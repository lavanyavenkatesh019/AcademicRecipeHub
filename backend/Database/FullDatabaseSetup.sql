/*
===============================================================================
AcademicRecipeHub - Full Database Setup Script (Hosting Optimized)
===============================================================================
Description: This script sets up the entire database schema, stored procedures, 
             and initial seed data for the AcademicRecipeHub project.
             
Instructions:
1. Ensure your database is already created in the hosting panel.
2. Select your database and run this script.
===============================================================================
*/

-- ============================================================================
-- 1. TABLE CREATION
-- ============================================================================

-- Users Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        Role NVARCHAR(20) NOT NULL DEFAULT 'User',
        ProfilePicture NVARCHAR(MAX) NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- Categories Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(100) UNIQUE NOT NULL
    );
END
GO

-- Recipes Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Recipes')
BEGIN
    CREATE TABLE Recipes (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(100) NOT NULL,
        Description NVARCHAR(MAX) NOT NULL,
        ImageUrl NVARCHAR(MAX),
        Category NVARCHAR(50) NOT NULL DEFAULT 'Veg',
        CookingTime NVARCHAR(50),
        Level NVARCHAR(20) DEFAULT 'Medium',
        Rating DECIMAL(2,1) DEFAULT 0.0,
        Status NVARCHAR(20) DEFAULT 'published',
        Ingredients NVARCHAR(MAX),
        Instructions NVARCHAR(MAX),
        [Views] INT DEFAULT 0,
        CreatedBy INT FOREIGN KEY REFERENCES Users(Id),
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- UserLikes Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserLikes')
BEGIN
    CREATE TABLE UserLikes (
        UserId INT FOREIGN KEY REFERENCES Users(Id),
        RecipeId INT FOREIGN KEY REFERENCES Recipes(Id),
        CreatedAt DATETIME DEFAULT GETDATE(),
        PRIMARY KEY (UserId, RecipeId)
    );
END
GO

-- UserSaved Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserSaved')
BEGIN
    CREATE TABLE UserSaved (
        UserId INT FOREIGN KEY REFERENCES Users(Id),
        RecipeId INT FOREIGN KEY REFERENCES Recipes(Id),
        CreatedAt DATETIME DEFAULT GETDATE(),
        PRIMARY KEY (UserId, RecipeId)
    );
END
GO

-- Ratings Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Ratings')
BEGIN
    CREATE TABLE Ratings (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT FOREIGN KEY REFERENCES Users(Id),
        RecipeId INT FOREIGN KEY REFERENCES Recipes(Id),
        RatingValue DECIMAL(2,1) NOT NULL CHECK (RatingValue BETWEEN 1.0 AND 5.0),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UNIQUE(UserId, RecipeId)
    );
END
GO

-- Reports Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reports')
BEGIN
    CREATE TABLE Reports (
        Id INT PRIMARY KEY IDENTITY(1,1),
        RecipeId INT NOT NULL,
        UserId INT NOT NULL,
        Reason NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX),
        Status NVARCHAR(50) DEFAULT 'Pending',
        AdminAction NVARCHAR(50) DEFAULT 'None',
        CreatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (RecipeId) REFERENCES Recipes(Id),
        FOREIGN KEY (UserId) REFERENCES Users(Id)
    );
END
GO

-- ============================================================================
-- 3. STORED PROCEDURES
-- ============================================================================

-- USER PROCEDURES
-------------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE sp_CreateUser
    @Username NVARCHAR(50),
    @PasswordHash NVARCHAR(255),
    @Role NVARCHAR(20)
AS
BEGIN
    INSERT INTO Users (Username, PasswordHash, Role)
    VALUES (@Username, @PasswordHash, @Role);
    SELECT SCOPE_IDENTITY() AS NewUserId;
END
GO

CREATE OR ALTER PROCEDURE sp_GetUserByUsername
    @Username NVARCHAR(50)
AS
BEGIN
    SELECT Id, Username, PasswordHash, Role, ProfilePicture, CreatedAt
    FROM Users
    WHERE Username = @Username;
END
GO

CREATE OR ALTER PROCEDURE sp_GetUserById
    @Id INT
AS
BEGIN
    SELECT Id, Username, PasswordHash, Role, ProfilePicture, CreatedAt
    FROM Users
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_GetUsers
AS
BEGIN
    SELECT Id, Username, Role, ProfilePicture, CreatedAt
    FROM Users;
