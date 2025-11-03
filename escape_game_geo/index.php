<?php
declare(strict_types=1);
session_start();

require_once 'flight/Flight.php';


Flight::route('/escape', function () {
    Flight::render('main');
});

Flight::start();
