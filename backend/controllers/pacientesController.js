const Paciente = require('../models/Paciente');
const demoStore = require('../middlewares/demoStore');

// Controlador para manejo de pacientes
// Aquí manejo toda la lógica CRUD de pacientes, con soporte para usuarios demo
const controladorPacientes = {
  // Obtener lista de pacientes (con búsqueda opcional)
  obtenerPacientes: async (req, res) => {
    try {
      const { buscar } = req.query;
      const idUsuario = req.session?.usuario?.id;
      if (!idUsuario) return res.status(401).json({ error: 'No autenticado' });
      
      // Para usuarios demo, uso datos temporales en memoria
      if (req.esUsuarioDemo) {
        const datosUsuario = demoStore.getUserData(req.idUsuarioDemo);
        let pacientes = datosUsuario.pacientes;
        
        if (buscar) {
          const buscarMinuscula = buscar.toLowerCase();
          pacientes = pacientes.filter(p => 
            p.nombre.toLowerCase().includes(buscarMinuscula) ||
            p.apellido.toLowerCase().includes(buscarMinuscula) ||
            p.documento.includes(buscar) ||
            p.email.toLowerCase().includes(buscarMinuscula)
          );
        }
        
        return res.json(pacientes);
      }
      
      let pacientes;
      if (buscar) {
        pacientes = await Paciente.buscar(buscar, idUsuario);
      } else {
        pacientes = await Paciente.obtenerTodos(idUsuario);
      }

      res.json(pacientes);
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener un paciente específico por ID
  obtenerPacientePorId: async (req, res) => {
    try {
      const { id } = req.params;
      const idUsuario = req.session?.usuario?.id;
      if (!idUsuario) return res.status(401).json({ error: 'No autenticado' });
      
      // Para usuarios demo, busco en los datos temporales
      if (req.esUsuarioDemo) {
        const datosUsuario = demoStore.getUserData(req.idUsuarioDemo);
        const paciente = datosUsuario.pacientes.find(p => p.id == id);
        
        if (!paciente) {
          return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        
        return res.json(paciente);
      }
      
      const paciente = await Paciente.buscarPorId(id, idUsuario);

      if (!paciente) {
        return res.status(404).json({ error: 'Paciente no encontrado' });
      }

      res.json(paciente);
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Crear un nuevo paciente
  crearPaciente: async (req, res) => {
    try {
      const idUsuario = req.session?.usuario?.id;
      if (!idUsuario) return res.status(401).json({ error: 'No autenticado' });
      
      const {
        nombre, apellido, dni, fecha_nacimiento, sexo, telefono, telefono_adicional, email,
        cobertura, plan, numero_afiliado, localidad, direccion, ocupacion,
        enfermedades_preexistentes, alergias, observaciones
      } = req.body;
      
      // Para usuarios demo, creo el paciente solo en memoria
      if (req.esUsuarioDemo) {
        if (!nombre || !apellido) {
          return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
        }
        
        const nuevoPaciente = demoStore.addPaciente(req.idUsuarioDemo, {
          nombre, apellido, documento: dni, fecha_nacimiento, sexo, telefono, 
          telefono_adicional, email, obra_social: cobertura, plan, numero_afiliado, 
          localidad, direccion, ocupacion, enfermedades_preexistentes, alergias, observaciones
        });
        
        return res.status(201).json({
          exito: true,
          mensaje: 'Paciente creado en modo demo (temporal)',
          paciente: nuevoPaciente,
          demo: true
        });
      }

      // Validaciones básicas
      if (!nombre || !apellido) {
        return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
      }

      const normalizar = (v) => (v === undefined || v === null || String(v).trim() === '' ? null : v);
      const dniNorm = normalizar(dni);
      const fechaNacNorm = normalizar(fecha_nacimiento);

      // Verificar si el DNI ya existe (sólo si se envió DNI)
      if (dniNorm) {
        const pacienteExistente = await Paciente.buscarPorDni(dniNorm, idUsuario);
        if (pacienteExistente) {
          return res.status(409).json({ error: 'Paciente ya registrado con este DNI' });
        }
      }

      const nuevoPaciente = await Paciente.crear({
        nombre, apellido, dni: dniNorm, fecha_nacimiento: fechaNacNorm, sexo, telefono, telefono_adicional, email,
        cobertura, plan, numero_afiliado, localidad, direccion, ocupacion,
        enfermedades_preexistentes, alergias, observaciones
      }, idUsuario);

      res.status(201).json({
        mensaje: 'Paciente creado exitosamente',
        id_paciente: nuevoPaciente.id_paciente
      });

    } catch (error) {
      console.error('Error al crear paciente:', error);
      if (error.code === '23505') { // Código de PostgreSQL para violación de unique constraint
        res.status(409).json({ error: 'Paciente ya registrado con este DNI' });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  },

  // POST /api/pacientes/minimo - crear paciente con solo nombre y apellido
  // * Crea paciente mínimo (sólo nombre y apellido)
  crearPacienteMinimo: async (req, res) => {
    try {
      const idUsuario = req.session?.usuario?.id;
      if (!idUsuario) return res.status(401).json({ error: 'No autenticado' });
      const { nombre, apellido } = req.body;
      if (!nombre || !apellido) {
        return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
      }
      const nuevo = await Paciente.crearMinimo({ nombre, apellido }, idUsuario);
      res.status(201).json({ id_paciente: nuevo.id_paciente, nombre: nuevo.nombre, apellido: nuevo.apellido });
    } catch (error) {
      console.error('Error al crear paciente mínimo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // PUT /api/pacientes/:id
  // * Actualiza datos de un paciente (requiere nombre y apellido)
  actualizarPaciente: async (req, res) => {
    try {
      const { id } = req.params;
      const idUsuario = req.session?.usuario?.id;
      if (!idUsuario) return res.status(401).json({ error: 'No autenticado' });
      const {
        nombre, apellido, dni, fecha_nacimiento, sexo, telefono, telefono_adicional, email,
        cobertura, plan, numero_afiliado, localidad, direccion, ocupacion,
        enfermedades_preexistentes, alergias, observaciones
      } = req.body;

      // Validaciones básicas
      if (!nombre || !apellido) {
        return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
      }

      const normalizar = (v) => (v === undefined || v === null || String(v).trim() === '' ? null : v);
      const dniNorm = normalizar(dni);
      const fechaNacNorm = normalizar(fecha_nacimiento);

      const pacienteActualizado = await Paciente.actualizar(id, {
        nombre, apellido, dni: dniNorm, fecha_nacimiento: fechaNacNorm, sexo, telefono, telefono_adicional, email,
        cobertura, plan, numero_afiliado, localidad, direccion, ocupacion,
        enfermedades_preexistentes, alergias, observaciones
      }, idUsuario);

      if (!pacienteActualizado) {
        return res.status(404).json({ error: 'Paciente no encontrado' });
      }

      res.json({
        mensaje: 'Paciente actualizado exitosamente',
        paciente: pacienteActualizado
      });

    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      if (error.code === '23505') {
        res.status(409).json({ error: 'Ya existe otro paciente con este DNI' });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  },

  // DELETE /api/pacientes/:id
  // * Elimina (soft) un paciente por ID
  eliminarPaciente: async (req, res) => {
    try {
      const { id } = req.params;
      const idUsuario = req.session?.usuario?.id;
      if (!idUsuario) return res.status(401).json({ error: 'No autenticado' });
      const pacienteEliminado = await Paciente.eliminar(id, idUsuario);
      
      if (!pacienteEliminado) {
        return res.status(404).json({ error: 'Paciente no encontrado' });
      }

      res.json({ mensaje: 'Paciente eliminado exitosamente' });

    } catch (error) {
      console.error('Error al eliminar paciente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // GET /api/pacientes/buscar/:dni
  // * Busca paciente por DNI exacto
  buscarPorDni: async (req, res) => {
    try {
      const { dni } = req.params;
      const idUsuario = req.session?.usuario?.id;
      if (!idUsuario) return res.status(401).json({ error: 'No autenticado' });
      const paciente = await Paciente.buscarPorDni(dni, idUsuario);

      if (!paciente) {
        return res.status(404).json({ error: 'Paciente no encontrado' });
      }

      res.json(paciente);
    } catch (error) {
      console.error('Error al buscar paciente por DNI:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = controladorPacientes;