END
GO

CREATE OR ALTER PROCEDURE sp_GetAllUsers
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Username, Role, CreatedAt
    FROM Users
    ORDER BY CreatedAt DESC;
END;
GO

CREATE OR ALTER PROCEDURE sp_UpdateUserPassword
    @Id INT,
    @NewPasswordHash NVARCHAR(255)
AS
BEGIN
    UPDATE Users
    SET PasswordHash = @NewPasswordHash
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateUserProfilePicture
    @Id INT,
    @ProfilePicture NVARCHAR(MAX)
AS
BEGIN
    UPDATE Users
    SET ProfilePicture = @ProfilePicture
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_ResetUserPasswordByUsername]
    @Username NVARCHAR(50),
    @NewPasswordHash NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users
    SET PasswordHash = @NewPasswordHash
    WHERE Username = @Username;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- RECIPE PROCEDURES
-------------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE sp_GetRecipes
AS
BEGIN
    SELECT r.Id, r.Title, r.Description, r.ImageUrl, r.Category, r.CookingTime, r.Level, r.Rating, r.Status, r.Ingredients, r.Instructions, r.CreatedAt, u.Username AS Author
    FROM Recipes r
    INNER JOIN Users u ON r.CreatedBy = u.Id;
END
GO

CREATE OR ALTER PROCEDURE sp_GetRecipeById
    @Id INT
AS
BEGIN
    -- Increment View Count
    UPDATE Recipes SET [Views] = [Views] + 1 WHERE Id = @Id;

    SELECT r.Id, r.Title, r.Description, r.ImageUrl, r.Category, r.CookingTime, r.Level, r.Rating, r.Status, r.Ingredients, r.Instructions, r.[Views], r.CreatedAt, u.Username AS Author
    FROM Recipes r
    INNER JOIN Users u ON r.CreatedBy = u.Id
    WHERE r.Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_CreateRecipe
    @Title NVARCHAR(100),
    @Description NVARCHAR(MAX),
    @ImageUrl NVARCHAR(MAX), 
    @Category NVARCHAR(50),
    @CookingTime NVARCHAR(50),
    @Level NVARCHAR(20),
    @Ingredients NVARCHAR(MAX),
    @Instructions NVARCHAR(MAX),
    @CreatedBy INT
AS
BEGIN
    INSERT INTO Recipes (Title, Description, ImageUrl, Category, CookingTime, Level, Ingredients, Instructions, CreatedBy)
    VALUES (@Title, @Description, @ImageUrl, @Category, @CookingTime, @Level, @Ingredients, @Instructions, @CreatedBy);
    SELECT SCOPE_IDENTITY() AS NewRecipeId;
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateRecipe
    @Id INT,
    @Title NVARCHAR(100),
    @Description NVARCHAR(MAX),
    @ImageUrl NVARCHAR(MAX), 
    @Category NVARCHAR(50),
    @CookingTime NVARCHAR(50),
    @Level NVARCHAR(20),
    @Ingredients NVARCHAR(MAX),
    @Instructions NVARCHAR(MAX),
    @Status NVARCHAR(20)
AS
BEGIN
    UPDATE Recipes
    SET Title = @Title,
        Description = @Description,
        ImageUrl = @ImageUrl,
        Category = @Category,
        CookingTime = @CookingTime,
        Level = @Level,
        Ingredients = @Ingredients,
        Instructions = @Instructions,
        Status = @Status
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteRecipe]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM UserLikes WHERE RecipeId = @Id;
    DELETE FROM UserSaved WHERE RecipeId = @Id;
    DELETE FROM Ratings WHERE RecipeId = @Id;
    DELETE FROM Reports WHERE RecipeId = @Id;
    DELETE FROM Recipes WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_GetRandomRecipes
    @Count INT = 8
AS
BEGIN
    SELECT TOP (@Count) r.*, u.Username AS Author
    FROM Recipes r
    INNER JOIN Users u ON r.CreatedBy = u.Id
    ORDER BY NEWID();
END
GO

CREATE OR ALTER PROCEDURE sp_SearchRecipes
    @Query NVARCHAR(100)
