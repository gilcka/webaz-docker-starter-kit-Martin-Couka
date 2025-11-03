// Initialisation de la carte en récupérant les coordonnées exactes via un géocodage

const adresse = '6-8 Av. Blaise Pascal, 77420 Champs-sur-Marne, France';
let url = 'https://data.geopf.fr/geocodage/search?q=' + adresse;
var map; 

fetch(url)
    .then(reponseHttp => reponseHttp.json())
    .then(json => {
        const coordinates = json.features[0].geometry.coordinates;
        const lat = coordinates[1];
        const lon = coordinates[0];
        
        map = L.map('map').setView([lat, lon], 15);
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
    });