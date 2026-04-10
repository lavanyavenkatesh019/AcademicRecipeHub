USE RecipeManagementDB;
GO

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_SearchRecipes')
    DROP PROCEDURE sp_SearchRecipes;
GO

CREATE PROCEDURE sp_SearchRecipes
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
