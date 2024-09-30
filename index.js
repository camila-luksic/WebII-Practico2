const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
const db = require("./models");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(cors());

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },  
    useTempFiles: true,                     
    tempFileDir: './tmp/'                   
}));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'FrontEnd')));

 //db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  //db.directores.drop(); // Elimina primero la tabla que depende de peliculas
 //db.peliculas.drop();  // Luego elimina la tabla peliculas

db.sequelize.sync({
//force: true 
}).then(() => {
    
    console.log("Base de datos sincronizada");
});
//db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

app.use(function (error, req, res, next) {
    if (error instanceof SyntaxError) {
        res.status(400).json({ msg: 'Error en el JSON' });
    } else {
        next();
    }
});

require('./routes')(app);

app.listen(5015, function () {
    console.log('Servidor ejecutándose en http://localhost:5015');
});

//crud de pelicula,actor,director
//subir imagen por probar, subir trailer por hacer

/* requerimientos
catalogo de peliculas(que muestre nombre y foto) ordenado por calificacion
*,
hacer clic y ver la pelicula(todos los demas datos *+ el reparto con foto)
si hago clic en el actor que me muestre todas las peliculas en las que esta
*/

/*
tengo un index para el admin , me falta arreglar el edit ,pero crea muestra y elimina*
me falta lo de imagen* y trailer
y luego me falta todo lo de reparto con su foto y como link para ver todas sus peliculas
*/

//falta agregar actor a pelicula y director*
//falta mostrar el reparto en la pelicula*
//falta hacer clic en el reparto y ver todas las peliculas en las que estuvo*
//falta agregar el trailer
