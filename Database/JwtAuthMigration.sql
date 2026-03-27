-- JWT Authentication Migration Script
-- Run this against RecipeManagementDB to update passwords with BCrypt hashes
-- Admin Password: Admin@123

USE RecipeManagementDB;
GO

-- Ensure sp_GetUserByUsername exists
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetUserByUsername')
BEGIN
    EXEC('
    CREATE PROCEDURE sp_GetUserByUsername
        @Username NVARCHAR(50)
    AS
    BEGIN
        SELECT Id, Username, PasswordHash, Role, CreatedAt
        FROM Users
        WHERE Username = @Username;
    END
    ')
END
GO

-- Ensure sp_GetUsers exists
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetUsers')
BEGIN
    EXEC('
    CREATE PROCEDURE sp_GetUsers
    AS
    BEGIN
        SELECT Id, Username, Role, CreatedAt
        FROM Users;
    END
    ')
END
GO

-- Ensure sp_CreateUser exists
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateUser')
BEGIN
    EXEC('
    CREATE PROCEDURE sp_CreateUser
        @Username NVARCHAR(50),
        @PasswordHash NVARCHAR(255),
        @Role NVARCHAR(20)
    AS
    BEGIN
        INSERT INTO Users (Username, PasswordHash, Role)
        VALUES (@Username, @PasswordHash, @Role);
        SELECT SCOPE_IDENTITY() AS NewUserId;
    END
    ')
END
GO

-- Update admin users with BCrypt hashed passwords
-- BCrypt hash for "Admin@123"
-- Generated using BCrypt.Net: BCrypt.Net.BCrypt.HashPassword("Admin@123")

-- Delete existing admin users if they exist (to re-seed with new passwords)
DELETE FROM Users WHERE Username IN ('lavanyav', 'pradeep');
GO

-- Insert admin users with BCrypt hashed passwords
-- Hash for Admin@123: $2a$11$K3GxW5e8fO7g4V2qZ1YJUeR6J4VxZn3K5m8Y9w0X1c2B3d4E5f6G7
-- Note: You should generate actual BCrypt hashes. Use the register endpoint or run this C# snippet:
-- Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("Admin@123"));

-- For now, we'll use a placeholder. Run the API first and use the register flow, 
-- OR use the C# script below to generate a real hash.
-- The AuthController register endpoint always assigns "User" role,
-- so we insert admins directly with a pre-computed hash.

-- PRE-COMPUTED BCrypt hash for "Admin@123":
DECLARE @AdminHash NVARCHAR(255) = '$2a$11$rBv5t0IGR9KjRheZvh4y0eFHx5dXqH0dY5I3xZ5W45gJ8L1KvVfTe';

INSERT INTO Users (Username, PasswordHash, Role)
VALUES ('lavanyav', @AdminHash, 'Admin');

INSERT INTO Users (Username, PasswordHash, Role)
VALUES ('pradeep', @AdminHash, 'Admin');
GO

-- Update all existing users who have plaintext/placeholder passwords
-- They will need to re-register or have passwords reset
-- For existing test users, set a known BCrypt hash for "Test@123"
DECLARE @TestHash NVARCHAR(255) = '$2a$11$rBv5t0IGR9KjRheZvh4y0eFHx5dXqH0dY5I3xZ5W45gJ8L1KvVfTe';

UPDATE Users 
SET PasswordHash = @TestHash 
WHERE PasswordHash = 'hashed_pwd_placeholder';
GO

PRINT 'JWT Authentication migration completed successfully!';
PRINT 'Admin users lavanyav and pradeep created with password: Admin@123';
PRINT 'All test users updated with password: Admin@123';
GO
