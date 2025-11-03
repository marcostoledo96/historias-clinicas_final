// * Inicio/Dashboard
// * Muestra estadísticas básicas (pacientes, turnos de hoy, atendidos) y lista los turnos del día.
// * Incluye búsqueda rápida de pacientes en un modal con debounce.

let turnosHoy = [];

// Inicialización de Inicio
document.addEventListener('DOMContentLoaded', async () => {
    const acceso = await inicializarPagina();
    if (!acceso) return;
    // MVP: se eliminaron estadísticas y turnos de hoy
    configurarEventListeners();
});

// * cargarEstadisticas(): solicita totales y calcula métricas del mes actual
// cargarEstadisticas eliminado (MVP)

// * cargarTurnosHoy(): obtiene turnos del día y los muestra en la tabla
// cargarTurnosHoy eliminado (MVP)

// * mostrarTurnos(turnos): pinta filas del listado de turnos del día
// mostrarTurnos eliminado (MVP)

// * marcarLlegada(idTurno): setea situacion=en_espera con hora actual
// marcarLlegada eliminado (MVP)

// * marcarAtendido(idTurno)
// marcarAtendido eliminado (MVP)

// * verPaciente(idPaciente): abre perfil en nueva pestaña
// verPaciente eliminado (MVP)

// * configurarEventListeners(): wire del modal de búsqueda rápida y sus eventos
function configurarEventListeners() {
    // Botón búsqueda rápida
    document.getElementById('btn-buscar-paciente').addEventListener('click', () => {
        const modal = document.getElementById('modal-busqueda');
        modal.classList.remove('hidden');
        modal.classList.add('active');
        document.getElementById('busqueda-input').focus();
    });
    
    // Cerrar modal
    document.getElementById('btn-cerrar-modal').addEventListener('click', cerrarModalBusqueda);
    
    // Búsqueda en tiempo real
    const busquedaInput = document.getElementById('busqueda-input');
    busquedaInput.addEventListener('input', debounce(realizarBusqueda, 300));
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModalBusqueda();
        }
    });
    
    // Cerrar modal al hacer click fuera
    const modalOverlay = document.getElementById('modal-busqueda');
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            cerrarModalBusqueda();
        }
    });
}

// * cerrarModalBusqueda(): oculta y limpia el modal
function cerrarModalBusqueda() {
    const modal = document.getElementById('modal-busqueda');
    modal.classList.remove('active');
    modal.classList.add('hidden');
    const input = document.getElementById('busqueda-input');
    if (input) input.value = '';
    const resultados = document.getElementById('resultados-busqueda');
    if (resultados) resultados.innerHTML = '';
}

// * realizarBusqueda(): fetch a /api/pacientes?buscar=... con debounce
async function realizarBusqueda() {
    const termino = document.getElementById('busqueda-input').value.trim();
    const resultadosContainer = document.getElementById('resultados-busqueda');
    
    if (termino.length < 2) {
        resultadosContainer.innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`/api/pacientes?buscar=${encodeURIComponent(termino)}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const pacientes = await response.json();
            mostrarResultadosBusqueda(pacientes);
        }
        
    } catch (error) {
        console.error('Error en búsqueda:', error);
        resultadosContainer.innerHTML = '<p class="text-error">Error en la búsqueda</p>';
    }
}

// * mostrarResultadosBusqueda(pacientes): renderiza ítems clicables del modal
function mostrarResultadosBusqueda(pacientes) {
    const resultadosContainer = document.getElementById('resultados-busqueda');
    
    if (pacientes.length === 0) {
        resultadosContainer.innerHTML = '<p class="text-gray-500">No se encontraron pacientes</p>';
        return;
    }
    
    resultadosContainer.innerHTML = `
        <div class="results-scroll">
            ${pacientes.map(paciente => `
                <div class="card-body result-item"
                     onclick="seleccionarPaciente(${paciente.id_paciente})">
                    <div class="flex justify-between items-center">
                        <div>
                            <strong>${paciente.nombre} ${paciente.apellido}</strong>
                            <br>
                            <small>DNI: ${paciente.dni} | ${calcularEdad(paciente.fecha_nacimiento)} años</small>
                        </div>
                        <span class="badge badge-secondary">${paciente.cobertura || 'Sin cobertura'}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// * seleccionarPaciente(idPaciente): cierra modal y abre perfil
function seleccionarPaciente(idPaciente) {
    cerrarModalBusqueda();
    abrirPerfilPaciente(idPaciente);
}