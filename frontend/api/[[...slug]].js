// Catch-all to route all /api/* requests to the Express app
const app = require('../../backend/server');

module.exports = (req, res) => app(req, res);

