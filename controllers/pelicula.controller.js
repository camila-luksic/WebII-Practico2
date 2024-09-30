const path = require('path');
const fs = require('fs'); // Asegúrate también de tener esto si no lo tienes
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

exports.listPelicula = async (req, res) => {
    try {
        const peliculas = await db.peliculas.findAll(
        );
        res.json(peliculas);
    } catch (error) {
        res.status(500).json("Error en el servidor");
    }
}

exports.getPeliculaById = async (req, res) => {
    const id = req.params.id;
    try {
        const pelicula = await getPeliculaOr404(id, res, {
            include: [
                {
                    model: db.actores,
                    as: 'actores', 
                    attributes: ['id', 'nombre', 'imagen'], 
                },
                {
                    model: db.directores,
                    as: 'director', 
                    attributes: ['id', 'nombre', 'imagen'], 
                }]
        });
        if (!pelicula) {
            return;
        }
        res.json(pelicula);
    } catch (error) {
        res.status(500).json("Error en el servidor");
    }
}

exports.createPelicula = async (req, res) => {

    const requiredFields = ['nombre', 'sinopsis', 'fechaLanzamiento', 'calificacion', 'trailer'];
    if (!isRequestValid(requiredFields, req.body, res)) {
        return;
    }
    const fechaLanzamiento = new Date(req.body.fechaLanzamiento);
    const fechaFormateada = fechaLanzamiento.toISOString().split('T')[0]; // "YYYY-MM-DD"

    try {

        const pelicula = {
            nombre: req.body.nombre,
            sinopsis: req.body.sinopsis,
            fechaLanzamiento: fechaFormateada,
            calificacion: req.body.calificacion,
            trailer: req.body.trailer
        }
        const peliculaCreada = await db.peliculas.create(pelicula);

        res.status(201).json(peliculaCreada);
    } catch (error) {
        sendError500(error);
    }
}
exports.updatePeliculaPatch = async (req, res) => {
    const id = req.params.id;
    try {
        const pelicula = await getPeliculaOr404(id, res);
        if (!pelicula) {
            return;
        }
        const camposAActualizar = {
            nombre: req.body.nombre,
            sinopsis: req.body.sinopsis,
            fechaLanzamiento: req.body.fechaLanzamiento,
            calificacion: req.body.calificacion,
            trailer: req.body.trailer
        };

        await db.peliculas.update(camposAActualizar, {
            where: { id: id }
        });
        res.json(pelicula);
    } catch (error) {
        res.status(500).json("Error en el servidor");
    }
}
exports.updatePeliculaPut = async (req, res) => {
    const id = req.params.id;
    console.log('ID de la película:', id);

    try {
        const pelicula = await getPeliculaOr404(id, res);
        if (!pelicula) {
            return;
        }
        console.log('ID de la película:', pelicula);

        const requiredFields = ['nombre', 'sinopsis', 'fechaLanzamiento', 'calificacion', 'trailer'];
        if (!isRequestValid(requiredFields, req.body, res)) {
            return;
        }
        const fechaLanzamiento = new Date(req.body.fechaLanzamiento);
        const fechaFormateada = fechaLanzamiento.toISOString().split('T')[0]; // "YYYY-MM-DD"
        console.log("*****");
        console.log(requiredFields);
        const camposAActualizar = {
            nombre: req.body.nombre,
            sinopsis: req.body.sinopsis,
            fechaLanzamiento: fechaFormateada,
            calificacion: req.body.calificacion,
            trailer: req.body.trailer
        };

        await db.peliculas.update(camposAActualizar, {
            where: { id: id }
        });
        res.json(pelicula);
    } catch (error) {
        res.status(500).json("Error en el servidor");
    }
}
exports.deletePelicula = async (req, res) => {
    const id = req.params.id;
    try {
        const pelicula = await getPeliculaOr404(id, res);
        if (!pelicula) {
            return;
        }
        await pelicula.destroy();
        res.json({
            msg: 'Pelicula eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json("Error en el servidor")(error);
    }
}
async function getPeliculaOr404(id, res, options = {}) {
    try {
        const pelicula = await db.peliculas.findByPk(id, options);
        if (!pelicula) {
            return res.status(404).json({ error: 'Película no encontrada' });
        }
        return pelicula;
    } catch (error) {
        res.status(500).json("Error en el servidor")(error);
        return null; 
    }
}

exports.subirImagenPelicula = async function (req, res) {
    const id = req.params.id;
    const pelicula = await db.peliculas.findByPk(id);
    if (!pelicula) {
        return res.status(404).json({ message: 'Película no encontrada' });
    }
    if (!req.files?.imagen) {
        return res.status(400).json({ message: 'Debe seleccionar una imagen' });
    }

    const imagen = req.files.imagen;
    const imagenDir = path.join(__dirname, '/../public/imagenes/peliculas/');

    if (!fs.existsSync(imagenDir)) {
        fs.mkdirSync(imagenDir, { recursive: true });
    }

    const filePath = path.join(imagenDir, `${pelicula.id}.jpg`);

    imagen.mv(filePath, async function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al subir la imagen' });
        }

        const pathRelativo = `/public/imagenes/peliculas/${pelicula.id}.jpg`;
        await db.peliculas.update({ imagen: pathRelativo }, { where: { id: pelicula.id } });

        res.json({ message: 'Imagen subida exitosamente', ruta: pathRelativo });
    });
};

