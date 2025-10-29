// Punto de entrada para Vercel
// Este archivo configura y exporta la aplicación Express como función serverless

const path = require('path');

// Configurar el entorno para Vercel
process.env.VERCEL = '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Asegurar que el directorio de trabajo sea correcto
const rootDir = path.join(__dirname, '..');
process.chdir(rootDir);

// Log para debugging en Vercel
console.log('Vercel function starting...');
console.log('Working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Root directory:', rootDir);

let handler;

try {
  // Configurar dotenv explícitamente
  console.log('Loading environment variables...');
  require('dotenv').config({ path: path.join(rootDir, 'backend', '.env') });
  
  console.log('Environment loaded:', {
    NODE_ENV: process.env.NODE_ENV,
    hasDBUrl: !!process.env.DATABASE_URL,
    hasSessionSecret: !!process.env.SESSION_SECRET
  });
  
  // Importar la aplicación
  console.log('Loading Express app...');
  const app = require('../backend/server.js');
  console.log('Express app loaded successfully');
  
  // Crear el handler para Vercel
  handler = (req, res) => {
    console.log(`${req.method} ${req.url}`);
    return app(req, res);
  };
  
} catch (error) {
  console.error('Error initializing Vercel function:', error);
  console.error('Error stack:', error.stack);
  
  // Crear handler de fallback
  const express = require('express');
  const fallbackApp = express();
  
  fallbackApp.use(express.json());
  
  fallbackApp.all('*', (req, res) => {
    console.error('Fallback handler for:', req.method, req.url);
    res.status(500).json({ 
      error: 'Server initialization failed', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
  
  handler = fallbackApp;
}

// Exportar el handler para Vercel
module.exports = handler;