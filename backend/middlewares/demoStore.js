// Almacén temporal para datos demo
// Esta clase la diseñé para mantener datos en memoria que se resetean automáticamente
class AlmacenDemo {
  constructor() {
    this.datos = new Map();
    this.contadores = new Map();
    
    // Programo limpieza automática cada 30 minutos
    setInterval(() => {
      this.limpiarDatosViejos();
    }, 30 * 60 * 1000);
  }

  // Inicializar datos para un usuario demo
  inicializarDatosUsuario(idUsuario) {
    if (!this.datos.has(idUsuario)) {
      this.datos.set(idUsuario, {
        pacientes: this.obtenerPacientesIniciales(),
        consultas: this.obtenerConsultasIniciales(),
        turnos: this.obtenerTurnosIniciales(),
        timestamp: Date.now()
      });
      
      this.contadores.set(idUsuario, {
        idPaciente: 1000,
        idConsulta: 2000,
        idTurno: 3000
      });
    }
    
    return this.datos.get(idUsuario);
  }

  // Obtener datos de un usuario
  getUserData(idUsuario) {
    return this.datos.get(idUsuario) || this.inicializarDatosUsuario(idUsuario);
  }

  // Agregar paciente demo
  addPaciente(idUsuario, datosPaciente) {
    const datosUsuario = this.getUserData(idUsuario);
    const contador = this.contadores.get(idUsuario);
    
    const nuevoPaciente = {
      id: ++contador.idPaciente,
      ...datosPaciente,
      fecha_creacion: new Date().toISOString(),
      demo: true
    };
    
    datosUsuario.pacientes.push(nuevoPaciente);
    return nuevoPaciente;
  }

  // Agregar consulta demo
  addConsulta(idUsuario, datosConsulta) {
    const datosUsuario = this.getUserData(idUsuario);
    const contador = this.contadores.get(idUsuario);
    
    const nuevaConsulta = {
      id: ++contador.idConsulta,
      ...datosConsulta,
      fecha_consulta: datosConsulta.fecha_consulta || new Date().toISOString(),
      demo: true
    };
    
    datosUsuario.consultas.push(nuevaConsulta);
    return nuevaConsulta;
  }

  // Agregar turno demo
  addTurno(idUsuario, datosTurno) {
    const datosUsuario = this.getUserData(idUsuario);
    const contador = this.contadores.get(idUsuario);
    
    const nuevoTurno = {
      id: ++contador.idTurno,
      ...datosTurno,
      demo: true
    };
    
    datosUsuario.turnos.push(nuevoTurno);
    return nuevoTurno;
  }

  // Actualizar paciente demo
  updatePaciente(idUsuario, idPaciente, datosActualizacion) {
    const datosUsuario = this.getUserData(idUsuario);
    const indice = datosUsuario.pacientes.findIndex(p => p.id == idPaciente);
    
    if (indice !== -1) {
      datosUsuario.pacientes[indice] = { ...datosUsuario.pacientes[indice], ...datosActualizacion };
      return datosUsuario.pacientes[indice];
    }
    return null;
  }

  // Eliminar datos de un usuario
  clearUserData(idUsuario) {
    this.datos.delete(idUsuario);
    this.contadores.delete(idUsuario);
  }

  // Limpiar datos antiguos (más de 2 horas)
  limpiarDatosViejos() {
    const ahora = Date.now();
    const edadMaxima = 2 * 60 * 60 * 1000; // 2 horas
    
    for (const [idUsuario, datosUsuario] of this.datos.entries()) {
      if (ahora - datosUsuario.timestamp > edadMaxima) {
        this.clearUserData(idUsuario);
        console.log(`🧹 Datos demo expirados limpiados para usuario: ${idUsuario}`);
      }
    }
  }

  // Datos iniciales para demo - los diseñé para que sean realistas
  obtenerPacientesIniciales() {
    return [
      {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        documento: '12345678',
        email: 'juan.perez@email.com',
        telefono: '1234567890',
        fecha_nacimiento: '1980-05-15',
        direccion: 'Calle Falsa 123',
        obra_social: 'OSDE',
        numero_afiliado: 'OS123456',
        demo: true
      },
      {
        id: 2,
        nombre: 'María',
        apellido: 'González',
        documento: '87654321',
        email: 'maria.gonzalez@email.com',
        telefono: '0987654321',
        fecha_nacimiento: '1975-10-20',
        direccion: 'Avenida Siempre Viva 456',
        obra_social: 'Swiss Medical',
        numero_afiliado: 'SM789012',
        demo: true
      }
    ];
  }

  obtenerConsultasIniciales() {
    return [
      {
        id: 1,
        paciente_id: 1,
        fecha_consulta: '2024-10-20T10:00:00',
        motivo: 'Control rutinario',
        diagnostico: 'Paciente en buen estado general',
        tratamiento: 'Continuar con medicación actual',
        observaciones: 'Próximo control en 6 meses',
        demo: true
      },
      {
        id: 2,
        paciente_id: 2,
        fecha_consulta: '2024-10-21T14:30:00',
        motivo: 'Dolor de cabeza',
        diagnostico: 'Cefalea tensional',
        tratamiento: 'Analgésicos según necesidad',
        observaciones: 'Evitar estrés, descanso adecuado',
        demo: true
      }
    ];
  }

  obtenerTurnosIniciales() {
    return [
      {
        id: 1,
        paciente_id: 1,
        fecha: '2024-10-25',
        hora: '09:00',
        motivo: 'Control rutinario',
        estado: 'confirmado',
        demo: true
      },
      {
        id: 2,
        paciente_id: 2,
        fecha: '2024-10-26',
        hora: '15:00',
        motivo: 'Seguimiento',
        estado: 'pendiente',
        demo: true
      }
    ];
  }
}

// Uso un singleton para compartir los datos
const almacenDemo = new AlmacenDemo();
module.exports = almacenDemo;