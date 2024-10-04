import React from 'react';
import { useNavigate } from 'react-router-dom';

import "../StyleSheets/addUser.css";
import userDefault from '../Icons/usuario.png';

export default function AddUser(){
    
    const navigate = useNavigate()
    const [preview, setPreview] = React.useState(null);

    //vista previa de la foto
    const handleChange = (e) => {
        const { files } = e.target;

        if (files.length > 0) {
            setPreview(URL.createObjectURL(files[0])); // Generar una vista previa de la imagen
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault()
  
        const nombre = e.target.nombres.value
        const correo = e.target.email.value
        const pass = e.target.psw.value
        const passconfirm = e.target.pswconfirm.value
        const foto = e.target.foto.files[0]
  
        console.log("Nombres ", nombre, " Correo ", correo, " pass ", pass, " passConf ", passconfirm)
        
       const formData = new FormData();

		formData.append('nombre', nombre);
		formData.append('email', correo);
		formData.append('password', pass);
		formData.append('foto', foto);

        if (pass === passconfirm){
            fetch(`http://localhost:9000/addUser`, {
                method: 'POST',
                body: formData
            })
            .then(Response => Response.json())
            .then(rawData => {
                console.log(rawData)

                if (rawData.errortype === 1) {
                    alert("usuario agregado exitosamente")
                    navigate(`/login`)
                } else {
                    alert("Error: Usuario no creado")
                }
            })
        } else {
            alert("Contraseñas no coinciden")
        }
    }

    return(
        <>
            <div className="container">
                <div className="d-flex justify-content-center">
                    <div className="explorer-card">
                        
                        <div className="explorer-card-header">
                            &nbsp;
                            <h3>PhotoBucket - Registro de Usuario</h3>
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
                                        {<img src={preview || userDefault} alt="Vista previa" style={{width: '100px', height: '100px'}} />}
                                        <div>&nbsp;</div>
                                        <div className="custom-file">
                                            &nbsp;&nbsp;&nbsp;
                                            <input type="file" className="custom-file-input" name="foto" onChange={handleChange} accept="image/*" required/>
                                        </div>
                                    </div>

                                    {/* Segunda columna: nombre, correo, contraseñas */}
                                    <div className='col-md-6'>
                                        <div className='datos'>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            Nombre de Usuario
                                        </div>
                                        <div className="input-group form-group">
                                            <div>&nbsp;&nbsp;&nbsp;</div>
                                            <input type="text" className="form-control" placeholder="Ingrese su nombre de usuario" name="nombres" required/>
                                            <div>&nbsp;&nbsp;&nbsp;</div>
                                        </div>
                                        <div>&nbsp;&nbsp;&nbsp;</div>

                                        <div className='datos'>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            Correo electronico
                                        </div>
                                        <div className="input-group form-group">
                                            <div>&nbsp;&nbsp;&nbsp;</div>
                                            <input type="email" className="form-control" placeholder="Ingrese su correo electronico" name="email" required/>
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

                                        <div className='datos'>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            Confirmar Contraseña
                                        </div>
                                        <div className="input-group form-group">
                                            <div>&nbsp;&nbsp;&nbsp;</div>
                                            <input type="password" className="form-control" placeholder="Confirme su contraseña" name="pswconfirm" required/>
                                            <div>&nbsp;&nbsp;&nbsp;</div>
                                        </div>
                                        <div>&nbsp;&nbsp;&nbsp;</div>
                                    </div> 
                                </div> 

                                <div style={{textAlign:'center'}}>
                                    <button type="submit" className="btn btn-primary crear_btn">Registrarse</button>
                                </div>
                            </form>
                        </div>
                    
                    </div>
                </div>
            </div>
        </>
    )
}