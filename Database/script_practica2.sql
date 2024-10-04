-- Crear la base de datos con nombre mydb
CREATE DATABASE IF NOT EXISTS mydb;

-- Usar la base de datos
USE mydb;

-- Creación de la tabla usuario
CREATE TABLE Usuario (
	IdUsuario INT PRIMARY KEY AUTO_INCREMENT,
	NombreUsuario VARCHAR(100) NOT NULL,
	ContraseniaUsuario VARCHAR(100) NOT NULL,
	CorreoUsuario VARCHAR(100) NOT NULL,
	FotoUsuario VARCHAR(1000) NOT NULL,
	FotoClaveFacial VARCHAR(1000),
	UNIQUE (NombreUsuario),
	UNIQUE (CorreoUsuario)
) ENGINE=InnoDB;

