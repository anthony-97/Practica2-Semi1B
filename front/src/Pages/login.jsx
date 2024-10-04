import React from 'react';
import { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';

import "../StyleSheets/login.css"
import user from '../Icons/profile.png';
import key from '../Icons/key.png';
import logo from '../Icons/Logo.png';

export default function Login(){
    
    const navigate = useNavigate(); 
    const [estado, setEstado] = useState(null); // Inicializa el estado en null
    const unameRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault()
  
        const user = e.target.uname.value
        const pass = e.target.psw.value
  
        console.log("user ", user, " pass ", pass)

        const data = {
            Usuario: user,
            Password: pass,
        };
		
        fetch(`http://localhost:9000/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(Response => Response.json())
        .then(rawData => {
            console.log("retorno ",rawData)
            //console.log(rawData.nickname)
            //console.log(rawData.type)
            //console.log(rawData.errortype)
           
            //const nombre = rawData.name
            const email = rawData.email
            const errortype = rawData.errortype
            console.log("El errortype es" , errortype);
            setEstado(errortype);
            if (errortype === 0){
                navigate(`/Inicio/${email}`);
            }
        })
    }

    const facial = (e) =>{
        //Validar con require nativo que el campo esta lleno
        if (unameRef.current.reportValidity()) {
            const valor = unameRef.current.value
            //Se envía solo el nombre de usuario/correo
            const data = {
                text: valor
            };

            fetch(`http://localhost:9000/verificarFacial`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
            .then(Response => Response.json())
            .then(rawData => {
                //console.log("retorno ",rawData)
                const email = rawData.email
                const errortype = rawData.errortype
                setEstado(errortype);
                if (errortype === 3){
                    console.log("ir a ventana reconocimiento facial")
                    navigate(`/RecFacial/${email}`);
                } else {
                    alert("Reconocimiento facial no activado");
                }
            })
        }        
    }

    const crearUsuario = (e) =>{
        navigate(`/AddUser`)
    }

    return(
        <>
            <div className="container">
                <div className="d-flex justify-content-center">
                    <div className="card ">
                        <div className="card-header">
                            <div className="d-flex justify-content-center">
                                <h3>PhotoBucket&nbsp;</h3>
                                <img src={logo} alt="logo" style={{width: '8%', height: '8%'}} />
                            </div>
                            <h3>Inicio de Sesión</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="input-group form-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text" style={{padding: '0', marginRight:'10px'}}>
                                            <img src={user} alt="user" style={{width: '100%', height: '100%'}} />
                                        </span>
                                    </div>
                                    {/* ref={unameRef} es para mantener la funcionalidad de required y el valor (contendio) del input fuera del form*/}
                                    <input type="text" className="form-control" placeholder="Nombre de usuario o Correo electronico" ref={unameRef} name="uname" required/>
                                </div>
                                
                                <div>&nbsp;&nbsp;&nbsp;</div>
                                
                                <div className="input-group form-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text" style={{padding: '0', marginRight:'10px'}}>
                                            <img src={key} alt="user" style={{width: '100%', height: '100%'}} />
                                        </span>
                                    </div>
                                    <input type="password" className="form-control" placeholder="Contraseña" name="psw" required/>
                                </div>

                                <div>&nbsp;&nbsp;&nbsp;</div>
                                
                                <div style={{textAlign:'center'}}>
                                    <button type="submit" className="btn btn-primary login_btn">Iniciar Sesion</button> 
                                </div>
                            </form>

                            <div>&nbsp;&nbsp;&nbsp;</div>
                            <div style={{textAlign:'center'}}>
                                <button type="submit" className="btn btn-primary facial_login_btn" onClick={facial}>Utilizar reconocimiento facial</button>
                            </div>

                            <div>&nbsp;</div>
                            <div className="card-footer">
                                <div className="d-flex justify-content-center links">
                                    <div className='newUser'>¿No tienes una cuenta? </div>
                                    <div>&nbsp;&nbsp;&nbsp;</div>
                                    <div className="newUserPage" onClick={crearUsuario} style={{cursor: 'pointer'}}>Registrate aqui</div>
                                </div>
                            </div>
                            
                            <div className='estadoLogin'>
                                {estado === 1 ? (
                                    <div>Contraseña incorrecta</div>
                                ):estado === 2 ?(
                                    <div>No se encontro el usuario</div>
                                ):estado === 4 ?(
                                    <div>Reconocimiento facial inactivo. Puede habilitarlo en configuracion de la cuenta</div>
                                ):(
                                    <div></div>
                                )}
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}