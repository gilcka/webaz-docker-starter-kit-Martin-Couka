<?php

declare(strict_types=1);

require_once 'flight/Flight.php';

Flight::route('/', function() {
    Flight::render('accueil_matheo');
});

Flight::route('/test-db', function () {
    $host = 'db';
    $port = 5432;
    $dbname = 'mydb';
    $user = 'postgres';
    $pass = 'postgres';

    // Connexion BDD
    $link = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$pass");

    $sql_objets = "SELECT * FROM objets;";
    $query_objets = pg_query($link, $sql_objets);
    $results_objets = pg_fetch_all($query_objets);
    Flight::json($results_objets);

    $sql_personnes = "SELECT * FROM personnes;";
    $query_personnes = pg_query($link, $sql_personnes);
    $results_personnes = pg_fetch_all($query_personnes);
    Flight::json($results_personnes);
});

Flight::route('/menu', function() {
    Flight::render('accueil');
});

Flight::route('/escape', function () {
    $host = 'db';
    $port = 5432;
    $dbname = 'mydb';
    $user = 'postgres';
    $pass = 'postgres';

    // Connexion BDD
    $link = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$pass");

    // Récupérer l'id et latitude/longitude séparément (loc est un geometry)
    $sql_objets = "SELECT id, name, image, zoom, ST_Y(loc) AS lat, ST_X(loc) AS lon FROM objets;";
    $query_objets = pg_query($link, $sql_objets);
    $objets = pg_fetch_all($query_objets);
    if (!$objets) {
        $objets = [];
    }

    $sql_personnes = "SELECT id, name, message, ordre_apparition, zoom, ST_Y(loc) AS lat, ST_X(loc) AS lon FROM personnes;";
    $query_personnes = pg_query($link, $sql_personnes);
    $personnes = pg_fetch_all($query_personnes);
    if (!$personnes) {
        $personnes = [];
    }

    Flight::render('escape', ['objets' => $objets, 'personnes' => $personnes]);
});

Flight::start();

?>