package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"

	"github.com/rs/cors"
)

type Entrada struct {
	Text string `json:"text"`
}

type Login struct {
	User string `json:"usuario"`
	Pass string `json:"password"`
}

type AddUser struct {
	Nombre string `json:"nombre"`
	Correo string `json:"email"`
	Pass   string `json:"password"`
}

type StatusResponse struct {
	Message string `json:"message"`
	Type    string `json:"type"`
}

type LoginResponse struct {
	Name      string `json:"name"`
	Email     string `json:"email"`
	ErrorType int    `json:"errortype"`
}

type InicioResponse struct {
	Name string `json:"name"`
	Foto string `json:"foto"`
}

type EditDataResponse struct {
	Name     string `json:"name"`
	Password string `json:"password"`
	Foto     string `json:"foto"`
}

func main() {
	http.HandleFunc("/login", login)
	http.HandleFunc("/loginFacial", loginFacial)
	http.HandleFunc("/addUser", addUser)
	http.HandleFunc("/datosInicio", datosInicio)
	http.HandleFunc("/editarDatos", editarDatos)

	// Configurar CORS con opciones predeterminadas
	c := cors.Default()

	// Configurar el manejador HTTP con CORS
	handler := c.Handler(http.DefaultServeMux)

	// Iniciar el servidor en el puerto 8080
	fmt.Println("Servidor escuchando en http://localhost:8080")
	http.ListenAndServe(":8080", handler)
}

func login(w http.ResponseWriter, r *http.Request) {
	fmt.Println("login")
	// Configurar la cabecera de respuesta
	w.Header().Set("Content-Type", "application/json")

	var entrada Login
	if err := json.NewDecoder(r.Body).Decode(&entrada); err != nil {
		http.Error(w, "Error al decodificar JSON", http.StatusBadRequest)
		return
	}

	fmt.Println("User ", entrada.User)
	fmt.Println("Pass ", entrada.Pass)
	//Construir cadena para ejecutar el comando login

	var responder LoginResponse

	if entrada.User == "kevin" {
		if entrada.Pass == "123" {
			//inicia sesion
			responder.Name = "kevin"
			responder.Email = "user@gmail.com"
			responder.ErrorType = 0
		} else {
			//Contraseña incorrecta
			responder.Name = ""
			responder.Email = ""
			responder.ErrorType = 1
		}
	} else {
		//usuario no encontrado
		responder.Name = ""
		responder.Email = ""
		responder.ErrorType = 2
	}

	respuestaJSON, err := json.Marshal(responder)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al serializar datos a JSON: %s", err), http.StatusInternalServerError)
		return
	}
	w.Write(respuestaJSON)
}

func loginFacial(w http.ResponseWriter, r *http.Request) {
	fmt.Println("login")
	// Configurar la cabecera de respuesta
	w.Header().Set("Content-Type", "application/json")

	var entrada Entrada
	if err := json.NewDecoder(r.Body).Decode(&entrada); err != nil {
		http.Error(w, "Error al decodificar JSON", http.StatusBadRequest)
		return
	}

	fmt.Println("User ", entrada.Text)

	//Buscar si existe la foto de reconocimiento facial del usuario (podría ni siquiera existir el usuario)
	var responder LoginResponse
	var busqueda = 4 //El valor indica si encontro la foto y determina si esta activo el reconocimiento facial
	//Para el manejo en el front se mantienen los valores del login por contraseña y se agregan los de reconocimiento facial
	if busqueda == 3 {
		//reconocimiento facial activo
		responder.Name = ""
		responder.Email = ""
		responder.ErrorType = 3
	} else if busqueda == 4 {
		//reconocimiento facial inactivo
		responder.Name = ""
		responder.Email = ""
		responder.ErrorType = 4
	} else {
		//usuario no encontrado
		responder.Name = ""
		responder.Email = ""
		responder.ErrorType = 2
	}

	respuestaJSON, err := json.Marshal(responder)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al serializar datos a JSON: %s", err), http.StatusInternalServerError)
		return
	}
	w.Write(respuestaJSON)
}

