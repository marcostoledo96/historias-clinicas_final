// Punto de entrada para Vercel
// Este archivo exporta la aplicación Express desde el backend

const path = require('path');

// Asegurar que el directorio de trabajo sea correcto
process.chdir(path.join(__dirname, '..'));

// Importar y exportar la aplicación
const app = require('../backend/server.js');

module.exports = app;