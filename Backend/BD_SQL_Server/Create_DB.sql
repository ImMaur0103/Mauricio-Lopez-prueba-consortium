USE master;
GO

CREATE DATABASE Notificaciones ON
(NAME = Notificaciones_dat,
    FILENAME = 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\notificacionesdat.mdf',
    SIZE = 10MB,
    MAXSIZE = 50MB,
    FILEGROWTH = 5MB)
LOG ON
(NAME = Notificaciones_log,
    FILENAME = 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\notificacioneslog.ldf',
    SIZE = 5MB,
    MAXSIZE = 25MB,
    FILEGROWTH = 5MB);
GO

USE master;
GO

CREATE LOGIN django_user WITH PASSWORD = 'Contraseña';
GO

USE Notificaciones;
GO

CREATE USER django_user FOR LOGIN django_user;
GO

-- por ser una prueba y tomamos esto como ambiente de desarrollo le damos el rango mas amplio de permisos
EXEC sp_addrolemember 'db_owner', 'django_user';

