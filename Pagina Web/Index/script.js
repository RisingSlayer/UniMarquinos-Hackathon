var map;
var markerDestino;
var directionsService;
var directionsRenderer;
var coordenadasUsuario;
var autocompleteInicio;
var autocompleteDestino;

function iniciarMap() {
    obtenerUbicacionUsuario();

    autocompleteInicio = new google.maps.places.Autocomplete(
        document.getElementById('ubicacion'),
        {
            fields: ['geometry', 'name']
        }
    );

    autocompleteInicio.addListener('place_changed', function() {
        var place = autocompleteInicio.getPlace();
        if (!place.geometry) {
            console.error("No se encontraron detalles de la ubicación para el lugar proporcionado:", place.name);
            return;
        }
        coordenadasUsuario = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        };
        actualizarUbicacionUsuario(coordenadasUsuario);
    });

    autocompleteDestino = new google.maps.places.Autocomplete(
        document.getElementById('destino'),
        {
            fields: ['geometry', 'name']
        }
    );

    autocompleteDestino.addListener('place_changed', function() {
        var place = autocompleteDestino.getPlace();
        if (!place.geometry) {
            console.error("No se encontraron detalles de la ubicación para el lugar proporcionado:", place.name);
            return;
        }
        var coordDestino = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        };
        placeMarker(coordDestino);
    });
}

function obtenerUbicacionUsuario() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            coordenadasUsuario = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            inicializarMapa(coordenadasUsuario);
        }, function () {
            console.error("Error al obtener la ubicación del usuario.");
            alert("No se pudo obtener la ubicación del usuario.");
            var coordenadasPredeterminadas = { lat: -12.0459093, lng: -76.9586752 };
            inicializarMapa(coordenadasPredeterminadas);
        });
    } else {
        console.error("Geolocalización no soportada.");
        alert("La geolocalización no está soportada en este navegador.");
        var coordenadasPredeterminadas = { lat: -12.0459093, lng: -76.9586752 };
        inicializarMapa(coordenadasPredeterminadas);
    }
}

function inicializarMapa(coordenadasUsuario) {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: coordenadasUsuario,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            }
        ],
        zoomControl: false,
        streetViewControl: false
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: { strokeColor: "#0b132b" }
    });

    // Agregar marcador para la ubicación exacta actual
    var iconoUsuario = {
        url: '../images/carro.png',
        scaledSize: new google.maps.Size(30, 30)
    };
    var markerUsuario = new google.maps.Marker({
        position: coordenadasUsuario,
        map: map,
        icon: iconoUsuario
    });

    map.addListener('click', function(event) {
        placeMarker(event.latLng);
    });

    var floatingButton = document.querySelector('.floating-button button');
    floatingButton.addEventListener('click', toggleInputs);
}

function placeMarker(location) {
    if (markerDestino) {
        markerDestino.setMap(null);
    }
    markerDestino = new google.maps.Marker({
        position: location,
        map: map
    });
    calculateRoute();
}

function calculateRoute() {
    if (markerDestino) {
        var coordDestino = markerDestino.getPosition();

        var request = {
            origin: coordenadasUsuario,
            destination: coordDestino,
            travelMode: 'DRIVING'
        };

        directionsService.route(request, function (response, status) {
            if (status === 'OK') {
                directionsRenderer.setDirections({routes: []});
                directionsRenderer.setDirections(response);

                var leg = response.routes[0].legs[0];
                var iconoUsuario = {
                    url: '../images/carro.png',
                    scaledSize: new google.maps.Size(30, 30)
                };
                var markerInicio = new google.maps.Marker({
                    position: leg.start_location,
                    map: map,
                    icon: iconoUsuario
                });
            } else {
                console.error('Error al calcular la ruta:', status);
            }
        });
    } else {
        console.error('Por favor, seleccione una ubicación de destino en el mapa.');
    }
}

function actualizarUbicacionUsuario(coordenadas) {
    coordenadasUsuario = coordenadas;
    map.setCenter(coordenadas);
    placeMarker(coordenadas);
}

