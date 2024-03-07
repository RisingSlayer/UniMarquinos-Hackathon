function iniciarMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var coordUsuario = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            var coordDestino = { lat: -12.053398313997858, lng: -77.08536279682846 };
            
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 15,
                center: coordUsuario,
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

            var iconoUsuario = {
                url: '../images/carro.png',
                scaledSize: new google.maps.Size(30, 30)
            };

            var iconoDestino = {
                url: '../images/destino.png',
                scaledSize: new google.maps.Size(30, 30)
            };

            var markerUsuario = new google.maps.Marker({
                position: coordUsuario,
                map: map,
                icon: iconoUsuario
            });

            var directionsService = new google.maps.DirectionsService();
            var directionsRenderer = new google.maps.DirectionsRenderer({
                map: map,
                suppressMarkers: true,
                polylineOptions: { strokeColor: "#0b132b" }
            });

            var request = {
                origin: coordUsuario,
                destination: coordDestino,
                travelMode: 'DRIVING'
            };

            directionsService.route(request, function (response, status) {
                if (status === 'OK') {
                    markerUsuario.setMap(null);

                    directionsRenderer.setDirections(response);

                    var leg = response.routes[0].legs[0];
                    var markerInicio = new google.maps.Marker({
                        position: leg.start_location,
                        map: map,
                        icon: iconoUsuario
                    });
                    var markerFin = new google.maps.Marker({
                        position: leg.end_location,
                        map: map,
                        icon: iconoDestino
                    });

                } else {
                    console.error('Error al calcular la ruta:', status);
                }
            });

        }, function () {
            console.error("Error al obtener la ubicación");
            var defaultCoord = { lat: -12.0459093, lng: -76.9586752 };
            iniciarMap(defaultCoord);
        });
    } else {
        console.error("Geolocalización no soportada");
        var defaultCoord = { lat: -12.0459093, lng: -76.9586752 };
        iniciarMap(defaultCoord);
    }
    var floatingButton = document.querySelector('.floating-button button');
    floatingButton.addEventListener('click', toggleInputs);
}

iniciarMap();

function toggleInputs() {
    var inputsContainer = document.querySelector('.inputs-container');
    inputsContainer.classList.toggle('inputs-visible');
}
