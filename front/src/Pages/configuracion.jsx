import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import "../StyleSheets/configuracion.css";

export default function CuentaConfig(){

    const navigate = useNavigate();
    const { email } = useParams();

    //este es un metodo de un boton
    const editar  = () =>{
        navigate(`/EditUser/${email}`);
    }

    const facial  = () =>{
        navigate(`/ConfigFacial/${email}`);
    }
    
    //este es de otro boton 
    const regresar  = () =>{
        navigate(`/Inicio/${email}`);
    }

    return(
        <>
            <div className="container-config">
                <div className="d-flex justify-content-center">
                    <div className="config-card">
                        <div className="config-card-header">
                            &nbsp;
                            <h3>PhotoBucket - Configuracion de la Cuenta</h3>
                            &nbsp;
                        </div>
                        <div className="card-body">
                            <div className="button-container">
                                <button type="submit" className="btn btn-primary cuenta_config_btn" onClick={editar}>Editar informacion personal</button>
                                <button type="submit" className="btn btn-primary cuenta_config_btn" onClick={facial}>Configurar reconocimiento facial</button>
                                <button type="submit" className="btn btn-primary cuenta_config_btn">Eliminar cuenta</button>
                                <button type="submit" className="btn btn-primary cuenta_config_btn" onClick={regresar}>Regresar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}