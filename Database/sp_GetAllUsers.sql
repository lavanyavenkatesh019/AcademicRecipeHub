USE RecipeManagementDB;
GO

IF OBJECT_ID('sp_GetAllUsers', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetAllUsers;
GO

CREATE PROCEDURE sp_GetAllUsers
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        Id,
        Username,
        Role,
        CreatedAt
    FROM Users
    ORDER BY CreatedAt DESC;
END;
GO
