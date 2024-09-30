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

exports.listActor = async (req, res) => {
    try {
        const actores = await db.actores.findAll();
        res.json(actores);
    } catch (error) {
        sendError500(error);
    }
}

exports.getActorById = async (req, res) => {
    const id = req.params.id;
    try {
        const actor = await getActorOr404(id, res,{
            include:"peliculas"
        });
        if (!actor) {
            return;
        }
        res.json(actor);
    } catch (error) {
        sendError500(error);
    }
}

exports.createActor = async (req, res) => {

    const requiredFields = ['nombre'];
    if (!isRequestValid(requiredFields, req.body, res)) {
        return;
    }
    try {

        const actor = {
            nombre: req.body.nombre
        }
        const actorCreada = await db.actores.create(actor);

        res.status(201).json(actorCreada);
    } catch (error) {
        sendError500(error);
    }
}
exports.updateActorPatch = async (req, res) => {
    const id = req.params.id;
    try {
        const actor = await getActorOr404(id, res);
        if (!actor) {
            return;
        }
        const camposAActualizar = {
            nombre: req.body.nombre
        };

        await db.actores.update(camposAActualizar, {
            where: { id: id }
        });
        res.json(actor);
    } catch (error) {
        sendError500(error);
    }
}
exports.updateActorPut = async (req, res) => {
    const id = req.params.id;
    try {
        const actor = await getActorOr404(id, res);
        if (!actor) {
            return;
        }
        const requiredFields = ['nombre'];
    
        if (!isRequestValid(requiredFields, req.body, res)) {
            return;
        }
        const camposAActualizar = {
            nombre: req.body.nombre
        };

        await db.actores.update(camposAActualizar, {
            where: { id: id }
        });
        res.json(actor);
    } catch (error) {
        sendError500(error);
    }
}
exports.deleteActor = async (req, res) => {
    const id = req.params.id;
    try {
        const actor = await getActorOr404(id, res);
        if (!actor) {
            return;
        }
        await actor.destroy();
        res.json({
            msg: 'Actor eliminado correctamente'
        });
    } catch (error) {
        sendError500(error);
    }
}
async function getActorOr404(id, res,options={}) {
    const actor = await db.actores.findByPk(id,options);
    if (!actor) {
        res.status(404).json({
            msg: 'Actor no encontrado'
        });
        return;
    }
    return actor;
}

exports.subirImagenActor = async function (req, res) {
    const id = req.params.id;
    const actor = await db.actores.findByPk(id);
    if (!actor) {
        return res.status(404).json({ message: 'Actor no encontrado' });
    }
    if (!req.files?.imagen) {
        return res.status(400).json({ message: 'Debe seleccionar una imagen' });
    }

    const imagen = req.files.imagen;
    const imagenDir = path.join(__dirname, '/../public/imagenes/actores/');
    
    if (!fs.existsSync(imagenDir)) {
        fs.mkdirSync(imagenDir, { recursive: true });
    }

    const filePath = path.join(imagenDir, `${actor.id}.jpg`);

    imagen.mv(filePath, async function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al subir la imagen' });
        }

       
        const pathRelativo = `/public/imagenes/actores/${actor.id}.jpg`;
        await db.actores.update({ imagen: pathRelativo }, { where: { id: actor.id } });

        res.json({ message: 'Imagen subida exitosamente', ruta: pathRelativo });
    });
};

function sendError500(res, error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
}
