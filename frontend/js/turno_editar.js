// * Editar turno
// * Carga un turno por id y permite actualizar campos. Normaliza cadenas vacías a null para evitar errores de DB.

document.addEventListener('DOMContentLoaded', async () => {
  const acceso = await inicializarPagina();
  if (!acceso) return;

  const { id, dia } = getURLParams();
  if (!id) { mostrarAlerta('Falta ID de turno', 'error'); return; }

  await cargarTurno(id);
  configurarEventos(id, dia);
});

// * cargarTurno(id): obtiene datos y prellena el formulario
async function cargarTurno(id) {
  try {
    const resp = await fetch(`/api/turnos/${id}`, { credentials: 'include' });
    if (!resp.ok) return manejarErrorAPI(null, resp);
    const t = await resp.json();

    const formulario = document.getElementById('formulario-editar-turno');
    formulario.paciente.value = `${t.nombre} ${t.apellido}`;
    formulario.dia.value = t.dia ? t.dia.substring(0,10) : '';
    formulario.horario.value = t.horario ? t.horario.substring(0,5) : '';
    formulario.cobertura.value = t.cobertura || '';
    formulario.hora_llegada.value = t.hora_llegada ? t.hora_llegada.substring(0,5) : '';
    formulario.situacion.value = t.situacion || 'programado';
    formulario.primera_vez.checked = !!t.primera_vez;
    formulario.detalle.value = t.detalle || '';

    formulario.dataset.id = id;
  } catch (e) { manejarErrorAPI(e); }
}

// * configurarEventos(id, dia): wire del submit y navegación de retorno (preserva ?dia)
function configurarEventos(id, dia) {
  document.getElementById('btn-volver-turno').addEventListener('click', () => {
    window.location.href = `turnos.html${dia ? `?dia=${dia}`:''}`;
  });

  document.getElementById('formulario-editar-turno').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formulario = e.target;
    const datos = Object.fromEntries(new FormData(formulario).entries());
    datos.primera_vez = formulario.primera_vez.checked;

    // Normalizar opcionales: enviar null si están vacíos (evita errores de TIME en backend/DB)
    if (datos.hora_llegada !== undefined && String(datos.hora_llegada).trim() === '') {
      datos.hora_llegada = null;
    }
    if (datos.cobertura !== undefined && String(datos.cobertura).trim() === '') {
      datos.cobertura = null;
    }
    if (datos.detalle !== undefined && String(datos.detalle).trim() === '') {
      datos.detalle = null;
    }

    if (!datos.dia || !datos.horario) {
      mostrarAlerta('Día y horario son requeridos', 'error');
      return;
    }

    try {
      const resp = await fetch(`/api/turnos/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(datos)
      });
      const result = await resp.json();
      if (resp.ok) {
        mostrarAlerta('turno actualizado', 'success');
      } else {
        manejarErrorAPI(result, resp);
        mostrarAlerta(result.error || 'No se pudo actualizar', 'error');
      }
    } catch (e) { manejarErrorAPI(e); }
  });
}

