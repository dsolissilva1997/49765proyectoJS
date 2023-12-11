const asientos = [];
let carrito = [];
//Se llama a función que obtienen los datos desde la "api", el json que se encuentra en la carpeta JS "asientos.json"
obtenerDatosJson();

const carritoGuardado = localStorage.getItem('carrito');
if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    mostrarAlertaCarritoRecuperado();
}

//Fetch con uso de promesa
async function obtenerDatosJson() {
    const URL = "js/asientos.json";
    fetch(URL)
        .then((response) => response.json())
        .then((data) => asientos.push(...data))
        .then(() => {mostrarAsientosEnContenedor(asientos);})
        .catch((error) => mostrarError(error))
}

function mostrarAsientosEnContenedor(asientos) {
    const asientosContainer = document.getElementById('asientos-container');
    asientosContainer.innerHTML = ''; 
    asientos.forEach(asiento => {
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Asiento ${asiento.id}</h5>
                    <p class="card-text">Precio: $${asiento.precio}</p>
                    <p class="card-text">Categoria: ${asiento.categoria}</p>
                    <button class="btn btn-primary" onclick="registrarAsiento(${asiento.id})">Seleccionar</button>
                </div>
            </div>
        `;
        asientosContainer.appendChild(card);
    });
}

//funcion con uso de promesa
function registrarAsiento(id) {
    Swal.fire({
        title: 'Ingresa tu nombre',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Registrar',
        showLoaderOnConfirm: true,
        preConfirm: (nombrePasajero) => {
            return new Promise((resolve, reject) => {
                if (nombrePasajero) {
                    resolve(nombrePasajero);
                } else {
                    reject('Ingresa un nombre válido');
                }
            });
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            const asientoEnCarrito = carrito.find(asiento => asiento.id === id);
            
            if (!asientoEnCarrito && asientos[id - 1].estado === 'disponible') {
                asientos[id - 1].nombre = result.value;
                asientos[id - 1].estado = 'ocupado';
                mostrarAlertaAsientoRegistrado(id, result.value);
                agregarAlCarrito(asientos[id - 1]);
            } else if (asientoEnCarrito) {
                mostrarAlertaAsientoRegistrado(id, result.value);
            } else {
                mostrarAlertaAsientoOcupado(id);
            }
        }
    }).catch((error) => {
        mostrarAlertaError(error);
    });
}

function mostrarCarritoEnContenedor(carrito) {
    const asientosContainer = document.getElementById('asientos-container');
    
    // Si el carrito esta vacio, muestra un mensaje de advertencia y muestra array de asientos nuevamente en el html
    if (carrito.length === 0) {
        mostrarAlertaCarritoVacio();
        mostrarAsientosEnContenedor(asientos);
    } else {
        // Si hay productos en el carrito, muestra cada producto
        asientosContainer.innerHTML = '';
        carrito.forEach(asiento => {
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Asiento ${asiento.id}</h5>
                        <p class="card-text">Precio: $${asiento.precio}</p>
                        <p class="card-text">Categoria: ${asiento.categoria}</p>
                        <p class="card-text">Nombre del pasajero: ${asiento.nombre}</p>
                    </div>
                </div>
            `;
            asientosContainer.appendChild(card);
        });
    }
}

function agregarAlCarrito(asiento) {
    carrito.push(asiento);
    actualizarCarritoEnStorage();
    mostrarAlertaCarritoAgregado();
}

function actualizarCarritoEnStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function calcularCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        if (carrito.length > 0) {
            let total = carrito.reduce((sum, asiento) => sum + asiento.precio, 0);
            mostrarAlertaCarritoTotal(total);
        } else {
            mostrarAlertaCarritoVacio();
        }
    } else {
        mostrarAlertaCarritoVacio();
    }
}

//funcion con promesa
function limpiarCarrito() {
    Swal.fire({
        icon: 'warning',
        title: '¿Estas seguro?',
        text: 'Esta accion eliminara todos los asientos del carrito.',
        showCancelButton: true,
        confirmButtonText: 'Si, Limpiar Carrito',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            asientos.forEach(asiento => {
                asiento.nombre = '';
                asiento.estado = 'disponible';
            });

            carrito = [];
            actualizarCarritoEnStorage();
            mostrarAlertaCarritoLimpiado();
            mostrarAsientosEnContenedor(asientos);
        }
    });
}

