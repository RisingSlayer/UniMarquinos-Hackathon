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

iniciarMap();
