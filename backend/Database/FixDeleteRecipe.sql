USE RecipeManagementDB;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteRecipe]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Delete from related tables to satisfy foreign key constraints
    
    -- 1. User Activity (Likes and Saved)
    DELETE FROM UserLikes WHERE RecipeId = @Id;
    DELETE FROM UserSaved WHERE RecipeId = @Id;

    -- 2. Ratings and Comments
    DELETE FROM Ratings WHERE RecipeId = @Id;
    
    -- 3. Reports against the recipe
    DELETE FROM Reports WHERE RecipeId = @Id;

    -- 4. Lastly, delete the recipe itself
    DELETE FROM Recipes WHERE Id = @Id;
END
GO
