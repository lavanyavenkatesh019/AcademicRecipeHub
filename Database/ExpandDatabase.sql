USE RecipeManagementDB;
GO

-- 1. Create UserLikes Table
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

-- 2. Create UserSaved Table
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

-- 3. Stored Procedures for User Activity
CREATE OR ALTER PROCEDURE sp_ToggleLike
    @UserId INT,
    @RecipeId INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM UserLikes WHERE UserId = @UserId AND RecipeId = @RecipeId)
    BEGIN
        DELETE FROM UserLikes WHERE UserId = @UserId AND RecipeId = @RecipeId;
    END
    ELSE
    BEGIN
        INSERT INTO UserLikes (UserId, RecipeId) VALUES (@UserId, @RecipeId);
    END
END
GO

CREATE OR ALTER PROCEDURE sp_ToggleSave
    @UserId INT,
    @RecipeId INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM UserSaved WHERE UserId = @UserId AND RecipeId = @RecipeId)
    BEGIN
        DELETE FROM UserSaved WHERE UserId = @UserId AND RecipeId = @RecipeId;
    END
    ELSE
    BEGIN
        INSERT INTO UserSaved (UserId, RecipeId) VALUES (@UserId, @RecipeId);
    END
END
GO

CREATE OR ALTER PROCEDURE sp_GetUserActivity
    @UserId INT
AS
BEGIN
    -- Created Recipes
    SELECT r.*, u.Username AS Author, 'Created' as ActivityType
    FROM Recipes r
    INNER JOIN Users u ON r.CreatedBy = u.Id
    WHERE r.CreatedBy = @UserId;

    -- Liked Recipes
    SELECT r.*, u.Username AS Author, 'Liked' as ActivityType
    FROM Recipes r
    INNER JOIN UserLikes l ON r.Id = l.RecipeId
    INNER JOIN Users u ON r.CreatedBy = u.Id
    WHERE l.UserId = @UserId;

    -- Saved Recipes
    SELECT r.*, u.Username AS Author, 'Saved' as ActivityType
    FROM Recipes r
    INNER JOIN UserSaved s ON r.Id = s.RecipeId
    INNER JOIN Users u ON r.CreatedBy = u.Id
    WHERE s.UserId = @UserId;
END
GO

-- 4. Stored Procedure for Random Recipes
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

-- 5. Add More Diverse Recipes
INSERT INTO Recipes (Title, Description, ImageUrl, Category, CookingTime, Rating, Status, Ingredients, Instructions, CreatedBy)
VALUES 
('Dahi Puri', 'Popular Indian street food - crispy puris filled with yogurt and chutneys.', '/Picture/dessert.jpg', 'North Indian', '15 mins', 4.8, 'published', 'Puris, Boiled potatoes, Curd, Chutneys, Sev', '1. Assemble puris. 2. Fill with potato. 3. Top with curd and chutneys. 4. Serve immediately.', 1),
('Butter Chicken', 'Tender chicken in a rich, buttery tomato sauce.', '/Picture/paneer.jpg', 'North Indian', '45 mins', 4.9, 'published', 'Chicken, Butter, Tomato puree, Cream, Kasoori method', '1. Cook chicken. 2. Prepare gravy. 3. Add chicken to gravy. 4. Finish with cream.', 1),
('Medu Vada', 'Savoury doughnut-like fritters from South India.', '/Picture/IdliSambhar.jpg', 'South Indian', '30 mins', 4.7, 'published', 'Urad dal, Peppercorns, Curry leaves, Oil', '1. Soak dal. 2. Grind to fluffly batter. 3. Shape into donuts. 4. Deep fry until golden.', 2),
('Filter Coffee', 'Traditional South Indian frothy coffee.', '/Picture/mango.jpg', 'Beverages', '10 mins', 4.9, 'published', 'Coffee powder, Milk, Sugar', '1. Brew decoction. 2. Mix with hot milk and sugar. 3. Froth and serve.', 2),
('Gulab Jamun', 'Deep-fried balls dipped in sugar syrup.', '/Picture/dessert.jpg', 'Dessert', '40 mins', 4.9, 'published', 'Khoya, Flour, Sugar, Cardamom', '1. Make dough balls. 2. Fry until brown. 3. Soak in syrup.', 1),
('Chocolate Lava Cake', 'Oozing chocolate center in a soft cake shell.', '/Picture/dessert.jpg', 'Dessert', '25 mins', 4.8, 'published', 'Dark chocolate, Butter, Eggs, Sugar, Flour', '1. Melt chocolate. 2. Mix ingredients. 3. Bake for 12 mins.', 1),
('Lemon Mint Cooler', 'Refreshing summer drink with citrus and mint.', '/Picture/beverages.jpg', 'Beverages', '5 mins', 4.6, 'published', 'Lemon juice, Mint leaves, Soda, Sugar', '1. Muddle mint. 2. Add juice and sugar. 3. Top with soda.', 2),
('Poha', 'Flattened rice cooked with onions and peanuts.', '/Picture/pavbhaji.jpg', 'Breakfast', '15 mins', 4.5, 'published', 'Poha, Onion, Peanuts, Turmeric', '1. Wash poha. 2. Sauté peanuts and onions. 3. Mix in poha and salt.', 2);
GO
