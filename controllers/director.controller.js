const path = require('path');
const fs = require('fs');
const db = require("../models");
const { isRequestValid } = require("../utils/request.utils.js");

// Estados del servidor
//200 -> ok
//201 -> creado
//400 -> validaciones
//401 -> no autorizado
//403 -> prohibido
//404 -> no encontrado
//500 -> errores del servidor

exports.listDirector = async (req, res) => {
    try {
        const directores = await db.directores.findAll();
        res.json(directores);
    } catch (error) {
        sendError500(error);
    }
}

exports.getDirectorById = async (req, res) => {
    const id = req.params.id;
    try {
        const director = await getDirectorOr404(id, res);
        if (!director) {
            return;
        }
        res.json(director);
    } catch (error) {
        sendError500(error);
    }
}

exports.createDirector = async (req, res) => {

    const requiredFields = ['nombre'];
    if (!isRequestValid(requiredFields, req.body, res)) {
        return;
    }
    try {

        const director = {
            nombre: req.body.nombre
        }
        const directorCreada = await db.directores.create(director);

        res.status(201).json(directorCreada);
    } catch (error) {
        sendError500(error);
    }
}
exports.updateDirectorPatch = async (req, res) => {
    const id = req.params.id;
    try {
        const director = await getDirectorOr404(id, res);
        if (!director) {
            return;
        }
        const camposAActualizar = {
            nombre: req.body.nombre
        };

        await db.directores.update(camposAActualizar, {
            where: { id: id }
        });
        res.json(director);
    } catch (error) {
        sendError500(error);
    }
}
exports.updateDirectorPut = async (req, res) => {
    const id = req.params.id;
    try {
        const director = await getDirectorOr404(id, res);
        if (!director) {
            return;
        }
        const requiredFields = ['nombre'];
        if (!isRequestValid(requiredFields, req.body, res)) {
            return;
        }
        const camposAActualizar = {
            nombre: req.body.nombre
        };

        await db.directores.update(camposAActualizar, {
            where: { id: id }
        });
        res.json(director);
    } catch (error) {
        sendError500(error);
    }
}
exports.deleteDirector = async (req, res) => {
    const id = req.params.id;
    try {
        const director = await getDirectorOr404(id, res);
        if (!director) {
            return;
        }
        await director.destroy();
        res.json({
            msg: 'Director eliminado correctamente'
        });
    } catch (error) {
        sendError500(error);
    }
}
async function getDirectorOr404(id, res) {
    const director = await db.directores.findByPk(id);
    if (!director) {
        res.status(404).json({
            msg: 'Director no encontrado'
        });
        return;
    }
    return director;
} 
exports.subirImagenDirector = async function (req, res) {
    const id = req.params.id;
    const director = await db.directores.findByPk(id);
    if (!director) {
        return res.status(404).json({ message: 'Director no encontrado' });
    }
    if (!req.files?.imagen) {
        return res.status(400).json({ message: 'Debe seleccionar una imagen' });
    }

    const imagen = req.files.imagen;
    const imagenDir = path.join(__dirname, '/../public/imagenes/directores/');
    
    if (!fs.existsSync(imagenDir)) {
        fs.mkdirSync(imagenDir, { recursive: true });
    }

    const filePath = path.join(imagenDir, `${director.id}.jpg`);

    imagen.mv(filePath, async function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al subir la imagen' });
        }

        const pathRelativo = `/public/imagenes/directores/${director.id}.jpg`;
        await db.directores.update({ imagen: pathRelativo }, { where: { id: director.id } });

        res.json({ message: 'Imagen subida exitosamente', ruta: pathRelativo });
    });
};
function sendError500(res, error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
} 
exports.obtenerPeliculasPorDirector = async (req, res) => {
    try {
        const { id } = req.params;

        const director = await db.directores.findOne({
            where: { id },
            include: [
                {
                    model: db.peliculas,
                    as: 'peliculas', 
                    attributes: ['nombre', 'sinopsis', 'fechaLanzamiento', 'calificacion', 'trailer']
                }
            ]
        });

        if (!director) {
            return res.status(404).json({ message: 'Director no encontrado.' });
        }

        res.json({
            director: {
                nombre: director.nombre
            },
            peliculas: director.peliculas
        });
    } catch (error) {
        console.error('Error al obtener las películas del director:', error);
        res.status(500).json({ message: 'Error al obtener las películas del director.' });
    }
};
