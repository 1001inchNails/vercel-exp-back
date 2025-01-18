
async function conectarCliente(){    // funcion para conexion a cliente...
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://dccAtlMongoC_S:1001%25%25wWqq4904@clusterbuster.bl5p1.mongodb.net/?retryWrites=true&w=majority&appName=ClusterBuster";
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    return client;
  }
  
  async function listadoUsers() { // devuelve array de objetos con todos los datos
    const cliente=await conectarCliente();
    try {
      const database = cliente.db('exendpovercel');
      const datos = database.collection('usuarios');
      const query = {};
      let dato = await datos.find(query).toArray();
      return dato;
    } finally {
      await cliente.close();
    }
  }
  
  async function insertarNuevoDocumento(nuevoDoc) { // inserta nuevo documento en la coleccion
    const cliente=await conectarCliente();
    try {
      const database = cliente.db('exendpovercel');
      const datos = database.collection('usuarios');
      await datos.insertOne(nuevoDoc);
    } finally {
      await cliente.close();
    }
  }
  
  const express = require('express');
  
  const app = express();
  
  app.use(express.json());
  
  // https://stackoverflow.com/questions/47523265/jquery-ajax-no-access-control-allow-origin-header-is-present-on-the-requested
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
  
  
  
  app.get('/api/users',async(req, res)=>{  // todos los usuarios
    let usuarios=await listadoUsers();
    //console.log(usuarios);
    res.json(usuarios);
  });
  
  app.get('/api/users/:nombre', async(req, res)=>{  // busqueda por nombre
    let resultado=[];
    let usuariosB=await listadoUsers();
    let userNombre=req.params.nombre;
    userNombre.toLowerCase();
    for(let usuario of usuariosB){
      if(usuario['nombre'].toLowerCase().includes(userNombre.toLowerCase())){
        resultado.push(usuario);
      }
    }
    if(resultado.length>0){
      res.json(resultado);
    }
    else if(resultado.length==0){
      res.json({"mensaje":"No se han encontrado coincidencias"})
    }
    else{
      res.status(404).json(({error:"Error, madafaka"}));
    }
  });
  
  app.post('/api/datos', async(req,res)=>{
    try{
      let usuariosC=await listadoUsers();
      let nuevoIndice=(usuariosC.length);  // calculamos nuevo indice
      nuevoIndice++;
      nuevoIndice.toString();
  
      let nuevoNombre=req.body.nombre;  // cojemos los valores para el nuevo dato
      let nuevoApellidos=req.body.apellidos;
      let nuevoTelefono=req.body.telefono;
      let nuevoEmail=req.body.email;
  
      let datoNuevo={
        "id":nuevoIndice.toString(),
        "nombre":nuevoNombre,
        "apellidos":nuevoApellidos,
        "telefono":nuevoTelefono,
        "email":nuevoEmail,
      };
      
      await insertarNuevoDocumento(datoNuevo) // actualizacion de BBDD
      .then(() => console.log('Datos introducidos correctamente'))
      .catch((error) => console.error('Error al introducir datos:', error)); 
      res.json({"mensaje":"Usuario introducido correctamente"});
    }catch(error){
      res.send({"mensaje":error});
    }
    
  
  });
  

  
  const port = 5000;

  app.listen(port, () => {
    console.log(`Listening: http://localhost:${port}`);
  });
   
  module.exports = app;
  
  