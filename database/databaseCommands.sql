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


// SqlLite 
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("player.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS canciones (
      id INTEGER PRIMARY KEY,
      filename TEXT,
      filepath TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS anuncios (
      id INTEGER PRIMARY KEY,
      filename TEXT,
      filepath TEXT,
      dia TEXT NOT NULL
    );

  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      password TEXT NOT NULL
    );
  `);

  db.run(`
    INSERT INTO users (username, password) 
        VALUES
        ('admin', '$2b$10$QMCFvatgwEatXxWI2cIeLOJTvUAowEn/qSK9tSip7TpCWXGUIZT.m'),
        ('guil.berm', '$2b$10$eOqcPuG8cduWaXI5iPhbHuPXjYS7PiREKHyLXdS2uBeMdezdbcvaS'),
        ('leon.rojas', '$2b$10$1khJw8dgUZeELgRM5DUdNOq21XNzQJ2RllmXaq97XwdrxIqUuED1G'),
        ('arthu.orti', '$2b$10$0sGPSBeZDNR2QO8e0bhBnu6uwFPmppLTAiLGS9cjjxYe8ek3jB2T6'),
        ('yeis.rojas', '$2b$10$iRxko8Jx4T2wOrhuavysvOcoeruSTegHxyNKpPPoHQ1JquxvV53IW');
  `);

  db.each("SELECT * FROM users", (err, row) => {
    console.log(row.id + ": " + row.username + " " + row.password);
  });
});

db.close();
