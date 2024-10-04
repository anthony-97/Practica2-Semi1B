import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import "../StyleSheets/editUser.css";
//import userDefault from '../Icons/usuario.png';

export default function EditUser(){
    
    const { email } = useParams();
    const navigate = useNavigate()
    const [preview, setPreview] = useState({name: '', password: '', foto: ''});
    const [previewFoto, setPreviewFoto] = useState(null);

    //Cargar datos con el componente
    useEffect(()=>{
        fetch(`http://localhost:9000/editarDatos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ email })
        })
        .then(Response => Response.json())
        .then(rawData => {console.log("Datos del usuario ",rawData); setPreview(rawData);})
    }, [email]);
    //lo dejo fuera porque react hace la peticion dos veces, de esta manera se optimiza que haga la conversion con los datos finales
    const fotoBase64 = preview.foto ? `data:image/jpeg;base64,${preview.foto}` : '';

    //vista previa de la foto
    const handleChange = (e) => {
        const { files } = e.target;
        if (files.length > 0) {
            setPreviewFoto(URL.createObjectURL(files[0])); // Generar una vista previa de la imagen
        }else{
            setPreviewFoto(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault()
  
        const nombre = e.target.nombres.value
        const correo = e.target.email.value
        const pass = e.target.psw.value
        const foto = e.target.foto.files[0]
        const nombreUsuario = preview.name //Nombre del usuario, que se envia al backend para saber cual registro se va a editar
  
        console.log("Nombres ", nombre, " Correo ", correo, " pass ", pass)
        
       const formData = new FormData();

		formData.append('nombre', nombre);
		formData.append('email', correo);
		formData.append('password', pass);
		formData.append('foto', foto);
        formData.append('nombre_usuario', nombreUsuario);

        if (pass){
            fetch(`http://localhost:9000/actualizarDatos`, {
                method: 'POST',
                body: formData
            })
            .then(Response => Response.json())
            .then(rawData => {
                console.log(rawData)

                if (rawData.errorType === 1) {
                    alert("Datos actualizados exitosamente")
                    navigate(`/Inicio/${email}`)
                } else {
                    alert("Error: No se pudo actualizar")
                }
            })
        } else {
            alert("Contraseñas no coinciden")
        }
    }

    return(
        <>
            <div className="container-edit">
                <div className="d-flex justify-content-center">
                    <div className="explorer-card">
                        
                        <div className="explorer-card-header">
                            &nbsp;
                            <h3>PhotoBucket - Información personal</h3>
                            &nbsp;
                        </div>

                        <div className="card-body">
                            <form onSubmit={handleSubmit}>

                                <div className='row'>
                                    {/* Primera columna: foto y vista previa */}
                                    <div className="col-md-6 d-flex flex-column align-items-center">
                                        <div className='datos'>
                                            Foto de perfil
                                        </div>
                                        <div>&nbsp;</div>
                                        {<img src={previewFoto || fotoBase64 } alt="Vista previa" style={{width: '100px', height: '100px'}} />}
                                        <div>&nbsp;</div>
                                        <div className="custom-file">
                                            &nbsp;&nbsp;&nbsp;
                                            <input type="file" className="custom-file-input" name="foto" onChange={handleChange} accept="image/*"/>
                                        </div>
                                    </div>

                                    {/* Segunda columna: nombre, correo, contraseñas */}
                                    <div className="col-md-6 data-container">
                                        <div className='datos'>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            Nombre de Usuario
                                        </div>
                                        <div className="input-group form-group">
                                            <div>&nbsp;&nbsp;&nbsp;</div>
                                            <input type="text" className="form-control" placeholder="Ingrese su nombre de usuario" name="nombres" defaultValue = {preview.name} required/>
                                            <div>&nbsp;&nbsp;&nbsp;</div>
                                        </div>
                                        <div>&nbsp;</div>

                                        <div className='datos'>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            Correo electronico
                                        </div>
                                        <div className="input-group form-group">
                                            <div>&nbsp;&nbsp;&nbsp;</div>
                                            <input type="email" className="form-control" placeholder="Ingrese su correo electronico" name="email" defaultValue = {email} required/>
                                            <div>&nbsp;&nbsp;&nbsp;</div>
                                        </div>
                                        <div>&nbsp;&nbsp;&nbsp;</div>

                                        <div className='datos'>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            Contraseña
                                        </div>
                                         <div className="input-group form-group">
                                            <div>&nbsp;&nbsp;&nbsp;</div>
                                            <input type="password" className="form-control" placeholder="Ingrese su Contraseña" name="psw" required/>
                                            <div>&nbsp;&nbsp;&nbsp;</div>
                                        </div>
                                        <div>&nbsp;&nbsp;&nbsp;</div>

                                    </div> 
                                </div> 

                                <div style={{textAlign:'center'}}>
                                    <button type="submit" className="btn btn-primary guardar_edit_btn">Guardar cambios</button>
                                    &nbsp;&nbsp;&nbsp;
                                    <button type="submit" className="btn btn-primary cancelar_edit_btn">Cancelar</button>
                                </div>
                            </form>
                        </div>
                    
                    </div>
                </div>
            </div>
        </>
    )
}