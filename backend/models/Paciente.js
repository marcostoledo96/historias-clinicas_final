// Modelo: Paciente
// Responsable de las operaciones CRUD sobre la tabla `pacientes`
// Uso el patrón Active Record con `pg` y Pool compartido
// Todas las consultas filtran por `activo = true` (soft-delete)
// Los errores de BD se propagan y deben ser capturados por el controlador
const conexionBD = require('../db/connection');

class Paciente {
  // Obtener todos los pacientes activos
  static async obtenerTodos(idUsuario) {
    try {
      const resultado = await conexionBD.query(
  `SELECT id_paciente, nombre, apellido, dni, fecha_nacimiento, sexo, 
   telefono, telefono_adicional, email, cobertura, plan, numero_afiliado, localidad, direccion, 
         ocupacion, fecha_registro 
         FROM pacientes 
         WHERE activo = true AND id_usuario = $1 
         ORDER BY apellido, nombre`
      , [idUsuario]);
      return resultado.rows;
    } catch (error) {
      throw error;
    }
  }

  // Buscar paciente por ID
  static async buscarPorId(id, idUsuario) {
    try {
      const resultado = await conexionBD.query(
        `SELECT * FROM pacientes WHERE id_paciente = $1 AND activo = true AND id_usuario = $2`,
        [id, idUsuario]
      );
      return resultado.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Buscar paciente por DNI
  static async buscarPorDni(dni, idUsuario) {
    try {
      const resultado = await conexionBD.query(
  'SELECT * FROM pacientes WHERE dni = $1 AND activo = true AND id_usuario = $2',
        [dni, idUsuario]
      );
      return resultado.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Buscar pacientes por término
  static async buscar(termino, idUsuario) {
    try {
      const resultado = await conexionBD.query(
        `SELECT id_paciente, nombre, apellido, dni, fecha_nacimiento, sexo, 
      telefono, telefono_adicional, email, cobertura, plan 
         FROM pacientes 
         WHERE activo = true AND id_usuario = $2
         AND (LOWER(nombre) LIKE LOWER($1) 
              OR LOWER(apellido) LIKE LOWER($1) 
              OR dni LIKE $1)
         ORDER BY apellido, nombre`,
        [`%${termino}%`, idUsuario]
      );
      return resultado.rows;
    } catch (error) {
      throw error;
    }
  }

  // Crear nuevo paciente
  static async crear(datosPaciente, idUsuario) {
    try {
      const {
        nombre, apellido, dni, fecha_nacimiento, sexo, telefono, telefono_adicional, email,
        cobertura, plan, numero_afiliado, localidad, direccion, ocupacion,
        enfermedades_preexistentes, alergias, observaciones
      } = datosPaciente;

      const resultado = await conexionBD.query(
        `INSERT INTO pacientes (
          id_usuario, nombre, apellido, dni, fecha_nacimiento, sexo, telefono, telefono_adicional, email,
          cobertura, plan, numero_afiliado, localidad, direccion, ocupacion,
          enfermedades_preexistentes, alergias, observaciones
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id_paciente`,
        [
            idUsuario, nombre, apellido, dni, fecha_nacimiento, sexo, telefono, telefono_adicional, email,
            cobertura, plan, numero_afiliado, localidad, direccion, ocupacion,
            enfermedades_preexistentes, alergias, observaciones
        ]
      );
      return resultado.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Crear paciente con datos mínimos
  static async crearMinimo({ nombre, apellido }, idUsuario) {
    try {
      const resultado = await conexionBD.query(
        `INSERT INTO pacientes (id_usuario, nombre, apellido) VALUES ($1, $2, $3) RETURNING id_paciente, nombre, apellido`,
        [idUsuario, nombre, apellido]
      );
      return resultado.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Actualizar paciente existente
  static async actualizar(id, datosPaciente, idUsuario) {
    try {
      const {
        nombre, apellido, dni, fecha_nacimiento, sexo, telefono, telefono_adicional, email,
        cobertura, plan, numero_afiliado, localidad, direccion, ocupacion,
        enfermedades_preexistentes, alergias, observaciones
      } = datosPaciente;

      const resultado = await conexionBD.query(
        `UPDATE pacientes SET 
         nombre = $1, apellido = $2, dni = $3, fecha_nacimiento = $4, 
         sexo = $5, telefono = $6, telefono_adicional = $7, email = $8, cobertura = $9, plan = $10,
         numero_afiliado = $11, localidad = $12, direccion = $13, ocupacion = $14,
         enfermedades_preexistentes = $15, alergias = $16, observaciones = $17
         WHERE id_paciente = $18 AND activo = true AND id_usuario = $19
         RETURNING *`,
        [
          nombre, apellido, dni, fecha_nacimiento, sexo, telefono, telefono_adicional, email,
          cobertura, plan, numero_afiliado, localidad, direccion, ocupacion,
          enfermedades_preexistentes, alergias, observaciones, id, idUsuario
        ]
      );
      return resultado.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Eliminar paciente (soft-delete)
  static async eliminar(id, idUsuario) {
    try {
      const resultado = await conexionBD.query(
        'UPDATE pacientes SET activo = false WHERE id_paciente = $1 AND id_usuario = $2 RETURNING id_paciente',
        [id, idUsuario]
      );
      return resultado.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Paciente;