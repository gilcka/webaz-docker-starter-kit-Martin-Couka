<?php

declare(strict_types=1);

require_once 'flight/Flight.php';

// CONNEXION DATABASE
define('host', 'db');
define('port', '5432');
define('name', 'mydb');
define('user', 'postgres');
define('password', 'postgres');

$string_connexion = "host=" . host . " port=" . port . " dbname=" . name . " user=" . user . " password=" . password;
$connexion_db = pg_connect($string_connexion);
pg_set_client_encoding($connexion_db, "UTF8");

Flight::set('connexion_db', $connexion_db);

//TEST DE LA CONNEXION ET DES DB
Flight::route('/test-db', function () {

    // Connexion BDD
    $link = Flight::get('connexion_db');

    $sql_objets = "SELECT * FROM objets;";
    $query_objets = pg_query($link, $sql_objets);
    $results_objets = pg_fetch_all($query_objets);
    Flight::json($results_objets);

    $sql_personnes = "SELECT * FROM personnes;";
    $query_personnes = pg_query($link, $sql_personnes);
    $results_personnes = pg_fetch_all($query_personnes);
    Flight::json($results_personnes);
});


//API OBJETS
Flight::route('GET /api/objets', function () {

    $link = Flight::get('connexion_db');

    $id = Flight::request()->query['id'] ?? null;

    if (!$id) {

    $sql = "SELECT id, name, image, zoom, ST_Y(loc) AS lat, ST_X(loc) AS lon FROM objets;";

    $requete = pg_query($link, $sql);

    if (!$requete) {
    Flight::json(['error' => 'erreur requete'], 500);
    return;
    }

    $objets = pg_fetch_all($requete);
    pg_close($link);

    Flight::json($objets);
    return;
    }

    $sql = "SELECT id, name, image, zoom, ST_Y(loc) AS lat, ST_X(loc) AS lon FROM objets WHERE id = $1";

    $requete = pg_query_params($link, $sql, [$id]);
    $objet = pg_fetch_all($requete, PGSQL_ASSOC);
    pg_close($link);

    Flight::json($objet ?: ['error' => 'aucun objet ne corresond à cet id']);
});

//API PERSONNES
Flight::route('GET /api/personnes', function () {

    $link = Flight::get('connexion_db');

    $id = Flight::request()->query['id'] ?? null;

    if (!$id) {

    $sql = "SELECT id, name, message, reponse, indice_fin, zoom, ordre_apparition, image, ST_Y(loc) AS lat, ST_X(loc) AS lon FROM personnes;";

    $requete = pg_query($link, $sql);

    if (!$requete) {
    Flight::json(['error' => 'erreur requete'], 500);
    return;
    }

    $personnes = pg_fetch_all($requete);
    pg_close($link);

    Flight::json($personnes);
    return;
    }

    $sql = "SELECT id, name, message, reponse, indice_fin, zoom, ordre_apparition, image, ST_Y(loc) AS lat, ST_X(loc) AS lon FROM personnes WHERE id = $1";

    $requete = pg_query_params($link, $sql, [$id]);
    $personne = pg_fetch_all($requete, PGSQL_ASSOC);
    pg_close($link);

    Flight::json($personne ?: ['error' => 'aucun objet ne corresond à cet id']);
});

//API INDICES
Flight::route('GET /api/indices', function () {

    $link = Flight::get('connexion_db');

    $id = Flight::request()->query['id'] ?? null;

    if (!$id) {

    $sql = "SELECT id, objet_id, indice FROM indices;";

    $requete = pg_query($link, $sql);

    if (!$requete) {
    Flight::json(['error' => 'erreur requete'], 500);
    return;
    }

    $indices = pg_fetch_all($requete);
    pg_close($link);

    Flight::json($indices);
    return;
    }

    $sql = "SELECT id, objet_id, indice FROM indices WHERE id = $1";

    $requete = pg_query_params($link, $sql, [$id]);
    $indice = pg_fetch_all($requete, PGSQL_ASSOC);
    pg_close($link);

    Flight::json($indice ?: ['error' => 'aucun objet ne corresond à cet id']);
});


//API JOUEURS
Flight::route('POST /api/joueurs', function() {
    $link = Flight::get('connexion_db');

    $donneesFin = Flight::request();

    $nom = $donneesFin->data->nom ?? '';
    $temps = $donneesFin->data->temps ?? '';

    if (empty($nom)) {
    Flight::json(['error' => 'Lâche ton blaze'], 400);
    return;
    }
    $sql = 'INSERT INTO joueurs (nom, temps) VALUES ($1, $2) RETURNING id';
    $requete = pg_query_params($link, $sql, [$nom, $temps]);

    if ($requete) {
    $resultat = pg_fetch_all($requete, PGSQL_ASSOC);
    Flight::json(['success' => true, 'id' => ($resultat && isset($resultat[0]['id'])) ? $resultat[0]['id'] : null]);
    } else {
    Flight::json(['error' => 'Erreur sauvegarde'], 500);
    }
});

Flight::route('GET /api/joueurs', function() {
    $link = Flight::get('connexion_db');
    $sql = "SELECT nom, temps FROM joueurs ORDER BY temps LIMIT 5;";
    $requete = pg_query($link, $sql);
    if ($requete) {
        $rows = pg_fetch_all($requete, PGSQL_ASSOC) ?: [];
        $out = [];
        foreach ($rows as $r) {
            $temps = $r['temps'];
            $out[] = ['nom' => $r['nom'], 'temps' => $temps];
        }
        Flight::json($out);
    } else {
        Flight::json([], 500);
    }
});

//ROUTES DU JEU
Flight::route('/', function() {
    Flight::render('accueil_matheo');
});

Flight::route('/menu', function() {
    Flight::render('accueil');
});

Flight::route('/escape', function () {

    Flight::render('escape');
});

Flight::start();

?>