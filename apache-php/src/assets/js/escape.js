

Vue.createApp({
    data() {
        return {
            ensgLat: 48.8414,
            ensgLon: 2.5862,
            emprise: 0.009,
            marqueurs: [],
            inventaireIds: new Set(),
            inventaireCounts: {},
            map: null, // ← Ajoute ça
            heatmapLayer: null,
            heatMapVisible: false
        }
    },
    mounted() {
        this.initialisationCarte();
        this.creerHeatmapLayer(); // ← On le crée ICI
    },
    methods: {
        initialisationCarte() {
            this.map = L.map('map').setView([this.ensgLat,this.ensgLon], 15);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            var rectangle = L.rectangle([
            [this.ensgLat - this.emprise, this.ensgLon - this.emprise], 
            [this.ensgLat + this.emprise, this.ensgLon + this.emprise]  
            ], {
                color: 'red',        
                fillColor: 'red',    
                fillOpacity: 0.2,    
                weight: 3            
            }).addTo(map);

            this.ajouterMarqueurJules();

            this.ajouterObjetsCarte();
            },
        creerHeatmapLayer() {
            this.heatmapLayer = L.tileLayer.wms('http://localhost:8080/geoserver/escape_chaleur/wms', {
                layers: 'escape_chaleur:chaleur',
                format: 'image/png',
                transparent: true,
                version: '1.1.1',
                attribution: 'Geoserver',
                crs: L.CRS.EPSG4326
            });
        },
        ajouterMarqueurJules() {
            var markerJules = L.marker([this.ensgLat, this.ensgLon], {
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
        },
        ajouterObjetInventaire(nomObjet, imageUrl, count) {
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
        },
        ajouterObjetsCarte() {
            for (let i = 0; i < objets.length; i++) {
                let objet = objets[i];

                let lat = parseFloat(objet.lat);
                let lon = parseFloat(objet.lon);

                let marker = L.marker([lat, lon], {
                    icon: L.divIcon({
                        className: 'invisible-marker',
                        html: ''
                    })
                }).addTo(this.map);

                marker.bindTooltip(objet.name, {
                    permanent: true,
                    direction: 'center',
                    className: 'label-' + objet.name.toLowerCase().replace(/\s+/g, '-')
                }).openTooltip();

                marker.on('click', function() {
                    var oid = String(objet.id);
                    if (!this.inventaireIds.has(oid)) {
                        this.inventaireIds.add(oid);
                        this.inventaireCounts[objet.name] = (this.inventaireCounts[objet.name] || 0) + 1;
                        this.ajouterObjetInventaire(objet.name, objet.image, this.inventaireCounts[objet.name]);
                        this.map.removeLayer(marker);
                    }
                });

                this.marqueurs.push({
                    marker: marker,
                    objet: objet
                });

                
                this.map.on('zoomend', () => {
                    var zoomActuel = this.map.getZoom();
                    
                    for (var i = 0; i < this.marqueurs.length; i++) {
                        var item = this.marqueurs[i];
                        var marker = item.marker;
                        var objet = item.objet;
                        
                        if (zoomActuel >= objet.zoom && !this.inventaireIds.has(String(objet.id))) {
                            if (!this.map.hasLayer(marker)) {
                                marker.addTo(this.map);
                            }
                        } else {
                            if (this.map.hasLayer(marker)) {
                                this.map.removeLayer(marker);
                            }
                        }
                    }
                });

                for (var i = 0; i < this.marqueurs.length; i++) {
                    if (this.map.getZoom() < this.marqueurs[i].objet.zoom) {
                        this.map.removeLayer(this.marqueurs[i].marker);
                    }
                }
            }
        },
        toggleHeatmap() {
            if (this.heatMapVisible) {
                this.map.removeLayer(this.heatmapLayer);
                this.heatMapVisible = false;
            } else {
                this.heatmapLayer.addTo(this.map);
                this.heatMapVisible = true;
            }
        },
    }
}).mount('#jeu');