const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const mysql = require('mysql');  
//Para realizar solicitudes http al S3
const https = require('https');


//Credenciales de aws
const aws_keys = require('./creds_template'); 
const AWS = require('aws-sdk');

//Claves de S3
const s3 = new AWS.S3(aws_keys.s3);  
const multer = require('multer'); // Importar multer para manejar el buffer de la imagen
const util = require('util'); // Importar util para promisify
const bcrypt = require('bcrypt'); //Importar bcrypt

//Rekognition
const rek = new AWS.Rekognition(aws_keys.rekognition);


const corsOptions = { origin: true, optionsSuccessStatus: 200 };
app.use(cors(corsOptions));

/*app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));*/

app.use(express.json()); //Para interpretar JSON en el cuerpo de las solicitudes
app.use(express.urlencoded({ extended: true })); //Para interpretar solicitudes de tipo x-www-form-urlencoded

//Para la base 64 de las fotos
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

//Credenciales de la base de datos
const db_credentials = require('./db_creds'); 
const { error } = require('console');
const conn = mysql.createPool(db_credentials); 
const query = util.promisify(conn.query).bind(conn); // Promisificar conn.query

//Puerto del servidor
const port = 9000;
app.listen(port);
console.log("Escuchando en el puerto", port);

//Para encriptar la contrasena
const saltRounds = 10;

app.get('/', (req, res) => {
   res.status(200).send('OK');
 });

//Endpoint para agregar un usuario, aqui se sube la imagen a S3 y se recupera la url de la imagen
app.post("/addUser", upload.single('foto'), async (req, res) => {
    const { nombre, email, password } = req.body; 
    if (!req.file) {
        return res.status(400).send({ message: 'Foto no proporcionada' });
    }

    const fotoBuffer = req.file.buffer; 
    const fotoNombre = `Fotos_Perfil/${nombre}_${Date.now()}.jpg`; //Se le asigna el nombre a la foto con la fecha de subida

    const params = {
        Bucket: "practica2-semi1-b-2s2024-imagenes1-g6", 
        Key: fotoNombre, 
        Body: fotoBuffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read'  
    };

    try {
        const uploadResult = await s3.upload(params).promise();
        const url_img = uploadResult.Location; 
        
		const queryStr = `SELECT * FROM Usuario WHERE NombreUsuario = "${String(nombre)}";`;

		const queryStrCorreo = `SELECT * FROM Usuario WHERE CorreoUsuario = "${String(email)}";`;

		const existingUser = await query(queryStr);
		const existingCorreo = await query(queryStrCorreo); 
		
        if (existingUser && existingUser.length > 0) {  // Verifica si existingUser está definido y tiene elementos
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso', errorType: 0 });
        }

		if (existingCorreo && existingCorreo.length > 0) {  // Verifica si ya hay un usuario que esta usando el correo a registrar
            return res.status(400).json({ message: 'El correo ya esta en uso', errorType: 0 });
        }

        // Encripta la contraseña
        const hashedPassword = await bcrypt.hash(password, saltRounds);

		await query('INSERT INTO Usuario (NombreUsuario, ContraseniaUsuario, CorreoUsuario, FotoUsuario) VALUES(?,?,?,?)', 
        [nombre, hashedPassword, email, url_img], 
        function (err, result) {
            if (err) {
                console.error('Error al insertar usuario:', err);
                return res.status(500).send({ message: 'Error al insertar usuario' });
            }
            res.send({ message: 'Usuario creado exitosamente', email: "", errortype: 1 });
        });

    } catch (error) {
        console.error('Error al subir la foto a S3:', error);
        res.status(500).send({ message: 'Error al subir la foto' });
    }
});

//Endpoint para el login
app.post("/login", async (req, res) => {
    const { Usuario, Password } = req.body; //Recibiendo el body
    try {
		//Verificando si el nombre de usuario existe
		var consulta = "";
		if(String(Usuario).includes("@")) { //Si viene una @, es un correo
			consulta = `SELECT * FROM Usuario WHERE CorreoUsuario = "${String(Usuario)}";`;
		} else {
			consulta = `SELECT * FROM Usuario WHERE NombreUsuario = "${String(Usuario)}";`;
		}

		const users = await query(consulta);
 
        if (!users) { //Usuario mo encontrado, codigo de error = 2
            return res.status(401).json({ name: "", email: "", errortype: 2 });
        }
    	
        //Se recupera el usuario de la consulta
        const usr = users[0];

        //Comparando contraseña encriptada
		console.log(users.length);
        const isMatch = await bcrypt.compare(Password, usr.ContraseniaUsuario);
        if (!isMatch) { //Contraseña incorrecta, código de error = 1
            return res.status(401).json({ name: "", email: "", errortype: 1 });
        }
    
        const userData = { ...usr };

    	//Se retorna un codigo de error de 0 para que inicie sesion
        res.status(200).json({ name: userData.NombreUsuario, email: userData.CorreoUsuario, errortype: 0 });
    
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión', state: 1 });
    }
});

