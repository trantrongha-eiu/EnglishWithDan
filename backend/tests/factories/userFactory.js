// Test-data builder for User documents + matching JWT helper, so
// integration tests can create a real, DB-backed user and authenticate
// as them in one call instead of hand-rolling documents/tokens per test.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

let counter = 0;
function unique(prefix) {
  counter += 1;
  return `${prefix}${Date.now()}${counter}`;
}

async function createUser(overrides = {}) {
  const raw = overrides.rawPassword || 'Test1234!';
  const user = await User.create({
    username: overrides.username || unique('user'),
    email: overrides.email || `${unique('user')}@test.local`,
    password: overrides.password === undefined ? await bcrypt.hash(raw, 4) : overrides.password,
    firstName: overrides.firstName ?? 'Test',
    lastName: overrides.lastName ?? 'User',
    role: overrides.role || 'student',
    plan: overrides.plan || 'free',
    planExpiresAt: overrides.planExpiresAt ?? null,
    isBanned: overrides.isBanned ?? false,
    ...overrides.extra
  });
  return user;
}

function signTokenFor(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function createStudent(overrides = {}) {
  return createUser({ role: 'student', ...overrides });
}

async function createPremiumStudent(overrides = {}) {
  return createUser({
    role: 'student',
    plan: 'premium',
    planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ...overrides
  });
}

async function createTeacher(overrides = {}) {
  return createUser({ role: 'teacher', ...overrides });
}

async function createAdmin(overrides = {}) {
  return createUser({ role: 'admin', ...overrides });
}

module.exports = {
  createUser, createStudent, createPremiumStudent, createTeacher, createAdmin,
  signTokenFor, unique,
};
