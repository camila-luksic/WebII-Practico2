const dbConfig=require("../config/db.config.js");
const Sequelize=require("sequelize");
const sequelize=new Sequelize(
    dbConfig.Db,
    dbConfig.User,
    dbConfig.Password,
    {
        host:dbConfig.Host,
        port:dbConfig.Port,
        dialect:"mysql",
    }
);

const db={};
db.Sequelize=Sequelize;
db.sequelize=sequelize;

db.peliculas=require("./pelicula.model.js")(sequelize,Sequelize);
db.actores=require("./actor.model.js")(sequelize,Sequelize);
db.directores=require("./director.model.js")(sequelize,Sequelize);
db.peliculasYactores=require("./peliculas-actores.model.js")(sequelize,Sequelize);

db.directores.hasMany(db.peliculas, {
    foreignKey: 'directorId',
    onDelete: 'CASCADE'  
});

db.peliculas.belongsTo(db.directores, 
    { foreignKey: 'directorId',
        as:'director', 
        onDelete: 'CASCADE'  
    }
);


db.peliculas.belongsToMany(db.actores, {
    through: 'peliculas_actores', 
    as: "actores",
    foreignKey: "peliculaId"
});
db.actores.belongsToMany(db.peliculas, {
    through: "peliculas_actores",
    as: "peliculas",
    foreignKey: "actorId"
});

module.exports=db;
