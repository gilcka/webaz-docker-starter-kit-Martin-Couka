-- Activer PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Création de la table des objets à trouver
DROP TABLE IF EXISTS objets;

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
('Bouteille de Jaeger', 'images/jaeger.jpg', 19, ST_SetSRID(ST_MakePoint(2.583864379,48.8459606), 4326)),
('Bouteille de Jaeger', 'images/jaeger.jpg', 19, ST_SetSRID(ST_MakePoint(2.580235745,48.8482698), 4326)),
('Bouteille de Jaeger', 'images/jaeger.jpg', 19, ST_SetSRID(ST_MakePoint(2.590833511,48.8370957), 4326)),
('Louise Vadeaudeau', 'images/Louise.jpg', 19, ST_SetSRID(ST_MakePoint(2.591552466454641, 48.843020341145845), 4326));


-- On fait pareil avec les gens avec qui il faut parler

DROP TABLE IF EXISTS personnes;

CREATE TABLE personnes (
    id SERIAL PRIMARY KEY,
    name TEXT, 
    message TEXT,
    reponse INT,
	indice_fin TEXT,
    zoom INT, 
    ordre_apparition INT,
    image TEXT,
    loc geometry(Point, 4326)
);

INSERT INTO personnes (name, message, reponse, indice_fin, zoom, ordre_apparition, image, loc) VALUES
('Killian Grosfront', 'Combien de fois on a gagné le trophée Descartes ?', 5, 
 'La personne suivante, Magali Carreaux, doit surement être en train de surveiller un chantier quelque part autour de l''école',
 18, 1, 'images/5.jpg',
 ST_SetSRID(ST_MakePoint(2.5925794002506253,48.839409302967056), 4326)
),

('Magali Carreaux', 'Combien a coûté la réparation de la fenêtre (en milliers d’euros) ?', 8,
 'La personne détentrice du prochain numéro, Clara Bourbier, est la secrétaire du BDHess et doit sûrement faire la queue dans une administration quelconque de l''UGE',
 18, 2, 'images/8.jpg',
 ST_SetSRID(ST_MakePoint(2.58192261198548,48.843495838070886), 4326)
),

('Clara Bourbier', 'Combien de contrôles de présence ont eu les it2 depuis le début de l’année ?', 4,
 'La dernière personne est nostalgique de ses années pré-ENSG, et doit sûrement être garée pas loin d''un collège, d''un lycée, ou d''une école',
 18, 3, 'images/4.jpg',
 ST_SetSRID(ST_MakePoint(2.587200720208837,48.83942860331999), 4326)
),

('Diego Posédanssabagnole', 'Combien de parrains a Tom Cacadur ?', 7,
 '',
 18, 4, 'images/7.jpg',
 ST_SetSRID(ST_MakePoint(2.585891112457032,48.844299902248146), 4326)
);

-- Puis avec la table vide qui stockera les pseudos et scores des futurs joueurs

DROP TABLE IF EXISTS joueurs;

CREATE TABLE joueurs (
	id SERIAL primary key, 
	nom TEXT NOT NULL, 
	temps TIME NOT NULL
);

DROP TABLE IF EXISTS indices;

CREATE TABLE indices (
    id SERIAL primary key, 
    objet_id INT NOT NULL, 
    indice TEXT NOT NULL
);

-- Et enfin avec la table des indices associés par leur id à chacun des objets à trouver

INSERT INTO indices (objet_id, indice) VALUES
(1, 'Lieu préféré des afters des soirées ENSG'),
(2, 'Elle a failli prendre l''eau'),
(3, 'Endroit sympa pour faire du VTT (à l''échelle de Noisy Le Grand...)'),
(4, 'Sur la route des vacances'),
(5, 'Pour faire des courses en vif'),
(6, 'Une bouteille chez Fred'),
(7, 'Une bouteille à la khôllocs''copie'),
(8, 'Une dernière bouteille à la meilleure résidence étudiante du campus'),
(9, 'Louise Vadeaudeau tente de rentrer chez elle en RER');

