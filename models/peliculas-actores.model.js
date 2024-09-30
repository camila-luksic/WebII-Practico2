module.exports = (sequelize, Sequelize) => {
    const Peliculas_Actores = sequelize.define("Peliculas_Actores", {
        peliculaId: {
            type: Sequelize.INTEGER,
            primaryKey:true,
            references: {
                model: 'peliculas',
                key: 'id'
            },
            onUpdate: 'CASCADE',  
            onDelete: 'CASCADE' 
        },
        actorId: {
            type: Sequelize.INTEGER,
            primaryKey:true,
            references: {
                model: 'actors',
                key: 'id'
            },
            onUpdate: 'CASCADE', 
            onDelete: 'CASCADE' 
        }
});
    

    return Peliculas_Actores;
}
