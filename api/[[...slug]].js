// Root-level Vercel Function to forward all /api/* to the Express app
const app = require('../backend/server');

module.exports = (req, res) => app(req, res);

