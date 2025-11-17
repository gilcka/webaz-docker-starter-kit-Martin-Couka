<?php

$server = 'u2.ensg.eu';
$user = 'geo';
$pass = '';
$db = 'geobase';

$link = mysqli_connect($server, $user, $pass, $db);

mysqli_set_charset($link, "utf8");

?>