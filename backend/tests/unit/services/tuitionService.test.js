'use strict';

const mongoose = require('mongoose');
const tuitionService = require('../../../services/tuitionService');
const TuitionFee = require('../../../models/TuitionFee');
const Message = require('../../../models/Message');
const User = require('../../../models/User');
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

  describe('createMonthlyFees', () => {
    it('creates one record per month, rolling over into the next year', async () => {
      const student = await createStudent();
      const { fees, skipped } = await tuitionService.createMonthlyFees({
        studentId: student._id, month: 11, year: 2026, monthCount: 3, amount: 1500000,
      });
      expect(skipped).toEqual([]);
      expect(fees.map(f => `${f.month}/${f.year}`)).toEqual(['11/2026', '12/2026', '1/2027']);
      expect(fees.every(f => f.amount === 1500000 && f.feeType === 'monthly')).toBe(true);
    });

    it('skips months the student already has a fee for instead of failing', async () => {
      const student = await createStudent();
      await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 5, year: 2026, amount: 1 });
      const { fees, skipped } = await tuitionService.createMonthlyFees({
        studentId: student._id, month: 4, year: 2026, monthCount: 3, amount: 2,
      });
      expect(fees.map(f => f.month)).toEqual([4, 6]);
      expect(skipped).toEqual([{ month: 5, year: 2026 }]);
      expect(await TuitionFee.countDocuments({ studentId: student._id })).toBe(3);
    });
  });

  describe('updateFee', () => {
    it('actually persists a feeType change instead of silently dropping it', async () => {
      const student = await createStudent();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 1, year: 2026, amount: 500000,
      });

      const updated = await tuitionService.updateFee(fee._id, { feeType: 'course', courseName: 'IELTS Advanced' });
      expect(updated.feeType).toBe('course');
      expect(updated.courseName).toBe('IELTS Advanced');
    });

    it('leaves feeType unchanged when not supplied in the update', async () => {
      const student = await createStudent();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 1, year: 2026, amount: 500000,
      });

      const updated = await tuitionService.updateFee(fee._id, { amount: 600000 });
      expect(updated.feeType).toBe('monthly');
    });

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

    it('messages the student on the false→true isPaid transition when a sender is given', async () => {
      const student = await createStudent();
      const admin = await createAdmin();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 5, year: 2026, amount: 500000, isPaid: false,
      });

      await tuitionService.updateFee(fee._id, { isPaid: true }, admin);

      const messages = await Message.find({ fromId: admin._id, toId: student._id });
      expect(messages).toHaveLength(1);
      expect(messages[0].body).toMatch(/xác nhận thanh toán/i);
    });

    it('does NOT message again on a later edit while isPaid stays true', async () => {
      const student = await createStudent();
      const admin = await createAdmin();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 6, year: 2026, amount: 500000, isPaid: true, paidDate: new Date(),
      });

      await tuitionService.updateFee(fee._id, { note: 'edited after paid' }, admin);

      const messages = await Message.find({ fromId: admin._id, toId: student._id });
      expect(messages).toHaveLength(0);
    });

    it('does NOT message when no sender is passed', async () => {
      const student = await createStudent();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 7, year: 2026, amount: 500000, isPaid: false,
      });

      await tuitionService.updateFee(fee._id, { isPaid: true });

      const messages = await Message.find({ toId: student._id });
      expect(messages).toHaveLength(0);
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
      expect(summary.awaitingConfirmCount).toBe(0);

      const { fees } = await tuitionService.getMyFees(studentA._id);
      expect(fees).toHaveLength(2);
      expect(fees.every(f => f.studentId.toString() === studentA._id.toString())).toBe(true);
    });
  });

  it('getMySummary counts unpaid fees the student already reported as transferred', async () => {
    const student = await createStudent();
    await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 1, year: 2026, amount: 300000, isPaid: false, studentNotified: true });
    await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 2, year: 2026, amount: 300000, isPaid: false });
    await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 3, year: 2026, amount: 300000, isPaid: true, studentNotified: true });

    const summary = await tuitionService.getMySummary(student._id);
    expect(summary.unpaidCount).toBe(2);
    expect(summary.awaitingConfirmCount).toBe(1);
  });

  it('getMySummary: only the fee billed THIS month is nagged — due from day 8 (VN), overdue after day 10', async () => {
    const student = await createStudent();
    const at = iso => tuitionService.getMySummary(student._id, new Date(iso));
    await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 9, year: 2026, amount: 100, isPaid: false });
    await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 10, year: 2026, amount: 200, isPaid: false, studentNotified: true });
    await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 11, year: 2026, amount: 400, isPaid: false });

    // 7/10 VN: October billed this month but not due yet; the badge still counts everything
    expect(await at('2026-10-07T12:00:00Z')).toMatchObject({ unpaidCount: 3, monthCount: 1, monthTotal: 200, dueCount: 0, overdue: false });
    // 8/10 00:30 VN (17:30Z on the 7th): only October — not September's debt, not November
    expect(await at('2026-10-07T17:30:00Z')).toMatchObject({ dueCount: 1, dueTotal: 200, dueAwaitingCount: 1, overdue: false });
    // 11/10 VN: overdue
    expect(await at('2026-10-10T17:30:00Z')).toMatchObject({ dueCount: 1, overdue: true });
    // 3/11 VN: October is no longer nagged, November not due yet
    expect(await at('2026-11-03T05:00:00Z')).toMatchObject({ monthCount: 1, monthTotal: 400, dueCount: 0 });
    // 8/11 VN: November only
    expect(await at('2026-11-08T05:00:00Z')).toMatchObject({ dueCount: 1, dueTotal: 400 });
  });

  it('resetTuitionReminderCountIfCaughtUp ignores fees entered ahead for later months', async () => {
    const student = await createStudent({ tuitionReminderCount: 2 });
    const oct = await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 10, year: 2026, amount: 1, isPaid: false });
    await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 12, year: 2026, amount: 1, isPaid: false });
    await TuitionFee.updateOne({ _id: oct._id }, { isPaid: true });
    await tuitionService.resetTuitionReminderCountIfCaughtUp(student._id, new Date('2026-10-09T05:00:00Z'));
    expect((await User.findById(student._id)).tuitionReminderCount).toBe(0);
  });

  it('getMySummary: a course fee is due from day 8 of the month it was entered', async () => {
    const student = await createStudent();
    const fee = await createTuitionFee({ studentId: student._id, feeType: 'course', courseName: 'X', amount: 800, isPaid: false });
    await TuitionFee.updateOne({ _id: fee._id }, { $set: { createdAt: new Date('2026-10-02T05:00:00Z') } }, { timestamps: false });
    expect((await tuitionService.getMySummary(student._id, new Date('2026-10-05T05:00:00Z'))).dueCount).toBe(0);
    expect((await tuitionService.getMySummary(student._id, new Date('2026-10-08T05:00:00Z'))).dueCount).toBe(1);
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
      expect(messages[0].type).toBe('reminder');
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
      expect(messages.every(m => m.type === 'reminder')).toBe(true);
    });

    it('returns 0 and creates no messages when nothing to remind', async () => {
      const admin = await createAdmin();
      const count = await tuitionService.sendBulkReminders({ month: 1, year: 2099 }, admin);
      expect(count).toBe(0);

      const messages = await Message.find({ fromId: admin._id });
      expect(messages).toHaveLength(0);
    });
  });

  // Regression coverage for PLATFORM_AUDIT_2026-08-22 item #2 — the 3
  // tuition-reminder mechanisms (per-fee, bulk, cron) previously tracked
  // nothing, unlike routes/admin/users.js's studyReminderCount escalation.
  describe('tuitionReminderCount tracking', () => {
    it('sendReminder bumps the student\'s tuitionReminderCount', async () => {
      const student = await createStudent();
      const admin = await createAdmin();
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 3, year: 2026, amount: 400000, isPaid: false,
      });

      await tuitionService.sendReminder(fee._id, null, admin);
      await tuitionService.sendReminder(fee._id, null, admin);

      const updated = await User.findById(student._id).select('tuitionReminderCount');
      expect(updated.tuitionReminderCount).toBe(2);
    });

    it('sendBulkReminders bumps each reminded student once, deduped', async () => {
      const admin = await createAdmin();
      const studentA = await createStudent();
      const studentB = await createStudent();

      await createTuitionFee({ studentId: studentA._id, feeType: 'monthly', month: 8, year: 2026, amount: 100000, isPaid: false });
      await createTuitionFee({ studentId: studentB._id, feeType: 'monthly', month: 8, year: 2026, amount: 200000, isPaid: false });

      await tuitionService.sendBulkReminders({ month: 8, year: 2026 }, admin);

      const [uA, uB] = await Promise.all([
        User.findById(studentA._id).select('tuitionReminderCount'),
        User.findById(studentB._id).select('tuitionReminderCount'),
      ]);
      expect(uA.tuitionReminderCount).toBe(1);
      expect(uB.tuitionReminderCount).toBe(1);
    });

    it('updateFee resets tuitionReminderCount to 0 once the student has no unpaid fees left', async () => {
      const student = await createStudent({ extra: { tuitionReminderCount: 5 } });
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 9, year: 2026, amount: 400000, isPaid: false,
      });

      await tuitionService.updateFee(fee._id, { isPaid: true });

      const updated = await User.findById(student._id).select('tuitionReminderCount');
      expect(updated.tuitionReminderCount).toBe(0);
    });

    it('updateFee does NOT reset tuitionReminderCount while another unpaid fee remains', async () => {
      const student = await createStudent({ extra: { tuitionReminderCount: 5 } });
      const feeA = await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 9, year: 2026, amount: 400000, isPaid: false });
      await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 10, year: 2026, amount: 400000, isPaid: false });

      await tuitionService.updateFee(feeA._id, { isPaid: true });

      const updated = await User.findById(student._id).select('tuitionReminderCount');
      expect(updated.tuitionReminderCount).toBe(5);
    });

    it('deleteFee resets tuitionReminderCount to 0 once no unpaid fees remain', async () => {
      const student = await createStudent({ extra: { tuitionReminderCount: 3 } });
      const fee = await createTuitionFee({
        studentId: student._id, feeType: 'monthly', month: 11, year: 2026, amount: 400000, isPaid: false,
      });

      await tuitionService.deleteFee(fee._id);

      const updated = await User.findById(student._id).select('tuitionReminderCount');
      expect(updated.tuitionReminderCount).toBe(0);
    });
  });

  describe('getUnpaidByStudent', () => {
    it('sums unpaid amounts ACROSS periods, not just the current one — the "Tổng nợ" fix', async () => {
      const student = await createStudent();
      await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 1, year: 2026, amount: 500000, isPaid: false });
      await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 2, year: 2026, amount: 300000, isPaid: false });
      await createTuitionFee({ studentId: student._id, feeType: 'course', courseName: 'IELTS Advanced', amount: 2000000, isPaid: false });

      const map = await tuitionService.getUnpaidByStudent();
      expect(map[String(student._id)]).toBe(2800000);
    });

    it('excludes paid fees from the total', async () => {
      const student = await createStudent();
      await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 1, year: 2026, amount: 500000, isPaid: true });
      await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 2, year: 2026, amount: 300000, isPaid: false });

      const map = await tuitionService.getUnpaidByStudent();
      expect(map[String(student._id)]).toBe(300000);
    });

    it('omits a student entirely once every fee is paid', async () => {
      const student = await createStudent();
      await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 1, year: 2026, amount: 500000, isPaid: true });

      const map = await tuitionService.getUnpaidByStudent();
      expect(map[String(student._id)]).toBeUndefined();
    });
  });

  describe('getClassStudentsMissingTuition', () => {
    const ClassGroup = require('../../../models/ClassGroup');
    const ClassEnrollment = require('../../../models/ClassEnrollment');
    const { createTeacher } = require('../../factories/userFactory');
    const NOW = new Date('2026-10-09T05:00:00Z'); // 9/10/2026 VN

    async function setup(classOverrides = {}) {
      const teacher = await createTeacher();
      const cls = await ClassGroup.create({ name: 'Lớp A', teacherId: teacher._id, ...classOverrides });
      const student = await createStudent();
      await ClassEnrollment.create({ classId: cls._id, studentId: student._id, enrolledAt: new Date('2026-09-01') });
      return { cls, student };
    }

    it('lists an enrolled student with no fee for the current month', async () => {
      const { cls, student } = await setup();
      const rows = await tuitionService.getClassStudentsMissingTuition(NOW);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ studentId: String(student._id), month: 10, year: 2026 });
      expect(rows[0].classes).toEqual([{ classId: String(cls._id), name: 'Lớp A' }]);
    });

    it('a monthly fee for this month (paid or not) clears the student', async () => {
      const { student } = await setup();
      await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 10, year: 2026, amount: 1 });
      expect(await tuitionService.getClassStudentsMissingTuition(NOW)).toEqual([]);
    });

    it('a course fee entered since enrolling clears the student', async () => {
      const { student } = await setup();
      await createTuitionFee({ studentId: student._id, feeType: 'course', courseName: 'IELTS', amount: 1 });
      expect(await tuitionService.getClassStudentsMissingTuition(NOW)).toEqual([]);
    });

    it('uses the start month for a class that has not started yet', async () => {
      const { student } = await setup({ startDate: new Date('2026-11-15') });
      await createTuitionFee({ studentId: student._id, feeType: 'monthly', month: 10, year: 2026, amount: 1 });
      const rows = await tuitionService.getClassStudentsMissingTuition(NOW);
      expect(rows.map(r => `${r.month}/${r.year}`)).toEqual(['11/2026']);
    });

    it('ignores archived/ended classes and removed or dropped students', async () => {
      await setup({ status: 'archived' });
      await setup({ endDate: new Date('2026-09-30') });
      const { cls } = await setup();
      await ClassEnrollment.updateMany({ classId: cls._id }, { status: 'dropped' });
      expect(await tuitionService.getClassStudentsMissingTuition(NOW)).toEqual([]);
    });
  });

  describe('getClassTuition', () => {
    const ClassGroup = require('../../../models/ClassGroup');
    const ClassEnrollment = require('../../../models/ClassEnrollment');
    const { createTeacher } = require('../../factories/userFactory');
    const NOW = new Date('2026-10-09T05:00:00Z');

    it('classifies each live student as missing / unpaid / paid for the billing month', async () => {
      const teacher = await createTeacher();
      const cls = await ClassGroup.create({ name: 'Lớp B', teacherId: teacher._id });
      const [missing, unpaid, paid, dropped] = await Promise.all([createStudent(), createStudent(), createStudent(), createStudent()]);
      for (const s of [missing, unpaid, paid, dropped]) {
        await ClassEnrollment.create({ classId: cls._id, studentId: s._id, enrolledAt: new Date('2026-09-01') });
      }
      await ClassEnrollment.updateOne({ studentId: dropped._id }, { status: 'dropped' });
      await createTuitionFee({ studentId: missing._id, feeType: 'monthly', month: 9, year: 2026, amount: 300, isPaid: false });
      await createTuitionFee({ studentId: unpaid._id, feeType: 'monthly', month: 10, year: 2026, amount: 500, isPaid: false });
      await createTuitionFee({ studentId: paid._id, feeType: 'course', courseName: 'IELTS', amount: 900, isPaid: true });

      const { period, students } = await tuitionService.getClassTuition(cls, {}, NOW);
      expect(period).toEqual({ month: 10, year: 2026 });
      expect(students.map(s => [s.studentId, s.status])).toEqual([
        [String(missing._id), 'missing'], [String(unpaid._id), 'unpaid'], [String(paid._id), 'paid'],
      ]);
      expect(students[0]).toMatchObject({ unpaidTotal: 300, unpaidCount: 1, fees: [] });
      expect(students[1].fees).toHaveLength(1);

      const sept = await tuitionService.getClassTuition(cls, { month: '9', year: '2026' }, NOW);
      expect(sept.students.find(s => s.studentId === String(missing._id)).status).toBe('unpaid');
    });
  });

  describe('listFees search (q)', () => {
    it('matches student name words across first/last name, username, and course name', async () => {
      const bui = await createStudent({ firstName: 'Bùi', lastName: 'Tuấn', username: 'buituan1207' });
      const other = await createStudent({ firstName: 'Lan', lastName: 'Ng' });
      await createTuitionFee({ studentId: bui._id, feeType: 'monthly', month: 10, year: 2026, amount: 1 });
      await createTuitionFee({ studentId: other._id, feeType: 'course', courseName: 'IELTS Intensive', amount: 2 });

      expect((await tuitionService.listFees({ q: 'bùi tuấn' })).total).toBe(1);
      expect((await tuitionService.listFees({ q: 'buituan' })).total).toBe(1);
      expect((await tuitionService.listFees({ q: 'intensive' })).fees[0].amount).toBe(2);
      expect((await tuitionService.listFees({ q: 'không ai' })).total).toBe(0);
    });
  });
});
