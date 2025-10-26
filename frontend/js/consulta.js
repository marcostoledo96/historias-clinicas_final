// ! Página de consulta (ver/editar/crear)
// * Modos soportados:
//   - Ver/Editar: consulta.html?id=123 → carga consulta y habilita guardado (PUT)
//   - Crear: consulta.html?nuevo=1&id_paciente=456 → prellena con datos del paciente (POST)
// * Contratos con backend:
//   - GET /api/consultas/:id, POST /api/consultas, PUT /api/consultas/:id
//   - GET /api/pacientes/:id (para autocompletar campos de solo lectura)
// ? UX: auto-grow de textareas; calculo de edad; navegación segura de retorno

document.addEventListener('DOMContentLoaded', async () => {
  const acceso = await inicializarPagina();
  if (!acceso) return;

  const { id, nuevo, id_paciente } = getURLParams();

  // Modo edición/visualización de una consulta existente
  if (id) {
    await cargarConsulta(id);
    configurarEventosConsulta({ modo: 'editar', idConsulta: id });
    return;
  }

  // Modo creación de una nueva consulta desde el perfil del paciente
  if ((nuevo === '1' || nuevo === 1) && id_paciente) {
    await inicializarNuevaConsulta(id_paciente);
    configurarEventosConsulta({ modo: 'crear', idPaciente: id_paciente });
    return;
  }

  // Si no hay id ni parámetros de nueva consulta, mostrar error
  mostrarAlerta('Falta ID de consulta o id_paciente para crear una nueva', 'error');
});

// Inicializa la vista para crear una nueva consulta con datos del paciente
async function inicializarNuevaConsulta(idPaciente) {
  try {
    const formulario = document.getElementById('formulario-consulta');
    // Guardamos el id del paciente en dataset para reutilizar en otros flujos
    formulario.dataset.idPaciente = idPaciente;

    // Autocompletar encabezado (solo lectura) con datos del paciente
    await autocompletarDesdePaciente(formulario);

    // Setear fecha de consulta por defecto al día de hoy (local)
    if (formulario.fecha) formulario.fecha.value = obtenerFechaHoyLocal();

    // Enfocar el primer campo editable (motivo)
    const firstEditable = formulario.querySelector('textarea[name="motivo_consulta"]');
    if (firstEditable) firstEditable.focus();
  } catch (e) {
    manejarErrorAPI(e);
  }
}

async function cargarConsulta(id) {
  try {
    const resp = await fetch(`/api/consultas/${id}`, { credentials: 'include' });
    if (!resp.ok) return manejarErrorAPI(null, resp);
    const c = await resp.json();

    const formulario = document.getElementById('formulario-consulta');
  formulario.dataset.idPaciente = c.id_paciente || c.paciente_id;
  // Mostrar como "Apellido, Nombre"
  const ape = c.apellido || '';
  const nom = c.nombre || '';
  formulario.paciente.value = `${ape}${ape && nom ? ', ' : ''}${nom}`.trim();
    formulario.fecha.value = c.fecha ? c.fecha.substring(0,10) : '';
    formulario.numero_afiliado.value = c.numero_afiliado || '';
    formulario.cobertura.value = c.cobertura || '';
  if (formulario.plan) formulario.plan.value = c.plan || '';
  // Datos de clínica (solo lectura)
  if (formulario.sexo) formulario.sexo.value = c.sexo || '';
  if (formulario.fecha_nacimiento) formulario.fecha_nacimiento.value = c.fecha_nacimiento ? c.fecha_nacimiento.substring(0,10) : '';
  if (formulario.enfermedades_preexistentes) formulario.enfermedades_preexistentes.value = c.enfermedades_preexistentes || '';
    formulario.motivo_consulta.value = c.motivo_consulta || '';
    formulario.informe_medico.value = c.informe_medico || '';
    formulario.diagnostico.value = c.diagnostico || '';
    formulario.tratamiento.value = c.tratamiento || '';
    formulario.estudios.value = c.estudios || '';

    // Mostrar edad junto a fecha de nacimiento
    actualizarEdadConsulta();

    // Autocompletar con datos del perfil del paciente si faltan o para unificar fuente
    await autocompletarDesdePaciente(formulario);
  } catch (e) { manejarErrorAPI(e); }
}

