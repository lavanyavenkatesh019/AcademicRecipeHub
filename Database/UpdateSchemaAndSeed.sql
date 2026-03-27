USE RecipeManagementDB;
GO

-- 1. Add missing columns to Recipes table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Recipes') AND name = 'Category')
BEGIN
    ALTER TABLE Recipes ADD Category NVARCHAR(50) NOT NULL DEFAULT 'Veg';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Recipes') AND name = 'CookingTime')
BEGIN
    ALTER TABLE Recipes ADD CookingTime NVARCHAR(50);
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Recipes') AND name = 'Rating')
BEGIN
    ALTER TABLE Recipes ADD Rating DECIMAL(2,1) DEFAULT 0.0;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Recipes') AND name = 'Status')
BEGIN
    ALTER TABLE Recipes ADD Status NVARCHAR(20) DEFAULT 'published';
END
GO

-- 2. Update Stored Procedures to include new fields
CREATE OR ALTER PROCEDURE sp_GetRecipes
AS
BEGIN
    SELECT r.Id, r.Title, r.Description, r.ImageUrl, r.Category, r.CookingTime, r.Rating, r.Status, r.CreatedAt, u.Username AS Author
    FROM Recipes r
    INNER JOIN Users u ON r.CreatedBy = u.Id;
END
GO

CREATE OR ALTER PROCEDURE sp_GetRecipeById
    @Id INT
AS
BEGIN
    SELECT r.Id, r.Title, r.Description, r.ImageUrl, r.Category, r.CookingTime, r.Rating, r.Status, r.CreatedAt, u.Username AS Author
    FROM Recipes r
    INNER JOIN Users u ON r.CreatedBy = u.Id
    WHERE r.Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_CreateRecipe
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

CREATE OR ALTER PROCEDURE sp_UpdateRecipe
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

-- 3. Seed Recipes (Delete existing and re-insert for clean demo data)
DELETE FROM Recipes;
GO

INSERT INTO Recipes (Title, Description, ImageUrl, Category, CookingTime, Rating, Status, CreatedBy)
VALUES 
('Paneer Butter Masala', 'Creamy and rich tomato-based curry with paneer cubes.', '/Picture/paneer.jpg', 'North Indian', '30 mins', 4.8, 'published', 1),
('Chicken Tikka', 'Spicy grilled chicken chunks marinated in yogurt and spices.', '/Picture/paneer.jpg', 'North Indian', '40 mins', 4.9, 'published', 1),
('Masala Dosa', 'Thin and crispy crepes filled with spiced potato mash.', '/Picture/dosa.jpg', 'South Indian', '25 mins', 4.7, 'published', 2),
('Idli Sambar', 'Steamed rice cakes served with flavorful lentil soup.', '/Picture/IdliSambhar.jpg', 'South Indian', '20 mins', 4.6, 'published', 2),
('Mango Lassi', 'Sweet and refreshing mango-flavored yogurt drink.', '/Picture/mango.jpg', 'Beverages', '10 mins', 4.9, 'published', 1),
('Cold Coffee', 'Creamy chilled coffee with a hint of chocolate.', '/Picture/mango.jpg', 'Beverages', '5 mins', 4.5, 'published', 1),
('Veg Biryani', 'Aromatic basmati rice cooked with mixed vegetables and spices.', '/Picture/chickenbiryani.jpg', 'Veg', '50 mins', 4.7, 'published', 2),
('Chicken Biryani', 'Classic layered rice dish with tender chicken and spices.', '/Picture/chickenbiryani.jpg', 'Non-Veg', '60 mins', 4.9, 'published', 2),
('Aloo Paratha', 'Whole wheat flatbread stuffed with spiced mashed potatoes.', '/Picture/pavbhaji.jpg', 'Breakfast', '20 mins', 4.8, 'published', 1),
('Veg Sandwich', 'Healthy and quick sandwich with fresh veggies.', '/Picture/sandwitch.jpg', 'Breakfast', '10 mins', 4.4, 'published', 1);
GO