func addUser(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Crear usuario")
	// Configurar la cabecera de respuesta
	w.Header().Set("Content-Type", "application/json")

	// Limitar el tamaño del archivo y parsear el formulario
	err := r.ParseMultipartForm(10 << 20) // Limitar el tamaño del archivo a 10MB
	if err != nil {
		http.Error(w, "Error al parsear el formulario", http.StatusBadRequest)
		return
	}

	/* -------------- CAPOS DE UN USUARIO -------------- */
	//nombre, correo, contraseña, foto perfil, foto reconocimiento facial

	// Obtener campos del formulario
	nombre := r.FormValue("nombre")
	correo := r.FormValue("email")
	pass := r.FormValue("password")

	fmt.Println("Nombre ", nombre)
	fmt.Println("Email ", correo)
	fmt.Println("Password ", pass)

	// Obtener el archivo subido
	//file, _, err := r.FormFile("foto")
	file, fileHeader, err := r.FormFile("foto")
	if err != nil {
		http.Error(w, "Error al obtener la imagen", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Obtener el nombre original del archivo
	filename := fileHeader.Filename
	fmt.Println("Nombre del archivo subido:", filename)

	// Asegurarse de que el directorio 'uploads' existe
	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		err = os.Mkdir("uploads", os.ModePerm) // Crear el directorio si no existe
		if err != nil {
			http.Error(w, "Error al crear el directorio de almacenamiento", http.StatusInternalServerError)
			return
		}
	}

	// Guardar el archivo en el directorio uploads
	filepath := filepath.Join("uploads", filename)
	dst, err := os.Create(filepath)
	if err != nil {
		http.Error(w, "Error al crear el archivo en el servidor", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, file) // Copiar el archivo subido al servidor
	if err != nil {
		http.Error(w, "Error al guardar la imagen", http.StatusInternalServerError)
		return
	}

	respuestaJSON, err := json.Marshal(1) //1 significa que si se creo el usuario sin errores
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al serializar datos a JSON: %s", err), http.StatusInternalServerError)
		return
	}
	w.Write(respuestaJSON)
}

func datosInicio(w http.ResponseWriter, r *http.Request) {
	fmt.Println("datos ventana inicio del usuario")
	// Configurar la cabecera de respuesta
	w.Header().Set("Content-Type", "application/json")

	var entrada string
	if err := json.NewDecoder(r.Body).Decode(&entrada); err != nil {
		http.Error(w, "Error al decodificar JSON", http.StatusBadRequest)
		return
	}
	fmt.Println("Usuario actual ", entrada)

	//Flujo para enviar la foto
	filePath := "uploads/IMG_20210206_182826.jpg"
	// Abrir el archivo
	file, err := os.Open(filePath)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al abrir el archivo: %s", err), http.StatusInternalServerError)
		return
	}
	defer file.Close()

	// Leer el archivo
	imageData, err := ioutil.ReadAll(file)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al leer el archivo: %s", err), http.StatusInternalServerError)
		return
	}

	// Codificar la imagen a base64
	imageBase64 := base64.StdEncoding.EncodeToString(imageData)

	// Crear el objeto de respuesta
	respuesta := InicioResponse{
		Name: "Kevin Samayoa",
		//Email: "user@gmail.com",
		Foto: imageBase64,
	}
	respuestaJSON, err := json.Marshal(respuesta)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al serializar datos a JSON: %s", err), http.StatusInternalServerError)
		return
	}
	w.Write(respuestaJSON)
}

func editarDatos(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ventana editar datos del usuario")
	// Configurar la cabecera de respuesta
	w.Header().Set("Content-Type", "application/json")

	var entrada string
	if err := json.NewDecoder(r.Body).Decode(&entrada); err != nil {
		http.Error(w, "Error al decodificar JSON", http.StatusBadRequest)
		return
	}
	fmt.Println("Usuario actual ", entrada)

	//Flujo para enviar la foto
	filePath := "uploads/IMG_20210206_182826.jpg"
	// Abrir el archivo
	file, err := os.Open(filePath)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al abrir el archivo: %s", err), http.StatusInternalServerError)
		return
	}
	defer file.Close()

	// Leer el archivo
	imageData, err := ioutil.ReadAll(file)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al leer el archivo: %s", err), http.StatusInternalServerError)
		return
	}

	// Codificar la imagen a base64
	imageBase64 := base64.StdEncoding.EncodeToString(imageData)

	// Crear el objeto de respuesta
	respuesta := EditDataResponse{
		Name:     "Kevin Samayoa",
		Password: "123",
		Foto:     imageBase64,
	}
	respuestaJSON, err := json.Marshal(respuesta)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al serializar datos a JSON: %s", err), http.StatusInternalServerError)
		return
	}
	w.Write(respuestaJSON)
}