function configurarEventosConsulta(opts = {}) {
  const { modo, idConsulta, idPaciente } = opts;
  document.getElementById('btn-volver-consulta').addEventListener('click', () => {
    window.history.length > 1 ? window.history.back() : window.location.href = 'inicio.html';
  });

  const btnPerfil = document.getElementById('btn-ver-perfil-consulta');
  if (btnPerfil) {
    btnPerfil.addEventListener('click', () => {
      const formulario = document.getElementById('formulario-consulta');
      const pid = formulario?.dataset?.idPaciente;
      if (pid) abrirPerfilPaciente(pid);
      else mostrarAlerta('No se pudo determinar el paciente de la consulta', 'warning');
    });
  }

  document.getElementById('formulario-consulta').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target).entries());

    // Validación mínima
    if (!datos.motivo_consulta) {
      mostrarAlerta('Motivo de consulta es requerido', 'error');
      return;
    }

    try {
      let resp;
      if (modo === 'crear') {
        // Agregar id_paciente desde dataset si no viene del formulario (inputs disabled no se envían)
        const formulario = document.getElementById('formulario-consulta');
        const pid = idPaciente || formulario?.dataset?.idPaciente;
        if (!pid) {
          mostrarAlerta('No se pudo determinar el paciente para crear la consulta', 'error');
          return;
        }
        const payload = { ...datos, id_paciente: pid };
        // Si no se completó la fecha, setear hoy por defecto
        if (!payload.fecha) payload.fecha = obtenerFechaHoyLocal();
        resp = await fetch('/api/consultas', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
        });
      } else {
        resp = await fetch(`/api/consultas/${idConsulta}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(datos)
        });
      }
      const result = await resp.json();
      if (resp.ok) {
        mostrarAlerta(modo === 'crear' ? 'consulta creada' : 'consulta guardada', 'success');
        // Si es creación, podemos redirigir a la vista de la consulta recién creada
        if (modo === 'crear' && result && (result.id || result.id_consulta)) {
          const nuevoId = result.id || result.id_consulta;
          setTimeout(() => { window.location.href = `consulta.html?id=${nuevoId}`; }, 600);
        }
      } else {
        manejarErrorAPI(result, resp);
        mostrarAlerta(result.error || 'No se pudo guardar', 'error');
      }
    } catch (e) { manejarErrorAPI(e); }
  });

  // Auto-grow para Motivo (1 renglón inicial) y Diagnóstico (1 renglón inicial)
  const autoGrow = (el, minRows = 1) => {
    if (!el) return;
    const cs = window.getComputedStyle(el);
    let lineHeight = parseFloat(cs.lineHeight);
    if (isNaN(lineHeight)) {
      const fontSize = parseFloat(cs.fontSize) || 16;
      lineHeight = Math.round(fontSize * 1.4);
    }
    const minHeight = Math.max(1, lineHeight * minRows);
    el.style.height = 'auto';
    el.style.overflowY = 'hidden';
    el.style.height = Math.max(minHeight, el.scrollHeight) + 'px';
  };

  const motivo = document.querySelector('textarea[name="motivo_consulta"]');
  if (motivo) {
    autoGrow(motivo, 1);
    motivo.addEventListener('entrada', () => autoGrow(motivo, 1));
    motivo.addEventListener('change', () => autoGrow(motivo, 1));
    motivo.addEventListener('paste', () => setTimeout(() => autoGrow(motivo, 1), 0));
  }

  const diag = document.querySelector('textarea[name="diagnostico"]');
  if (diag) {
    autoGrow(diag, 1);
    diag.addEventListener('entrada', () => autoGrow(diag, 1));
    diag.addEventListener('change', () => autoGrow(diag, 1));
    diag.addEventListener('paste', () => setTimeout(() => autoGrow(diag, 1), 0));
  }

  // Auto-grow para Informe (3 filas mínimas), Estudios (2) y Tratamiento (2)
  const informe = document.querySelector('textarea[name="informe_medico"]');
  if (informe) {
    autoGrow(informe, 3);
    informe.addEventListener('entrada', () => autoGrow(informe, 3));
    informe.addEventListener('change', () => autoGrow(informe, 3));
    informe.addEventListener('paste', () => setTimeout(() => autoGrow(informe, 3), 0));
  }

  const estudios = document.querySelector('textarea[name="estudios"]');
  if (estudios) {
    autoGrow(estudios, 2);
    estudios.addEventListener('entrada', () => autoGrow(estudios, 2));
    estudios.addEventListener('change', () => autoGrow(estudios, 2));
    estudios.addEventListener('paste', () => setTimeout(() => autoGrow(estudios, 2), 0));
  }

  const tratamiento = document.querySelector('textarea[name="tratamiento"]');
  if (tratamiento) {
    autoGrow(tratamiento, 2);
    tratamiento.addEventListener('entrada', () => autoGrow(tratamiento, 2));
    tratamiento.addEventListener('change', () => autoGrow(tratamiento, 2));
    tratamiento.addEventListener('paste', () => setTimeout(() => autoGrow(tratamiento, 2), 0));
  }

  // Actualizar edad en la vista de consulta (solo lectura)
  actualizarEdadConsulta();
}

function actualizarEdadConsulta() {
  try {
    const formulario = document.getElementById('formulario-consulta');
    if (!formulario) return;
    const fecha = formulario.fecha_nacimiento ? formulario.fecha_nacimiento.value : '';
    const span = document.getElementById('edad-consulta');
    if (!span) return;
    if (!fecha) { span.textContent = ''; return; }
    const edad = calcularEdad(fecha);
    if (edad === '' || isNaN(edad) || edad < 0) { span.textContent = ''; return; }
    span.textContent = `${edad} años`;
  } catch {}
}

// Rellena campos de solo lectura con datos del perfil del paciente
async function autocompletarDesdePaciente(formulario) {
  try {
    const id = formulario?.dataset?.idPaciente;
    if (!id) return;
    const resp = await fetch(`/api/pacientes/${id}`, { credentials: 'include' });
    if (!resp.ok) return; // si falla, no bloqueamos la vista de consulta
    const p = await resp.json();

    const ape = p.apellido || '';
    const nom = p.nombre || '';
    formulario.paciente.value = `${ape}${ape && nom ? ', ' : ''}${nom}`.trim();

    if (formulario.cobertura && !formulario.cobertura.value) formulario.cobertura.value = p.cobertura || '';
    if (formulario.plan && !formulario.plan.value) formulario.plan.value = p.plan || '';
    if (formulario.numero_afiliado && !formulario.numero_afiliado.value) formulario.numero_afiliado.value = p.numero_afiliado || '';

    if (formulario.sexo && !formulario.sexo.value) formulario.sexo.value = p.sexo || '';
    if (formulario.fecha_nacimiento && !formulario.fecha_nacimiento.value) formulario.fecha_nacimiento.value = p.fecha_nacimiento ? p.fecha_nacimiento.substring(0,10) : '';
    if (formulario.enfermedades_preexistentes && !formulario.enfermedades_preexistentes.value) formulario.enfermedades_preexistentes.value = p.enfermedades_preexistentes || '';

    actualizarEdadConsulta();
  } catch (e) {
    // silencioso: el flujo de consulta debe seguir funcionando aunque falle este fetch
    console.warn('No se pudo autocompletar datos del paciente:', e);
  }
}

// Utilidad: devuelve YYYY-MM-DD en horario local
function obtenerFechaHoyLocal() {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

