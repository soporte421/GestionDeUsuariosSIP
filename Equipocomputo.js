const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxHEcSYv_G47R3gYFYGsrtqFIBnLw2J07I-bKc-aTk8qd6ycocQAUEPuHJUEbg8x3GTrA/exec";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar evento para GUARDAR nuevos registros si existe el formulario
    const formulario = document.getElementById("formularioInventario");
    if (formulario) {
        formulario.addEventListener("submit", guardarNuevoRegistro);
    }

    // 2. Cargar tabla si existe en la página actual
    const tabla = document.getElementById("tablaEquipos") || document.getElementById("cuerpoTabla");
    if (tabla) {
        cargarDatos();
    }
});

// Extrae el valor tolerando diferencias entre mayúsculas y minúsculas
function getVal(item, claves) {
    if (!item) return "";
    for (let k of Object.keys(item)) {
        let kLimpia = k.toLowerCase().replace(/[^a-z0-9]/g, "");
        for (let c of claves) {
            let cLimpia = c.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (kLimpia === cLimpia) {
                let v = item[k];
                if (v !== undefined && v !== null && String(v).trim() !== "") {
                    return String(v).trim();
                }
            }
        }
    }
    return "";
}

// ==========================================
// 1. FUNCIONALIDAD: GUARDAR NUEVO REGISTRO
// ==========================================
function guardarNuevoRegistro(e) {
    e.preventDefault();
    const formulario = e.target;
    const btnGuardar = formulario.querySelector("button[type='submit']");
    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando... ⏳";

    const datosNuevoEquipo = {
        accion: "agregar",
        id: document.getElementById("id") ? document.getElementById("id").value : "",
        tipoEquipo: document.getElementById("tipoEquipo") ? document.getElementById("tipoEquipo").value : "",
        marca: document.getElementById("marca") ? document.getElementById("marca").value : "",
        modelo: document.getElementById("modelo") ? document.getElementById("modelo").value : "",
        identificador: document.getElementById("identificador") ? document.getElementById("identificador").value : "",
        procesador: document.getElementById("procesador") ? document.getElementById("procesador").value : "",
        ram: document.getElementById("ram") ? document.getElementById("ram").value : "",
        disco: document.getElementById("disco") ? document.getElementById("disco").value : "",
        sistema: document.getElementById("sistema") ? document.getElementById("sistema").value : "",
        usuario: document.getElementById("usuario") ? document.getElementById("usuario").value : "",
        departamento: document.getElementById("departamento") ? document.getElementById("departamento").value : "",
        ubicacion: document.getElementById("ubicacion") ? document.getElementById("ubicacion").value : "",
        estado: document.getElementById("estado") ? document.getElementById("estado").value : "",
        observaciones: document.getElementById("observaciones") ? document.getElementById("observaciones").value : "",
        teclado: document.getElementById("teclado") ? document.getElementById("teclado").value : "",
        mouse: document.getElementById("mouse") ? document.getElementById("mouse").value : "",
        camara: document.getElementById("camara") ? document.getElementById("camara").value : "",
        diademas: document.getElementById("diademas") ? document.getElementById("diademas").value : "",
        responsiva: document.getElementById("responsiva") ? document.getElementById("responsiva").value : ""
    };

    const callbackName = 'callbackGuardar_' + Math.floor(Math.random() * 1000000);
    const script = document.createElement('script');

    window[callbackName] = function(respuesta) {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);

        alert("✅ ¡Equipo guardado exitosamente en Google Sheets!");
        formulario.reset();
        btnGuardar.disabled = false;
        btnGuardar.textContent = "Guardar equipo";

        if (document.getElementById("tablaEquipos")) {
            cargarDatos();
        }
    };

    script.onerror = function() {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);
        alert("❌ Ocurrió un error al guardar el registro.");
        btnGuardar.disabled = false;
        btnGuardar.textContent = "Guardar equipo";
    };

    const params = new URLSearchParams(datosNuevoEquipo).toString();
    script.src = `${URL_SCRIPT}?prefix=${callbackName}&${params}`;
    document.body.appendChild(script);
}

