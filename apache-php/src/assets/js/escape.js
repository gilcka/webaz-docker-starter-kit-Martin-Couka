//Importation de la couche chaleur

var heatmapLayer = L.tileLayer.wms('http://localhost:8080/geoserver/escape_chaleur/wms', {
    layers: 'escape_chaleur:chaleur',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: 'Geoserver',
    crs: L.CRS.EPSG4326,
    filed:true
});

var heatMapVisible = false;

function toggleHeatmap() {
    if (heatMapVisible) {
        map.removeLayer(heatmapLayer);
        heatMapVisible = false;
    } else {
        heatmapLayer.addTo(map);
        heatMapVisible = true;
    }
}

//Coordonnées de l'ENSG

var ensgLat = 48.8414;
var ensgLon = 2.5874;

//Creation de l'emprise

var offset = 0.009;

// Initialisation de la carte sur l'ENSG

var map = L.map('map').setView([ensgLat,ensgLon], 15);

//Ajout des tuiles OpenStreetMap

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Limites de la zone : A DEFINIR

var rectangle = L.rectangle([
    [ensgLat - offset, ensgLon - offset], // Sud-Ouest
    [ensgLat + offset, ensgLon + offset]  // Nord-Est
], {
    color: 'red',        
    fillColor: 'red',    
    fillOpacity: 0.2,    
    weight: 3            
}).addTo(map);

//Affichage permanent de Jules si besoin des consignes

var markerJules = L.marker([ensgLat, ensgLon], {
    icon: L.divIcon({
        className: 'invisible-marker', // Pas d'icône visible
        html: ''
    })
}).addTo(map);

markerJules.bindTooltip("Jules", {
    permanent: true,
    direction: 'center',
    className: 'label-jules'
}).openTooltip();

markerJules.bindPopup(`
    <div style="max-width: 200px;">
        <h3>Rappel des cibles</h3>
        <ul>
            <li>Ramasser les 5 objets que Louise a laissé tomber de son sac,</li> 
            <li>trouver le code de sa résidence,</li>
            <li>trouver ses clés de maison en échange de potins numériques</li>
        </ul>
    </div>
`);

//Initialisation de l'inventaire

var inventaire = [];

//Ajout sur la carte de tous les objets du sac de Louise qui sont disponibles en permanence, à un niveau de zoom très bas : test avec le téléphone, à automatiser via une base de données

var marqueurs = [];

for (let i = 0; i < objets.length; i++) {
    let objet = objets[i];

    let lat = parseFloat(objet.lat);
    let lon = parseFloat(objet.lon);

    let marker = L.marker([lat, lon], {
        icon: L.divIcon({
            className: 'invisible-marker',
            html: ''
        })
    }).addTo(map);

    marker.bindTooltip(objet.name, {
        permanent: true,
        direction: 'center',
        className: 'label-' + objet.name.toLowerCase().replace(/\s+/g, '-')
    }).openTooltip();

    marker.on('click', function() {
        if (!inventaire.includes(objet.name)) {
            inventaire.push(objet.name);
            ajouterObjetInventaire(objet.name, objet.image);
            map.removeLayer(marker);
        }
    });

    marqueurs.push({
        marker: marker,
        objet: objet
    });
}

function ajouterObjetInventaire(nomObjet, imageUrl) {
    // On cible les cases réelles dans l'inventaire
    var cases = document.querySelectorAll('aside .inventaire > div');

    for (var i = 0; i < cases.length; i++) {
        var texteCase = cases[i].textContent.trim();
        if (texteCase === '' || texteCase === 'Élément ' + (i+1)) {
            cases[i].innerHTML = `
                <div style="display: flex; 
                     flex-direction: column; 
                     align-items: center; 
                     justify-content: center;">
                    <img src="${imageUrl}" alt="${nomObjet}" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 5px;">
                    <p style="margin: 0; font-size: 12px; font-weight: bold;">${nomObjet}</p>
                </div>
            `;
            break;
        }
    }
}

// Gestion du zoom pour tous les marqueurs
map.on('zoomend', function() {
    var zoomActuel = map.getZoom();
    
    for (var i = 0; i < marqueurs.length; i++) {
        var item = marqueurs[i];
        var marker = item.marker;
        var objet = item.objet;
        
        // Afficher le marqueur si le zoom est suffisant et l'objet pas encore récupéré
        if (zoomActuel >= objet.zoom && !inventaire.includes(objet.name)) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
        } else {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        }
    }
});

// Initialisation : masquer les marqueurs dont le zoom n'est pas suffisant
for (var i = 0; i < marqueurs.length; i++) {
    if (map.getZoom() < marqueurs[i].objet.zoom) {
        map.removeLayer(marqueurs[i].marker);
    }
}

