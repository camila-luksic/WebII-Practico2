module.exports = app => {
    let router = require("express").Router();
    const controller =require("../controllers/director.controller.js");

    router.get('/', controller.listDirector);
    router.get('/:id', controller.getDirectorById);
    router.post('/', controller.createDirector);
    router.put('/:id', controller.updateDirectorPut);
    router.patch('/:id', controller.updateDirectorPatch);
    router.delete('/:id', controller.deleteDirector);
    router.post("/:id/img", controller.subirImagenDirector);
    router.get('/:id/peliculas', controller.obtenerPeliculasPorDirector);

    app.use('/directores', router);

};