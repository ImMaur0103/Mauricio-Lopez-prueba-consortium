-- Crear tabla Persona
CREATE TABLE Persona (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    apellido NVARCHAR(100) NOT NULL,
    cedula NVARCHAR(20) NOT NULL,
    fecha_nacimiento DATE,
    direccion NVARCHAR(255),
    telefono NVARCHAR(20),
    email NVARCHAR(100)
);

-- Crear tabla Rol
CREATE TABLE Rol (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(50) NOT NULL
);

-- Crear tabla PersonaRol
CREATE TABLE PersonaRol (
    id INT IDENTITY(1,1) PRIMARY KEY,
    persona_id INT NOT NULL,
    rol_id INT NOT NULL,
    FOREIGN KEY (persona_id) REFERENCES Persona(id),
    FOREIGN KEY (rol_id) REFERENCES Rol(id)
);

-- Crear tabla auth_user
CREATE TABLE auth_user (
    id INT IDENTITY(1,1) PRIMARY KEY,
    password NVARCHAR(128) NOT NULL,
    last_login DATETIME NULL,
    is_superuser BIT NOT NULL,
    username NVARCHAR(150) NOT NULL,
    first_name NVARCHAR(150) NOT NULL,
    last_name NVARCHAR(150) NOT NULL,
    email NVARCHAR(254) NOT NULL,
    is_staff BIT NOT NULL,
    is_active BIT NOT NULL,
    date_joined DATETIME NOT NULL,
    persona_id INT,
    FOREIGN KEY (persona_id) REFERENCES Persona(id)
);

-- Crear tabla Entidad
CREATE TABLE Entidad (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(255) NOT NULL,
    tipo NVARCHAR(100),
    direccion NVARCHAR(255),
    telefono NVARCHAR(20),
    email NVARCHAR(100)
);

-- Crear tabla Notificacion
CREATE TABLE Notificacion (
    id INT IDENTITY(1,1) PRIMARY KEY,
    fecha_recepcion DATE NOT NULL,
    hora_recepcion TIME NOT NULL,
    entidad_id INT NOT NULL,
    numero_cedula_expediente NVARCHAR(50) NOT NULL,
    dirigido_a NVARCHAR(255) NOT NULL,
    recepcionista_id INT NOT NULL,
    hora_entrega_interna TIME,
    colaborador_entrega_id INT,
    fecha_hora_entrega DATETIME,
    FOREIGN KEY (entidad_id) REFERENCES Entidad(id),
    FOREIGN KEY (recepcionista_id) REFERENCES Persona(id),
    FOREIGN KEY (colaborador_entrega_id) REFERENCES Persona(id)
);