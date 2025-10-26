// Middleware para modo demo
// Aquí implementé la lógica que me permite mostrar la aplicación sin comprometer datos reales
const almacenDemo = require('./demoStore');

// Emails que considero como usuarios demo
const EMAILS_DEMO = [
  'demo@historias.com',
  'admin@historias.com',
  'test@historias.com',
  'prueba@historias.com'
];

// Middleware para identificar si es un usuario demo
const modoDemo = (req, res, next) => {
  // Verifico si el usuario está logueado y es un usuario demo
  if (req.session.user && EMAILS_DEMO.includes(req.session.user.email.toLowerCase())) {
    req.esUsuarioDemo = true;
    req.idUsuarioDemo = req.session.user.id;
    
    // Agrego header para que el frontend sepa que está en modo demo
    res.set('X-Demo-Mode', 'true');
    
    console.log(`🎭 Usuario demo detectado: ${req.session.user.email}`);
  } else {
    req.esUsuarioDemo = false;
  }
  
  next();
};

// Función para interceptar operaciones de escritura en modo demo
const interceptarOperacionesDemo = (req, res, next) => {
  if (!req.esUsuarioDemo) {
    return next();
  }

  const metodo = req.method.toLowerCase();
  const esOperacionEscritura = ['post', 'put', 'patch', 'delete'].includes(metodo);
  
  if (esOperacionEscritura) {
    console.log(`🎭 Interceptando operación ${metodo.toUpperCase()} para usuario demo`);
    
    // Marco que esta es una operación demo
    req.operacionDemo = true;
    
    // Creo una respuesta simulada si no hay datos específicos
    req.simularExito = (datos = {}) => {
      return res.json({
        exito: true,
        mensaje: 'Operación realizada en modo demo (cambios temporales)',
        datos: datos,
        demo: true
      });
    };
  }
  
  next();
};

// Función para limpiar datos demo cuando el usuario cierra sesión
const limpiarDatosDemo = (idUsuario) => {
  if (idUsuario) {
    almacenDemo.clearUserData(idUsuario);
    console.log(`🧹 Datos demo limpiados para usuario: ${idUsuario}`);
  }
};

module.exports = {
  modoDemo,
  interceptarOperacionesDemo,
  limpiarDatosDemo,
  EMAILS_DEMO
};