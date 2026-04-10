USE RecipeManagementDB;
GO

-- 1. Add Ingredients and Instructions columns to Recipes table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Recipes') AND name = 'Ingredients')
BEGIN
    ALTER TABLE Recipes ADD Ingredients NVARCHAR(MAX);
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Recipes') AND name = 'Instructions')
BEGIN
    ALTER TABLE Recipes ADD Instructions NVARCHAR(MAX);
END
GO

-- 2. Update Stored Procedures
CREATE OR ALTER PROCEDURE sp_GetRecipes
AS
BEGIN
    SELECT r.Id, r.Title, r.Description, r.ImageUrl, r.Category, r.CookingTime, r.Rating, r.Status, r.CreatedAt, r.Ingredients, r.Instructions, u.Username AS Author
    FROM Recipes r
    INNER JOIN Users u ON r.CreatedBy = u.Id;
END
GO

CREATE OR ALTER PROCEDURE sp_GetRecipeById
    @Id INT
AS
BEGIN
    SELECT r.Id, r.Title, r.Description, r.ImageUrl, r.Category, r.CookingTime, r.Rating, r.Status, r.CreatedAt, r.Ingredients, r.Instructions, u.Username AS Author
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
    @Ingredients NVARCHAR(MAX),
    @Instructions NVARCHAR(MAX),
    @CreatedBy INT
AS
BEGIN
    INSERT INTO Recipes (Title, Description, ImageUrl, Category, CookingTime, Ingredients, Instructions, CreatedBy)
    VALUES (@Title, @Description, @ImageUrl, @Category, @CookingTime, @Ingredients, @Instructions, @CreatedBy);
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
        Ingredients = @Ingredients,
        Instructions = @Instructions,
        Status = @Status
    WHERE Id = @Id;
END
GO

-- 3. Seed Detailed Recipes
DELETE FROM Recipes;
GO

INSERT INTO Recipes (Title, Description, ImageUrl, Category, CookingTime, Rating, Status, Ingredients, Instructions, CreatedBy)
VALUES 
('Paneer Butter Masala', 'Creamy and rich tomato-based curry with paneer cubes.', '/Picture/paneer.jpg', 'North Indian', '30 mins', 4.8, 'published', 
'200g Paneer, 2 Tomatoes, 1 Onion, 1 tbsp Ginger-garlic paste, 1/2 cup Cream, 2 tbsp Butter, Spices', 
'1. Sauté onions and tomatoes. 2. Blend into a paste. 3. Cook paste with butter and spices. 4. Add paneer and cream. 5. Simmer for 5 mins.', 1),

('Chicken Tikka', 'Spicy grilled chicken chunks marinated in yogurt and spices.', '/Picture/paneer.jpg', 'North Indian', '40 mins', 4.9, 'published',
'500g Chicken, 1 cup Yogurt, 2 tbsp Lemon juice, Ginger-garlic paste, Red chili powder, Garam masala',
'1. Marinate chicken with yogurt and spices for 2 hours. 2. Skewer the pieces. 3. Grill at 200°C for 20 mins. 4. Baste with butter. 5. Serve hot.', 1),

('Masala Dosa', 'Thin and crispy crepes filled with spiced potato mash.', '/Picture/dosa.jpg', 'South Indian', '25 mins', 4.7, 'published',
'Dosa batter, 2 Potatoes, 1 Onion, Mustard seeds, Curry leaves, Turmeric, Green chilies',
'1. Prepare potato masala. 2. Spread batter on hot tawa. 3. Add oil and cook until crisp. 4. Place masala in center. 5. Fold and serve.', 2),

('Idli Sambar', 'Steamed rice cakes served with flavorful lentil soup.', '/Picture/IdliSambhar.jpg', 'South Indian', '20 mins', 4.6, 'published',
'Idli batter, 1 cup Toor dal, Sambar powder, Tamarind, Mixed vegetables',
'1. Steam idlis in molds. 2. Cook dal and veggies. 3. Add tamarind and sambar powder. 4. Simmer. 5. Serve hot with idlis.', 2),

('Mango Lassi', 'Sweet and refreshing mango-flavored yogurt drink.', '/Picture/mango.jpg', 'Beverages', '10 mins', 4.9, 'published',
'1 cup Mango pulp, 1 cup Yogurt, 2 tbsp Sugar, Cardamom powder',
'1. Blend all ingredients until smooth. 2. Add ice cubes. 3. Blend again. 4. Pour into glasses. 5. Garnish and serve.', 1),

('Cold Coffee', 'Creamy chilled coffee with a hint of chocolate.', '/Picture/mango.jpg', 'Beverages', '5 mins', 4.5, 'published',
'1 cup Milk, 1 tbsp Coffee powder, 2 tbsp Sugar, Chocolate syrup, Ice',
'1. Blend coffee, sugar, and milk. 2. Add ice and blend until frothy. 3. Drizzle syrup in glass. 4. Pour coffee. 5. Serve chilled.', 1),

('Veg Biryani', 'Aromatic basmati rice cooked with mixed vegetables and spices.', '/Picture/chickenbiryani.jpg', 'Veg', '50 mins', 4.7, 'published',
'2 cups Basmati rice, Mixed vegetables (carrot, beans, peas), Biryani masala, Whole spices, Mint leaves',
'1. Cook rice 70%. 2. Sauté veggies with spices. 3. Layer rice and veggies. 4. Dum cook for 20 mins. 5. Serve with raita.', 2),

('Chicken Biryani', 'Classic layered rice dish with tender chicken and spices.', '/Picture/chickenbiryani.jpg', 'Non-Veg', '60 mins', 4.9, 'published',
'500g Chicken, 2 cups Basmati rice, Fried onions, Yogurt, Biryani masala',
'1. Marinate chicken. 2. Cook rice with spices. 3. Layer chicken and rice. 4. Top with fried onions. 5. Dum cook for 30 mins.', 2),

('Aloo Paratha', 'Whole wheat flatbread stuffed with spiced mashed potatoes.', '/Picture/pavbhaji.jpg', 'Breakfast', '20 mins', 4.8, 'published',
'2 cups Whole wheat flour, 2 Boiled potatoes, Green chili, Amchur powder, Butter',
'1. Make dough. 2. prepare potato stuffing. 3. Stuff dough balls. 4. Roll and cook on tawa with butter. 5. Serve with curd.', 1),

('Veg Sandwich', 'Healthy and quick sandwich with fresh veggies.', '/Picture/sandwitch.jpg', 'Breakfast', '10 mins', 4.4, 'published',
'Bread slices, Cucumber, Tomato, Onion, Green chutney, Butter',
'1. Apply butter and chutney. 2. Place veggie slices. 3. Sprinkle salt. 4. Grill or serve fresh. 5. Cut and serve.', 1);
GO
