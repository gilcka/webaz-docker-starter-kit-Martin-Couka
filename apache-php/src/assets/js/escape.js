Vue.createApp({
    data() {
        return {
            ensgLat: 48.8414,
            ensgLon: 2.5862,
            emprise: 0.009,
            marqueurs: [],
            inventaireIds: new Set(),
            inventaireCounts: {},
            inventaireIdToName: {},
            map: null,
            heatmapLayer: null,
            heatMapVisible: false
        }
    },

    mounted() {
        this.initialisationCarte();
        this.creerHeatmapLayer();
    },

    methods: {
        initialisationCarte() {
            this.map = L.map('map').setView([this.ensgLat, this.ensgLon], 15);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(this.map);

            var rectangle = L.rectangle([
                [this.ensgLat - this.emprise, this.ensgLon - this.emprise], 
                [this.ensgLat + this.emprise, this.ensgLon + this.emprise]  
            ], {
                color: 'red',        
                fillColor: 'red',    
                fillOpacity: 0.2,    
                weight: 3            
            }).addTo(this.map);

            this.ajouterMarqueurJules();
            this.ajouterMarqueurGilles();
            this.ajouterObjetsCarte();
            this.ajouterPersonnesCarte();
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
                    className: 'invisible-marker',
                    html: ''
                })
            }).addTo(this.map);

            markerJules.bindTooltip("Jules ADSL", {
                permanent: true,
                direction: 'center',
                className: 'label-jules'
            }).openTooltip();

            markerJules.bindPopup(`
                <div style="max-width: 200px;">
                    <h3>Rappel des cibles</h3>
                    <ul>
                        <li>Ramasser les 5 objets que Louise a laissé tomber de son sac,</li> 
                        <li>Trouver le code de sa résidence en répondant à 4 questions,</li>
                        <li>Dealer ses clés de maison en échange de 3 bouteilles de Jaeger à Gilles Grocaka qui est caché dans son endroit préféré du campus...</li>
                    </ul>
                </div>
            `);
        },

        ajouterMarqueurGilles() {
            var markerGilles = L.marker([48.84033827337177, 2.590845797231987], {
                icon: L.divIcon({
                    className: 'invisible-marker',
                    html: ''
                })
            }).addTo(this.map);

            markerGilles.bindTooltip('Gilles Grocaka', {
                permanent: true,
                direction: 'center',
                className: 'label-gilles'
            }).openTooltip();

            markerGilles._zoom = 19;

            markerGilles.on('click', function() {
                var vm = this;
                var ok = window.confirm("LIBEREZ LE JAEGER");

                if (!ok) return;

                var nom = Object.keys(vm.inventaireCounts || {}).filter(n => n && n.toLowerCase().includes('jaeger'));
                var nbrJaeger = nom.reduce((s, n) => s + (vm.inventaireCounts[n] || 0), 0);
                if (nbrJaeger < 3) {
                    window.alert("Pas assez de bouteilles ma pépette");
                    return;
                }

                let but = 3;
                for (let i = 0; i < nom.length && but > 0; i++) {
                    var n = nom[i];
                    while ((vm.inventaireCounts[n] || 0) > 0 && but > 0) {
                        vm.retirerObjetInventaire(n);
                        but--;
                    }
                }
            });

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

        retirerObjetInventaire(nomObjet) {
            // Supprime une seule instance de l'objet `nomObjet` de l'inventaire.
            if (!nomObjet) return false;

            // Trouver la case d'inventaire correspondante
            var existing = document.querySelector('aside .inventaire > div[data-name="' + nomObjet + '"]');
            if (!existing) return false;

            // Décrémente le compteur interne
            var current = (this.inventaireCounts && this.inventaireCounts[nomObjet]) ? this.inventaireCounts[nomObjet] : 0;
            if (current > 1) {
                var next = current - 1;
                this.inventaireCounts[nomObjet] = next;
                var badge = existing.querySelector('.count-badge');
                if (badge) badge.textContent = next;
            } else {
                // supprime la case
                existing.removeAttribute('data-name');
                existing.innerHTML = 'Élément ' + (Array.prototype.indexOf.call(existing.parentNode.children, existing) + 1);
                if (this.inventaireCounts && this.inventaireCounts[nomObjet] !== undefined) delete this.inventaireCounts[nomObjet];
            }

            // Supprimer un id associé (si on en a enregistré)
            try {
                for (var id in this.inventaireIdToName) {
                    if (!Object.prototype.hasOwnProperty.call(this.inventaireIdToName, id)) continue;
                    if (this.inventaireIdToName[id] === nomObjet) {
                        if (this.inventaireIds && this.inventaireIds.has(String(id))) this.inventaireIds.delete(String(id));
                        delete this.inventaireIdToName[id];
                        break;
                    }
                }
            } catch (e) { /* ignore */ }

            return true;
        },

        ajouterPersonnesCarte() {
            const self = this;

            personnes.sort((a, b) => a.ordre_apparition - b.ordre_apparition);

            for (let i = 0; i < personnes.length; i++) {
                let personne = personnes[i];
                let lat = parseFloat(personne.lat);
                let lon = parseFloat(personne.lon);

                let marker = L.marker([lat, lon], {
                    icon: L.divIcon({
                        className: 'invisible-marker',
                        html: ''
                    })
                }).addTo(this.map);

                marker.bindTooltip(personne.name, {
                    permanent: true,
                    direction: 'center',
                    className: 'label-' + personne.name.toLowerCase().replace(/\s+/g, '-')
                }).openTooltip();

                marker.on('click', () => {
                    this.poserQuestion(personne);
                });
            }

            this.map.on('zoomend', function() {
                var zoomActuel = self.map.getZoom();
                
                for (var j = 0; j < self.marqueurs.length; j++) {
                    var item = self.marqueurs[j];
                    var marker = item.marker;
                    var personne = item.personne;
                    
                    if (zoomActuel >= personne.zoom && !self.inventaireIds.has(String(personne.id))) {
                        if (!self.map.hasLayer(marker)) {
                            marker.addTo(self.map);
                        }
                    } else {
                        if (self.map.hasLayer(marker)) {
                            self.map.removeLayer(marker);
                        }
                    }
                }
            });

            // Masquer les marqueurs en dessous du zoom initial
            for (var k = 0; k < this.marqueurs.length; k++) {
                if (this.map.getZoom() < this.marqueurs[k].personne.zoom) {
                    this.map.removeLayer(this.marqueurs[k].marker);
                }
            }
        },

        poserQuestion(personne) {
            let reponse = prompt(personne.message);
            if (reponse === null) return;

            if (reponse.trim() == personne.reponse) {

                alert("Bonne réponse ma vie");

            this.ajouterObjetInventaire(
                personne.reponse,
                personne.image,
                1
            );

            } else {
                alert("Mauvaise réponse chatoune");
            }      

        },

        ajouterObjetsCarte() {
            const self = this;

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
                    if (!self.inventaireIds.has(oid)) {
                        self.inventaireIds.add(oid);
                        self.inventaireCounts[objet.name] = (self.inventaireCounts[objet.name] || 0) + 1;
                        self.ajouterObjetInventaire(objet.name, objet.image, self.inventaireCounts[objet.name]);
                        self.map.removeLayer(marker);
                    }
                });

                this.marqueurs.push({
                    marker: marker,
                    objet: objet
                });
            }

            // Gestion du zoom
            this.map.on('zoomend', function() {
                var zoomActuel = self.map.getZoom();
                
                for (var j = 0; j < self.marqueurs.length; j++) {
                    var item = self.marqueurs[j];
                    var marker = item.marker;
                    var objet = item.objet;
                    
                    if (zoomActuel >= objet.zoom && !self.inventaireIds.has(String(objet.id))) {
                        if (!self.map.hasLayer(marker)) {
                            marker.addTo(self.map);
                        }
                    } else {
                        if (self.map.hasLayer(marker)) {
                            self.map.removeLayer(marker);
                        }
                    }
                }
            });

            // Masquer les marqueurs en dessous du zoom initial
            for (var k = 0; k < this.marqueurs.length; k++) {
                if (this.map.getZoom() < this.marqueurs[k].objet.zoom) {
                    this.map.removeLayer(this.marqueurs[k].marker);
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
        }
    }
}).mount('#jeu');