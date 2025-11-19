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

    $sql = "SELECT * FROM objets;";
    $query = pg_query($link, $sql);
    $results = pg_fetch_all($query);
    Flight::json($results);
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
    $sql = "SELECT id, name, image, zoom, ST_Y(loc) AS lat, ST_X(loc) AS lon FROM objets;";
    $query = pg_query($link, $sql);
    $objets = pg_fetch_all($query);
    if (!$objets) {
        $objets = [];
    }

    Flight::render('escape', ['objets' => $objets]);
});

Flight::start();

?>