USE RecipeManagementDB;
GO

-- Update sp_UpdateRecipe to include Ingredients and Instructions
ALTER PROCEDURE sp_UpdateRecipe
    @Id INT,
    @Title NVARCHAR(100),
    @Description NVARCHAR(MAX),
    @ImageUrl NVARCHAR(500),
    @Category NVARCHAR(50),
    @CookingTime NVARCHAR(50),
    @Ingredients NVARCHAR(MAX) = NULL,
    @Instructions NVARCHAR(MAX) = NULL,
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

-- Update sp_DeleteRecipe to handle cascading deletes
ALTER PROCEDURE sp_DeleteRecipe
    @Id INT
AS
BEGIN
    -- Delete from related tables first
    DELETE FROM UserLikes WHERE RecipeId = @Id;
    DELETE FROM UserSaved WHERE RecipeId = @Id;
    
    -- Delete the recipe itself
    DELETE FROM Recipes WHERE Id = @Id;
END
GO
