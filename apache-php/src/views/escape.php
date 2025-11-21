<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="assets/css/escape.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""/>
    <title>Escape Game Géographique</title>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""></script>
    <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js"></script>
</head>
<body>
  <div id="jeu">
  <header>
    <h1>LOUISE VADEAUDEAU</h1>
    <h4><i>Baladez-vous et zoomez sur la carte pour trouver les objets dans la zone rouge</i></h4>
  </header>

<aside>
    <div class="titre_inventaire"><b>Louisa Mémaud</b></div>
    <div class="inventaire">
        <div><!-- Case 1 vide --></div>
        <div><!-- Case 2 vide --></div>
        <div><!-- Case 3 vide --></div>
        <div><!-- Case 4 vide --></div>
        <div><!-- Case 5 vide --></div>
        <div><!-- Case 5 vide --></div>
        <div><!-- Case 5 vide --></div>
        <div><!-- Case 5 vide --></div>
        <div><!-- Case 5 vide --></div>
    </div>
</aside>

  <main>
    <div id="map"></div>
  </main>

  <div id = "chaleur">
    <label>
      <input type="checkbox" id = "carte_chaleur" @change="toggleHeatmap()">
      Calor
    </label>
  </div>
  </div>

  <script>
    var objets = <?php echo json_encode($objets ?? []); ?>;
    var personnes = <?php echo json_encode($personnes ?? []); ?>;
  </script>

  <script src="assets/js/escape.js"></script>
</body>
</html>