AS
BEGIN
    SELECT r.Id, r.Title, r.Description, r.ImageUrl, r.Category, r.CookingTime, r.Rating, r.Status, r.CreatedAt, r.Ingredients, r.Instructions, u.Username AS Author
    FROM Recipes r
    INNER JOIN Users u ON r.CreatedBy = u.Id
    WHERE r.Title LIKE '%' + @Query + '%' 
       OR r.Category LIKE '%' + @Query + '%'
       OR r.Description LIKE '%' + @Query + '%'
    ORDER BY 
        CASE 
            WHEN r.Title = @Query THEN 1
            WHEN r.Title LIKE @Query + '%' THEN 2
            ELSE 3 
        END, 
        r.Rating DESC;
END
GO

-- CATEGORY PROCEDURES
-------------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE sp_AddCategory
    @Name NVARCHAR(100)
AS
BEGIN
    INSERT INTO Categories (Name) VALUES (@Name);
    SELECT SCOPE_IDENTITY();
END
GO

CREATE OR ALTER PROCEDURE sp_GetAllCategories
AS
BEGIN
    SELECT Id, Name FROM Categories ORDER BY Name ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateCategory
    @Id INT,
    @NewName NVARCHAR(100)
AS
BEGIN
    DECLARE @OldName NVARCHAR(100);
    SELECT @OldName = Name FROM Categories WHERE Id = @Id;
    IF @OldName IS NOT NULL
    BEGIN
        UPDATE Categories SET Name = @NewName WHERE Id = @Id;
        UPDATE Recipes SET Category = @NewName WHERE Category = @OldName;
    END
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteCategory
    @Id INT
AS
BEGIN
    DECLARE @OldName NVARCHAR(100);
    SELECT @OldName = Name FROM Categories WHERE Id = @Id;
    IF @OldName IS NOT NULL
    BEGIN
        DELETE FROM Categories WHERE Id = @Id;
        UPDATE Recipes SET Category = 'Uncategorized' WHERE Category = @OldName;
    END
END
GO

-- USER ACTIVITY & STATS PROCEDURES
-------------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE sp_ToggleLike
    @UserId INT,
    @RecipeId INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM UserLikes WHERE UserId = @UserId AND RecipeId = @RecipeId)
        DELETE FROM UserLikes WHERE UserId = @UserId AND RecipeId = @RecipeId;
    ELSE
        INSERT INTO UserLikes (UserId, RecipeId) VALUES (@UserId, @RecipeId);
END
GO

CREATE OR ALTER PROCEDURE sp_ToggleSave
    @UserId INT,
    @RecipeId INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM UserSaved WHERE UserId = @UserId AND RecipeId = @RecipeId)
        DELETE FROM UserSaved WHERE UserId = @UserId AND RecipeId = @RecipeId;
    ELSE
        INSERT INTO UserSaved (UserId, RecipeId) VALUES (@UserId, @RecipeId);
END
GO

CREATE OR ALTER PROCEDURE sp_GetUserActivity
    @UserId INT
AS
BEGIN
    SELECT r.*, u.Username AS Author, 'Created' as ActivityType
    FROM Recipes r INNER JOIN Users u ON r.CreatedBy = u.Id WHERE r.CreatedBy = @UserId;
    SELECT r.*, u.Username AS Author, 'Liked' as ActivityType
    FROM Recipes r INNER JOIN UserLikes l ON r.Id = l.RecipeId INNER JOIN Users u ON r.CreatedBy = u.Id WHERE l.UserId = @UserId;
    SELECT r.*, u.Username AS Author, 'Saved' as ActivityType
    FROM Recipes r INNER JOIN UserSaved s ON r.Id = s.RecipeId INNER JOIN Users u ON r.CreatedBy = u.Id WHERE s.UserId = @UserId;
END
GO

CREATE OR ALTER PROCEDURE sp_AddOrUpdateRating
    @UserId INT,
    @RecipeId INT,
    @RatingValue DECIMAL(2,1)
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Ratings WHERE UserId = @UserId AND RecipeId = @RecipeId)
        UPDATE Ratings SET RatingValue = @RatingValue, CreatedAt = GETDATE() WHERE UserId = @UserId AND RecipeId = @RecipeId;
    ELSE
        INSERT INTO Ratings (UserId, RecipeId, RatingValue) VALUES (@UserId, @RecipeId, @RatingValue);

    DECLARE @AvgRating DECIMAL(2,1);
    SELECT @AvgRating = AVG(RatingValue) FROM Ratings WHERE RecipeId = @RecipeId;
    UPDATE Recipes SET Rating = ISNULL(@AvgRating, 0.0) WHERE Id = @RecipeId;
    SELECT @AvgRating AS NewAverageRating;