exports.addParticipantes = async function (req, res) {
    const id = req.params.id;

    try {
        const pelicula = await db.peliculas.findByPk(id, {
            include: [{
                model: db.actores, 
                through: { attributes: [] } 
            }]
        });

        if (!pelicula) {
            return res.status(404).json({ message: 'Película no encontrada' });
        }

        res.json({ pelicula });
    } catch (error) {
        console.error('Error al obtener la película con sus actores:', error);
        return res.status(500).json({ message: 'Error al obtener la película con sus actores' });
    }
};



exports.insertParticipantes = async (req, res) => {
    const peliculaId = req.params.id;
    const { actoresIds } = req.body;

    if (!Array.isArray(actoresIds) || actoresIds.length === 0) {
        return res.status(400).json({ message: "actoresIds debe ser un array y no puede estar vacío." });
    }

    try {
        const pelicula = await db.peliculas.findByPk(peliculaId);
        if (!pelicula) {
            return res.status(404).json({ message: "Película no encontrada." });
        }

        const promesas = actoresIds.map(async (actorId) => {
            const actor = await db.actores.findByPk(actorId);
            if (!actor) {
                return res.status(404).json({ message: `Actor con ID ${actorId} no encontrado.` });
            }

            const existeRelacion = await db.peliculasYactores.findOne({
                where: { peliculaId, actorId }
            });

            if (!existeRelacion) {
                return db.peliculasYactores.create({ peliculaId, actorId });
            }
        });

        await Promise.all(promesas);

        return res.status(200).json({ message: "Actores agregados correctamente." });
    } catch (error) {
        console.error('Error al agregar actores a la película:', error);
        return res.status(500).json({ message: "Error al agregar actores." });
    }
};
exports.addDirectorToPelicula = async (req, res) => {
    const { id } = req.params; 
    const { directorId } = req.body; 

    try {
        const director = await db.directores.findByPk(directorId);
        if (!director) {
            return res.status(404).json({ message: 'Director no encontrado' });
        }

        const pelicula = await db.peliculas.findByPk(id);
        if (!pelicula) {
            return res.status(404).json({ message: 'Película no encontrada' });
        }

        pelicula.directorId = directorId;
        await pelicula.save();

        res.status(200).json({ message: 'Director asignado a la película correctamente', pelicula });
    } catch (error) {
        console.error("Error al asignar director:", error);
        res.status(500).json({ message: 'Error al asignar director a la película' });
    }
};
exports.getPeliculasByDirector = async (req, res) => {
    const { directorId } = req.params; // Asumiendo que la ruta es /peliculas/director/:directorId
    console.log("director: " + directorId);
    try {
        const peliculas = await db.peliculas.findAll({
            where: { directorId: directorId }, // Aquí se pasa directorId como un objeto
            include: [{ model: db.directores, as: 'director' }] // Asegúrate de que 'as' coincide con la asociación definida
        });

        if (peliculas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron películas para este director.' });
        }

        res.json(peliculas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las películas del director', error });
    }
};

