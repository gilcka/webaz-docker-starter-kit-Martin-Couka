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
// On stocke les ids récupérés et le nombre par nom
var inventaireIds = new Set();
var inventaireCounts = {}; // { 'Nom': count }

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
        var oid = String(objet.id);
        if (!inventaireIds.has(oid)) {
            inventaireIds.add(oid);
            inventaireCounts[objet.name] = (inventaireCounts[objet.name] || 0) + 1;
            ajouterObjetInventaire(objet.name, objet.image, inventaireCounts[objet.name]);
            map.removeLayer(marker);
        }
    });

    marqueurs.push({
        marker: marker,
        objet: objet
    });
}

function ajouterObjetInventaire(nomObjet, imageUrl, count) {
    var cases = document.querySelectorAll('aside .inventaire > div');

    var existing = document.querySelector('aside .inventaire > div[data-name="' + nomObjet + '"]');
    if (existing) {
        var badge = existing.querySelector('.count-badge');
        if (badge) badge.textContent = count;
        return;
    }

    for (var i = 0; i < cases.length; i++) {
        var texteCase = cases[i].textContent.trim();
        if (texteCase === '' || texteCase === 'Élément ' + (i+1)) {
            cases[i].dataset.name = nomObjet;
            cases[i].innerHTML = `
                <div style="display: flex; 
                     flex-direction: column; 
                     align-items: center; 
                     justify-content: center; position: relative;">
                    <img src="${imageUrl}" alt="${nomObjet}" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 5px;">
                    <p style="margin: 0; font-size: 12px; font-weight: bold;">${nomObjet}</p>
                    <span class="count-badge" style="position: absolute; top: 4px; right: 8px; background:#222; color:#fff; padding:2px 6px; border-radius:10px; font-size:12px;">${count}</span>
                </div>
            `;
            break;
        }
    }
}

map.on('zoomend', function() {
    var zoomActuel = map.getZoom();
    
    for (var i = 0; i < marqueurs.length; i++) {
        var item = marqueurs[i];
        var marker = item.marker;
        var objet = item.objet;
        
        if (zoomActuel >= objet.zoom && !inventaireIds.has(String(objet.id))) {
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

for (var i = 0; i < marqueurs.length; i++) {
    if (map.getZoom() < marqueurs[i].objet.zoom) {
        map.removeLayer(marqueurs[i].marker);
    }
}

