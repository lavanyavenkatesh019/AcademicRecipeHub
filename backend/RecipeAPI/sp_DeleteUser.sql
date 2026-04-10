CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteUser]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Delete Recipes created by this user (including all their cascades)
    DECLARE @RecipeId INT;
    DECLARE recipe_cursor CURSOR FOR 
        SELECT Id FROM Recipes WHERE CreatedBy = @Id;

    OPEN recipe_cursor;
    FETCH NEXT FROM recipe_cursor INTO @RecipeId;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_DeleteRecipe @Id = @RecipeId;
        FETCH NEXT FROM recipe_cursor INTO @RecipeId;
    END

    CLOSE recipe_cursor;
    DEALLOCATE recipe_cursor;

    -- 2. Delete User's standalone activity across the platform
    DELETE FROM UserLikes WHERE UserId = @Id;
    DELETE FROM UserSaved WHERE UserId = @Id;
    DELETE FROM Ratings WHERE UserId = @Id;
    DELETE FROM Reports WHERE UserId = @Id;

    -- 3. Finally, delete the user itself
    DELETE FROM Users WHERE Id = @Id;
END
GO
