# Supermercado Primo - Reproductor de Música Web

El Supermercado Primo presenta un reproductor de música web desarrollado utilizando las tecnologías Node.js, Express y Mysql. Esta aplicación avanzada permite a los usuarios disfrutar de su música favorita mientras brinda una experiencia fluida y confiable.

## Características principales

- Registro de usuarios: Los usuarios pueden crear fácilmente una cuenta personal para acceder a todas las funcionalidades del reproductor de música.
- Inicio de sesión seguro: Con un sistema de autenticación robusto, los usuarios pueden iniciar sesión de manera segura en sus cuentas.
- Carga de canciones: La aplicación permite a los usuarios cargar y almacenar sus canciones en formato MP3 y M4A para acceder a ellas en cualquier momento y desde cualquier dispositivo.
- Reproducción de canciones: Los usuarios pueden reproducir sus canciones cargadas sin problemas, brindando una experiencia auditiva excepcional.
- API para información de canciones: Además de las funcionalidades principales, la aplicación también proporciona una API intuitiva que permite a los desarrolladores obtener información detallada sobre las canciones almacenadas.

## Requisitos previos

Antes de ejecutar la aplicación, asegúrate de tener instalado lo siguiente:

- Node.js (v16 o superior)
- Mysql

## Instalación

1. Clona este repositorio:

   ```bash
   git clone https://github.com/tuusuario/reproductor-musica.git

2. Ve al directorio del proyecto:

   ```bash
   cd reproductor-musica

3. Instala las dependencias:

   ```bash
   npm install

4. Configura las variables de entorno:

    Crea un archivo .env en el directorio raíz del proyecto
    Copia el contenido del archivo .env.example y pégalo en el archivo .env
    Completa las variables de entorno con tus propios valores

5. Inicia el servidor:

   ```bash
   npm start

6. Accede a la aplicación en tu navegador web en la siguiente URL: http://localhost:3000

## Uso

1. Regístrate en la aplicación para crear una cuenta de usuario.
2. Inicia sesión con tu cuenta de usuario.
3. Carga canciones en formato MP3 o M4A desde la sección de administración.
4. Reproduce las canciones en el reproductor integrado.
5. Utiliza la API para obtener información sobre las canciones.

## API

La aplicación proporciona las siguientes rutas de la API:

- `GET /api/canciones`: Obtiene todas las canciones.
- `GET /api/canciones/:id`: Obtiene una canción específica por su ID.

## Contribución

Si deseas contribuir a este proyecto y ayudarlo a crecer, sigue estos pasos:

1. Crea un fork de este repositorio.
2. Crea una nueva rama con un nombre descriptivo: `git checkout -b nombre_de_rama`.
3. Realiza las modificaciones necesarias y realiza los commits correspondientes.
4. Envía tus cambios al repositorio remoto: `git push origin nombre_de_rama`.
5. Abre un pull request para revisar tus cambios y fusionarlos con la rama principal.

# Authors

- **Jean Pierre Giovanni Arenas Ortiz**

## Licencia

Esta aplicación está bajo la Licencia MIT. Para obtener más detalles, consulta el archivo [LICENSE](enlace_a_la_licencia).
