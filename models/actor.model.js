module.exports = (sequelize, Sequelize) => {
    const Actor = sequelize.define("actor", {
        nombre: {
            type: Sequelize.STRING,
            allowNull: false
        },
        imagen:{
            type:Sequelize.STRING
        },
        porsi:{
            type:Sequelize.STRING
        }
        
    });
    return Actor;
    
};
