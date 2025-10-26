// ! Rutas: Autenticación y perfil de usuario
// ? Maneja login/logout, verificación de sesión, registro (admin) y perfil
const express = require('express');
const router = express.Router();
const controladorAutenticacion = require('../controllers/authController');
const { logging, validarCamposRequeridos, verificarAuth, verificarAdmin } = require('../middlewares/auth');

// * Logging básico para todas las rutas de este router
router.use(logging);

// * POST /api/auth/login
//   Body requerido: { email, password }
router.post('/login', 
  validarCamposRequeridos(['email', 'password']),
  controladorAutenticacion.login
);

// * POST /api/auth/logout
router.post('/logout', controladorAutenticacion.logout);

// * GET /api/auth/verificar
router.get('/verificar', controladorAutenticacion.verificarSesion);

// * POST /api/auth/registro (solo admin)
//   Body requerido: { email, nombre_completo, password }
router.post('/registro', 
  verificarAuth,
  verificarAdmin,
  validarCamposRequeridos(['email', 'nombre_completo', 'password']),
  controladorAutenticacion.registro
);

// * Recuperación de contraseña (flujo demo sin correo real)
router.post('/recuperar', controladorAutenticacion.solicitarRecuperacion);
router.post('/restablecer', controladorAutenticacion.restablecerConCodigo);

// * Perfil del usuario autenticado
router.get('/perfil', verificarAuth, controladorAutenticacion.obtenerPerfil);
router.put('/perfil', verificarAuth, controladorAutenticacion.actualizarPerfil);
router.put('/password', verificarAuth, controladorAutenticacion.cambiarPassword);

module.exports = router;
