//Coordonnées de l'ENSG

var ensgLat = 48.8414;
var ensgLon = 2.5874;

var telLat = 48.840379;
var telLon = 2.588558;


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

for (let i = 0; i <= 8; i++) {
    // Code à exécuter
}

var markerTelephone = L.marker([telLat, telLon], {
    icon: L.divIcon({
        className: 'invisible-marker',
        html: ''
    })
}).addTo(map);

markerTelephone.bindTooltip("Téléphone", {
    permanent: true,
    direction: 'center',
    className: 'label-telephone'
}).openTooltip();

//Puis ajout dans l'inventaire quand le joueur clique dessus

markerTelephone.on('click', function() {
    if (!inventaire.includes('téléphone')) {
        inventaire.push('téléphone');               
        ajouterObjetInventaire('téléphone', 'images/telephone.jpg');       
        map.removeLayer(markerTelephone);
    }
});

function ajouterObjetInventaire(nomObjet, imageUrl) {
    var cases = document.querySelectorAll('aside > div');
    
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

map.on('zoomend', function() {
    if (map.getZoom() >= 19 && !inventaire.includes('téléphone')) {
        if (!map.hasLayer(markerTelephone)) {
            markerTelephone.addTo(map);
        }
    } else {
        if (map.hasLayer(markerTelephone)) {
            map.removeLayer(markerTelephone);
        }
    }
});
if (map.getZoom() < 19) {
    map.removeLayer(markerTelephone);
}

//Ajout sur la carte des gens que le joueur doit aller voir, qui s'affichent différemment selon les étapes du jeu