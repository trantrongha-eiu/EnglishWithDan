'use strict';

const upgradeService = require('../../../services/upgradeService');
const UpgradeRequest = require('../../../models/UpgradeRequest');
const { createUpgradeRequest } = require('../../factories/contentFactory');
const { createStudent } = require('../../factories/userFactory');

describe('upgradeService', () => {
  describe('constants', () => {
    it('VALID_MONTHS is exactly [1,3,6,12,36]', () => {
      expect(upgradeService.VALID_MONTHS).toEqual([1, 3, 6, 12, 36]);
    });

    it('PRICES has an entry for each valid month', () => {
      for (const m of upgradeService.VALID_MONTHS) {
        expect(upgradeService.PRICES[m]).toEqual(expect.any(Number));
      }
    });
  });

  describe('createRequest', () => {
    it('creates a request with the amount looked up from PRICES', async () => {
      const student = await createStudent();
      const result = await upgradeService.createRequest(student._id, 6, 'please upgrade');
      expect(result.conflict).toBe(false);
      expect(result.request.amount).toBe(upgradeService.PRICES[6]);
      expect(result.request.months).toBe(6);
      expect(result.request.note).toBe('please upgrade');
    });

    it('returns conflict:true with the existing requestId if a pending request already exists', async () => {
      const student = await createStudent();
      const existing = await createUpgradeRequest({ userId: student._id, months: 3, amount: 250000, status: 'pending' });

      const result = await upgradeService.createRequest(student._id, 12, 'another one');
      expect(result.conflict).toBe(true);
      expect(result.requestId.toString()).toBe(existing._id.toString());

      const count = await UpgradeRequest.countDocuments({ userId: student._id });
      expect(count).toBe(1);
    });

    it('allows a new request if the previous one is not pending', async () => {
      const student = await createStudent();
      await createUpgradeRequest({ userId: student._id, months: 3, amount: 250000, status: 'approved' });

      const result = await upgradeService.createRequest(student._id, 12, '');
      expect(result.conflict).toBe(false);
      expect(result.request.months).toBe(12);
    });

    it('documents current behavior for an invalid months value: schema validation rejects the save (amount undefined + months not in enum)', async () => {
      const student = await createStudent();
      // months=2 is not a key in PRICES nor in the model's enum -> amount is undefined
      // and the underlying UpgradeRequest.save() throws a Mongoose ValidationError.
      // This is a possible bug: nothing in upgradeService.createRequest itself
      // validates `months` against VALID_MONTHS before building amount/saving —
      // it currently relies entirely on the Mongoose schema enum validator (and
      // presumably client-side validation) to catch bad input.
      await expect(upgradeService.createRequest(student._id, 2, '')).rejects.toThrow();

      const count = await UpgradeRequest.countDocuments({ userId: student._id });
      expect(count).toBe(0);
    });
  });

  describe('getStatus', () => {
    it('returns the most recent request for a user (sorted by createdAt desc)', async () => {
      const student = await createStudent();
      const older = await createUpgradeRequest({ userId: student._id, months: 1, amount: 90000, status: 'approved' });
      await new Promise(r => setTimeout(r, 10));
      const newer = await createUpgradeRequest({ userId: student._id, months: 12, amount: 900000, status: 'pending' });

      const result = await upgradeService.getStatus(student._id);
      expect(result._id.toString()).toBe(newer._id.toString());
      expect(older._id.toString()).not.toBe(result._id.toString());
    });

    it('returns null when there is no request for the user', async () => {
      const student = await createStudent();
      const result = await upgradeService.getStatus(student._id);
      expect(result).toBeNull();
    });
  });
});
