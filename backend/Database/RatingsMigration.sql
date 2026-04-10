USE RecipeManagementDB;
GO

-- 1. Create Ratings Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Ratings')
BEGIN
    CREATE TABLE Ratings (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT FOREIGN KEY REFERENCES Users(Id),
        RecipeId INT FOREIGN KEY REFERENCES Recipes(Id),
        RatingValue DECIMAL(2,1) NOT NULL CHECK (RatingValue BETWEEN 1.0 AND 5.0),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UNIQUE(UserId, RecipeId) -- One rating per user per recipe
    );
END
GO

-- 2. Procedure to Add/Update Rating and Recalculate Average
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AddOrUpdateRating')
    DROP PROCEDURE sp_AddOrUpdateRating;
GO

CREATE PROCEDURE sp_AddOrUpdateRating
    @UserId INT,
    @RecipeId INT,
    @RatingValue DECIMAL(2,1)
AS
BEGIN
    -- Upsert the rating
    IF EXISTS (SELECT 1 FROM Ratings WHERE UserId = @UserId AND RecipeId = @RecipeId)
    BEGIN
        UPDATE Ratings 
        SET RatingValue = @RatingValue, CreatedAt = GETDATE()
        WHERE UserId = @UserId AND RecipeId = @RecipeId;
    END
    ELSE
    BEGIN
        INSERT INTO Ratings (UserId, RecipeId, RatingValue)
        VALUES (@UserId, @RecipeId, @RatingValue);
    END

    -- Recalculate average rating for the recipe and update Recipes table
    DECLARE @AvgRating DECIMAL(2,1);
    SELECT @AvgRating = AVG(RatingValue) FROM Ratings WHERE RecipeId = @RecipeId;

    UPDATE Recipes 
    SET Rating = ISNULL(@AvgRating, 0.0) 
    WHERE Id = @RecipeId;

    SELECT @AvgRating AS NewAverageRating;
END
GO

-- 3. Update Admin Stats SP for 4.0+ threshold
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAdminStats')
BEGIN
    -- We need to re-create it completely to ensure the 4.0 logic is applied
    DECLARE @sql NVARCHAR(MAX) = '
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
        ORDER BY Rating DESC, [Views] DESC;

        -- 4. Top Rated Recipes (>= 4.0 as per latest request)
        SELECT Id, Title, Rating, Category
        FROM Recipes
        WHERE Rating >= 4.0
        ORDER BY Rating DESC;
    END';
    EXEC sp_executesql @sql;
END
GO
