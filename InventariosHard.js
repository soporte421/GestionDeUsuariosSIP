const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbyb3qSU37M7JtPk8IaGrPMQVBcBB0PUVvk4ZzRFUz6Fm2er2DQMomYuZxvm4Tr7nP1X/exec";

let registrosLocales = [];
let indexEditando = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarRegistros();

    const formGuardar = document.getElementById("formularioHardware");
    if (formGuardar) {
        formGuardar.addEventListener("submit", guardarNuevoRegistro);
    }

    const formEditar = document.getElementById("formularioEditar");
    if (formEditar) {
        formEditar.addEventListener("submit", guardarEdicionModal);
    }
});

function cargarRegistros() {
    const cuerpoTabla = document.getElementById("cuerpoTabla");
    const btnActualizar = document.getElementById("btnActualizar");

    if (btnActualizar) {
        btnActualizar.disabled = true;
        btnActualizar.textContent = "🔄 Cargando...";
    }

    if (cuerpoTabla && registrosLocales.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Cargando registros... ⏳</td></tr>`;
    }

    const callbackName = 'callbackCargarHard_' + Math.floor(Math.random() * 1000000);
    const script = document.createElement('script');

    const restaurarBoton = () => {
        if (btnActualizar) {
            btnActualizar.disabled = false;
            btnActualizar.textContent = "🔄 Actualizar Tabla";
        }
    };

    window[callbackName] = function(datos) {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);
        restaurarBoton();

        if (datos && datos.error) {
            if (cuerpoTabla && registrosLocales.length === 0) {
                cuerpoTabla.innerHTML = `<tr><td colspan="7" style="text-align:center; color: red; padding: 20px;">Error: ${datos.error}</td></tr>`;
            }
            return;
        }

        let listaRaw = Array.isArray(datos) ? datos : [];

        // Respeta el rowId original retornado desde Apps Script
        registrosLocales = listaRaw.map(item => ({
            id: item.rowId,
            dispositivos: item.dispositivos || "-",
            enFuncionamiento: item.enFuncionamiento || "0",
            enRevision: item.enRevision || "0",
            dejoDeFuncionar: item.dejoDeFuncionar || "0",
            cambio: item.cambio || "0",
            notas: item.notas || "-"
        }));

        renderizarTabla();
    };

    script.onerror = function() {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);
        restaurarBoton();
    };

    script.src = `${URL_SCRIPT}?prefix=${callbackName}&_nocache=${new Date().getTime()}`;
    document.body.appendChild(script);
}

function renderizarTabla() {
    const cuerpoTabla = document.getElementById("cuerpoTabla");
    if (!cuerpoTabla) return;

    cuerpoTabla.innerHTML = "";

    if (registrosLocales.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 15px;">No hay registros guardados.</td></tr>`;
        return;
    }

    registrosLocales.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${item.dispositivos}</strong></td>
            <td>${item.enFuncionamiento}</td>
            <td>${item.enRevision}</td>
            <td>${item.dejoDeFuncionar}</td>
            <td>${item.cambio}</td>
            <td>${item.notas}</td>
            <td style="white-space: nowrap;">
                <button type="button" class="btn btn-secondary" onclick="abrirModalEditar(${index})" style="padding: 4px 8px; margin-right: 4px;">✏️ Editar</button>
                <button type="button" class="btn btn-secondary" onclick="eliminarRegistro(${index})" style="padding: 4px 8px; color: red;">🗑️ Eliminar</button>
            </td>
        `;
        cuerpoTabla.appendChild(tr);
    });
}

function abrirModalEditar(index) {
    indexEditando = index;
    const item = registrosLocales[index];

    document.getElementById("editDispositivos").value = item.dispositivos;
    document.getElementById("editFuncionamiento").value = item.enFuncionamiento;
    document.getElementById("editRevision").value = item.enRevision;
    document.getElementById("editDejoDeFuncionar").value = item.dejoDeFuncionar;
    document.getElementById("editCambio").value = item.cambio;
    document.getElementById("editNotas").value = item.notas === "-" ? "" : item.notas;

    document.getElementById("modalEditar").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalEditar").style.display = "none";
    indexEditando = null;
}

function guardarEdicionModal(e) {
    e.preventDefault();

    if (indexEditando === null) return;

    const registroEditado = {
        accion: "editar",
        id: registrosLocales[indexEditando].id,
        dispositivos: document.getElementById("editDispositivos").value.trim(),
        enFuncionamiento: document.getElementById("editFuncionamiento").value.trim(),
        enRevision: document.getElementById("editRevision").value.trim(),
        dejoDeFuncionar: document.getElementById("editDejoDeFuncionar").value.trim(),
        cambio: document.getElementById("editCambio").value.trim(),
        notas: document.getElementById("editNotas").value.trim()
    };

    registrosLocales[indexEditando] = { ...registrosLocales[indexEditando], ...registroEditado };
    renderizarTabla();
    cerrarModal();

    enviarPeticionBackground(registroEditado);
}

function guardarNuevoRegistro(e) {
    e.preventDefault();

    const nuevoRegistro = {
        accion: "agregar",
        dispositivos: document.getElementById("dispositivos").value.trim(),
        enFuncionamiento: document.getElementById("enFuncionamiento").value.trim(),
        enRevision: document.getElementById("enRevision").value.trim(),
        dejoDeFuncionar: document.getElementById("dejoDeFuncionar").value.trim(),
        cambio: document.getElementById("cambio").value.trim(),
        notas: document.getElementById("notas").value.trim()
    };

    document.getElementById("formularioHardware").reset();

    enviarPeticionBackground(nuevoRegistro, () => {
        setTimeout(cargarRegistros, 1000);
    });
}

function eliminarRegistro(index) {
    if (!confirm("¿Seguro que deseas eliminar este registro?")) return;

    const itemAEliminar = registrosLocales[index];
    registrosLocales.splice(index, 1);
    renderizarTabla();

    enviarPeticionBackground({
        accion: "eliminar",
        id: itemAEliminar.id
    });
}

function enviarPeticionBackground(payload, callback) {
    const callbackName = 'callbackBG_' + Math.floor(Math.random() * 1000000);
    const script = document.createElement('script');

    window[callbackName] = function(respuesta) {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);
        if (callback) callback();
    };

    script.onerror = function() {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);
    };

    const params = new URLSearchParams(payload).toString();
    script.src = `${URL_SCRIPT}?prefix=${callbackName}&${params}&_nocache=${new Date().getTime()}`;
    document.body.appendChild(script);
}