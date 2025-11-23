<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="assets/css/accueil_matheo.css">
    <title>Escape Game Géographique</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
    <header>
        <h1>LOUISE VADEAUDEAU</h1>
    </header>
    
    <p id="matheo"><img src="images/Matheo_fumeur.jpg" alt="Accueil de Matheo qui fume" height='550' width='300'></p>

    <div id = 'redirection'>
        Vous rencontrez Mathéo Ohédubateau, le responsable de la soirée, qui fume sa clope. Il n'a pas l'air très investi dans son rôle de président BDE Eteintcelle et vous redirige vers Jules Adsl son fidèle secrétaire.
    </div>

    <div id='app' class='hall_of_fame'>
        <h3>Hall of Fame</h3>

        <div v-if="chargement" class="loading">
            Les meilleurs temps arrivent...
        </div>

        <div v-else>
            <ul v-if="scores.length > 0" class="scores-list">
                <li v-for="(score, index) in scores" :key="index" class="score-item">
                    <span class="classement">#{{ index + 1 }}</span>
                    <span class="nom">{{ joueurs.nom }}</span>
                    <span class="temps">{{ joueurs.temps }}</span>
                </li>
            </ul>
            <p v-else class="aucun-score">Vous êtes les premiers à jouer, vous allez nécessairement marquer l'histoire</p>
        </div>
    </div>

    <div id='voir_Jules'>
        <a href="/menu">Aller voir Jules</a>
    </div>

    <script src="hall_of_fame.js" defer></script>
</body>
</html>

