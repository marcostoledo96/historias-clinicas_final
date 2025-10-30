// Bridge Express app to Vercel Serverless Functions
// This allows the backend (Express) to run under the same Vercel project as the frontend.
// No server.listen here — Vercel provides req/res.

const app = require('../../backend/server');

module.exports = app;

