USE RecipeManagementDB;
GO

-- 1. Increase ImageUrl column size in Recipes table
ALTER TABLE Recipes
ALTER COLUMN ImageUrl NVARCHAR(MAX);
GO

-- 2. Update sp_CreateRecipe with ALL 9 parameters as expected by the backend
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateRecipe]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_CreateRecipe];
GO

CREATE PROCEDURE sp_CreateRecipe
    @Title NVARCHAR(100),
    @Description NVARCHAR(MAX),
    @ImageUrl NVARCHAR(MAX), 
    @Category NVARCHAR(50),
    @CookingTime NVARCHAR(50),
    @Level NVARCHAR(20),
    @Ingredients NVARCHAR(MAX),
    @Instructions NVARCHAR(MAX),
    @CreatedBy INT
AS
BEGIN
    INSERT INTO Recipes (Title, Description, ImageUrl, Category, CookingTime, Level, Ingredients, Instructions, CreatedBy)
    VALUES (@Title, @Description, @ImageUrl, @Category, @CookingTime, @Level, @Ingredients, @Instructions, @CreatedBy);
    SELECT SCOPE_IDENTITY() AS NewRecipeId;
END
GO

-- 3. Update sp_UpdateRecipe with ALL 10 parameters as expected by the backend
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateRecipe]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_UpdateRecipe];
GO

CREATE PROCEDURE sp_UpdateRecipe
    @Id INT,
    @Title NVARCHAR(100),
    @Description NVARCHAR(MAX),
    @ImageUrl NVARCHAR(MAX), 
    @Category NVARCHAR(50),
    @CookingTime NVARCHAR(50),
    @Level NVARCHAR(20),
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
        Level = @Level,
        Ingredients = @Ingredients,
        Instructions = @Instructions,
        Status = @Status
    WHERE Id = @Id;
END
GO
