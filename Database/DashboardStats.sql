USE RecipeManagementDB;
GO

-- 1. Add Views column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Recipes') AND name = 'Views')
BEGIN
    ALTER TABLE Recipes ADD [Views] INT DEFAULT 0;
END
GO

-- 2. Update existing rows to have 0 views if they are NULL
UPDATE Recipes SET [Views] = 0 WHERE [Views] IS NULL;
GO

-- 3. Update sp_GetRecipeById to increment views
ALTER PROCEDURE sp_GetRecipeById
    @Id INT
AS
BEGIN
    -- Increment View Count
    UPDATE Recipes SET [Views] = [Views] + 1 WHERE Id = @Id;

    SELECT r.Id, r.Title, r.Description, r.ImageUrl, r.Category, r.CookingTime, r.Rating, r.Status, r.[Views], r.CreatedAt, u.Username AS Author
    FROM Recipes r
    INNER JOIN Users u ON r.CreatedBy = u.Id
    WHERE r.Id = @Id;
END
GO

-- 4. Create sp_GetAdminStats
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAdminStats')
    DROP PROCEDURE sp_GetAdminStats;
GO

CREATE PROCEDURE sp_GetAdminStats
AS
BEGIN
    -- Total Counts
    DECLARE @TotalUsers INT = (SELECT COUNT(*) FROM Users);
    DECLARE @TotalRecipes INT = (SELECT COUNT(*) FROM Recipes);
    
    -- Category Stats
    SELECT Category AS Name, COUNT(*) AS RecipeCount
    FROM Recipes
    GROUP BY Category;

    -- Overall Stats
    SELECT @TotalUsers AS TotalUsers, @TotalRecipes AS TotalRecipes;

    -- Most Viewed Recipe
    SELECT TOP 1 Title, [Views]
    FROM Recipes
    ORDER BY [Views] DESC;
END
GO
