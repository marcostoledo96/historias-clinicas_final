// Función serverless específica para login
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

// Configurar entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Configurar dotenv
require('dotenv').config({ path: path.join(__dirname, '..', '..', 'backend', '.env') });

// Importar modelo de usuario
const Usuario = require('../../backend/models/Usuario');

const app = express();

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Handler específico para login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body?.email, hasPassword: !!req.body?.password });
    
    const { email, password, remember } = req.body;

    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario por email
    console.log('Searching user by email:', email);
    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario) {
      console.log('User not found');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña
    console.log('Verifying password');
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log('Login successful');
    res.json({
      message: 'Login exitoso',
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre_completo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error in login:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Manejar otros métodos
app.all('/api/auth/login', (req, res) => {
  res.status(405).json({ error: 'Método no permitido' });
});

module.exports = app;