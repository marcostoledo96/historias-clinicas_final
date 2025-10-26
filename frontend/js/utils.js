// Utilidades generales para la aplicación
// Aquí pongo funciones helper de UI y validaciones que uso en varias páginas
// Convención: mostrarAlerta(mensaje, tipo) donde tipo puede ser success, error, warning, info

// Variable global para saber si está en modo demo
let esModoDemo = false;

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo = 'info') {
  const contenedorAlertas = document.getElementById('alert-container');
  if (!contenedorAlertas) return;
  
  // Limpio alertas previas
  contenedorAlertas.innerHTML = '';
  
  const divAlerta = document.createElement('div');
  divAlerta.className = `alert alert-${tipo}`;
  divAlerta.textContent = mensaje;
  
  contenedorAlertas.appendChild(divAlerta);
  
  // Se oculta automáticamente después de 5 segundos
  setTimeout(() => {
    divAlerta.remove();
  }, 5000);
}

// Función para mostrar banner de modo demo
function mostrarBannerDemo() {
  // Evito duplicar banners
  if (document.getElementById('banner-demo')) return;
  
  const banner = document.createElement('div');
  banner.id = 'banner-demo';
  banner.className = 'banner-demo';
  banner.innerHTML = `
    <div class="contenido-demo">
      <span class="icono-demo">🎭</span>
      <span class="texto-demo">MODO DEMO - Los cambios son temporales y se borrarán al cerrar sesión</span>
      <button class="cerrar-demo" onclick="ocultarBannerDemo()">×</button>
    </div>
  `;
  
  // Lo inserto al principio del body
  document.body.insertBefore(banner, document.body.firstChild);
  
  esModoDemo = true;
}

// Función para ocultar banner demo
function ocultarBannerDemo() {
  const banner = document.getElementById('banner-demo');
  if (banner) {
    banner.remove();
  }
}

// Función para interceptar respuestas de API y detectar modo demo
function interceptarRespuestaAPI(response, data) {
  // Verifico header de modo demo
  if (response.headers.get('X-Demo-Mode') === 'true') {
    mostrarBannerDemo();
  }
  
  // Verifico si la respuesta indica modo demo
  if (data && data.demo === true) {
    mostrarBannerDemo();
  }
  
  return data;
}

// Función para formatear fechas
// * formatearFecha(fecha)
// > Entrada: fecha en formato aceptado por fecha (string/fecha). Salida: DD/MM/AAAA (es-AR).
function formatearFecha(fecha) {
  if (!fecha) return '';
  const fecha = new fecha(fecha);
  return fecha.toLocaleDateString('es-AR');
}

// Función para formatear fecha y hora
// formatearFechaHora eliminado por no uso

// Función para calcular edad
// * calcularEdad(fechaNacimiento)
// > Calcula edad (años) a partir de fecha de nacimiento. Retorna '' si falta.
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '';
  const hoy = new fecha();
  const nacimiento = new fecha(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
}

// Función para validar email
// * validarEmail(email)
// > Valida formato básico de email.
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Función para validar DNI
// * validarDNI(dni)
// > Valida DNI argentino de 7 u 8 dígitos (string de números).
function validarDNI(dni) {
  const regex = /^\d{7,8}$/;
  return regex.test(dni);
}

// capitalizar eliminado por no uso

// Función para obtener badge de situación de turno
// * getBadgeSituacion(situacion)
// > Devuelve HTML para badge según estado del turno.
function getBadgeSituacion(situacion) {
  const insignias = {
    'programado': 'badge-programado',
    'en_espera': 'badge-en-espera', 
    'atendido': 'badge-atendido',
    'ausente': 'badge-ausente',
    'cancelado': 'badge-cancelado'
  };
  
  const textos = {
    'programado': 'Programado',
    'en_espera': 'En Espera', 
    'atendido': 'Atendido',
    'ausente': 'Ausente',
    'cancelado': 'Cancelado'
  };
  
  return `<span class="badge ${insignias[situacion] || 'badge-secondary'}">${textos[situacion] || situacion}</span>`;
}

// Función para limpiar formulario
// * limpiarFormulario(formId)
// > Ejecuta formulario.reset() si existe el formulario con ese id.
function limpiarFormulario(formId) {
  const formulario = document.getElementById(formId);
  if (formulario) {
    formulario.reset();
  }
}

