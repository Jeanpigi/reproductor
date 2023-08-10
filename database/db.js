const mysql = require('mysql2/promise');
require("dotenv").config();
const bcrypt = require('bcrypt');


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

// Configuracion del usuario
const checkIfUsernameExists = async (username) => {
    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        return users.length > 0;
    } catch (error) {
        console.error('Error en checkIfUsernameExists:', error);
        throw error; // O manejar el error de alguna otra manera
    }
};

const createUser = async (username, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    } catch (error) {
        console.error('Error en createUser:', error);
        throw error; // O manejar el error de alguna otra manera
    }

};

const getUserByUsername = async (username) => {
    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        return users;
    } catch (error) {
        console.error('Error en getUser:', error);
        throw error; // O manejar el error de alguna otra manera
    }

};

const comparePasswords = (password, hashedPassword) => {
    try {
        return bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error('Error en comparePasswords:', error);
        throw error; // O manejar el error de alguna otra manera
    }
};

// configuracion de los audios y musica
const checkIfFileMusicExists = async (filename) => {
    try {
        const [song] = await pool.execute('SELECT filename FROM canciones WHERE filename = ?', [filename]);
        return song.length > 0;
    } catch (error) {
        console.error('Error en checkIfMusicExists:', error);
        throw error; // O manejar el error de alguna otra manera
    }
};

const createSong = async (filename, filepath) => {
    try {
        await pool.query('INSERT INTO canciones (filename, filepath) VALUES (?, ?)', [filename, filepath]);
    } catch (error) {
        console.error('Error en createSong:', error);
        throw error;
    }
};

const getAllSongs = async () => {
    try {
        const [canciones] = await pool.execute('SELECT * FROM canciones');
        return canciones;
    } catch (error) {
        console.error('Error en getAllSongs:', error);
        throw error;
    }
}

const removeSong = async (id) => {
    try {
        const [songExist] = await pool.execute('SELECT filepath FROM canciones WHERE id = ?', [id]);
        if (!songExist) {
            console.log('La cancion no existe');
        }
        await pool.execute('DELETE FROM canciones WHERE id = ?', [id]);
        return songExist;
    } catch (error) {
        console.error('Error en removeSong:', error);
        throw error;
    }
}

// Anuncios
const checkIfFileAdExists = async (filename) => {
    try {
        const [ad] = await pool.execute('SELECT filename FROM anuncios WHERE filename = ?', [filename]);
        return ad.length > 0;
    } catch (error) {
        console.error('Error en checkIfFileAdExists:', error);
        throw error; // O manejar el error de alguna otra manera
    }
};

const createAd = async (filename, filepath) => {
    try {
        await pool.query('INSERT INTO anuncios (filename, filepath) VALUES (?, ?)', [filename, filepath]);
    } catch (error) {
        console.error('Error en createAd:', error);
        throw error;
    }
};


const getAllAds = async () => {
    try {
        const [anuncios] = await pool.execute('SELECT * FROM anuncios');
        return anuncios;
    } catch (error) {
        console.error('Error en getAllAds:', error);
        throw error;
    }
}

const removeAd = async (id) => {
    try {
        const [adExist] = await pool.execute('SELECT * FROM anuncios WHERE id = ?', [id]);
        if (!adExist) {
            console.log('El anuncio no existe');
        }
        await pool.execute('DELETE FROM anuncios WHERE id = ?', [id]);
        return adExist;
    } catch (error) {
        console.error('Error en removeAd:', error);
        throw error;
    }
}

module.exports = {
    pool,
    checkIfUsernameExists,
    createUser,
    getUserByUsername,
    comparePasswords,
    checkIfFileMusicExists,
    createSong,
    getAllSongs,
    removeSong,
    checkIfFileAdExists,
    createAd,
    getAllAds,
    removeAd
};