END
GO

CREATE OR ALTER PROCEDURE sp_GetAdminStats
AS
BEGIN
    SELECT Category AS Name, COUNT(*) AS RecipeCount FROM Recipes GROUP BY Category;
    DECLARE @TotalUsers INT = (SELECT COUNT(*) FROM Users);
    DECLARE @TotalRecipes INT = (SELECT COUNT(*) FROM Recipes);
    DECLARE @TotalCategories INT = (SELECT COUNT(DISTINCT Category) FROM Recipes);
    SELECT @TotalUsers AS TotalUsers, @TotalRecipes AS TotalRecipes, @TotalCategories AS TotalCategories;
    SELECT TOP 1 Title, Rating FROM Recipes ORDER BY Rating DESC, [Views] DESC;
    SELECT Id, Title, Rating, Category FROM Recipes WHERE Rating > 4.5 ORDER BY Rating DESC;
END
GO

-- REPORTING PROCEDURES
-------------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE sp_AddReport
    @RecipeId INT,
    @UserId INT,
    @Reason NVARCHAR(255),
    @Description NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO Reports (RecipeId, UserId, Reason, Description)
    VALUES (@RecipeId, @UserId, @Reason, @Description);
END
GO

CREATE OR ALTER PROCEDURE sp_GetAllReports
AS
BEGIN
    SELECT r.Id, r.RecipeId, rcp.Title AS RecipeTitle, r.UserId, u.Username AS ReporterName,
           r.Reason, r.Description, r.Status, r.AdminAction, r.CreatedAt
    FROM Reports r JOIN Recipes rcp ON r.RecipeId = rcp.Id JOIN Users u ON r.UserId = u.Id
    ORDER BY r.CreatedAt DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateReportStatus
    @ReportId INT,
    @Status NVARCHAR(50),
    @AdminAction NVARCHAR(50)
AS
BEGIN
    UPDATE Reports SET Status = @Status, AdminAction = @AdminAction WHERE Id = @ReportId;
END
GO

-- DELETE USER PROCEDURE
-------------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteUser]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RecipeId INT;
    DECLARE recipe_cursor CURSOR FOR SELECT Id FROM Recipes WHERE CreatedBy = @Id;
    OPEN recipe_cursor;
    FETCH NEXT FROM recipe_cursor INTO @RecipeId;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_DeleteRecipe @Id = @RecipeId;
        FETCH NEXT FROM recipe_cursor INTO @RecipeId;
    END
    CLOSE recipe_cursor;
    DEALLOCATE recipe_cursor;
    DELETE FROM UserLikes WHERE UserId = @Id;
    DELETE FROM UserSaved WHERE UserId = @Id;
    DELETE FROM Ratings WHERE UserId = @Id;
    DELETE FROM Reports WHERE UserId = @Id;
    DELETE FROM Users WHERE Id = @Id;
END
GO

-- ============================================================================
-- 4. SEED DATA
-- ============================================================================

-- Seed Categories
INSERT INTO Categories (Name) VALUES ('Veg'), ('Non-Veg'), ('Dessert'), ('Beverages'), ('North Indian'), ('South Indian'), ('Breakfast');
GO

-- Seed Admin Users (Password: Admin@123)
-- BCrypt Hash: $2a$11$rBv5t0IGR9KjRheZvh4y0eFHx5dXqH0dY5I3xZ5W45gJ8L1KvVfTe
DECLARE @AdminHash NVARCHAR(255) = '$2a$11$rBv5t0IGR9KjRheZvh4y0eFHx5dXqH0dY5I3xZ5W45gJ8L1KvVfTe';
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('lavanyav', @AdminHash, 'Admin'), ('pradeep', @AdminHash, 'Admin');
GO

-- Seed High Quality Recipes
INSERT INTO Recipes (Title, Description, ImageUrl, Category, CookingTime, Level, Rating, Status, Ingredients, Instructions, CreatedBy)
VALUES 
('Paneer Butter Masala', 'Creamy and rich tomato-based curry with paneer cubes.', '/Picture/paneer.jpg', 'North Indian', '30 mins', 'Easy', 4.8, 'published', 
'200g Paneer, 2 Tomatoes, 1 Onion, 1 tbsp Ginger-garlic paste, 1/2 cup Cream, 2 tbsp Butter, Spices', 
'1. Sauté onions and tomatoes. 2. Blend into a paste. 3. Cook paste with butter and spices. 4. Add paneer and cream. 5. Simmer for 5 mins.', 1),

