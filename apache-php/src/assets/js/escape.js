//Vue qui gère toute la mécanique de jeu

Vue.createApp({
    data() {
        return {
            //données géographiques de base
            ensgLat: 48.8414,
            ensgLon: 2.5862,
            emprise: 0.009,
            //gestion du temps
            chrono: {
                secondes: 0,
                minutes: 0,
                heures: 0,
                intervalId: null,
                estEnCours: false,
            },
            chronoAffichage: '00:00:00',
            //gestion des tables sql
            marqueursPersonnes: [],
            marqueursObjets: [],
            marqueurGilles : [],
            prochainePersonneIndex: 0,
            indiceDejaLu: {},
            //gestion de l'inventaire
            inventaireIds: new Set(),
            inventaireCounts: {},
            inventaireIdToName: {},
            clesRecuperees: false,
            //gestion de la carte
            map: null,
            heatmapLayer: null,
            heatMapVisible: false,
        }
    },

    mounted() {

        //chargement des données des API en AJAX et lancement des fonctions de base
        Promise.all([
            fetch('/api/objets').then(r => r.json()),
            fetch('/api/personnes').then(r => r.json()),
            fetch('/api/indices').then(r => r.json())
        ]).then(([objets, personnes, indices]) => {

            this.objets = objets;
            this.personnes = personnes;
            this.indices = indices;

            this.initialisationCarte();
            this.creerHeatmapLayer();
            this.demarrerChrono();

        });
    },

    methods: {
        initialisationCarte() {
            //Construction de la carte via leaflet
            this.map = L.map('map').setView([this.ensgLat, this.ensgLon], 15);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(this.map);

            //emprise
            var rectangle = L.rectangle([
                [this.ensgLat - this.emprise, this.ensgLon - this.emprise], 
                [this.ensgLat + this.emprise, this.ensgLon + this.emprise]  
            ], {
                color: 'red',        
                fillColor: 'red',    
                fillOpacity: 0.2,    
                weight: 3            
            }).addTo(this.map);

            //Ajout des objets et des marqueurs permanents
            this.ajouterMarqueurJules();
            this.ajouterMarqueurGilles();
            this.ajouterObjetsCarte();
        },

        testFin() {
            //Fin du jeu appelée depuis un bouton

            //Vérification de la viabilité de l'inventaire
            if (!this.inventaireCounts || typeof this.inventaireCounts !== "object") {
                console.error("Inventaire incorrect");
                return;
            }

            const totalObjets = Object.values(this.inventaireCounts)
                .reduce((sum, v) => sum + v, 0);

            console.log("Objets dans l'inventaire :", totalObjets);

            if (totalObjets < 7) {
                alert(`Il te manque encore des objets !  
        Tu en as ${totalObjets}/7.`);
                return;
            }

            //Gestion de la partie demande de code et enregistrement des données du joueur
            let code = prompt("Entrez le code de la résidence :");

            if (code === null) return;

            if (code.trim() === "5847") {
                alert("BRAVO, Louise est tirée du fossé de la parcelle Y grâce à toi");
                this.arreterChrono();
                console.log("Temps final :", this.chronoAffichage);

                let pseudo = prompt('Bravo ! Sous quel pseudo veux-tu enregistrer ton temps ?');
                if (pseudo === null) return;
                console.log("Pseudo entré :", pseudo);

                pseudo = pseudo.trim();
                if (!pseudo) {
                    alert('Pseudo invalide, enregistrement annulé.');
                    return;
                }

                const temps = this.chronoAffichage;

                fetch('/api/joueurs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nom: pseudo,
                        temps: temps
                    })
                })
                .then(r => r.json())
                .then(data => {
                    if (data && data.success) {
                        const ok = window.confirm("C'est enregistré, tu peux retourner au menu admirer le Hall of Fame");
                        
                        if (ok) {
                            window.location.href = '/';
                        }              

                        fetch('/api/joueurs')
                        .then(r => r.json())
                        .then(joueurs => {
                            console.log("Liste mise à jour :", joueurs);
                        });

                    } else {
                        alert("Erreur lors de l'enregistrement : " + (data.error || "inconnue"));
                        console.error(data);
                    }
                });


            } else {
                alert("Mauvais code chacal, indice : ORDRE D'APPARITION");
            }
        },
        
        // 3 fonctions de gestion du chronomètre : démarrage, arrêt, affichage
        demarrerChrono() {
            if (!this.chrono.estEnCours) {
                this.chrono.estEnCours = true;
                this.chrono.intervalId = setInterval(() => {
                    this.chrono.secondes++;

                    if (this.chrono.secondes >= 60) {
                        this.chrono.secondes = 0;
                        this.chrono.minutes++;
                    }

                    if (this.chrono.minutes >= 60) {
                        this.chrono.minutes = 0;
                        this.chrono.heures++;
                    }

                    this.afficherChrono();
                }, 1000);
            }
        },

        arreterChrono() {
            if (this.chrono.estEnCours) {
                this.chrono.estEnCours = false;

                // On arrête l'intervalle si il existe
                if (this.chrono.intervalId) {
                    clearInterval(this.chrono.intervalId);
                    this.chrono.intervalId = null;
                }
            }
        },

        afficherChrono() {
            var h = this.chrono.heures < 10 ? '0' + this.chrono.heures : this.chrono.heures;
            var m = this.chrono.minutes < 10 ? '0' + this.chrono.minutes : this.chrono.minutes;
            var s = this.chrono.secondes < 10 ? '0' + this.chrono.secondes : this.chrono.secondes;

            this.chronoAffichage = `${h}:${m}:${s}`;
        },

        //2 fonction de gestion de la carte de chaleur, disponible sur la carte via une checkbox (Création puis affichage)
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

        toggleHeatmap() {
            if (this.heatMapVisible) {
                this.map.removeLayer(this.heatmapLayer);
                this.heatMapVisible = false;
            } else {
                this.heatmapLayer.addTo(this.map);
                this.heatMapVisible = true;
            }
        },

        //Ajout du marker avec affichage des consignes si besoin
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
                    <h3 style="text-align : center">CONSEIL : effectuez toutes ces étapes dans l'ordre indiqué</h3>
                    <ul>
                        <li>Ramasser les 5 objets que Louise a laissé tomber de son sac,</li> 
                        <li>Dealer ses clés de maison en échange de 3 bouteilles de Jaeger à Gilles Grocaka qui est surement bourré sous un pont,</li>
                        <li>Trouver le code de sa résidence en répondant à 4 questions posées par 4 personnes différentes,</li>
                        <li>Trouver Louise Vadeaudeau en personne qui se balade quelque part dans la zone...</li>
                    </ul>
                </div>
            `);
        },

        //Ajout du marker qui bloque l'objet clés
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

            //Gestion du zoom
            markerGilles._zoom = 18;

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
            
            //On ne met pas le marqueur si on n'a pas encore assez zoomé
            if (this.map.getZoom() < markerGilles._zoom) {
                this.map.removeLayer(markerGilles);
            }

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

                alert("Tiens les clés, tu devrais aller voir Killian Grosfront, Président du BDHess, qui est sûrement sur un lieu sportif du campus");

                this.clesRecuperees = true;
                //On lance l'apparition des personnes qui posent des questions pour obtenir le code
                this.déclencherApparitionPersonnes();

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

        //2 fonctions de gestion de l'inventaire : ajout et retrait des objets
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

        // 4 fonctions de gestion des interactions avec les personnes qui donnent le code
        //Les personnes n'apparaissent pas dès le début sur la carte : elles apparaissent une fois que Gilles a libéré les clés, et une par une
        
        //On lance le mécanisme
        déclencherApparitionPersonnes() {
            this.ajouterPersonnesCarte(); // On crée tous les marqueurs, invisibles
            this.afficherProchainePersonne();
        },

        //On affiche les personnes suivante via un mécanisme de stockage d'index dans une liste, qui permet de savoir si la personne est déjà passée ou non
        afficherProchainePersonne() {
            if (!this.clesRecuperees) return;

            if (this.prochainePersonneIndex >= this.marqueursPersonnes.length) return;

            let item = this.marqueursPersonnes[this.prochainePersonneIndex];

            item.marker.addTo(this.map);
        },

        ajouterPersonnesCarte() {
            //Tri des personnes par ordre d'apparition
            this.personnes.sort((a, b) => a.ordre_apparition - b.ordre_apparition);

            for (let i = 0; i < this.personnes.length; i++) {
                let personne = this.personnes[i];
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

        //Ouverture d'une fenêtre pop up pour répondre à la question et ainsi obtenir l'objet chiffre
        poserQuestion(personne, marker) {
            let reponse = prompt(personne.message);
            if (reponse === null) return;

            if (reponse.trim() == personne.reponse) {

                alert(`Bonne réponse ma vie ! ${personne.indice_fin}`);

                this.ajouterObjetInventaire(
                    personne.reponse,
                    personne.image,
                    1
                );

                this.map.removeLayer(marker);

                this.prochainePersonneIndex++;
                this.afficherProchainePersonne();

            } else {
                alert("Mauvaise réponse chatoune");
            }  

        },

        // Fonction d'ajout des objets sur la carte, qui intervient dès le début
        ajouterObjetsCarte() {
            const self = this;

            for (let i = 0; i < this.objets.length; i++) {
                let objet = this.objets[i];
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

            this.map.on('zoomend', function() {
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

            for (var k = 0; k < this.marqueursObjets.length; k++) {
                if (this.map.getZoom() < this.marqueursObjets[k].objet.zoom) {
                    this.map.removeLayer(this.marqueursObjets[k].marker);
                }
            }
        },

        // Fonction pour afficher des indices accessibles via un bouton Indice dans l'interface carte
        afficherIndice() {
            if (!Array.isArray(this.indices) || this.indices.length === 0) {
                alert('Aucun indice disponible.');
                return;
            }
            // On les affiche un par un, en classant selon l'ordre d'id des objets, ils n'apparaissent tous qu'une seule fois
            this.indices.sort((a, b) => a.objet_id - b.objet_id);

            for (let i = 0; i < this.indices.length; i++) {
                const indice = this.indices[i];
                const key = String(indice.objet_id);
                if (!this.indiceDejaLu[key]) {
                    this.indiceDejaLu[key] = true;
                    console.log(`Objet ID ${indice.objet_id} : Indice - ${indice.indice}`);
                    alert(indice.indice);
                    return;
                }
            }

            alert('Tu as déjà vu tous les indices disponibles.');
        }
    }
}).mount('#jeu');