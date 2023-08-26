require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const exphbs = require("express-handlebars");
const compression = require("express-compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const http = require("http");

// Rutas
const index = require("./routes/index");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3005;

app.use(morgan("tiny"));
app.use(express.json());
app.use(cors());
app.use(compression());

// Configurar express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 600000,
      sameSite: "None",
      secure: true,
    },
  })
);

// Configurar cookie-parser con la misma clave secreta
app.use(cookieParser(process.env.SESSION_SECRET));

// Configuración de Handlebars como motor de plantillas
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs.create({
    defaultLayout: "main",
    extname: ".hbs",
    partialsDir: __dirname + "/views/partials/",
  }).engine
);
app.set("view engine", ".hbs");

// Middleware para procesar datos del formulario
app.use(express.urlencoded({ extended: true }));

// Public
app.use(express.static(path.join(__dirname, "public")));
app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));
app.use("/music", express.static("public/music"));
app.use("/audios", express.static(path.join(__dirname, "public", "audios")));
app.use("/assets", express.static("public/assets"));

// Rutas
app.use("/", index);

// Importar y configurar sockets
const socketHandler = require("./utils/sockets");
socketHandler(server, __dirname);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