//Datos inicio
app.post("/datosInicio", async (req, res) => {
    const { email } = req.body; //Recibiendo el body que trae solo el correo
    try {
		//Verificando si el usuario existe mediante el correo
		var consulta = `SELECT * FROM Usuario WHERE CorreoUsuario = "${String(email)}";`;

		console.log(consulta); // Imprime la consulta con el valor
		const users = await query(consulta);
 
        if (!users) { //Usuario no encontrado, codigo de error = 2
            return res.status(401).json({ name: "", email: "", errortype: 2 });
        }
    	
        //Se recupera el usuario de la consulta
        const usr = users[0];
    
        const userData = { ...usr };
        const imageUrl = userData.FotoUsuario; //La url de la imagen en S3
        //Se recupera la imagen en base 64
        const base64Image = await getBase64Image(imageUrl);
        console.log("URL de la imagen ", imageUrl)

    	//Se retorna un codigo de error de 0 para que inicie sesion
        res.status(200).json({ name: userData.NombreUsuario, foto: base64Image, errortype: 0 });
    
    } catch (error) {
        console.error('Error al mostrar datos de inicio: ', error);
        res.status(500).json({ message: 'Error al mostrar datos de inicio', state: 1 });
    }
});

//Función para obtener la imagen en base64
function getBase64Image(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            const chunks = [];

            response.on('data', (chunk) => {
                chunks.push(chunk);
            });

            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const base64 = buffer.toString('base64');
                resolve(base64);
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
    });
}

//Editar datos
app.post("/editarDatos", async (req, res) => {
    const { email }  = req.body; //Recibiendo el body que trae solo el correo
    try {
		//Verificando si el usuario existe mediante el correo
		var consulta = `SELECT * FROM Usuario WHERE CorreoUsuario = "${String(email)}";`;

		console.log(consulta); // Imprime la consulta con el valor
		const users = await query(consulta);
 
        if (!users) { //Usuario no encontrado, codigo de error = 2
            return res.status(401).json({ name: "", email: "", errortype: 2 });
        }
    	
        //Se recupera el usuario de la consulta
        const usr = users[0];
    
        const userData = { ...usr };
        const imageUrl = userData.FotoUsuario; //La url de la imagen en S3

        //Se recupera la imagen en base 64
        const base64Image = await getBase64Image(imageUrl);
        
        res.status(200).json({ name: userData.NombreUsuario, foto: base64Image, errortype: 0 });
    
    } catch (error) {
        console.error('Error al mostrar datos:', error);
        res.status(500).json({ message: 'Error al mostrar datos', errorType: 1 });
    }
});

//Endpoint para actualizar los datos de un usuario
app.post("/actualizarDatos", upload.single('foto'), async (req, res) => {
    const { nombre, email, password, nombre_usuario } = req.body; 

    if (!req.file) {
        return res.status(400).send({ message: 'Foto no proporcionada' });
    }

    const fotoBuffer = req.file.buffer; 
    const fotoNombre = `Fotos_Perfil/${nombre}_${Date.now()}.jpg`; //Se le asigna el nombre a la foto con la fecha de subida

    const params = {
        Bucket: "practica2-semi1-b-2s2024-imagenes1-g6", 
        Key: fotoNombre, 
        Body: fotoBuffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read'  
    };

    try {
        const uploadResult = await s3.upload(params).promise();
        const url_img = uploadResult.Location; 

        //Verificando que el usuario exista
        const queryStr = `SELECT * FROM Usuario WHERE NombreUsuario = "${String(nombre_usuario)}";`;
        const existingUser = await query(queryStr); 

        if (!existingUser || existingUser.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado', errorType: 0 });
        }
 
        // Actualiza los datos del usuario
        const updateQuery = `
        UPDATE Usuario 
        SET NombreUsuario = ?, 
            ${password ? 'ContraseniaUsuario = ?,' : ''}
            CorreoUsuario = ?,
            ${req.file ? 'FotoUsuario = ?' : ''} 
        WHERE NombreUsuario = ?;
        `;

        //Valores nuevos que van insertados en la query UPDATE, ademas del nombre de usuario a buscar
        const updateValues = [nombre];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateValues.push(hashedPassword); //Añade la nueva contraseña encriptada
        }

        updateValues.push(email); //Añade el email a actualizar

        if (req.file) {
            updateValues.push(url_img); //Añade la nueva URL de la imagen
        }

        updateValues.push(nombre_usuario); //Nombre del usuario a buscar

        await query(updateQuery, updateValues, function (err, result) {
        if (err) {
            console.error('Error al actualizar usuario:', err);
            return res.status(500).send({ message: 'Error al actualizar usuario', errorType: 0 });
        }
        res.send({ message: 'Datos de usuario actualizados exitosamente', errorType: 1 });
        });

    } catch (error) {
        console.error('Error al actualizar usuario S3', error);
        res.status(500).send({ message: 'Error al actualizar usuario S3', errorType: 0});
    }
});


