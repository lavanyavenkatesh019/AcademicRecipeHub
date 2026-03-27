USE RecipeManagementDB;
GO

-- Update sp_GetAdminStats for Most Rated and Top Rated list
ALTER PROCEDURE sp_GetAdminStats
AS
BEGIN
    -- 1. Unique Category Stats
    SELECT Category AS Name, COUNT(*) AS RecipeCount
    FROM Recipes
    GROUP BY Category;

    -- 2. Overall Totals
    DECLARE @TotalUsers INT = (SELECT COUNT(*) FROM Users);
    DECLARE @TotalRecipes INT = (SELECT COUNT(*) FROM Recipes);
    DECLARE @TotalCategories INT = (SELECT COUNT(DISTINCT Category) FROM Recipes);

    SELECT @TotalUsers AS TotalUsers, @TotalRecipes AS TotalRecipes, @TotalCategories AS TotalCategories;

    -- 3. Highest Rated Recipe (Most Popular)
    SELECT TOP 1 Title, Rating
    FROM Recipes
    ORDER BY Rating DESC, [Views] DESC; -- Use Rating as primary, Views as tie-breaker

    -- 4. Top Rated Recipes (> 4.5)
    SELECT Id, Title, Rating, Category
    FROM Recipes
    WHERE Rating > 4.5
    ORDER BY Rating DESC;
END
GO
