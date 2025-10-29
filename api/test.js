// Función de prueba simple para Vercel
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
});

app.all('/api/test', (req, res) => {
  res.status(405).json({ error: 'Método no permitido' });
});

module.exports = app;