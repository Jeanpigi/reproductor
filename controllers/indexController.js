const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const fs = require('fs');
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

exports.getAll = async (req, res) => {
    try {
        const queryCanciones = 'SELECT * FROM canciones';
        const [canciones] = await pool.execute(queryCanciones);
        const queryAnuncios = 'SELECT * FROM anuncios';
        const [anuncios] = await pool.execute(queryAnuncios);
        res.render('songs', { canciones, anuncios });
    } catch (error) {
        console.error(error)
        res.send('Error del parte del servidor');
    }
};


exports.insertSong = async (req, res) => {
    try {
        const files = req.files; // Obtener los archivos subidos
        const insertedSongs = []; // Almacenar los nombres de las canciones insertadas

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filename = file.filename;
            const filepath = file.path;

            const querySong = 'SELECT filename FROM canciones WHERE filename = ?';
            const [result] = await pool.query(querySong, [filename]);

            if (result.length > 0) {
                const nombreCancion = result[0].filename;

                if (nombreCancion === filename) {
                    console.log(`La canción '${filename}' ya existe`);
                    continue; // Saltar al siguiente archivo
                }
            }

            const queryInsert = 'INSERT INTO canciones (filename, filepath) VALUES (?, ?)';
            await pool.execute(queryInsert, [filename, filepath]);

            insertedSongs.push(filename);
        }

        if (insertedSongs.length > 0) {
            console.log("Se completó la carga de las canciones: ", insertedSongs);
        } else {
            console.log("No se insertaron nuevas canciones");
        }

        res.redirect('/canciones');
    } catch (error) {
        console.error(error);
        res.send('Ocurrió un error al momento de insertar en la base de datos');
    }
};

exports.deleteSong = async (req, res) => {
    const { id } = req.params;
    try {
        const selectQuery = 'SELECT filepath FROM canciones WHERE id = ?';
        const [result] = await pool.execute(selectQuery, [id]);
        const filepath = result[0].filepath;

        const deleteQuery = 'DELETE FROM canciones WHERE id = ?';
        await pool.execute(deleteQuery, [id]);

        fs.unlink(filepath, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log('Archivo eliminado exitosamente');

            }
        });
        res.redirect("/canciones");
    } catch (error) {
        console.error(error);
        res.send('Ha ocurrido un error del lado del servidor');
    }
};

exports.getAllAudios = async (req, res) => {
    try {
        const query = 'SELECT * FROM anuncios';
        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (error) {
        console.error(error)
        res.send('Error del parte del servidor');
    }
};

exports.getAudios = async (req, res) => {
    try {
        const query = 'SELECT * FROM anuncios';
        const [rows] = await pool.execute(query);
        res.render('test', { rows })
    } catch (error) {
        console.error(error)
        res.send('Error del parte del servidor');
    }
};

exports.insertAudios = async (req, res) => {
    try {
        const files = req.files; // Obtener los archivos subidos (usar req.files en lugar de req.file)
        const insertedAudios = []; // Almacenar los nombres de los audios insertados

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filename = file.filename;
            const filepath = file.path;

            const queryAudio = 'SELECT filename FROM anuncios WHERE filename = ?';
            const [result] = await pool.execute(queryAudio, [filename]);

            if (result.length > 0) {
                const nombreAudio = result[0].filename;

                if (nombreAudio === filename) {
                    console.log(`El audio '${filename}' ya existe`);
                    continue; // Saltar al siguiente archivo
                }
            }

            const queryInsert = 'INSERT INTO anuncios (filename, filepath) VALUES (?, ?)';
            await pool.execute(queryInsert, [filename, filepath]);

            insertedAudios.push(filename);
        }

        if (insertedAudios.length > 0) {
            console.log("Se completó la carga de los audios:", insertedAudios);
        } else {
            console.log("No se insertaron nuevos audios");
        }

        res.redirect('/canciones');
    } catch (error) {
        console.error(error);
        res.send('Ocurrió un error del lado del servidor');
    }
};

exports.deleteAudios = async (req, res) => {
    const { id } = req.params;
    try {
        const selectQuery = 'SELECT filepath FROM anuncios WHERE id = ?';
        const [result] = await pool.execute(selectQuery, [id]);
        const filepath = result[0].filepath;

        const deleteQuery = 'DELETE FROM anuncios WHERE id = ?';
        await pool.execute(deleteQuery, [id]);

        fs.unlink(filepath, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log('Archivo eliminado exitosamente');
            }
        });
        res.redirect("/canciones");
    } catch (error) {
        console.error(error);
        res.send('Ha ocurrido un error del lado del servidor');
    }
};

