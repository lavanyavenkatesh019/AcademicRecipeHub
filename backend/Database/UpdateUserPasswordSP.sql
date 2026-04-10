USE RecipeManagementDB;
GO

-- 1. Create sp_UpdateUserPassword stored procedure
CREATE OR ALTER PROCEDURE sp_UpdateUserPassword
    @Id INT,
    @NewPasswordHash NVARCHAR(255)
AS
BEGIN
    UPDATE Users
    SET PasswordHash = @NewPasswordHash
    WHERE Id = @Id;
END
GO

-- 2. Update sp_GetUserById to include PasswordHash (needed for current password validation)
CREATE OR ALTER PROCEDURE sp_GetUserById
    @Id INT
AS
BEGIN
    SELECT Id, Username, PasswordHash, Role, ProfilePicture, CreatedAt
    FROM Users
    WHERE Id = @Id;
END
GO
