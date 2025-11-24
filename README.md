# Louise Vadeaudeau

Bienvenue sur notre escape game géographique "Louise Vadeaudeau" ! L'objectif est de ramener chez elle Louise Vadeaudeau, une élève de l'ENSG qui a bu plus que de raison et qui a semé toutes ses affaires sur le campus de la Cité Descartes. Elle a bien sur égaré ses clés et oublié le code de sa résidence...

## Configuration

Utilisation de l'application DockerDesktop avec les configurations en annexe.

## Solutions 

### Objets

- Téléphone : sur la parcelle Y devant l'ENSG (48.840379, 2.588558)
- Casquette : juste à côté de l'Etang du Bois de Grâce (48.848699, 2.589121)
- Marinière : au coeur du parc de la Butte Verte (48.836886, 2.580884)
- Portefeuille : sur l'autoroute A4 au sud du campus (48.833976, 2.59038)
- Sac à Main : dans le G20 au nord de l'école (48.846772, 2.585031)
- 1e Bouteille de Jaeger : au 1, allée des Charmilles (48.8459606, 2.583864379)
- 2e Bouteille de Jaeger : au 27, rue Jean Wiener (48.8482698, 2.580235745)
- 3e Bouteille de Jaeger : au Kley Nobel (48.8370957, 2.590833511)

### Personnes 

- Killian Grosfront : dans le Gymnase de la Haute Maison (48.839409, 2.592579)
- Magali Carreaux : sur le chantier de la future gare Noisy-Champs (48.843495, 2.581922)
- Clara Bourbier : dans le batiment Copernic de l'UGE (48.8394286, 2.5872007)
- Diego Posédanssabagnole : devant le Lycée René Descartes (48.8442999, 2.585891)

### Louise Vadeaudeau

Sur les rails du RER direction Marne La Vallée, à l'est du campus (48.843020, 2.5915524)

## Bugs possibles

La carte de chaleur met généralement un peu de temps à se charger, et il y a des petits problèmes de calibration dus à l'échelle de jeu choisie. N'hésitez pas à cliquer et recliquer sur le bouton "Calor" après avoir zoomé ou dézoomé si elle ne se charge pas correctement. 

De manière générale, le zoom est parfois difficilement géré par le jeu, mais dans la mesure où ça n'est pas un problème systématique et que la console ne renvoie aucune erreur, il semblerait que ça soit un bug insolvable de notre côté. 

# Annexe

## Docker Starter Kit

Construit un environnement Docker avec Apache+PHP+Flight, Postgres/PostGIS, pgAdmin, GeoServer.

### Structure générale

L’environnement est composé de 4 services (définis dans `docker-compose.yml`) :

| Service                | Nom interne | Rôle                                    | Ports exposés (hôte:docker) | Volume principal                         |
| ---------------------- | ----------- | --------------------------------------- | --------------------------- | ---------------------------------------- |
| **Apache+PHP**         | web         | Serveur web pour application Flight PHP | `1234:80`                   | `./apache-php/src:/var/www/html`         |
| **PostgreSQL+PostGIS** | db          | Base de données spatiale                | `5432`                      | `pg_data:/var/lib/postgresql/data`       |
| **pgAdmin**            | pgadmin     | Interface web pour gérer Postgres       | `5050:80`                   | `pgadmin_data:/var/lib/pgadmin`          |
| **GeoServer**          | geoserver   | Serveur cartographique (WMS, WFS, WCS)  | `8080:8080`                 | `geoserver_data:/opt/geoserver/data_dir` |

### Détails des services

#### Apache+PHP+Flight

- basé sur `./apache-php/Dockerfile`
- fichiers sources dans `./apache-php/src`
- http://localhost:1234

#### Postgres+PostGIS

- user: `postgres`, pass: `postgres`, base: `mydb`, port: `5432`
- exécute `./db/init.sql` au premier démarrage (contruit une table points, avec 3 points)

#### pgadmin

- user: `admin@admin.com`, pass: `admin`
- permet de se connecter à postgres si besoin (host `db`, port `5432`, user/pass, sans SSL)
- http://localhost:5050

#### GeoServer

- user: `admin`, pass: `geoserver`
- http://localhost:8080/geoserver

### Volumes & persistance

Les volumes Docker permettent de conserver les données même si le conteneur est supprimé et/ou relancé :

- un volume pour Apache+PHP (monté sur le dossier `./apache-php/src`)
- trois autres volumes Docker pour les données (attention, les données de ces volumes ne sont pas accessibles en local, voir «Sauvegarde» plus loin)

```yml
volumes:
  pg_data:
  pgadmin_data:
  geoserver_data:
```

- `pg_data` stocke la base PostGIS (schémas, données, utilisateurs)
- `pgadmin_data` stocke les données pgadmin (connexions)
- `geoserver_data` stocke la configuration GeoServer (workspaces)

### Commandes de base

```sh
# lance la stack Docker
docker compose up
docker compose up -d # en mode daemon

# arrête la stack
docker compose down
docker compose down -v # supprime en plus les volumes
```

### Sauvegarde

Pour récupérer en local les données de la BDD et de GeoServer, exécutez les scripts respectifs depuis la racine du projet

```sh
# Copie des workspaces GeoServer
# docker compose cp <container>:<from> <to>
docker compose cp geoserver:/opt/geoserver/data_dir/workspaces/. ./geoserver-workspaces/

# Export SQL de la base (dump)
docker compose exec -t db pg_dump --inserts -U postgres -d mydb > "./db/backup.sql"
```

- un dossier `./geoserver-workspaces` est créé pour les données des workspaces GeoServer
- un fichier `./db/backup.sql` est créé pour un dump de la BDD

