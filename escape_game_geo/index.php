<?php
declare(strict_types=1);
session_start();

require_once 'flight/Flight.php';

include 'connect.php';

Flight::set('connexion', $link);

Flight::route('/menu', function() {
    Flight::render('menu');
})

Flight::route('/escape', function () {
    Flight::render('escape_game');
});

Flight::start();
