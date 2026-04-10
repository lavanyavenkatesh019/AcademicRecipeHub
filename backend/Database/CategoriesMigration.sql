USE RecipeManagementDB;
GO

-- 1. Create Categories Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(100) UNIQUE NOT NULL
    );

    -- Seed initial data
    INSERT INTO Categories (Name) VALUES 
        ('Veg'), 
        ('Non-Veg'), 
        ('Dessert'), 
        ('Beverages'), 
        ('North Indian'), 
        ('South Indian'), 
        ('Breakfast');
END
GO

-- 2. Stored Procedures for Categories
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AddCategory')
    DROP PROCEDURE sp_AddCategory;
GO
CREATE PROCEDURE sp_AddCategory
    @Name NVARCHAR(100)
AS
BEGIN
    INSERT INTO Categories (Name) VALUES (@Name);
    SELECT SCOPE_IDENTITY();
END
GO

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAllCategories')
    DROP PROCEDURE sp_GetAllCategories;
GO
CREATE PROCEDURE sp_GetAllCategories
AS
BEGIN
    SELECT Id, Name FROM Categories ORDER BY Name ASC;
END
GO

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateCategory')
    DROP PROCEDURE sp_UpdateCategory;
GO
CREATE PROCEDURE sp_UpdateCategory
    @Id INT,
    @NewName NVARCHAR(100)
AS
BEGIN
    DECLARE @OldName NVARCHAR(100);
    SELECT @OldName = Name FROM Categories WHERE Id = @Id;

    IF @OldName IS NOT NULL
    BEGIN
        -- Update the category name
        UPDATE Categories SET Name = @NewName WHERE Id = @Id;

        -- Cascade the update to existing recipes that used the old text category
        UPDATE Recipes SET Category = @NewName WHERE Category = @OldName;
    END
END
GO

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_DeleteCategory')
    DROP PROCEDURE sp_DeleteCategory;
GO
CREATE PROCEDURE sp_DeleteCategory
    @Id INT
AS
BEGIN
    DECLARE @OldName NVARCHAR(100);
    SELECT @OldName = Name FROM Categories WHERE Id = @Id;

    IF @OldName IS NOT NULL
    BEGIN
        -- Delete the category
        DELETE FROM Categories WHERE Id = @Id;

        -- Prevent orphaned recipe categories by renaming those recipes to 'Uncategorized'
        UPDATE Recipes SET Category = 'Uncategorized' WHERE Category = @OldName;
    END
END
GO
