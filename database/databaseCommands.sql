CREATE DATABASE reproductor;

connect reproductor


CREATE TABLE canciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255),
  filepath VARCHAR(255)
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE anuncios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255),
  filepath VARCHAR(255)
);

-- formas de ingresar a la base de datos mediante docker

docker exec -it mysql sh

mysql -u root -p 

show databases;

use reproductor;

shwo tables;