-- Crear base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AuthDB')
BEGIN
    CREATE DATABASE AuthDB;
END
GO

USE AuthDB;
GO

-- Tabla Roles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(50) NOT NULL
    );
END
GO

-- Tabla Users
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        RoleId INT NOT NULL,
        CONSTRAINT UQ_Users_Email UNIQUE (Email),
        CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id)
    );
END
GO

-- Tabla RefreshTokens
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RefreshTokens')
BEGIN
    CREATE TABLE RefreshTokens (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Token NVARCHAR(MAX) NOT NULL,
        IsRevoked BIT NOT NULL DEFAULT 0,
        ExpiresAt DATETIME2 NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UserId INT NOT NULL,
        CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
    );
END
GO

-- Tabla __EFMigrationsHistory
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '__EFMigrationsHistory')
BEGIN
    CREATE TABLE __EFMigrationsHistory (
        MigrationId NVARCHAR(150) NOT NULL PRIMARY KEY,
        ProductVersion NVARCHAR(32) NOT NULL
    );
END
GO

-- Seed de roles
IF NOT EXISTS (SELECT * FROM Roles)
BEGIN
    SET IDENTITY_INSERT Roles ON;
    INSERT INTO Roles (Id, Name) VALUES (1, 'Admin'), (2, 'Worker'), (3, 'Customer');
    SET IDENTITY_INSERT Roles OFF;
END
GO

-- Seed de migraciones
IF NOT EXISTS (SELECT * FROM __EFMigrationsHistory)
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    VALUES 
        ('20260319085530_InitialCreate', '10.0.0'),
        ('20260504065127_UpdateRoles', '10.0.0');
END
GO

-- Seed de usuarios
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'chispita@gmail.com')
BEGIN
    SET IDENTITY_INSERT Users ON;
    INSERT INTO Users (Id, Name, Email, PasswordHash, IsActive, CreatedAt, RoleId) VALUES
    (1, 'Juan Admin', 'juan@gmail.com', '$2a$11$mEG/YxvpWVE7wu7WR0zj9OCpEq6cpaDCAc1rY2XhsJNZz0HfljyjG', 1, '2026-03-19 09:24:58.535', 2),
    (3, 'Jenni', 'jenni@gmail.com', '$2a$11$.bvs5rcAjtsv4BPKVXmAPeWDEEivitBPg0qGEOvDwfIpB77MyW0Ey', 1, '2026-03-20 07:09:07.490', 2),
    (260, 'Paulina Avila', 'paulinam@gmail.com', '$2a$11$tqT9wZFdqWO0BHyhhpIwj.FWEtcWHkJrY4B0jQrdOdWvT1z2gEoN6', 1, '2026-05-10 07:00:26.957', 3),
    (261, 'Perla Avila', 'chispita@gmail.com', '$2a$11$KjMF7JiwouqRu6ZRjYqVceSc8KR1EkHcweqjDbQ8TY7InpTvfAbAq', 1, '2026-05-12 00:25:05.924', 1),
    (262, 'Gloria Q', 'gloria@gmail.com', '$2a$11$wpfQJ4CuiJmIA2zQaga8S.cZNFvwWmGReoy7k2PHS2JZ34ydPqOzW', 1, '2026-05-12 00:32:44.988', 2),
    (263, 'Walter Villalobos', 'walter@gmail.com', '$2a$11$oOtirPY.aXpYNb.HUmsNSekZPznVfdp0p8WfAeDMQXnH/NKnr/M8.', 1, '2026-05-12 00:36:14.931', 2);
    SET IDENTITY_INSERT Users OFF;
END
GO