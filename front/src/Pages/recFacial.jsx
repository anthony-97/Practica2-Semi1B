import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import "../StyleSheets/addUser.css";

export default function RecFacial() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [photo, setPhoto] = useState(null);
    const { email } = useParams();


    // Acceder a la cámara web
    const handleStartCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                videoRef.current.srcObject = stream;
            })
            .catch((error) => {
                console.error("Error al acceder a la cámara: ", error);
            });
    };

    // Capturar la foto desde la cámara web
    const handleCapture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            setPhoto(blob);
        });
    };

    // Enviar la foto al backend
    const handleSubmit = (e) => {
        e.preventDefault();

        if (photo) {
            const formData = new FormData();
            formData.append('user', email);
            formData.append('foto', photo, 'captura.jpg'); // Enviar la foto como archivo con un nombre de archivo definido

            fetch(`http://localhost:9000/loginFacial`, {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(rawData => {
                    console.log(rawData);
                    const email = rawData.email
                    if (rawData.errorType === 0) {
                        alert("Acceso permitido");
                        navigate(`/Inicio/${email}`);
                    } else {
                        alert("Acceso denegado");
                    }
                })
                .catch((error) => {
                    console.error("Error en la petición: ", error);
                });
        } else {
            alert("Primero captura una foto");
        }
    };

    return (
        <>
            <div className="container">
                <div className="d-flex justify-content-center">
                    <div className="explorer-card">
                        <div className="explorer-card-header">
                            <h3>PhotoBucket - Captura de Foto</h3>
                        </div>

                        <div className="card-body">
                            <div className="d-flex flex-column align-items-center">
                                {/* Video para previsualizar la cámara */}
                                <video ref={videoRef} autoPlay style={{ width: '300px', height: '300px' }}></video>
                                <div>&nbsp;</div>

                                {/* Botón para iniciar la cámara */}
                                <button className="btn btn-secondary" onClick={handleStartCamera}>
                                    Iniciar Cámara
                                </button>
                                <div>&nbsp;</div>

                                {/* Botón para capturar la foto */}
                                <button className="btn btn-primary" onClick={handleCapture}>
                                    Capturar Foto
                                </button>
                                <div>&nbsp;</div>

                                {/* Mostrar la foto capturada */}
                                {photo && <img src={URL.createObjectURL(photo)} alt="Foto capturada" style={{ width: '100px', height: '100px' }} />}
                                <div>&nbsp;</div>

                                {/* Botón para enviar la foto */}
                                <form onSubmit={handleSubmit}>
                                    <button type="submit" className="btn btn-success">Enviar Foto</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}