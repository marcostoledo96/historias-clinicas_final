// Punto de entrada para Vercel
// Este archivo configura y exporta la aplicación Express

const path = require('path');

// Configurar el entorno para Vercel
process.env.VERCEL = '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Asegurar que el directorio de trabajo sea correcto
const rootDir = path.join(__dirname, '..');
process.chdir(rootDir);

try {
  // Importar dotenv explícitamente
  require('dotenv').config({ path: path.join(rootDir, 'backend', '.env') });
  
  // Importar la aplicación
  const app = require('../backend/server.js');
  
  // Manejar errores no capturados específicamente para Vercel
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });
  
  module.exports = app;
  
} catch (error) {
  console.error('Error initializing app:', error);
  
  // Crear una aplicación mínima de respaldo
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  
  app.all('*', (req, res) => {
    res.status(500).json({ 
      error: 'Server initialization failed', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
  
  module.exports = app;
}