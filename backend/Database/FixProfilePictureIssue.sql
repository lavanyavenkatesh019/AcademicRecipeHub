USE RecipeManagementDB;
GO

-- 1. Ensure ProfilePicture column exists in Users table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'ProfilePicture')
BEGIN
    ALTER TABLE Users ADD ProfilePicture NVARCHAR(MAX) NULL;
    PRINT 'Added ProfilePicture column to Users table.';
END
GO

-- 2. Update sp_GetUserByUsername to include ProfilePicture
CREATE OR ALTER PROCEDURE sp_GetUserByUsername
    @Username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Username, PasswordHash, Role, ProfilePicture, CreatedAt
    FROM Users
    WHERE Username = @Username;
END
GO
PRINT 'Updated sp_GetUserByUsername';
GO

-- 3. Update sp_GetUserById to include ProfilePicture
CREATE OR ALTER PROCEDURE sp_GetUserById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Username, Role, ProfilePicture, CreatedAt
    FROM Users
    WHERE Id = @Id;
END
GO
PRINT 'Updated sp_GetUserById';
GO

-- 4. Update sp_GetUsers to include ProfilePicture
CREATE OR ALTER PROCEDURE sp_GetUsers
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Username, Role, ProfilePicture, CreatedAt
    FROM Users;
END
GO
PRINT 'Updated sp_GetUsers';
GO

-- 5. Update sp_GetAllUsers to include ProfilePicture
CREATE OR ALTER PROCEDURE sp_GetAllUsers
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        Id,
        Username,
        Role,
        ProfilePicture,
        CreatedAt
    FROM Users
    ORDER BY CreatedAt DESC;
END;
GO
PRINT 'Updated sp_GetAllUsers';
GO

PRINT 'Database fix for ProfilePicture issue completed successfully.';
