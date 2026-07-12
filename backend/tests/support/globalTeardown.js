// Stops the shared in-memory MongoDB instance started in globalSetup.js.
module.exports = async function globalTeardown() {
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
};