// ==========================================
// 2. FUNCIONALIDAD: CARGAR Y MOSTRAR TABLA
// ==========================================
function cargarDatos() {
    const tbody = document.querySelector("#tablaEquipos tbody") || document.getElementById("cuerpoTabla");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="20" style="text-align:center; padding: 20px; color: #0891b2; font-weight: bold;">Cargando registros... ⏳</td></tr>`;

    const callbackName = 'callbackCargar_' + Math.floor(Math.random() * 1000000);
    const script = document.createElement('script');

    window[callbackName] = function(respuesta) {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);

        tbody.innerHTML = "";

        if (!respuesta || !Array.isArray(respuesta) || respuesta.length === 0) {
            tbody.innerHTML = `<tr><td colspan="20" style="text-align:center; padding: 20px;">No hay datos registrados.</td></tr>`;
            return;
        }

        respuesta.forEach((item) => {
            const fila = document.createElement("tr");

            const id = getVal(item, ["id", "ID"]);
            const tipo = getVal(item, ["tipoEquipo", "tipo", "tipoequipo"]);
            const marca = getVal(item, ["marca", "MARCA"]);
            const modelo = getVal(item, ["modelo", "MODELO"]);
            const identificador = getVal(item, ["identificador", "IDENTIFICADOR"]);
            const procesador = getVal(item, ["procesador", "PROCESADOR"]);
            const ram = getVal(item, ["ram", "RAM"]);
            const disco = getVal(item, ["disco", "DISCO"]);
            const sistema = getVal(item, ["sistema", "SISTEMA"]);
            const usuario = getVal(item, ["usuario", "USUARIO"]);
            const departamento = getVal(item, ["departamento", "DEPARTAMENTO"]);
            const ubicacion = getVal(item, ["ubicacion", "UBICACIÓN", "UBICACION"]);
            const estado = getVal(item, ["estado", "ESTADO"]);
            const observaciones = getVal(item, ["observaciones", "OBSERVACIONES"]);
            const teclado = getVal(item, ["teclado", "TECLADO"]);
            const mouse = getVal(item, ["mouse", "MOUSE"]);
            const camara = getVal(item, ["camara", "CAMARA", "CÁMARA"]);
            const diademas = getVal(item, ["diademas", "DIADEMAS"]);
            const responsiva = getVal(item, ["responsiva", "RESPONSIVA"]);
            const filaExcel = item.filaExcel || "";

            const itemJSON = encodeURIComponent(JSON.stringify({
                id, tipo, marca, modelo, identificador, procesador, ram, disco,
                sistema, usuario, departamento, ubicacion, estado, observaciones,
                teclado, mouse, camara, diademas, responsiva, filaExcel
            }));

            // Mapeo ordenado de 20 columnas exactas según la estructura del HTML
            fila.innerHTML = `
                <td style="white-space: nowrap;">
                    <button class="btn-accion btn-editar" onclick="abrirModalEditar('${itemJSON}')">✏️ Editar</button>
                    <button class="btn-accion btn-eliminar" onclick="eliminarRegistro('${filaExcel}')">🗑️ Eliminar</button>
                </td>
                <td>${id}</td>
                <td>${tipo}</td>
                <td>${marca}</td>
                <td>${modelo}</td>
                <td>${identificador}</td>
                <td>${procesador}</td>
                <td>${ram}</td>
                <td>${disco}</td>
                <td>${sistema}</td>
                <td>${usuario}</td>
                <td>${departamento}</td>
                <td>${ubicacion}</td>
                <td>${estado}</td>
                <td>${observaciones}</td>
                <td>${teclado}</td>
                <td>${mouse}</td>
                <td>${camara}</td>
                <td>${diademas}</td>
                <td>${responsiva}</td>
            `;

            tbody.appendChild(fila);
        });
    };

    script.onerror = function() {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);
        tbody.innerHTML = `<tr><td colspan="20" style="text-align:center; color: red; padding: 20px;">Error al cargar datos.</td></tr>`;
    };

    script.src = `${URL_SCRIPT}?prefix=${callbackName}`;
    document.body.appendChild(script);
}

// ==========================================
// 3. FUNCIONALIDAD: EDITAR Y ELIMINAR
// ==========================================
function abrirModalEditar(itemJSON) {
    const item = JSON.parse(decodeURIComponent(itemJSON));
    
    document.getElementById("editFilaExcel").value = item.filaExcel || "";
    document.getElementById("editId").value = item.id || "";
    document.getElementById("editTipo").value = item.tipo || "";
    document.getElementById("editMarca").value = item.marca || "";
    document.getElementById("editModelo").value = item.modelo || "";
    document.getElementById("editIdentificador").value = item.identificador || "";
    document.getElementById("editProcesador").value = item.procesador || "";
    document.getElementById("editRam").value = item.ram || "";
    document.getElementById("editDisco").value = item.disco || "";
    document.getElementById("editSistema").value = item.sistema || "";
    document.getElementById("editUsuario").value = item.usuario || "";
    document.getElementById("editDepartamento").value = item.departamento || "";
    document.getElementById("editUbicacion").value = item.ubicacion || "";
    document.getElementById("editEstado").value = item.estado || "";
    document.getElementById("editObservaciones").value = item.observaciones || "";
    document.getElementById("editTeclado").value = item.teclado || "";
    document.getElementById("editMouse").value = item.mouse || "";
    document.getElementById("editCamara").value = item.camara || "";
    document.getElementById("editDiademas").value = item.diademas || "";
    document.getElementById("editResponsiva").value = item.responsiva || "";

    const modal = document.getElementById("modalEditar");
    if (modal && modal.showModal) {
        modal.showModal();
    } else if (modal) {
        modal.setAttribute("open", "true");
    }
}

function cerrarModal() {
    const modal = document.getElementById("modalEditar");
    if (modal && modal.close) {
        modal.close();
    } else if (modal) {
        modal.removeAttribute("open");
    }
}

function guardarEdicion() {
    const datosModificados = {
        accion: "editar",
        filaExcel: document.getElementById("editFilaExcel").value,
        id: document.getElementById("editId").value,
        tipoEquipo: document.getElementById("editTipo").value,
        marca: document.getElementById("editMarca").value,
        modelo: document.getElementById("editModelo").value,
        identificador: document.getElementById("editIdentificador").value,
        procesador: document.getElementById("editProcesador").value,
        ram: document.getElementById("editRam").value,
        disco: document.getElementById("editDisco").value,
        sistema: document.getElementById("editSistema").value,
        usuario: document.getElementById("editUsuario").value,
        departamento: document.getElementById("editDepartamento").value,
        ubicacion: document.getElementById("editUbicacion").value,
        estado: document.getElementById("editEstado").value,
        observaciones: document.getElementById("editObservaciones").value,
        teclado: document.getElementById("editTeclado").value,
        mouse: document.getElementById("editMouse").value,
        camara: document.getElementById("editCamara").value,
        diademas: document.getElementById("editDiademas").value,
        responsiva: document.getElementById("editResponsiva").value
    };

    const callbackName = 'callbackEditar_' + Math.floor(Math.random() * 1000000);
    const script = document.createElement('script');

    window[callbackName] = function(respuesta) {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);
        alert("✅ Registro actualizado correctamente");
        cerrarModal();
        cargarDatos();
    };

    const params = new URLSearchParams(datosModificados).toString();
    script.src = `${URL_SCRIPT}?prefix=${callbackName}&${params}`;
    document.body.appendChild(script);
}

function eliminarRegistro(filaExcel) {
    if (!filaExcel) return;
    if (!confirm("¿Estás seguro de que deseas eliminar este registro?")) return;

    const callbackName = 'callbackEliminar_' + Math.floor(Math.random() * 1000000);
    const script = document.createElement('script');

    window[callbackName] = function(respuesta) {
        delete window[callbackName];
        if (document.body.contains(script)) document.body.removeChild(script);
        alert("🗑️ Registro eliminado correctamente");
        cargarDatos();
    };

    script.src = `${URL_SCRIPT}?prefix=${callbackName}&accion=eliminar&filaExcel=${filaExcel}`;
    document.body.appendChild(script);
}