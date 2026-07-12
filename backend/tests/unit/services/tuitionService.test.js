'use strict';

const mongoose = require('mongoose');
const tuitionService = require('../../../services/tuitionService');
const TuitionFee = require('../../../models/TuitionFee');
const Message = require('../../../models/Message');
const { createTuitionFee } = require('../../factories/contentFactory');
const { createStudent, createAdmin } = require('../../factories/userFactory');

describe('tuitionService', () => {
  describe('createFee', () => {
    it('monthly fee sets month/year and leaves courseName empty', async () => {
      const student = await createStudent();
      const fee = await tuitionService.createFee({
        studentId: student._id, feeType: 'monthly', month: 3, year: 2026, amount: 500000,
      });
      expect(fee.month).toBe(3);
      expect(fee.year).toBe(2026);
      expect(fee.courseName).toBe('');
    });

    it('course fee sets courseName and leaves month/year undefined', async () => {
      const student = await createStudent();
      const fee = await tuitionService.createFee({
        studentId: student._id, feeType: 'course', courseName: 'IELTS Advanced', amount: 2000000,
        month: 3, year: 2026, // supplied but should be ignored per the ternary
      });
      expect(fee.courseName).toBe('IELTS Advanced');
      expect(fee.month).toBeUndefined();
      expect(fee.year).toBeUndefined();
    });
  });

  describe('updateFee', () => {
    it('clears studentNotified when amount changed while unpaid and previously notified', async () => {
      const student = await createStudent();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 1, year: 2026,
        amount: 500000, isPaid: false, studentNotified: true,
      });

      const updated = await tuitionService.updateFee(fee._id, { amount: 600000 });
      expect(updated.studentNotified).toBe(false);
      expect(updated.studentNotifiedAt).toBeNull();
    });

    it('clears studentNotified when month changed while unpaid and previously notified', async () => {
      const student = await createStudent();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 1, year: 2026,
        amount: 500000, isPaid: false, studentNotified: true,
      });

      const updated = await tuitionService.updateFee(fee._id, { month: 2 });
      expect(updated.studentNotified).toBe(false);
    });

    it('clears studentNotified when year changed while unpaid and previously notified', async () => {
      const student = await createStudent();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 1, year: 2026,
        amount: 500000, isPaid: false, studentNotified: true,
      });

      const updated = await tuitionService.updateFee(fee._id, { year: 2027 });
      expect(updated.studentNotified).toBe(false);
    });

    it('does NOT clear studentNotified if the fee is already paid', async () => {
      const student = await createStudent();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 1, year: 2026,
        amount: 500000, isPaid: true, studentNotified: true,
      });

      const updated = await tuitionService.updateFee(fee._id, { amount: 700000 });
      expect(updated.studentNotified).toBe(true);
    });

    it('does NOT clear studentNotified when nothing relevant changed', async () => {
      const student = await createStudent();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 1, year: 2026,
        amount: 500000, isPaid: false, studentNotified: true,
      });

      const updated = await tuitionService.updateFee(fee._id, { note: 'just a note update' });
      expect(updated.studentNotified).toBe(true);
    });

    it('returns null for a missing fee id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await tuitionService.updateFee(fakeId, { amount: 100 });
      expect(result).toBeNull();
    });

    it('sets paidDate when marked paid, clears it when marked unpaid', async () => {
      const student = await createStudent();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 4, year: 2026, isPaid: false,
      });

      const paid = await tuitionService.updateFee(fee._id, { isPaid: true });
      expect(paid.isPaid).toBe(true);
      expect(paid.paidDate).toBeTruthy();

      const unpaid = await tuitionService.updateFee(fee._id, { isPaid: false });
      expect(unpaid.isPaid).toBe(false);
      expect(unpaid.paidDate).toBeUndefined();
    });
  });

  describe('listFees', () => {
    it('filters by studentId/month/year/feeType/isPaid/studentNotified and returns aggregate stats', async () => {
      const studentA = await createStudent();
      const studentB = await createStudent();

      await createTuitionFee({
        studentId: studentA._id, feeType: 'monthly', month: 5, year: 2026,
        amount: 500000, isPaid: true, studentNotified: false,
      });
      await createTuitionFee({
        studentId: studentA._id, feeType: 'monthly', month: 6, year: 2026,
        amount: 600000, isPaid: false, studentNotified: true,
      });
      await createTuitionFee({
        studentId: studentB._id, feeType: 'course', courseName: 'X',
        amount: 1000000, isPaid: false, studentNotified: false,
      });

      const byStudent = await tuitionService.listFees({ studentId: studentA._id.toString() });
      expect(byStudent.total).toBe(2);

      const byMonth = await tuitionService.listFees({ month: 5, year: 2026 });
      expect(byMonth.total).toBe(1);
      expect(byMonth.fees[0].amount).toBe(500000);

      const byFeeType = await tuitionService.listFees({ feeType: 'course' });
      expect(byFeeType.total).toBe(1);

      const byPaid = await tuitionService.listFees({ isPaid: 'true' });
      expect(byPaid.total).toBe(1);
      expect(byPaid.stats.paidAmount).toBe(500000);

      const byNotified = await tuitionService.listFees({ studentNotified: 'true' });
      expect(byNotified.total).toBe(1);
      expect(byNotified.stats.pendingNotify).toBe(1);

      const all = await tuitionService.listFees({});
      expect(all.total).toBe(3);
      expect(all.stats.totalAmount).toBe(500000 + 600000 + 1000000);
      expect(all.stats.paidAmount).toBe(500000);
    });

    it('returns zeroed stats when no fees match', async () => {
      const result = await tuitionService.listFees({ month: 11, year: 2099 });
      expect(result.total).toBe(0);
      expect(result.fees).toEqual([]);
      expect(result.stats).toEqual({ totalAmount: 0, paidAmount: 0, pendingNotify: 0 });
    });
  });

  describe('getMySummary / getMyFees', () => {
    it('scopes to the given studentId only', async () => {
      const studentA = await createStudent();
      const studentB = await createStudent();

      await createTuitionFee({ studentId: studentA._id, feeType: 'monthly', month: 1, year: 2026, amount: 300000, isPaid: false });
      await createTuitionFee({ studentId: studentA._id, feeType: 'monthly', month: 2, year: 2026, amount: 200000, isPaid: true });
      await createTuitionFee({ studentId: studentB._id, feeType: 'monthly', month: 1, year: 2026, amount: 999999, isPaid: false });

      const summary = await tuitionService.getMySummary(studentA._id);
      expect(summary.unpaidCount).toBe(1);
      expect(summary.totalUnpaid).toBe(300000);

      const { fees } = await tuitionService.getMyFees(studentA._id);
      expect(fees).toHaveLength(2);
      expect(fees.every(f => f.studentId.toString() === studentA._id.toString())).toBe(true);
    });
  });

  describe('notifyPayment', () => {
    it('sets studentNotified true and creates a Message to every admin', async () => {
      const student = await createStudent();
      const admin1 = await createAdmin();
      const admin2 = await createAdmin();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 7, year: 2026, amount: 500000, isPaid: false,
      });

      const result = await tuitionService.notifyPayment(fee._id, student);
      expect(result.status).toBe('ok');

      const reloaded = await TuitionFee.findById(fee._id);
      expect(reloaded.studentNotified).toBe(true);
      expect(reloaded.studentNotifiedAt).toBeTruthy();

      const messages = await Message.find({ fromId: student._id });
      expect(messages).toHaveLength(2);
      const toIds = messages.map(m => m.toId.toString()).sort();
      expect(toIds).toEqual([admin1._id.toString(), admin2._id.toString()].sort());
    });

    it('rejects if the fee is already paid', async () => {
      const student = await createStudent();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 8, year: 2026, amount: 500000, isPaid: true,
      });
      const result = await tuitionService.notifyPayment(fee._id, student);
      expect(result.status).toBe('already_paid');
    });

    it('rejects if the fee does not belong to that student', async () => {
      const owner = await createStudent();
      const intruder = await createStudent();
      const fee = await createTuitionFee({
        studentId: owner._id, feeType: 'monthly', month: 9, year: 2026, amount: 500000, isPaid: false,
      });
      const result = await tuitionService.notifyPayment(fee._id, intruder);
      expect(result.status).toBe('not_found');
    });

    it('creates no messages when there are no admins', async () => {
      const student = await createStudent();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 10, year: 2026, amount: 500000, isPaid: false,
      });
      const result = await tuitionService.notifyPayment(fee._id, student);
      expect(result.status).toBe('ok');
      const messages = await Message.find({ fromId: student._id });
      expect(messages).toHaveLength(0);
    });
  });

  describe('sendReminder', () => {
    it('creates a Message for the fee\'s student', async () => {
      const student = await createStudent();
      const admin = await createAdmin();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 3, year: 2026, amount: 400000, isPaid: false,
      });

      const result = await tuitionService.sendReminder(fee._id, null, admin);
      expect(result).toBe(true);

      const messages = await Message.find({ toId: student._id });
      expect(messages).toHaveLength(1);
      expect(messages[0].fromId.toString()).toBe(admin._id.toString());
    });

    it('returns null for a missing fee', async () => {
      const admin = await createAdmin();
      const fakeId = new mongoose.Types.ObjectId();
      const result = await tuitionService.sendReminder(fakeId, null, admin);
      expect(result).toBeNull();
    });
  });

  describe('sendBulkReminders', () => {
    it('creates a Message for every unpaid fee matching month/year', async () => {
      const admin = await createAdmin();
      const studentA = await createStudent();
      const studentB = await createStudent();
      const studentC = await createStudent();

      await createTuitionFee({ studentId: studentA._id, feeType: 'monthly', month: 6, year: 2026, amount: 100000, isPaid: false });
      await createTuitionFee({ studentId: studentB._id, feeType: 'monthly', month: 6, year: 2026, amount: 200000, isPaid: false });
      await createTuitionFee({ studentId: studentC._id, feeType: 'monthly', month: 6, year: 2026, amount: 300000, isPaid: true });

      const count = await tuitionService.sendBulkReminders({ month: 6, year: 2026 }, admin);
      expect(count).toBe(2);

      const messages = await Message.find({ fromId: admin._id });
      expect(messages).toHaveLength(2);
    });

    it('returns 0 and creates no messages when nothing to remind', async () => {
      const admin = await createAdmin();
      const count = await tuitionService.sendBulkReminders({ month: 1, year: 2099 }, admin);
      expect(count).toBe(0);

      const messages = await Message.find({ fromId: admin._id });
      expect(messages).toHaveLength(0);
    });
  });
});
