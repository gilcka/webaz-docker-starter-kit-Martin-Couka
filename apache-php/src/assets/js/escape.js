Vue.createApp({
    data() {
        return {
            ensgLat: 48.8414,
            ensgLon: 2.5862,
            emprise: 0.009,
            marqueursPersonnes: [],
            marqueursObjets: [],
            marqueurGilles : [],
            inventaireIds: new Set(),
            inventaireCounts: {},
            inventaireIdToName: {},
            map: null,
            heatmapLayer: null,
            heatMapVisible: false,
            prochainePersonneIndex: 0,
            clesRecuperees: false,
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
        },

        testFin() {
            // Vérifie que l’inventaire est présent et bien structuré
            if (!this.inventaireCounts || typeof this.inventaireCounts !== "object") {
                console.error("Inventaire incorrect");
                return;
            }

            // Comptage total des objets
            const totalObjets = Object.values(this.inventaireCounts)
                .reduce((sum, v) => sum + v, 0);

            console.log("Objets dans l'inventaire :", totalObjets);

            // Vérification finale : 7 objets
            if (totalObjets < 7) {
                alert(`Il te manque encore des objets !  
        Tu en as ${totalObjets}/7.`);
                return;
            }

            // Demande du code final
            let code = prompt("Entrez le code de la résidence :");

            if (code === null) return; // Annulation

            if (code.trim() === "5784") {
                alert("BRAVO, Louise est tirée du fossé de la parcelle Y grâce à toi");
            } else {
                alert("Mauvais code chacal, indice : ORDRE D'APPARITION");
            }
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
                    <h3>CONSEIL : effectuez toutes ces étapes dans l'ordre indiqué</h3>
                    <ul>
                        <li>Ramasser les 5 objets que Louise a laissé tomber de son sac,</li> 
                        <li>Dealer ses clés de maison en échange de 3 bouteilles de Jaeger à Gilles Grocaka qui est surement enterré sous un pont comme le gros clochard de merde qu'il est</li>
                        <li>Trouver le code de sa résidence en répondant à 4 questions,</li>
                    </ul>
                </div>
            `);
        },

        ajouterMarqueurGilles() {
            const self = this;

            var markerGilles = L.marker([48.84335867841065, 2.585990833909156], {
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

            markerGilles._zoom = 15;

            this.map.on('zoomstart', function () {
                var zoomActuel = self.map.getZoom();

                if (zoomActuel >= markerGilles._zoom) {
                    if (!self.map.hasLayer(markerGilles)) {
                        markerGilles.addTo(self.map);
                    }
                } else {
                    if (self.map.hasLayer(markerGilles)) {
                        self.map.removeLayer(markerGilles);
                    }
                }
            });
            
            if (this.map.getZoom() < markerGilles._zoom) {
                this.map.removeLayer(markerGilles);
            }

            // ✔ Fonction fléchée = this = Vue !
            markerGilles.on('click', () => {
                var vm = this;

                var ok = window.confirm("LIBEREZ LE JAEGER");
                if (!ok) return;

                var noms = Object.keys(vm.inventaireCounts || {}).filter(n =>
                    n.toLowerCase().includes('jaeger')
                );

                var nbrJaeger = noms.reduce((sum, n) =>
                    sum + (vm.inventaireCounts[n] || 0), 0);

                if (nbrJaeger < 3) {
                    window.alert("Pas assez de bouteilles ma pépette");
                    return;
                }

                let reste = 3;
                for (let n of noms) {
                    while (vm.inventaireCounts[n] > 0 && reste > 0) {
                        vm.retirerObjetInventaire(n);
                        reste--;
                    }
                }

                alert("Gilles : ok ma gueule, tiens les clés");

                this.clesRecuperees = true;
                this.déclencherApparitionPersonnes();

                //Ajout des clés dans l'inventaire
                let nomCles = "Clés";
                let imageCles = "images/cles_maison.jpg";

                this.inventaireCounts[nomCles] = (this.inventaireCounts[nomCles] || 0) + 1;

                this.ajouterObjetInventaire(
                    nomCles,
                    imageCles,
                    this.inventaireCounts[nomCles]
                );
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
            if (!nomObjet) return false;

            var existing = document.querySelector('aside .inventaire > div[data-name="' + nomObjet + '"]');
            if (!existing) return false;

            var current = (this.inventaireCounts && this.inventaireCounts[nomObjet]) ? this.inventaireCounts[nomObjet] : 0;
            if (current > 1) {
                var next = current - 1;
                this.inventaireCounts[nomObjet] = next;
                var badge = existing.querySelector('.count-badge');
                if (badge) badge.textContent = next;
            } else {
                existing.removeAttribute('data-name');
                existing.innerHTML = '';
                if (this.inventaireCounts && this.inventaireCounts[nomObjet] !== undefined) delete this.inventaireCounts[nomObjet];
            }

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
            // Trier les personnes par ordre
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
                });

                marker.bindTooltip(personne.name, {
                    permanent: true,
                    direction: 'center',
                    className: 'label-' + personne.name.toLowerCase().replace(/\s+/g, '-')
                });

                marker.on('click', () => {
                    this.poserQuestion(personne, marker);
                });

                // On stocke mais on n'ajoute PAS sur la carte
                this.marqueursPersonnes.push({
                    marker: marker,
                    personne: personne
                });
            }
        },

        poserQuestion(personne, marker) {
            let reponse = prompt(personne.message);
            if (reponse === null) return;

            if (reponse.trim() == personne.reponse) {

                alert("Bonne réponse ma vie");

                // Donne l'objet
                this.ajouterObjetInventaire(
                    personne.reponse,
                    personne.image,
                    1
                );

                // Supprime la personne trouvée
                this.map.removeLayer(marker);

                // Passe à la suivante
                this.prochainePersonneIndex++;
                this.afficherProchainePersonne();

            } else {
                alert("Mauvaise réponse chatoune");
            }  

        },

        déclencherApparitionPersonnes() {
            this.ajouterPersonnesCarte(); // On crée tous les marqueurs, invisibles
            this.afficherProchainePersonne();
        },


        afficherProchainePersonne() {
            if (!this.clesRecuperees) return;

            if (this.prochainePersonneIndex >= this.marqueursPersonnes.length) return;

            let item = this.marqueursPersonnes[this.prochainePersonneIndex];

            // Ajouter le marker sur la carte
            item.marker.addTo(this.map);
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

                this.marqueursObjets.push({
                    marker: marker,
                    objet: objet
                });
            }

            // Gestion du zoom
            this.map.on('zoomstart', function() {
                var zoomActuel = self.map.getZoom();
                
                for (var j = 0; j < self.marqueursObjets.length; j++) {
                    var item = self.marqueursObjets[j];
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
            for (var k = 0; k < this.marqueursObjets.length; k++) {
                if (this.map.getZoom() < this.marqueursObjets[k].objet.zoom) {
                    this.map.removeLayer(this.marqueursObjets[k].marker);
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