 
 
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


<?php
// route pour envoyer les données de l'utilisateur (pseudo et scores) à notre serveur
// à la fin de la partie

Flight::route('POST /api/scores', function() {
    $link = Flight::get('connexion_db');
    // récupère les infos données par l'utilisateur
    $donneesFin = Flight::request();
    // stocke le json du pseudo et du score de l'utilisateur (récupérés via POST)
    $pseudo = $donneesFin->data->pseudo ?? '';
    $score = $donneesFin->data->score ?? 0;
    // si pas de pseudo rentré, on dit de mettre un pseudo
    if (empty($pseudo)) {
    Flight::json(['error' => 'Mets un pseudo stp'], 400);
    return;
    }
    // insère dans la table score les infos de l'utilisateur : pseudo et score
    // on veut récupérer l'id associé à l'utilisateur ($1 et $2 sont équivalents à $pseudo et $score)
    $sql = 'INSERT INTO scores (pseudo, score) VALUES ($1, $2) RETURNING id';
    $requete = pg_query_params($link, $sql, [$pseudo, $score]);

    if ($requete) {
    // si la requête marche bien
    // on sort le résultat de la requête sous forme de tableau json
    $resultat = pg_fetch_all($requete, PGSQL_ASSOC);
    Flight::json(['success' => true, 'id' => $resultat['id']]);
    } else {
    Flight::json(['error' => 'Erreur sauvegarde'], 500);
    }
});

// route pour récupérer le top 10 des utilisateurs (pseudo et scores)
Flight::route('GET /api/scores', function() {
    $link = Flight::get('connexion_db');
    $sql = "SELECT pseudo, score FROM scores ORDER BY score DESC LIMIT 10";
    $requete = pg_query($link, $sql);
    if ($requete) {
    $scores = pg_fetch_all($requete);
    // si la requête ne ressort aucun utilisateur, on renvoie une liste vide (personne
    // n'a encore joué au jeu)
    Flight::json($scores ?: []);
    } else {
    Flight::json(['error' => 'Erreur requête'], 500);
    }
});

Flight::route('/carte', function() {
    Flight::render('carte');
});


Flight::start();

?>