//Endpoint para login facial
app.post("/loginFacial", upload.single('foto'), async (req, res) => {
    const { user } = req.body;  // Usuario enviado en el body
    const imagenAComparar = req.file.buffer;  // Imagen proporcionada por el usuario

    try {
        // 1. Obtener la URL de la foto facial almacenada en la base de datos
        const queryStr = `SELECT FotoClaveFacial FROM Usuario WHERE CorreoUsuario = "${user}"`;
        const result = await query(queryStr);
        
        if (!result || result.length === 0 || !result[0].FotoClaveFacial) {
            return res.status(404).json({ message: 'No se encontró la clave facial del usuario', errorType: 1 });
        }
        
        const fotoClaveFacialUrl = result[0].FotoClaveFacial;  // URL de la foto almacenada

        console.log(fotoClaveFacialUrl)
        // 2. Descargar la imagen de S3 utilizando la URL
        const s3Params = {
            Bucket: "practica2-semi1-b-2s2024-imagenes1-g6",  // El bucket donde está almacenada la imagen
            Key: fotoClaveFacialUrl.replace("https://practica2-semi1-b-2s2024-imagenes1-g6.s3.us-east-2.amazonaws.com/", "") // Obtener el nombre del archivo desde la URL
        };
        
        const fotoAlmacenada = await s3.getObject(s3Params).promise();  // Descargar la imagen desde S3
        const fotoAlmacenadaBuffer = fotoAlmacenada.Body;  // Obtener el buffer de la imagen descargada

        // 3. Comparar las dos imágenes utilizando AWS Rekognition
        const params = {
            SourceImage: {  // Imagen de la base de datos
                Bytes: fotoAlmacenadaBuffer  
            }, 
            TargetImage: {  // Imagen que el usuario sube para comparar
                Bytes: imagenAComparar  
            },
            SimilarityThreshold: 80  // Umbral de similitud del 80%
        };

        rek.compareFaces(params, function(err, data) {
            if (err) {
                console.error('Error en la comparación facial:', err);
                return res.status(500).json({ message: 'Error en la comparación facial', errorType: 2 });
            }

            // 4. Verificar si la similitud es mayor o igual al 80%
            const faceMatches = data.FaceMatches;
            if (faceMatches.length > 0 && faceMatches[0].Similarity >= 80) {
                // Si la comparación es exitosa (mayor o igual a 80%), se loguea al usuario
                res.status(200).json({ message: 'Login exitoso', email: user, errorType: 0 });
            } else {
                // Si la similitud es menor a 80%, el login falla
                res.status(401).json({ message: 'Login fallido', errorType: 3 });
            }
        });
    } catch (error) {
        console.error('Error en el proceso de login facial:', error);
        res.status(500).json({ message: 'Login fallido', errorType: 4 });
    }
});

app.post("/verificarFacial", async (req, res) => {
    const { text } = req.body; //Recibiendo el body que trae solo un correo o nUsuario
    try {
		var consulta = "";
		if(String(text).includes("@")) { //Si viene una @, es un correo
			consulta = `SELECT * FROM Usuario WHERE CorreoUsuario = '${text}';`;
		} else {
			consulta = `SELECT * FROM Usuario WHERE NombreUsuario = '${text}';`;
		}
        const result = await query(consulta);

        if (result[0].FotoClaveFacial === null) { //No esta configurada la imagen para reconocimiento facial
            //Codigo de error 4, reconocimiento facial inactivo
            res.status(200).json({ email: "", foto: "", errortype: 4 });
        } else {
             //Se recupera la imagen en base 64
            const imageUrl = result[0].FotoClaveFacial; //La url de la imagen clave en S3
            const base64Image = await getBase64Image(imageUrl);
            //Retorno de codigo exitoso 3
            res.status(200).json({ email: result[0].CorreoUsuario, foto: base64Image, errortype: 3 });
        }
    } catch (error) {
        console.error('Error al verificar rec. facial:', error);
        res.status(500).json({ message: 'Error al verificar rec. facial', errorType: 4});
    }
});

