USE RecipeManagementDB;
GO

DECLARE @AdminHash NVARCHAR(255) = '$2a$11$rBv5t0IGR9KjRheZvh4y0eFHx5dXqH0dY5I3xZ5W45gJ8L1KvVfTe';

IF EXISTS (SELECT 1 FROM Users WHERE Username = 'lavanyav')
BEGIN
    UPDATE Users SET PasswordHash = @AdminHash, Role = 'Admin' WHERE Username = 'lavanyav';
    PRINT 'Updated existing user lavanyav';
END
ELSE
BEGIN
    INSERT INTO Users (Username, PasswordHash, Role) VALUES ('lavanyav', @AdminHash, 'Admin');
    PRINT 'Inserted new user lavanyav';
END
GO