function toggleInputs() {
    var inputsContainer = document.querySelector('.inputs-container');
    inputsContainer.classList.toggle('inputs-visible');
}

function mostrarListaChoferes() {
    // Crear el contenedor del rectángulo blanco
    var overlay = document.createElement('div');
    overlay.classList.add('overlay');

    // Crear el contenedor de la lista de choferes
    var choferesContainer = document.createElement('div');
    choferesContainer.classList.add('choferes-container');
    choferesContainer.id = 'lista-choferes'; // Establecer el id

    // Crear el botón para cerrar el cuadro de lista de choferes
    var closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', function() {
        cerrarListaChoferes(overlay); // Pasar el elemento overlay como argumento
    });

    // Crear el título de la lista de choferes
    var title = document.createElement('h2');
    title.textContent = 'Choferes Disponibles';

    // Crear la tabla
    var tabla = document.createElement('table');
    tabla.classList.add('chofer-table');

    // Crear la fila de cabecera
    var cabecera = document.createElement('tr');

    // Crear las celdas de la cabecera
    var nombreCabecera = document.createElement('th');
    nombreCabecera.textContent = 'Nombre';

    var placaCabecera = document.createElement('th');
    placaCabecera.textContent = 'Placa';

    var precioCabecera = document.createElement('th');
    precioCabecera.textContent = 'Precio';

    var tiempoLlegadaCabecera = document.createElement('th');
    tiempoLlegadaCabecera.textContent = 'Tiempo de Llegada';

    var seleccionarCabecera = document.createElement('th');
    seleccionarCabecera.textContent = ''; // La cabecera del botón no necesita texto

    // Agregar las celdas a la fila de cabecera
    cabecera.appendChild(nombreCabecera);
    cabecera.appendChild(placaCabecera);
    cabecera.appendChild(precioCabecera);
    cabecera.appendChild(tiempoLlegadaCabecera);
    cabecera.appendChild(seleccionarCabecera);

    // Agregar la fila de cabecera a la tabla
    tabla.appendChild(cabecera);

    // Crear las filas con los datos de los choferes (ejemplo con 3 choferes)
    var choferes = [
        { nombre: "Juan Pérez", placa: "ABC123", precio: "S/2.00", tiempoLlegada: generarTiempoLlegada() },
        { nombre: "María González", placa: "DEF456", precio: "S/2.50", tiempoLlegada: generarTiempoLlegada() },
        { nombre: "Pedro Ramírez", placa: "GHI789", precio: "S/2.00", tiempoLlegada: generarTiempoLlegada() }
    ];

    choferes.forEach(function(chofer) {
        var fila = document.createElement('tr');

        // Crear las celdas con los datos del chofer
        var nombreCelda = document.createElement('td');
        nombreCelda.textContent = chofer.nombre;

        var placaCelda = document.createElement('td');
        placaCelda.textContent = chofer.placa;

        var precioCelda = document.createElement('td');
        precioCelda.textContent = chofer.precio;

        var tiempoLlegadaCelda = document.createElement('td');
        tiempoLlegadaCelda.textContent = chofer.tiempoLlegada + ' min';

        var seleccionarCelda = document.createElement('td');
        var seleccionarButton = document.createElement('button');
        seleccionarButton.textContent = 'Seleccionar';
        seleccionarButton.addEventListener('click', function() {
            mostrarProcesoPago(chofer);
        });
        seleccionarCelda.appendChild(seleccionarButton);

        // Agregar las celdas a la fila
        fila.appendChild(nombreCelda);
        fila.appendChild(placaCelda);
        fila.appendChild(precioCelda);
        fila.appendChild(tiempoLlegadaCelda);
        fila.appendChild(seleccionarCelda);

        // Agregar la fila a la tabla
        tabla.appendChild(fila);
    });

    // Agregar el título al contenedor de la lista de choferes
    choferesContainer.appendChild(title);

    // Agregar la tabla al contenedor de la lista de choferes
    choferesContainer.appendChild(tabla);

    // Agregar el botón de cierre al contenedor de la lista de choferes
    choferesContainer.appendChild(closeButton);

    // Agregar el contenedor de la lista de choferes al rectángulo blanco
    overlay.appendChild(choferesContainer);

    // Agregar el rectángulo blanco a la página
    document.body.appendChild(overlay);
}

