// * Nuevo turno (página separada)
// * Crea un turno sin forzar creación de paciente. Si no hay id_paciente, usa nombre/apellido temporales.
// * Autocompleta cobertura si se selecciona un paciente existente.

document.addEventListener('DOMContentLoaded', async () => {
  const acceso = await inicializarPagina();
  if (!acceso) return;

  const params = getURLParams();
  const formulario = document.getElementById('formulario-nuevo-turno');

  // * Prefill día si viene por query (?dia=YYYY-MM-DD). Si no, hoy.
  if (params.dia && formulario && formulario.dia) {
    formulario.dia.value = params.dia;
  } else if (formulario && formulario.dia) {
    // por defecto hoy
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    formulario.dia.value = `${yyyy}-${mm}-${dd}`;
  }

  integrarSelectorPacientesTurno_Nuevo();
  integrarAutocompletePaciente_Nuevo();
  configurarEventos_Nuevo();
});

// * integrarSelectorPacientesTurno_Nuevo(): usa el modal selector y autocompleta cobertura
function integrarSelectorPacientesTurno_Nuevo() {
  const display = document.getElementById('paciente-entrada');
  const hidden = document.querySelector('#formulario-nuevo-turno [name="id_paciente"]');
  const btn = document.getElementById('btn-seleccionar-paciente-turno');
  if (!display || !hidden || !btn) return;

  const abrir = (prefill='') => {
    abrirSelectorPacientes({
      prefill,
      onSelect: (p) => {
        display.value = `${p.nombre} ${p.apellido} (DNI ${p.dni})`;
        hidden.value = p.id_paciente;
        // Autocompletar cobertura si existe en el paciente
        const coberturaInput = document.querySelector('#formulario-nuevo-turno [name="cobertura"]');
        if (coberturaInput) coberturaInput.value = p.cobertura || '';
      }
    });
  };

  btn.addEventListener('click', () => abrir(display.value.trim()));
  display.addEventListener('entrada', () => { hidden.value = ''; });
}

// * integrarAutocompletePaciente_Nuevo(): autocompletado con carga de cobertura en selección
function integrarAutocompletePaciente_Nuevo() {
  const entrada = document.getElementById('paciente-entrada');
  const menu = document.getElementById('paciente-sugerencias');
  const hidden = document.querySelector('#formulario-nuevo-turno [name="id_paciente"]');
  if (!entrada || !menu || !hidden) return;

  let timer = null;
  let opciones = [];
  const ocultar = () => { menu.classList.add('hidden'); menu.innerHTML=''; };
  const mostrar = (items) => {
    if (!items.length) { ocultar(); return; }
    menu.innerHTML = items.map(p => `
      <div class="item-sugerencia" datos-id="${p.id_paciente}" style="padding:8px; cursor:pointer; display:flex; justify-content:space-between;">
        <span>${p.nombre} ${p.apellido}</span>
        <span style="color: var(--color-gray-600);">DNI ${p.dni || '-'}</span>
      </div>
    `).join('');
    menu.classList.remove('hidden');
  };

  const buscar = async (q) => {
    try {
      const url = q ? `/api/pacientes?buscar=${encodeURIComponent(q)}` : '/api/pacientes';
      const resp = await fetch(url, { credentials: 'include' });
      if (!resp.ok) { manejarErrorAPI(null, resp); return; }
      const datos = await resp.json();
      opciones = datos.slice(0, 20);
      mostrar(opciones);
    } catch (e) { manejarErrorAPI(e); }
  };

  entrada.addEventListener('entrada', () => {
    hidden.value = '';
    const q = entrada.value.trim();
    if (timer) clearTimeout(timer);
    if (!q) { ocultar(); return; }
    timer = setTimeout(() => buscar(q), 200);
  });

  entrada.addEventListener('focus', () => {
    const q = entrada.value.trim();
    if (q) buscar(q);
  });

  entrada.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { ocultar(); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (opciones.length > 0) {
        const p = opciones[0];
        entrada.value = `${p.nombre} ${p.apellido} (DNI ${p.dni || '-'})`;
        hidden.value = p.id_paciente;
        // Autocompletar cobertura
        const coberturaInput = document.querySelector('#formulario-nuevo-turno [name="cobertura"]');
        if (coberturaInput) coberturaInput.value = p.cobertura || '';
        ocultar();
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#paciente-sugerencias') || e.target === entrada) return;
    ocultar();
  });

  menu.addEventListener('click', (e) => {
    const row = e.target.closest('.item-sugerencia');
    if (!row) return;
    const id = parseInt(row.dataset.id, 10);
    const p = opciones.find(x => x.id_paciente === id);
    if (!p) return;
    entrada.value = `${p.nombre} ${p.apellido} (DNI ${p.dni || '-'})`;
    hidden.value = p.id_paciente;
    // Autocompletar cobertura
    const coberturaInput = document.querySelector('#formulario-nuevo-turno [name="cobertura"]');
    if (coberturaInput) coberturaInput.value = p.cobertura || '';
    ocultar();
  });
}

