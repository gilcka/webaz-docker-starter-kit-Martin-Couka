-- Activer PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Création de la table des objets à trouver
CREATE TABLE objets (
    id SERIAL PRIMARY KEY,
    name TEXT, 
    image TEXT, 
    zoom INT,
    loc geometry(Point, 4326)
);

-- On remplit la table
INSERT INTO objets (name, image, zoom, loc) VALUES
('Téléphone', 'images/telephone.jpg', 19, ST_SetSRID(ST_MakePoint(2.588558, 48.840379), 4326)),
('Casquette', 'images/casquette.jpg', 19, ST_SetSRID(ST_MakePoint(2.589121,48.848699), 4326)),
('Marinière', 'images/mariniere.jpg', 19, ST_SetSRID(ST_MakePoint(2.580884, 48.836886), 4326)),
('Portefeuille', 'images/portefeuille.jpg', 19, ST_SetSRID(ST_MakePoint(2.59038, 48.833976), 4326)),
('Sac à main', 'images/sac.jpg', 19, ST_SetSRID(ST_MakePoint(2.585031, 48.846772), 4326)),
('Bouteille de JaegerMeister', 'images/jaeger.jpg', 19, ST_SetSRID(ST_MakePoint(2.583864379,48.8459606), 4326)),
('Bouteille de JaegerMeister', 'images/jaeger.jpg', 19, ST_SetSRID(ST_MakePoint(2.580235745,48.8482698), 4326)),
('Bouteille de JaegerMeister', 'images/jaeger.jpg', 19, ST_SetSRID(ST_MakePoint(2.590833511,48.8370957), 4326)),