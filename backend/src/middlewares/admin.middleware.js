const { requireAuth } = require('./auth.middleware');

// export middleware that enforces ADMIN role
module.exports = requireAuth(["ADMIN"]);