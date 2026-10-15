// POST /api/contact — public consult form. Covers the honeypot: a bot that
// fills the hidden hp_check field gets the normal success answer but no
// email goes out.
const request = require('supertest');
const app = require('../../app');
const contactService = require('../../services/contactService');

describe('POST /api/contact', () => {
  let send;
  beforeEach(() => { send = jest.spyOn(contactService, 'sendInquiry').mockResolvedValue(); });
  afterEach(() => send.mockRestore());

  test('a real submission sends the inquiry', async () => {
    const res = await request(app).post('/api/contact').send({ name: 'Nguyễn An', phone: '0912345678', hp_check: '' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
  });

  test('a filled honeypot looks like success but sends nothing', async () => {
    const res = await request(app).post('/api/contact').send({ name: 'Bot', phone: '0912345678', hp_check: 'http://spam' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(send).not.toHaveBeenCalled();
  });
});
