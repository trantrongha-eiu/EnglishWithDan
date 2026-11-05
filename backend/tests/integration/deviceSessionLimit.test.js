// Integration tests for the 1-PC + 1-mobile login limit for students
// (utils/deviceSession.js + middleware/auth.js's SESSION_REPLACED check).
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { createUser, createAdmin, createTeacher, signTokenFor, unique } = require('../factories/userFactory');
const { deviceTypeFromUA } = require('../../utils/deviceSession');

const PC_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const PC2_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const PHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const PHONE2_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
const PASS = 'CorrectPass1!';

async function makeStudent() {
  return createUser({ email: `${unique('dev')}@test.local`, rawPassword: PASS });
}
async function login(user, ua, { ip, deviceId } = {}) {
  let req = request(app).post('/api/auth/login').set('User-Agent', ua);
  if (ip) req = req.set('X-Forwarded-For', ip);
  const res = await req.send({ email: user.email, password: PASS, ...(deviceId ? { deviceId } : {}) });
  expect(res.status).toBe(200);
  return res.body.token;
}
const me = (token) => request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

describe('deviceTypeFromUA', () => {
  test('phones and tablets are mobile, desktop browsers are PC', () => {
    expect(deviceTypeFromUA(PHONE_UA)).toBe('mobile');
    expect(deviceTypeFromUA(PHONE2_UA)).toBe('mobile');
    expect(deviceTypeFromUA(PC_UA)).toBe('desktop');
    expect(deviceTypeFromUA(PC2_UA)).toBe('desktop');
    expect(deviceTypeFromUA('')).toBe('desktop');
  });
});

describe('student device limit', () => {
  test('one PC + one phone can be signed in at the same time', async () => {
    const user = await makeStudent();
    const pc = await login(user, PC_UA);
    const phone = await login(user, PHONE_UA);
    expect((await me(pc)).status).toBe(200);
    expect((await me(phone)).status).toBe(200);
  });

  test('a second PC login signs the first PC out, phone stays signed in', async () => {
    const user = await makeStudent();
    const pc1 = await login(user, PC_UA);
    const phone = await login(user, PHONE_UA);
    const pc2 = await login(user, PC2_UA);

    const res = await me(pc1);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('SESSION_REPLACED');
    expect((await me(pc2)).status).toBe(200);
    expect((await me(phone)).status).toBe(200);
  });

  test('logging in again from the same browser keeps its other tabs signed in', async () => {
    const user = await makeStudent();
    const tab1 = await login(user, PC_UA, { ip: '1.1.1.1', deviceId: 'browserAAAA1111' });
    const tab2 = await login(user, PC_UA, { ip: '2.2.2.2', deviceId: 'browserAAAA1111' });
    expect((await me(tab1)).status).toBe(200);
    expect((await me(tab2)).status).toBe(200);
  });

  test('a second browser on the same PC (same IP + OS) is the same device', async () => {
    const user = await makeStudent();
    const chrome = await login(user, PC_UA, { ip: '3.3.3.3', deviceId: 'chromeBBBB2222' });
    const edge = await login(user, PC_UA.replace('Safari/537.36', 'Safari/537.36 Edg/130.0'), { ip: '3.3.3.3', deviceId: 'edgeCCCC3333' });
    expect((await me(chrome)).status).toBe(200);
    expect((await me(edge)).status).toBe(200);
  });

  test('another PC (different browser id and IP) still signs the first PC out', async () => {
    const user = await makeStudent();
    const home = await login(user, PC_UA, { ip: '4.4.4.4', deviceId: 'homeDDDD4444' });
    const tab2 = await login(user, PC_UA, { ip: '4.4.4.4', deviceId: 'homeDDDD4444' });
    const other = await login(user, PC_UA, { ip: '5.5.5.5', deviceId: 'otherEEEE5555' });
    expect((await me(home)).body.code).toBe('SESSION_REPLACED');
    expect((await me(tab2)).body.code).toBe('SESSION_REPLACED');
    expect((await me(other)).status).toBe(200);
  });

  test("logging out one browser keeps the same device's other browser signed in", async () => {
    const user = await makeStudent();
    const a = await login(user, PC_UA, { ip: '6.6.6.6', deviceId: 'devFFFF6666a' });
    const b = await login(user, PC_UA, { ip: '6.6.6.6', deviceId: 'devGGGG6666b' });
    expect((await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${b}`)).status).toBe(200);
    expect((await me(b)).status).toBe(401);
    expect((await me(a)).status).toBe(200);
  });

  test('a second phone login signs the first phone out', async () => {
    const user = await makeStudent();
    const phone1 = await login(user, PHONE_UA);
    const phone2 = await login(user, PHONE2_UA);
    expect((await me(phone1)).body.code).toBe('SESSION_REPLACED');
    expect((await me(phone2)).status).toBe(200);
  });

  test('logging out on the phone keeps the PC signed in', async () => {
    const user = await makeStudent();
    const pc = await login(user, PC_UA);
    const phone = await login(user, PHONE_UA);
    expect((await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${phone}`)).status).toBe(200);
    expect((await me(phone)).status).toBe(401);
    expect((await me(pc)).status).toBe(200);
  });

  test('changing password keeps this device and signs the other one out', async () => {
    const user = await makeStudent();
    const pc = await login(user, PC_UA);
    const phone = await login(user, PHONE_UA);
    const res = await request(app).put('/api/user/change-password')
      .set('Authorization', `Bearer ${pc}`)
      .send({ currentPassword: PASS, newPassword: 'NewPass1234!' });
    expect(res.status).toBe(200);
    expect((await me(res.body.token)).status).toBe(200);
    expect((await me(phone)).status).toBe(401);
  });

  test('a pre-feature token keeps working until the first new-style login', async () => {
    const user = await makeStudent();
    const legacy = signTokenFor(user);
    expect((await me(legacy)).status).toBe(200);
    await login(user, PHONE_UA);
    const res = await me(legacy);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('SESSION_REPLACED');
  });

  test('staff accounts are not limited', async () => {
    const admin = await createAdmin({ email: `${unique('devadm')}@test.local`, rawPassword: PASS });
    const pc1 = await login(admin, PC_UA);
    const pc2 = await login(admin, PC2_UA);
    expect((await me(pc1)).status).toBe(200);
    expect((await me(pc2)).status).toBe(200);
    const saved = await User.findById(admin._id).lean();
    expect(saved.activeSessions && saved.activeSessions.desktop && saved.activeSessions.desktop.sid).toBeFalsy();
  });

  test('a teacher can use many tabs, browsers and phones at once', async () => {
    const teacher = await createTeacher({ email: `${unique('devtch')}@test.local`, rawPassword: PASS });
    const tokens = [];
    for (const ua of [PC_UA, PC2_UA, PC_UA, PHONE_UA, PHONE2_UA]) tokens.push(await login(teacher, ua));
    for (const t of tokens) expect((await me(t)).status).toBe(200);
  });

  test('staff logout ends only that session, other devices stay signed in', async () => {
    const admin = await createAdmin({ email: `${unique('devadm2')}@test.local`, rawPassword: PASS });
    const pc = await login(admin, PC_UA);
    const phone = await login(admin, PHONE_UA);
    expect((await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${pc}`)).status).toBe(200);
    const res = await me(pc);
    expect(res.status).toBe(401);
    expect(res.body.code).toBeUndefined();
    expect((await me(phone)).status).toBe(200);
    // A fresh login after logout works too.
    expect((await me(await login(admin, PC_UA))).status).toBe(200);
  });
});
