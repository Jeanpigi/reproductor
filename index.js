require('dotenv').config();
const express = require("express");
const morgan = require('morgan');
const path = require("path");
const exphbs = require('express-handlebars');
const compression = require('compression');
const cors = require('cors');

//Rutas
const index = require("./routes/index");

const app = express();
const port = process.env.PORT || 3002;

app.use(morgan("tiny"));
// parse application/json
app.use(express.json());
app.use(cors());
app.use(compression());

// Configuración de Handlebars como motor de plantillas
app.set("views", path.join(__dirname, "views"));
app.engine(
    ".hbs",
    exphbs.create({
        defaultLayout: "main",
        extname: ".hbs",
        // helpers: require('./lib/handlebars')
        partialsDir: __dirname + '/views/partials/',
    }).engine
);
app.set("view engine", ".hbs");

// Middleware para procesar datos del formulario
app.use(express.urlencoded({ extended: true }));


// Public
app.use(express.static(path.join(__dirname, 'public')));

app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css'));
app.use('/music', express.static('public/music'));
app.use('/publicidad', express.static('public/publicidad'));
app.use('/assets', express.static('public/assets'));


//Rutas
app.use('/', index);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
