const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxHEcSYv_G47R3gYFYGsrtqFIBnLw2J07I-bKc-aTk8qd6ycocQAUEPuHJUEbg8x3GTrA/exec";

// Variable global para guardar la lista de datos sin romper el HTML
window.datosTabla = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarTabla();
    
    const btnActualizar = document.querySelector(".btn-actualizar");
    if (btnActualizar) {
        btnActualizar.addEventListener("click", cargarTabla);
    }
});

function cargarTabla() {
    const tbody = document.querySelector("#tablaEquipos tbody") || document.querySelector("tbody");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="20" style="text-align:center; padding: 20px; color: #0891b2; font-weight: bold;">Cargando registros... ⏳</td></tr>`;
    }

    const callbackName = 'callbackCargarTabla_' + Math.floor(Math.random() * 1000000);
    const script = document.createElement('script');

    window[callbackName] = function(datos) {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);

        console.log("Datos recibidos de Google Sheets:", datos);
        window.datosTabla = datos; // Guardamos copia global
        renderizarTabla(datos);
    };

    script.onerror = function() {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="20" style="text-align:center; color: red; padding: 20px;">Error al conectar con Google Sheets.</td></tr>`;
        }
    };

    script.src = `${URL_SCRIPT}?prefix=${callbackName}`;
    document.body.appendChild(script);
}

// BUSCADOR ULTRA FLEXIBLE Y POR POSICIÓN (A-S)
function getCampo(item, clavesPosibles, indicePosicional) {
    if (!item) return "-";

    // 1. Si el objeto viene estructurado como un Array directo de celdas
    if (Array.isArray(item) && indicePosicional !== undefined) {
        let valArr = item[indicePosicional];
        if (valArr !== undefined && valArr !== null && String(valArr).trim() !== "") {
            return String(valArr).trim();
        }
    }

    // 2. Búsqueda por nombre de propiedad (sin importar mayúsculas, minúsculas ni símbolos/emojis)
    const clavesItem = Object.keys(item);
    for (let cp of clavesPosibles) {
        const cpLimpia = cp.toLowerCase().replace(/[^a-z0-9]/g, "");
        for (let ki of clavesItem) {
            const kiLimpia = ki.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (cpLimpia === kiLimpia) {
                let v = item[ki];
                if (v !== undefined && v !== null && String(v).trim() !== "") {
                    return String(v).trim();
                }
            }
        }
    }

    // 3. Fallback: probar índices numéricos si las propiedades vienen como ["0", "1", "2"]
    if (indicePosicional !== undefined && item[indicePosicional] !== undefined) {
        let vNum = item[indicePosicional];
        if (vNum !== undefined && vNum !== null && String(vNum).trim() !== "") {
            return String(vNum).trim();
        }
    }

    return "-";
}

// RENDERIZADO SEGURO
function renderizarTabla(datos) {
    const tbody = document.querySelector("#tablaEquipos tbody") || document.querySelector("tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!Array.isArray(datos) || datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="20" style="text-align:center; padding: 15px;">No hay registros disponibles.</td></tr>`;
        return;
    }

    datos.forEach((item, index) => {
        const tr = document.createElement("tr");
        const filaExcel = item.filaExcel || item.FILAEXCEL || (index + 2);

        tr.innerHTML = `
            <td style="white-space: nowrap;">
                <button type="button" style="cursor:pointer; padding: 4px 8px; margin-right: 4px;" onclick="abrirModalEdicionPorIndice(${index})">✏️ Editar</button>
                <button type="button" style="cursor:pointer; padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 3px;" onclick="eliminarRegistro(${filaExcel})">🗑️ Eliminar</button>
            </td>
            <td>${getCampo(item, ["id"], 0)}</td>
            <td>${getCampo(item, ["tipo de equipo", "tipoequipo", "tipo"], 1)}</td>
            <td>${getCampo(item, ["marca"], 2)}</td>
            <td>${getCampo(item, ["modelo"], 3)}</td>
            <td>${getCampo(item, ["identificador del producto", "identificador", "identificadordelproducto"], 4)}</td>
            <td>${getCampo(item, ["procesador"], 5)}</td>
            <td>${getCampo(item, ["memoria ram", "ram", "memoriaram"], 6)}</td>
            <td>${getCampo(item, ["disco duro", "disco", "discoduro"], 7)}</td>
            <td>${getCampo(item, ["sistema operativo", "sistema", "sistemaoperativo"], 8)}</td>
            <td>${getCampo(item, ["usuario asignado", "usuario", "usuarioasignado"], 9)}</td>
            <td>${getCampo(item, ["departamento"], 10)}</td>
            <td>${getCampo(item, ["ubicacion", "ubicación"], 11)}</td>
            <td>${getCampo(item, ["estado"], 12)}</td>
            <td>${getCampo(item, ["observaciones"], 13)}</td>
            <td>${getCampo(item, ["id teclado", "teclado"], 14)}</td>
            <td>${getCampo(item, ["id mouse", "mouse"], 15)}</td>
            <td>${getCampo(item, ["id videocamara", "camara", "cámara"], 16)}</td>
            <td>${getCampo(item, ["id diademas audiculares", "diademas"], 17)}</td>
            <td>${getCampo(item, ["responsiva"], 18)}</td>
        `;

        tbody.appendChild(tr);
    });
}