function cerrarListaChoferes(overlay) {
    document.body.removeChild(overlay); // Remover el elemento overlay
}

function mostrarProcesoPago(chofer) {
    // Crear el contenedor del recuadro de pago
    var overlayPago = document.createElement('div');
    overlayPago.classList.add('overlay');

    // Crear el contenedor del proceso de pago
    var procesoPagoContainer = document.createElement('div');
    procesoPagoContainer.classList.add('proceso-pago-container');

    // Crear el título del proceso de pago
    var title = document.createElement('h2');
    title.textContent = 'Realizar Pago';

    // Crear el texto con los datos del chofer
    var datosChofer = document.createElement('p');
    datosChofer.innerHTML = `<strong>Nombre:</strong> ${chofer.nombre}<br><strong>Placa:</strong> ${chofer.placa}<br><strong>Precio:</strong> ${chofer.precio}<br><strong>Tiempo de Llegada:</strong> ${chofer.tiempoLlegada} min`;

    // Crear el selector de método de pago
    var metodoPagoSelect = document.createElement('select');
    metodoPagoSelect.innerHTML = `
        <option value="efectivo">Efectivo</option>
        <option value="yape">Yape</option>
    `;

    // Crear la imagen de Yape
    var imagenYape = document.createElement('img');
    imagenYape.src = '../Images/yapejeje.png';
    imagenYape.classList.add('yape-image');
    imagenYape.style.display = 'none'; // Ocultar la imagen por defecto

    // Crear el botón de confirmar pago
    var confirmarPagoButton = document.createElement('button');
    confirmarPagoButton.textContent = 'Confirmar Pago';
    confirmarPagoButton.classList.add('confirmar-pago-button');

    // Agregar el evento al botón de confirmar pago
    confirmarPagoButton.addEventListener('click', function() {
        var metodoPago = metodoPagoSelect.value;
        alert(`Pago confirmado con ${metodoPago} para ${chofer.nombre}`);
        cerrarProcesoPago(overlayPago);
    });

    // Agregar el evento al selector de método de pago
    metodoPagoSelect.addEventListener('change', function() {
        if (metodoPagoSelect.value === 'yape') {
            imagenYape.style.display = 'block'; // Mostrar la imagen de Yape si se selecciona Yape
        } else {
            imagenYape.style.display = 'none'; // Ocultar la imagen si se selecciona Efectivo
        }
    });

    // Agregar los elementos al contenedor del proceso de pago
    procesoPagoContainer.appendChild(title);
    procesoPagoContainer.appendChild(datosChofer);
    procesoPagoContainer.appendChild(document.createElement('br'));
    procesoPagoContainer.appendChild(document.createTextNode('Seleccionar método de pago: '));
    procesoPagoContainer.appendChild(metodoPagoSelect);
    procesoPagoContainer.appendChild(document.createElement('br'));
    procesoPagoContainer.appendChild(imagenYape); // Agregar la imagen de Yape
    procesoPagoContainer.appendChild(confirmarPagoButton); // Agregar el botón de confirmar pago

    // Agregar el contenedor del proceso de pago al recuadro de pago
    overlayPago.appendChild(procesoPagoContainer);

    // Agregar el recuadro de pago a la página
    document.body.appendChild(overlayPago);
}




function cerrarProcesoPago(overlay) {
    document.body.removeChild(overlay); // Remover el elemento overlay
}

function generarTiempoLlegada() {
    return Math.floor(Math.random() * 10) + 1; // Número aleatorio entre 1 y 10
}


function cerrarListaChoferes(overlay) {
    document.body.removeChild(overlay); // Remover el elemento overlay
}

function cerrarListaChoferes(overlay) {
    document.body.removeChild(overlay); // Remover el elemento overlay
}



iniciarMap();
