module.exports=app=>{

    require("./pelicula.routes.js")(app);
    require("./director.routes.js")(app);
    require("./actor.routes.js")(app);
    
}