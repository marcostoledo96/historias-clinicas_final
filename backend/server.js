// Servidor principal del backend
// Configura Express, CORS, sesiones, rutas y sirve el frontend

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

// Pool de Postgres (carga .env desde backend/.env)
const pool = require('./db/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Confiar en el proxy (Vercel/Heroku/NGINX) para cookies secure
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS con credenciales (cookies)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'https://vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const ok = allowedOrigins.some((allowed) => origin.includes(allowed.replace('https://', '').replace('http://', '')));
    return ok ? callback(null, true) : callback(new Error('No permitido por CORS'));
  },
  credentials: true,
}));

// Responder preflight (OPTIONS) para permitir POST con credenciales desde el navegador
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const ok = allowedOrigins.some((allowed) => origin.includes(allowed.replace('https://', '').replace('http://', '')));
    return ok ? callback(null, true) : callback(new Error('No permitido por CORS'));
  },
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiones: usar Postgres (válido para serverless)
app.use(session({
  store: new pgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'historias_clinicas_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas
const authRoutes = require('./routes/auth');
const pacientesRoutes = require('./routes/pacientes');
const consultasRoutes = require('./routes/consultas');
const turnosRoutes = require('./routes/turnos');

if (process.env.VERCEL) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/consultas', consultasRoutes);
app.use('/api/turnos', turnosRoutes);

// Salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV, vercel: !!process.env.VERCEL });
});

// Raíz: inicio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/inicio.html'));
});

// Errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor solo fuera de test y fuera de Vercel
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const MAX_REINTENTOS = 5;
  const iniciar = (puerto, intentosRestantes) => {
    const server = app.listen(puerto, () => {
      console.log(`Servidor en http://localhost:${puerto}`);
      console.log(`Sirviendo estáticos desde: ${path.join(__dirname, '../frontend')}`);
    });
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE' && intentosRestantes > 0) {
        const siguiente = puerto + 1;
        console.warn(`El puerto ${puerto} está en uso. Reintentando en ${siguiente}...`);
        iniciar(siguiente, intentosRestantes - 1);
      } else {
        console.error('No se pudo iniciar el servidor:', err?.message || err);
        process.exit(1);
      }
    });
  };
  iniciar(Number(PORT), MAX_REINTENTOS);
}

module.exports = app;
