import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import "../StyleSheets/inicio.css";
import userDefault from '../Icons/usuario.png';

export default function Inicio(){
    
    const { email } = useParams();
    const navigate = useNavigate();
    const [preview, setPreview] = useState({name: '', foto: ''});

    //Cargar datos con el componente
    useEffect(()=>{
        fetch(`http://localhost:9000/datosInicio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ email })
        })
        .then(Response => Response.json())
        .then(rawData => {
            console.log("Datos del usuario ",rawData); setPreview(rawData);})
    }, [email]);
    //lo dejo fuera porque react hace la peticion dos veces, de esta manera se optimiza que haga la conversion con los datos finales
    const fotoBase64 = preview.foto ? `data:image/jpeg;base64,${preview.foto}` : '';

    //Metodos de los botones
    const config  = () =>{
        navigate(`/CuentaConfig/${email}`);
    }

    const cerrarSesion  = () =>{
        navigate(`/Login`);
    }

    return(
        <>
            <div className="container-inicio">
                <div className="d-flex justify-content-center">
                    <div className="inicio-card">
                        <div className="inicio-card-header">
                            &nbsp;
                            <h3>PhotoBucket</h3>
                            &nbsp;
                        </div>
                        <div className="card-body">
                            <div className='row'>
                                {/* Datos */}
                                <div className="col-md-6 d-flex flex-column align-items-center">
                                    {<img src={fotoBase64 || userDefault} alt="Foto perfil usuario" style={{width: '100px', height: '125px'}} />}
                                    &nbsp;
                                    <div className='info'>
                                        <div className='datos'>
                                            Nombre de usuario: {preview.name}
                                        </div>
                                        <div className='datos'>
                                            Correo electrónico: {email}
                                        </div>
                                    </div>
                                </div>
                                {/* botones */}
                                <div className="col-md-6 button-container">
                                    <button type="submit" className="btn btn-primary usuario_btn" onClick={config}>Configuración de la cuenta</button>
                                    <button type="submit" className="btn btn-primary usuario_btn">Ver Álbumes</button>
                                    <button type="submit" className="btn btn-primary usuario_btn">Editar Álbumes</button>
                                    <button type="submit" className="btn btn-primary usuario_btn">Subir Imagen</button>
                                    <button type="submit" className="btn btn-primary usuario_btn">Extraer Texto</button>
                                    <button type="submit" className="btn btn-primary usuario_btn" onClick={cerrarSesion}>Cerrar Sesión</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}