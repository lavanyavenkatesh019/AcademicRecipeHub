USE RecipeManagementDB;
GO

-- 1. Add ProfilePicture column to Users table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'ProfilePicture')
BEGIN
    ALTER TABLE Users ADD ProfilePicture NVARCHAR(MAX) NULL;
END
GO

-- 2. Create or Update Stored Procedures for User Profile Picture

-- Update sp_GetUserByUsername to include ProfilePicture
CREATE OR ALTER PROCEDURE sp_GetUserByUsername
    @Username NVARCHAR(50)
AS
BEGIN
    SELECT Id, Username, PasswordHash, Role, ProfilePicture, CreatedAt
    FROM Users
    WHERE Username = @Username;
END
GO

-- Update sp_GetUserById to include ProfilePicture
CREATE OR ALTER PROCEDURE sp_GetUserById
    @Id INT
AS
BEGIN
    SELECT Id, Username, Role, ProfilePicture, CreatedAt
    FROM Users
    WHERE Id = @Id;
END
GO

-- Create sp_UpdateUserProfilePicture
CREATE OR ALTER PROCEDURE sp_UpdateUserProfilePicture
    @Id INT,
    @ProfilePicture NVARCHAR(MAX)
AS
BEGIN
    UPDATE Users
    SET ProfilePicture = @ProfilePicture
    WHERE Id = @Id;
END
GO