// * configurarEventos_Nuevo(): navegación de retorno, cancelar y submit con normalización
function configurarEventos_Nuevo() {
  // Volver a Turnos (mantiene día si existe)
  const btnVolver = document.getElementById('btn-volver-turnos');
  if (btnVolver) {
    btnVolver.addEventListener('click', () => {
      try {
        const dia = document.querySelector('#formulario-nuevo-turno [name="dia"]').value;
        const base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
        const url = new URL(base + 'turnos.html');
        if (dia) url.searchParams.set('dia', dia);
        window.location.href = url.toString();
      } catch (e) { window.location.href = 'turnos.html'; }
    });
  }

  document.getElementById('btn-cancelar-turno').addEventListener('click', () => {
    window.close();
  });

  document.getElementById('formulario-nuevo-turno').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData.entries());
    datos.primera_vez = formData.get('primera_vez') ? true : false;

    if (!datos.dia || !datos.horario) {
      mostrarAlerta('Día y horario son requeridos', 'error');
      return;
    }

    // ? Si no hay paciente seleccionado: NO crear paciente. Usar nombre/apellido temporales.
    if (!datos.id_paciente) {
      const nombreCompleto = (document.getElementById('paciente-entrada')?.value || '').trim();
      const partes = nombreCompleto.split(/\s+/).filter(Boolean);
      if (partes.length < 2) {
        mostrarAlerta('Ingresa nombre y apellido del paciente (mínimo) para crear el turno', 'warning');
        return;
      }
      datos.paciente_nombre_tmp = partes.slice(0, -1).join(' ');
      datos.paciente_apellido_tmp = partes.slice(-1).join(' ');
    }

    // Normalizar cadenas vacías a null cuando aplique
    if (datos.cobertura !== undefined && String(datos.cobertura).trim() === '') datos.cobertura = null;
    if (datos.detalle !== undefined && String(datos.detalle).trim() === '') datos.detalle = null;

    try {
      setButtonLoading('btn-guardar-turno', true);
      const resp = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(datos)
      });
      const result = await resp.json();
      if (resp.ok) {
        mostrarAlerta('turno creado con éxito', 'success');
        // Si se abrió desde turnos, refrescar día y cerrar
        try {
          if (window.opener && !window.opener.closed) {
            const dia = datos.dia;
            const base = window.opener.location.origin + window.opener.location.pathname.replace(/[^/]*$/, '');
            const url = new URL(base + 'turnos.html');
            if (dia) url.searchParams.set('dia', dia);
            window.opener.location.href = url.toString();
          }
        } catch (err) {
          // no-op
        }
        setTimeout(() => window.close(), 400);
      } else {
        manejarErrorAPI(result, resp);
        mostrarAlerta(result.error || 'No se pudo crear el turno', 'error');
      }
    } catch (e) {
      manejarErrorAPI(e);
    } finally {
      setButtonLoading('btn-guardar-turno', false);
    }
  });
}