//buscador

function buscarAsientosPorCategoria(categoriaBuscada) {
    const categoriaNormalizada = categoriaBuscada.toLowerCase();

    return asientos.filter(asiento => {
        const categoriaAsientoNormalizada = asiento.categoria.toLowerCase();
        return categoriaAsientoNormalizada.includes(categoriaNormalizada);
    });
}

function buscarYMostrarAsientosPorCategoria() {
    const categoriaBuscada = document.getElementById('busquedaCategoria').value.trim();

    if (categoriaBuscada) {
        const asientosEncontrados = buscarAsientosPorCategoria(categoriaBuscada);

        if (asientosEncontrados.length > 0) {
            mostrarAsientosEncontrados(asientosEncontrados);
        } else {
            mostrarAlertaSinResultados(categoriaBuscada);
            mostrarAsientosEnContenedor(asientos);
        }
    } else {
        mostrarAlertaNombreInvalido();
        mostrarAsientosEnContenedor(asientos);
    }
}

function mostrarAsientosEncontrados(asientosEncontrados) {
    const asientosContainer = document.getElementById('asientos-container');
    asientosContainer.innerHTML = ''; 

    asientosEncontrados.forEach(asiento => {
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Asiento ${asiento.id}</h5>
                    <p class="card-text">Precio: $${asiento.precio}</p>
                    <p class="card-text">Categoria: ${asiento.categoria}</p>
                    <button class="btn btn-primary" onclick="registrarAsiento(${asiento.id})">Seleccionar</button>
                </div>
            </div>
        `;
        asientosContainer.appendChild(card);
    });
}

//alertas

function mostrarAlertaSinResultados(categoriaBuscada) {
    Swal.fire({
        title: 'Sin Resultados',
        text: `No se encontraron asientos para la categoría '${categoriaBuscada}'.`,
        icon: 'warning',
        confirmButtonText: 'OK'
    });
}

function mostrarAlertaNombreInvalido() {
    Swal.fire({
        title: 'Nombre Invalido',
        text: 'Ingresa una categoria valida.',
        icon: 'error',
        confirmButtonText: 'OK'
    });
}

function mostrarAlertaError(error) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error,
    });
}

function mostrarAlertaCarritoLimpiado() {
    Swal.fire({
        icon: 'success',
        title: 'Carrito Limpio',
        text: 'Todos los asientos han sido eliminados del carrito.',
    });
}

function mostrarAlertaAsientoRegistrado(id, nombrePasajero) {
    Swal.fire({
        icon: 'success',
        title: '¡Asiento Registrado!',
        text: `El asiento ${id} ha sido reservado para ${nombrePasajero}.`,
    });
}

function mostrarAlertaAsientoOcupado(id) {
    Swal.fire({
        icon: 'warning',
        title: 'Asiento Ocupado',
        text: `El asiento ${id} ya esta ocupado.`,
    });
}

function mostrarAlertaNombreInvalido() {
    Swal.fire({
        icon: 'error',
        title: 'Nombre Invalido',
        text: 'Ingresa un nombre valido.',
    });
}

function mostrarAlertaCarritoAgregado() {
    Swal.fire({
        icon: 'success',
        title: '¡Producto agregado al carrito!',
        showConfirmButton: false,
        timer: 1500,
    });
}

function mostrarAlertaCarritoTotal(total) {
    Swal.fire({
        icon: 'info',
        title: 'Total a Pagar',
        text: `Total a pagar: $${total}`,
    });
}

function mostrarAlertaCarritoVacio() {
    Swal.fire({
        icon: 'info',
        title: 'Carrito Vacio',
        text: 'No hay asientos registrados en el carrito.',
    });
}

function mostrarAlertaCarritoRecuperado() {
    Swal.fire({
        icon: 'info',
        title: 'Recuperando tu Carrito Anterior',
        text: '¡Bienvenido de nuevo!',
        timer: 3000,
    });
}
//en esta alerta queria mostrar el error pero encontre que era mejor el mensaje, por eso no utilice la emtrada "error"
function mostrarError(error) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "No se puede conectar con la base de datos",
    });
}

function mostrarAlertaCarritoVacio() {
    Swal.fire({
        icon: 'info',
        title: 'El carrito se encuentra vacio',
        text: 'Carrito esta vacio, cargaremos los productos para que seleccione su asiento',
        timer: 3000,
    });
}