// Función para confirmar acción
// * confirmarAccion(mensaje)
// > Wrapper para confirm() para estandarizar y facilitar reemplazo futuro.
function confirmarAccion(mensaje) {
  return confirm(mensaje);
}

// Función para debounce (útil para búsquedas)
// * debounce(func, wait)
// > Evita ejecuciones repetidas; ejecuta la función luego de inactividad (wait ms).
function debounce(func, wait) {
  let temporizador;
  return function executedFunction(...args) {
    const despues = () => {
      clearTimeout(temporizador);
      func(...args);
    };
    clearTimeout(temporizador);
    temporizador = setTimeout(despues, wait);
  };
}

// Función para mostrar/ocultar elementos
// * mostrarElemento/ocultarElemento
// > Alternan la clase .hidden en elementos por id.
function mostrarElemento(elementId) {
  const elemento = document.getElementById(elementId);
  if (elemento) {
    elemento.classList.remove('hidden');
  }
}

function ocultarElemento(elementId) {
  const elemento = document.getElementById(elementId);
  if (elemento) {
    elemento.classList.add('hidden');
  }
}

// Función para toggle de elementos
// toggleElemento eliminado por no uso

// Función para loading en botones
// * setButtonLoading(buttonId, isLoading)
// > Deshabilita/rehabilita un botón y gestiona un cargando interno.
function setButtonLoading(buttonId, isLoading) {
  const boton = document.getElementById(buttonId);
  if (!boton) return;
  if (isLoading) {
    boton.disabled = true;
    // Añadir cargando si no existe
    let cargando = boton.querySelector('.loading');
    if (!cargando) {
      cargando = document.createElement('span');
      cargando.className = 'loading';
      cargando.setAttribute('aria-hidden', 'true');
      boton.prepend(cargando);
    }
  } else {
    boton.disabled = false;
    const cargando = boton.querySelector('.loading');
    if (cargando) cargando.remove();
  }
}

// Función para exportar tabla a CSV
// exportarACSV eliminado por no uso

// Función para obtener parámetros de URL
// * getURLParams()
// > Devuelve los parámetros de la URL actual como objeto simple clave/valor.
function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params);
}

// Función para setear parámetro en URL sin recargar
// setURLParam eliminado por no uso

// Función para manejar errores de API
// * manejarErrorAPI(error, response)
// * Estrategia estandar para manejar respuestas HTTP y errores de red.
// ? 401 → redirige a login; 403/404/5xx muestran alerta contextual.
function manejarErrorAPI(error, response = null) {
  console.error('Error API:', error);
  
  if (response) {
    if (response.status === 401) {
      mostrarAlerta('Sesión expirada. Por favor, inicia sesión nuevamente.', 'error');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      return;
    }
    
    if (response.status === 403) {
      mostrarAlerta('No tienes permisos para realizar esta acción.', 'error');
      return;
    }
    
    if (response.status === 404) {
      mostrarAlerta('Recurso no encontrado.', 'error');
      return;
    }
    
    if (response.status >= 500) {
      mostrarAlerta('Error interno del servidor. Intenta nuevamente.', 'error');
      return;
    }
  }
  
  mostrarAlerta('Error de conexión. Verifica tu conexión a internet.', 'error');
}

// Abrir perfil del paciente en nueva pestaña (opcionalmente en modo edición)
// * abrirPerfilPaciente(id, editar=false)
// > Abre `perfil_paciente.html` en nueva pestaña; si editar=true agrega ?edit=1
function abrirPerfilPaciente(id, editar = false) {
  if (!id) return;
  // Construir URL hacia perfil_paciente.html relativo al sitio actual
  const base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
  const url = new URL(base + 'perfil_paciente.html');
  url.searchParams.set('id', id);
  if (editar) url.searchParams.set('edit', '1');
  window.open(url.toString(), '_blank');
}

// Aplicar tema según preferencias locales (claro/oscuro)
// * Aplicación de tema claro/oscuro
// > Lee localStorage.preferencias.tema y setea data-theme en <html>.
(function aplicarTemaPreferencias() {
  try {
    const prefs = JSON.parse(localStorage.getItem('preferencias') || '{}');
    const tema = prefs.tema || 'claro';
    document.documentElement.setAttribute('data-theme', tema === 'oscuro' ? 'dark' : 'light');
  } catch (e) {
    // por defecto claro
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

