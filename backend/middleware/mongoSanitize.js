'use strict';

// Defense-in-depth against NoSQL operator injection: strips any key starting
// with '$' or containing '.' from req.body/params/query before it reaches a
// Mongoose query. The `express-mongo-sanitize` npm package does the same job
// but reassigns `req.query` outright, which Express 5 rejects (`req.query` is
// a getter-only accessor there) — this mutates each object's own keys in
// place instead, which Express 5 allows.
function stripMongoOperators(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 5) return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (obj[key] && typeof obj[key] === 'object') {
      stripMongoOperators(obj[key], depth + 1);
    }
  }
}

module.exports = function mongoSanitize(req, _res, next) {
  stripMongoOperators(req.body);
  stripMongoOperators(req.params);
  stripMongoOperators(req.query);
  next();
};