// ABRIR MODAL USANDO EL ÍNDICE DEL ARRAY
function abrirModalEdicionPorIndice(index) {
    const item = window.datosTabla[index];
    if (!item) return;

    // Asignar número de fila
    const editFila = document.getElementById("editFilaExcel") || document.getElementById("edit_filaExcel");
    if (editFila) editFila.value = item.filaExcel || item.FILAEXCEL || (index + 2);

    const mapeo = {
        "editId": [["id"], 0],
        "editTipo": [["tipo de equipo", "tipoequipo", "tipo"], 1],
        "editMarca": [["marca"], 2],
        "editModelo": [["modelo"], 3],
        "editIdentificador": [["identificador del producto", "identificador", "identificadordelproducto"], 4],
        "editProcesador": [["procesador"], 5],
        "editRam": [["memoria ram", "ram", "memoriaram"], 6],
        "editDisco": [["disco duro", "disco", "discoduro"], 7],
        "editSistema": [["sistema operativo", "sistema", "sistemaoperativo"], 8],
        "editUsuario": [["usuario asignado", "usuario", "usuarioasignado"], 9],
        "editDepartamento": [["departamento"], 10],
        "editUbicacion": [["ubicacion", "ubicación"], 11],
        "editEstado": [["estado"], 12],
        "editObservaciones": [["observaciones"], 13],
        "editTeclado": [["id teclado", "teclado"], 14],
        "editMouse": [["id mouse", "mouse"], 15],
        "editCamara": [["id videocamara", "camara", "cámara"], 16],
        "editDiademas": [["id diademas audiculares", "diademas"], 17],
        "editResponsiva": [["responsiva"], 18]
    };

    for (let inputId in mapeo) {
        const inputElem = document.getElementById(inputId) || document.getElementById(inputId.replace("edit", "edit_").toLowerCase());
        if (inputElem) {
            const val = getCampo(item, mapeo[inputId][0], mapeo[inputId][1]);
            inputElem.value = val === "-" ? "" : val;
        }
    }

    const modal = document.getElementById("modalEditar") || document.getElementById("modalEdicion");
    if (modal) {
        if (modal.showModal) modal.showModal();
        else modal.style.display = "block";
    }
}

// CERRAR MODAL (BOTÓN CANCELAR)
function cerrarModal() {
    const modal = document.getElementById("modalEditar") || document.getElementById("modalEdicion");
    if (modal) {
        if (modal.close) {
            modal.close();
        } else {
            modal.removeAttribute("open");
            modal.style.display = "none";
        }
    }
}

function cerrarModalEdicion() {
    cerrarModal();
}

// GUARDAR CAMBIOS (BOTÓN GUARDAR CAMBIOS)
function guardarEdicion() {
    const editFilaElem = document.getElementById("editFilaExcel") || document.getElementById("edit_filaExcel");
    const filaExcel = editFilaElem ? editFilaElem.value : "";

    if (!filaExcel) {
        alert("⚠️ No se encontró el número de fila para editar.");
        return;
    }

    const getValModal = (id1, id2) => {
        const el = document.getElementById(id1) || document.getElementById(id2);
        return el ? el.value : "";
    };

    const datosModificados = {
        accion: "editar",
        filaExcel: filaExcel,
        id: getValModal("editId", "edit_id"),
        tipoEquipo: getValModal("editTipo", "edit_tipoEquipo"),
        marca: getValModal("editMarca", "edit_marca"),
        modelo: getValModal("editModelo", "edit_modelo"),
        identificador: getValModal("editIdentificador", "edit_identificador"),
        procesador: getValModal("editProcesador", "edit_procesador"),
        ram: getValModal("editRam", "edit_ram"),
        disco: getValModal("editDisco", "edit_disco"),
        sistema: getValModal("editSistema", "edit_sistema"),
        usuario: getValModal("editUsuario", "edit_usuario"),
        departamento: getValModal("editDepartamento", "edit_departamento"),
        ubicacion: getValModal("editUbicacion", "edit_ubicacion"),
        estado: getValModal("editEstado", "edit_estado"),
        observaciones: getValModal("editObservaciones", "edit_observaciones"),
        teclado: getValModal("editTeclado", "edit_teclado"),
        mouse: getValModal("editMouse", "edit_mouse"),
        camara: getValModal("editCamara", "edit_camara"),
        diademas: getValModal("editDiademas", "edit_diademas"),
        responsiva: getValModal("editResponsiva", "edit_responsiva")
    };

    const callbackName = 'callbackEditar_' + Math.floor(Math.random() * 1000000);
    const script = document.createElement('script');

    window[callbackName] = function(respuesta) {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);

        alert("✅ ¡Registro actualizado con éxito!");
        cerrarModal();
        cargarTabla();
    };

    script.onerror = function() {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);
        alert("❌ Error de conexión al intentar guardar la edición.");
    };

    const params = new URLSearchParams(datosModificados).toString();
    script.src = `${URL_SCRIPT}?prefix=${callbackName}&${params}`;
    document.body.appendChild(script);
}

// ELIMINAR REGISTRO
function eliminarRegistro(filaExcel) {
    if (!filaExcel) return;
    if (!confirm(`¿Estás seguro de que deseas eliminar el registro de la fila ${filaExcel}?`)) return;

    const callbackName = 'callbackEliminar_' + Math.floor(Math.random() * 1000000);
    const script = document.createElement('script');

    window[callbackName] = function(respuesta) {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);

        alert("🗑️ ¡Registro eliminado con éxito!");
        cargarTabla();
    };

    script.onerror = function() {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);
        alert("❌ Error de conexión al intentar eliminar.");
    };

    script.src = `${URL_SCRIPT}?prefix=${callbackName}&accion=eliminar&filaExcel=${filaExcel}`;
    document.body.appendChild(script);
}