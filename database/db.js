const mysql = require('mysql2/promise');
require("dotenv").config();

// Configuración de la conexión a la base de datos MySQL utilizando un pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 20, // Número máximo de conexiones en el db
    waitForConnections: true,
    queueLimit: 0
});

// Obtener una conexión del db
module.exports = pool;