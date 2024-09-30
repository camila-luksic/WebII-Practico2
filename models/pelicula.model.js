module.exports = (sequelize, Sequelize) => {
    const Pelicula = sequelize.define("pelicula", {
        nombre: {
            type: Sequelize.STRING,
            allowNull: false
        },
        sinopsis: {
            type: Sequelize.STRING,
            allowNull: false
        },
        fechaLanzamiento:{
            type: Sequelize.DATE,
            allowNull: false
        },
        calificacion:{
            type:Sequelize.DECIMAL,
            allowNull:false
        },
        imagen:{
            type:Sequelize.STRING
        },
        trailer:{
            type:Sequelize.STRING  
        },
        directorId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'directors', 
                key: 'id'
            },
            onDelete: 'CASCADE'
        }

    });
    return Pelicula;
};
