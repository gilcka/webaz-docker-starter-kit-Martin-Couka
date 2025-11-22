 
 
//INTERACTION AVEC GILLES
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
                        vm.retirerObjetInventaire((n), '');
                        but--;
                    }
                }
            });

//ZOOM
            if (this.map.getZoom() < markerGilles._zoom) {
                this.map.removeLayer(markerGilles);
            }
            this.map.on('zoomend', function () {
                let currentZoom = self.map.getZoom();

                if (currentZoom >= markerGilles._zoomMin) {
                    if (!self.map.hasLayer(markerGilles)) {
                        markerGilles.addTo(self.map);
                    }
                } else {
                    if (self.map.hasLayer(markerGilles)) {
                        self.map.removeLayer(markerGilles);
                    }
                }
            });