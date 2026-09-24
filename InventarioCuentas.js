    // Asegúrate de reemplazar esta URL si generaste una Nueva Implementación
    const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxfeBs3tty9USQaPxS8ivq2gpMi_7PD29i8u6vo4qY44y2bgpQxkMZzB18rc-ucfdGv/exec";

    window.datosUsuarios = [];

    document.addEventListener("DOMContentLoaded", () => {
        cargarUsuarios();
    });

    // ==========================================
    // 1. CARGAR USUARIOS
    // ==========================================
    function cargarUsuarios() {
        const tbody = document.querySelector("#tablaUsuarios tbody");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">Cargando usuarios... ⏳</td></tr>`;
        }

        const callbackName = 'callbackCargarUsuarios_' + Math.floor(Math.random() * 1000000);
        const script = document.createElement('script');

        window[callbackName] = function(datos) {
            delete window[callbackName];
            if (document.body.contains(script)) document.body.removeChild(script);

            if (datos && datos.error) {
                if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red; padding: 20px;">Error: ${datos.error}</td></tr>`;
                return;
            }

            window.datosUsuarios = Array.isArray(datos) ? datos : [];
            renderizarTablaUsuarios(window.datosUsuarios);
        };

        script.onerror = function() {
            delete window[callbackName];
            if (document.body.contains(script)) document.body.removeChild(script);
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red; padding: 20px;">Error de conexión con Google Sheets.</td></tr>`;
            }
        };

        // Parámetro anti-caché (_nocache)
        script.src = `${URL_SCRIPT}?prefix=${callbackName}&_nocache=${new Date().getTime()}`;
        document.body.appendChild(script);
    }

    // ==========================================
    // 2. RENDERIZAR TABLA
    // ==========================================
    function renderizarTablaUsuarios(datos) {
        const tbody = document.querySelector("#tablaUsuarios tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (!Array.isArray(datos) || datos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 15px;">No hay usuarios registrados.</td></tr>`;
            return;
        }

        datos.forEach((item, index) => {
            const tr = document.createElement("tr");
            const filaExcel = item.filaExcel || (index + 2);

            const usuario = item.usuario || "-";
            const correo = item.correo || "-";
            const estadoVal = String(item.estado || "Activo").trim();

            const esInactivo = estadoVal.toLowerCase() === "inactivo";
            const badgeClass = esInactivo ? "badge-inactivo" : "badge-activo";
            const textoEstado = esInactivo ? "Inactivo" : "Activo";

            tr.innerHTML = `
                <td style="white-space: nowrap;">
                    <button type="button" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="abrirModalEditar(${index})">✏️ Editar</button>
                    <button type="button" class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="eliminarUsuario(${filaExcel})">🗑️ Eliminar</button>
                </td>
                <td><strong>${usuario}</strong></td>
                <td>${correo}</td>
                <td><span class="badge ${badgeClass}">${textoEstado}</span></td>
            `;

            tbody.appendChild(tr);
        });
    }

    // ==========================================
    // 3. CONTROL DE MODAL
    // ==========================================
    function abrirModalCrear() {
        document.getElementById("modalTitulo").textContent = "➕ Nuevo Usuario";
        document.getElementById("editFilaExcel").value = "";
        document.getElementById("editUsuario").value = "";
        document.getElementById("editCorreo").value = "";
        document.getElementById("editPass").value = "";
        document.getElementById("editEstado").value = "Activo";

        const modal = document.getElementById("modalUsuario");
        if (modal.showModal) modal.showModal();
        else modal.style.display = "block";
    }

    function abrirModalEditar(index) {
        const item = window.datosUsuarios[index];
        if (!item) return;

        document.getElementById("modalTitulo").textContent = "✏️ Editar Usuario";
        document.getElementById("editFilaExcel").value = item.filaExcel || (index + 2);
        
        document.getElementById("editUsuario").value = item.usuario || "";
        document.getElementById("editPass").value = item.pass || "";
        document.getElementById("editCorreo").value = item.correo || "";
        
        const est = String(item.estado || "").toLowerCase().trim();
        document.getElementById("editEstado").value = (est === "inactivo") ? "Inactivo" : "Activo";

        const modal = document.getElementById("modalUsuario");
        if (modal.showModal) modal.showModal();
        else modal.style.display = "block";
    }

    function cerrarModalUsuario() {
        const modal = document.getElementById("modalUsuario");
        if (modal.close) modal.close();
        else modal.style.display = "none";
    }

    // ==========================================
    // 4. GUARDAR (AGREGAR / EDITAR)
    // ==========================================
    function guardarUsuario() {
        const filaExcel = document.getElementById("editFilaExcel").value;
        const usuario = document.getElementById("editUsuario").value.trim();
        const correo = document.getElementById("editCorreo").value.trim();
        const pass = document.getElementById("editPass").value.trim();
        const estado = document.getElementById("editEstado").value;

        if (!usuario || !correo || !pass) {
            alert("⚠️ Por favor completa todos los campos requeridos.");
            return;
        }

        const accion = filaExcel ? "editar" : "agregar";
        const datosPayload = { accion, filaExcel, usuario, pass, correo, estado };

        const callbackName = 'callbackGuardarUsuario_' + Math.floor(Math.random() * 1000000);
        const script = document.createElement('script');

        window[callbackName] = function(respuesta) {
            delete window[callbackName];
            if (document.body.contains(script)) document.body.removeChild(script);

            if (respuesta && respuesta.error) {
                alert("❌ Error: " + respuesta.error);
                return;
            }

            cerrarModalUsuario();
            cargarUsuarios();
        };

        script.onerror = function() {
            delete window[callbackName];
            if (document.body.contains(script)) document.body.removeChild(script);
            alert("❌ Error de conexión al guardar el usuario.");
        };

        const params = new URLSearchParams(datosPayload).toString();
        script.src = `${URL_SCRIPT}?prefix=${callbackName}&${params}&_nocache=${new Date().getTime()}`;
        document.body.appendChild(script);
    }

    // ==========================================
    // 5. ELIMINAR USUARIO
    // ==========================================
    function eliminarUsuario(filaExcel) {
        if (!filaExcel) return;
        if (!confirm(`¿Estás seguro de eliminar el registro de la fila ${filaExcel}?`)) return;

        const callbackName = 'callbackEliminarUsuario_' + Math.floor(Math.random() * 1000000);
        const script = document.createElement('script');

        window[callbackName] = function(respuesta) {
            delete window[callbackName];
            if (document.body.contains(script)) document.body.removeChild(script);

            if (respuesta && respuesta.error) {
                alert("❌ Error al eliminar: " + respuesta.error);
                return;
            }

            cargarUsuarios();
        };

        script.onerror = function() {
            delete window[callbackName];
            if (document.body.contains(script)) document.body.removeChild(script);
            alert("❌ Error al intentar eliminar.");
        };

        script.src = `${URL_SCRIPT}?prefix=${callbackName}&accion=eliminar&filaExcel=${filaExcel}&_nocache=${new Date().getTime()}`;
        document.body.appendChild(script);
    }