('Chicken Tikka', 'Spicy grilled chicken chunks marinated in yogurt and spices.', '/Picture/paneer.jpg', 'North Indian', '40 mins', 'Medium', 4.9, 'published',
'500g Chicken, 1 cup Yogurt, 2 tbsp Lemon juice, Ginger-garlic paste, Red chili powder, Garam masala',
'1. Marinate chicken with yogurt and spices for 2 hours. 2. Skewer the pieces. 3. Grill at 200°C for 20 mins. 4. Baste with butter. 5. Serve hot.', 1),

('Masala Dosa', 'Thin and crispy crepes filled with spiced potato mash.', '/Picture/dosa.jpg', 'South Indian', '25 mins', 'Medium', 4.7, 'published',
'Dosa batter, 2 Potatoes, 1 Onion, Mustard seeds, Curry leaves, Turmeric, Green chilies',
'1. Prepare potato masala. 2. Spread batter on hot tawa. 3. Add oil and cook until crisp. 4. Place masala in center. 5. Fold and serve.', 2),

('Idli Sambar', 'Steamed rice cakes served with flavorful lentil soup.', '/Picture/IdliSambhar.jpg', 'South Indian', '20 mins', 'Easy', 4.6, 'published',
'Idli batter, 1 cup Toor dal, Sambar powder, Tamarind, Mixed vegetables',
'1. Steam idlis in molds. 2. Cook dal and veggies. 3. Add tamarind and sambar powder. 4. Simmer. 5. Serve hot with idlis.', 2),

('Mango Lassi', 'Sweet and refreshing mango-flavored yogurt drink.', '/Picture/mango.jpg', 'Beverages', '10 mins', 'Easy', 4.9, 'published',
'1 cup Mango pulp, 1 cup Yogurt, 2 tbsp Sugar, Cardamom powder',
'1. Blend all ingredients until smooth. 2. Add ice cubes. 3. Blend again. 4. Pour into glasses. 5. Garnish and serve.', 1),

('Cold Coffee', 'Creamy chilled coffee with a hint of chocolate.', '/Picture/mango.jpg', 'Beverages', '5 mins', 'Easy', 4.5, 'published',
'1 cup Milk, 1 tbsp Coffee powder, 2 tbsp Sugar, Chocolate syrup, Ice',
'1. Blend coffee, sugar, and milk. 2. Add ice and blend until frothy. 3. Drizzle syrup in glass. 4. Pour coffee. 5. Serve chilled.', 1),

('Veg Biryani', 'Aromatic basmati rice cooked with mixed vegetables and spices.', '/Picture/chickenbiryani.jpg', 'Veg', '50 mins', 'Hard', 4.7, 'published',
'2 cups Basmati rice, Mixed vegetables (carrot, beans, peas), Biryani masala, Whole spices, Mint leaves',
'1. Cook rice 70%. 2. Sauté veggies with spices. 3. Layer rice and veggies. 4. Dum cook for 20 mins. 5. Serve with raita.', 2),

('Chicken Biryani', 'Classic layered rice dish with tender chicken and spices.', '/Picture/chickenbiryani.jpg', 'Non-Veg', '60 mins', 'Hard', 4.9, 'published',
'500g Chicken, 2 cups Basmati rice, Fried onions, Yogurt, Biryani masala',
'1. Marinate chicken. 2. Cook rice with spices. 3. Layer chicken and rice. 4. Top with fried onions. 5. Dum cook for 30 mins.', 2),

('Aloo Paratha', 'Whole wheat flatbread stuffed with spiced mashed potatoes.', '/Picture/pavbhaji.jpg', 'Breakfast', '20 mins', 'Easy', 4.8, 'published',
'2 cups Whole wheat flour, 2 Boiled potatoes, Green chili, Amchur powder, Butter',
'1. Make dough. 2. prepare potato stuffing. 3. Stuff dough balls. 4. Roll and cook on tawa with butter. 5. Serve with curd.', 1);
GO

PRINT 'Full Database Setup Successful!';
GO
