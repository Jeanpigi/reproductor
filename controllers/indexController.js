const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    port: process.env.MYSQL_PORTDATABASE,
    database: process.env.MYSQL_DATABASE
};

const pool = mysql.createPool(dbConfig);

// Signup
exports.signup = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Verifica si el usuario ya existe
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length > 0) {
            return res.send('El nombre de usuario ya está en uso');
        }

        // Crea un nuevo usuario
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        // Guardar el usuario en la sesión
        req.session.user = { username };

        res.redirect('/login');
    } catch (error) {
        res.send(`Error que se está presentando es ${error}`);
    }
};


// Consulta de datos de usuario
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Verifica si el usuario existe
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.send('El usuario no existe');
        }

        // Compara la contraseña ingresada con el hash almacenado
        const passwordMatch = await bcrypt.compare(password, users[0].password);
        if (!passwordMatch) {
            return res.send('Credenciales inválidas');
        }

        // Guardar el usuario en la sesión
        req.session.user = { username };

        res.redirect("/canciones");
    } catch (error) {
        res.send(`El error es el siguiente ${error}`);
    }
};


exports.getAllSongs = async (req, res) => {
    try {
        const query = 'SELECT * FROM canciones';
        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (error) {
        console.error(error)
        res.send('Error del parte del servidor');
    }
};


exports.insertSong = async (req, res) => {
    const filename = req.file.filename;
    const filepath = req.file.path;

    try {
        const query = 'INSERT INTO canciones (filename, filepath) VALUES (?, ?)';
        await pool.query(query, [filename, filepath]);
        // Simulación de retraso para mostrar el indicador de carga
        setTimeout(() => {
            console.log("se completó la carga de la cancion");
            res.redirect('/canciones');
        }, 2000);
    } catch (error) {
        console.error(error);
        res.send('Ocurrio un error del lado del servidor');
    }
};

exports.getAllAds = async (req, res) => {
    try {
        const query = 'SELECT * FROM anuncios';
        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (error) {
        console.error(error)
        res.send('Error del parte del servidor');
    }
};

exports.insertAds = async (req, res) => {
    const filename = req.file.filename;
    const filepath = req.file.path;

    try {
        const query = 'INSERT INTO anuncios (filename, filepath) VALUES (?, ?)';
        await pool.query(query, [filename, filepath]);
        // Simulación de retraso para mostrar el indicador de carga
        setTimeout(() => {
            console.log("se completó la carga del anuncio");
            res.redirect('/anuncios');
        }, 2000);
    } catch (error) {
        console.error(error);
        res.send('Ocurrio un error del lado del servidor');
    }
};

