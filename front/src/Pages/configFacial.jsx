import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import userDefault from '../Icons/usuario.png';

export default function ConfigFacial(){

    const navigate = useNavigate();
    const { email } = useParams();
    const [preview, setPreview] = useState({password: '', foto: ''});
    const [previewFoto, setPreviewFoto] = useState(null);
    const [contraCorrecta, setConfirmacion] = useState(1);
    // Definir el estado inicial del checkbox
    const [isChecked, setIsChecked] = useState(false);

    useEffect(()=>{
        fetch(`http://localhost:9000/imgenFacial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ email })
        })
        .then(Response => Response.json())
        .then(rawData => {
            //console.log("Datos del usuario ",rawData); 
            setPreview(rawData);
            if (rawData.foto !== ""){
                //console.log("estado check ", isChecked)
                setIsChecked(true)
            }
        })
    }, [email]);
    //lo dejo fuera porque react hace la peticion dos veces, de esta manera se optimiza que haga la conversion con los datos finales
    const fotoBase64 = preview.foto ? `data:image/jpeg;base64,${preview.foto}` : '';

    const handleChangeFoto = (e) => {
        const { files } = e.target;
        if (files.length > 0) {
            setPreviewFoto(URL.createObjectURL(files[0])); // Generar una vista previa de la imagen
        } else {
            setPreviewFoto(null)
        }
    };
    
    const handleChangeCheck = (event) => {
        setIsChecked(event.target.checked);
    };

    const handleSubmit = (e) => {
        e.preventDefault()
  
        const correo = email
        const pass = e.target.psw.value
        const foto = e.target.foto.files[0]        
        
        const formData = new FormData();
		formData.append('email', correo);
        formData.append('password', pass);
		formData.append('foto', foto);

        fetch(`http://localhost:9000/verificarContraFacial`, {
            method: 'POST',
            body: formData
        })
        .then(Response => Response.json())
        .then(rawData => {
            console.log(rawData)
            setConfirmacion(rawData.errorType)
        })

        if (contraCorrecta === 1){
            if (isChecked){
                fetch(`http://localhost:9000/editarfacial`, {
                    method: 'POST',
                    body: formData
                })
                .then(Response => Response.json())
                .then(rawData => {
                    console.log(rawData)
                    if (rawData.errortype === 0) {
                        alert("Reconocimiento activado")
                        navigate(`/CuentaConfig/${email}`);
                    } else {
                        alert("Error: No se pudo guardar la imagen")
                    }
                })
            }else{
                
                fetch(`http://localhost:9000/eliminarFacial`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({ correo })
                })
                .then(Response => Response.json())
                .then(rawData => {
                    console.log(rawData)
                    if (rawData.errortype === 0) {
                        alert("Reconocimiento Desactivado")
                        navigate(`/CuentaConfig/${email}`);
                    } else {
                        alert("Error: No se pudo eliminar la imagen")
                    }
                })
            }
            
        } else {
            alert("Contraseña incorrecta")
        }
    }

    const regresar  = () =>{
        navigate(`/CuentaConfig/${email}`);
    }

    return(
        <>
            <div className="container-edit">
                <div className="d-flex justify-content-center">
                    <div className="edit-card">
                        
                        <div className="explorer-card-header">
                            &nbsp;
                            <h3>PhotoBucket - Reconocimiento facial</h3>
                            &nbsp;
                        </div>

                        <div className="card-body">
                            <form onSubmit={handleSubmit}>

                                <div className='row'>
                                    {/* Primera columna: foto y vista previa */}
                                    <div className="col-md-6 d-flex flex-column align-items-center">
                                        <div className='datos'>
                                            Foto clave actual
                                        </div>
                                        <div>&nbsp;</div>
                                        {<img src={previewFoto || fotoBase64 || userDefault } alt="Vista previa" style={{width: '100px', height: '100px'}} />}
                                        <div>&nbsp;</div>
                                        <div className="custom-file">
                                            &nbsp;&nbsp;&nbsp;
                                            {isChecked ? (
                                                <input type="file" className="custom-file-input" name="foto" onChange={handleChangeFoto} accept="image/*" required/>
                                            ):(
                                                <input type="file" className="custom-file-input" name="foto" onChange={handleChangeFoto} accept="image/*"/>
                                            )}
                                        </div>
                                    </div>

                                    {/* Segunda columna: estado, contraseñas */}
                                    <div className="col-md-6 data-container">
                                        <label className="form-check-label datos" htmlFor="flexSwitchCheckDefault">Uso de reconocimiento facial para autenticarse</label>
                                        <div className="form-check form-switch datos">
                                            <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" checked={isChecked} onChange={handleChangeCheck}/>
                                        </div>
                                        <div>&nbsp;&nbsp;&nbsp;</div>
                                        <div className='datos'>
                                            Contraseña
                                        </div>
                                         <div className="input-group form-group">
                                            <div></div>
                                            <input type="password" className="form-control" placeholder="Ingrese su Contraseña" name="psw" required/>
                                            <div>&nbsp;&nbsp;&nbsp;</div>
                                        </div>
                                    </div> 
                                </div> 

                                <div>&nbsp;&nbsp;&nbsp;</div>
                                <div>&nbsp;&nbsp;&nbsp;</div>
                                <div style={{textAlign:'center'}}>
                                    <button type="submit" className="btn btn-primary guardar_edit_btn">Guardar cambios</button>
                                    &nbsp;&nbsp;&nbsp;
                                    <button type="button" className="btn btn-primary cancelar_edit_btn" onClick={regresar}>Cancelar</button>        
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}