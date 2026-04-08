USE [RecipeManagementDB]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_ResetUserPasswordByUsername]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[sp_ResetUserPasswordByUsername]
GO

CREATE PROCEDURE [dbo].[sp_ResetUserPasswordByUsername]
    @Username NVARCHAR(50),
    @NewPasswordHash NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET PasswordHash = @NewPasswordHash
    WHERE Username = @Username;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
