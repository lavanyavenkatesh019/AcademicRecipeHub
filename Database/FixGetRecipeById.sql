USE RecipeManagementDB;
GO

ALTER PROCEDURE sp_GetRecipeById
    @Id INT
AS
BEGIN
    -- Increment View Count
    UPDATE Recipes SET [Views] = [Views] + 1 WHERE Id = @Id;

    SELECT 
        r.Id, 
        r.Title, 
        r.Description, 
        r.ImageUrl, 
        r.Category, 
        r.CookingTime, 
        r.Ingredients, 
        r.Instructions, 
        r.Rating, 
        r.Status, 
        r.[Views], 
        r.CreatedAt, 
        u.Username AS Author
    FROM Recipes r
    INNER JOIN Users u ON r.CreatedBy = u.Id
    WHERE r.Id = @Id;
END
GO
