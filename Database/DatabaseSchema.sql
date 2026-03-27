CREATE DATABASE RecipeManagementDB;
GO

USE RecipeManagementDB;
GO

-- 1. Create Users Table
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'User',
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 2. Create Recipes Table
CREATE TABLE Recipes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    ImageUrl NVARCHAR(500),
    Category NVARCHAR(50) NOT NULL,
    CookingTime NVARCHAR(50),
    Rating DECIMAL(2,1) DEFAULT 0.0,
    Status NVARCHAR(20) DEFAULT 'published',
    CreatedBy INT FOREIGN KEY REFERENCES Users(Id),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 3. Stored Procedures for Users
-- (unchanged)
GO

-- 4. Stored Procedures for Recipes
CREATE PROCEDURE sp_GetRecipes
AS
BEGIN
    SELECT r.Id, r.Title, r.Description, r.ImageUrl, r.Category, r.CookingTime, r.Rating, r.Status, r.CreatedAt, u.Username AS Author
    FROM Recipes r
    INNER JOIN Users u ON r.CreatedBy = u.Id;
END
GO

CREATE PROCEDURE sp_GetRecipeById
    @Id INT
AS
BEGIN
    SELECT r.Id, r.Title, r.Description, r.ImageUrl, r.Category, r.CookingTime, r.Rating, r.Status, r.CreatedAt, u.Username AS Author
    FROM Recipes r
    INNER JOIN Users u ON r.CreatedBy = u.Id
    WHERE r.Id = @Id;
END
GO

CREATE PROCEDURE sp_CreateRecipe
    @Title NVARCHAR(100),
    @Description NVARCHAR(MAX),
    @ImageUrl NVARCHAR(500),
    @Category NVARCHAR(50),
    @CookingTime NVARCHAR(50),
    @CreatedBy INT
AS
BEGIN
    INSERT INTO Recipes (Title, Description, ImageUrl, Category, CookingTime, CreatedBy)
    VALUES (@Title, @Description, @ImageUrl, @Category, @CookingTime, @CreatedBy);
    SELECT SCOPE_IDENTITY() AS NewRecipeId;
END
GO

CREATE PROCEDURE sp_UpdateRecipe
    @Id INT,
    @Title NVARCHAR(100),
    @Description NVARCHAR(MAX),
    @ImageUrl NVARCHAR(500),
    @Category NVARCHAR(50),
    @CookingTime NVARCHAR(50),
    @Status NVARCHAR(20)
AS
BEGIN
    UPDATE Recipes
    SET Title = @Title,
        Description = @Description,
        ImageUrl = @ImageUrl,
        Category = @Category,
        CookingTime = @CookingTime,
        Status = @Status
    WHERE Id = @Id;
END
GO

CREATE PROCEDURE sp_DeleteRecipe
    @Id INT
AS
BEGIN
    DELETE FROM Recipes WHERE Id = @Id;
END
GO

-- 5. Seed Users (100 users: 2 Admins, 98 Users)
-- Insert specific Admins
INSERT INTO Users (Username, PasswordHash, Role)
VALUES 
('lavanya', 'hashed_pwd_placeholder', 'Admin'),
('pradeep', 'hashed_pwd_placeholder', 'Admin');
GO

-- Insert 48 Regular Users explicitly to reach exactly 50 total
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser1', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser2', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser3', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser4', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser5', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser6', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser7', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser8', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser9', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser10', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser11', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser12', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser13', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser14', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser15', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser16', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser17', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser18', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser19', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser20', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser21', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser22', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser23', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser24', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser25', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser26', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser27', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser28', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser29', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser30', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser31', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser32', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser33', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser34', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser35', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser36', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser37', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser38', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser39', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser40', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser41', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser42', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser43', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser44', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser45', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser46', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser47', 'hashed_pwd_placeholder', 'User');
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('testuser48', 'hashed_pwd_placeholder', 'User');
GO
