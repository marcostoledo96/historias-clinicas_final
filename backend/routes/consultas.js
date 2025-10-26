// ! Rutas: Consultas
// ? Endpoints REST para listar, crear, actualizar y borrar consultas
const express = require('express');
const router = express.Router();
const controladorConsultas = require('../controllers/consultasController');
const { verificarAuth, verificarDoctor, logging, validarCamposRequeridos } = require('../middlewares/auth');

// * Middlewares globales en este router
//   - logging: registra método y URL
//   - verificarAuth: exige sesión iniciada
//   - verificarDoctor: exige rol adecuado
router.use(logging);
router.use(verificarAuth);
router.use(verificarDoctor);

// * GET /api/consultas
//   Devuelve todas las consultas (el filtrado por fecha/paciente se expone en rutas separadas)
router.get('/', controladorConsultas.obtenerConsultas);

// * GET /api/consultas/:id
//   Path params: id (number)
router.get('/:id', controladorConsultas.obtenerConsultaPorId);

// * GET /api/consultas/paciente/:id_paciente
//   Path params: id_paciente (number)
router.get('/paciente/:id_paciente', controladorConsultas.obtenerConsultasPorPaciente);

// * GET /api/consultas/fecha/:fecha
//   Path params: fecha (YYYY-MM-DD)
router.get('/fecha/:fecha', controladorConsultas.obtenerConsultasPorFecha);

// * POST /api/consultas
//   Body JSON requerido: { id_paciente, motivo_consulta, ...opcionales }
router.post('/', 
  validarCamposRequeridos(['id_paciente', 'motivo_consulta']),
  controladorConsultas.crearConsulta
);

// * PUT /api/consultas/:id
//   Body JSON requerido: { motivo_consulta, ...opcionales }
router.put('/:id', 
  validarCamposRequeridos(['motivo_consulta']),
  controladorConsultas.actualizarConsulta
);

// * DELETE /api/consultas/:id
router.delete('/:id', controladorConsultas.eliminarConsulta);

module.exports = router;