//imgenFacial
//En este endpoint, se recibe un email, para buscar al usuario en la base de datos y retornar la imagen clave
app.post("/imgenFacial", async (req, res) => {
    const { email } = req.body; 

    try {
        consulta = `SELECT FotoClaveFacial FROM Usuario WHERE CorreoUsuario = '${email}';`;
        const result = await query(consulta);

        if (result[0].FotoClaveFacial === null) { //No esta configurada la imagen para reconocimiento facial
            //Codigo de error 4, reconocimiento facial inactivo
            res.status(200).json({ email: "", foto: "", errortype: 4 });
        } else {
             //Se recupera la imagen en base 64
            const imageUrl = result[0].FotoClaveFacial; //La url de la imagen clave en S3
            const base64Image = await getBase64Image(imageUrl);
            //Retorno de codigo exitoso 3
            res.status(200).json({ email: result[0].CorreoUsuario, foto: base64Image, errortype: 3 });
        }

    } catch (error) {
        console.error('Error al obtener foto clave S3', error);
        res.status(500).send({ message: 'Error al obtener foto clave S3', errorType: 0});
    }
});

app.post("/verificarContraFacial", upload.single('foto'), async (req, res) => {
    const { email, password} = req.body; 

    try {
        consulta = `SELECT * FROM Usuario WHERE CorreoUsuario = '${email}';`;
        const result = await query(consulta);
        const isMatch = await bcrypt.compare(password, result[0].ContraseniaUsuario);

        if (!isMatch) { //ContraIncorrecta
            //Codigo de error 0
            res.status(401).json({ errortype: 0});
        } else {
            //Retorno de codigo exitoso 1
            res.status(200).json({ errortype: 1 });
        }

    } catch (error) {
        console.error('Error al verificar contra', error);
        res.status(500).send({ message: 'Error al verificar contra', errorType: 0});
    }
});


//editarFacial
//Para activar reconocimiento facial, se recibe un email, pass y foto, que activa el reconocimiento
app.post("/editarFacial", upload.single('foto'), async (req, res) => {
    const { email, password } = req.body; 
    if (!req.file) {
        return res.status(400).send({ message: 'Foto no proporcionada' });
    }
    
    try {
        //Verificando contrasena
        var consulta = `SELECT * FROM Usuario WHERE CorreoUsuario = "${String(email)}";`;
        const users = await query(consulta);
        //Se recupera el usuario de la consulta
        const usr = users[0];

        //Comparando contraseña encriptada
        const isMatch = await bcrypt.compare(password, usr.ContraseniaUsuario);
        if (!isMatch) { //Contraseña incorrecta, código de error = 1
            return res.status(401).json({ errortype: 1 });
        }

        const fotoBuffer = req.file.buffer; 
        const fotoNombre = `Fotos_Reconocimiento_Facial/${usr.NombreUsuario}_${Date.now()}.jpg`; //Se le asigna el nombre a la foto con la fecha de subida

        const params = {
            Bucket: "practica2-semi1-b-2s2024-imagenes1-g6", 
            Key: fotoNombre, 
            Body: fotoBuffer,
            ContentType: req.file.mimetype,
            ACL: 'public-read'  
        };

        const uploadResult = await s3.upload(params).promise();
        const url_img = uploadResult.Location; 

        // Actualiza los datos del usuario
        const updateQuery = `UPDATE Usuario SET FotoClaveFacial = ? WHERE NombreUsuario = ?;`;
        //Valores nuevos que van insertados en la query UPDATE, ademas del nombre de usuario a buscar
        const valoresAInsertar = [url_img, usr.NombreUsuario];

        await query(updateQuery, valoresAInsertar, function (err, result) {
        if (err) {
            return res.status(401).json({ errortype: 2 });
        }

        //Codigo de error 0, reconocimiento activado
        return res.status(401).json({ errortype: 0 });
        });

    } catch (error) {
        console.error('Error al activar reconocimiento facial', error);
        res.status(500).send({ message: 'Error al activar reconocimiento facial', errorType: 3});
    }
});


//eliminarFacial
//Para desactivar el reconocimiento facial, se recibe un email, que desactiva el reconocimiento, eliminando la foto del reconocimiento facial
app.post("/eliminarFacial", async (req, res) => {
    const { correo } = req.body; 
    try {
        //Se elimina la URL de reconocimiento facial
        const updateQuery = `UPDATE Usuario SET FotoClaveFacial = NULL WHERE CorreoUsuario = ?;`;
        //Valor a insertar
        const valorCorreo = [correo];

        await query(updateQuery, valorCorreo, function (err, result) {
        if (err) {
            return res.status(401).json({ errortype: 1 });
        }

        //Codigo de error 0, reconocimiento desactivado
        return res.status(401).json({ errortype: 0 });
        });

    } catch (error) {
        console.error('Error al desactivar reconocimiento facial', error);
        res.status(500).send({ message: 'Error al desactivar reconocimiento facial', errorType: 3});
    }
});