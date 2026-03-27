USE RecipeManagementDB;
GO

-- Create Reports Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reports')
BEGIN
    CREATE TABLE Reports (
        Id INT PRIMARY KEY IDENTITY(1,1),
        RecipeId INT NOT NULL,
        UserId INT NOT NULL,
        Reason NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX),
        Status NVARCHAR(50) DEFAULT 'Pending', -- Pending, Resolved, Archived
        AdminAction NVARCHAR(50) DEFAULT 'None', -- Edited, Deleted, Ignored, None
        CreatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (RecipeId) REFERENCES Recipes(Id),
        FOREIGN KEY (UserId) REFERENCES Users(Id)
    );
END
GO

-- Stored Procedure to Add a Report
CREATE OR ALTER PROCEDURE sp_AddReport
    @RecipeId INT,
    @UserId INT,
    @Reason NVARCHAR(255),
    @Description NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO Reports (RecipeId, UserId, Reason, Description)
    VALUES (@RecipeId, @UserId, @Reason, @Description);
END
GO

-- Stored Procedure to Get All Reports for Admin
CREATE OR ALTER PROCEDURE sp_GetAllReports
AS
BEGIN
    SELECT 
        r.Id, 
        r.RecipeId, 
        rcp.Title AS RecipeTitle,
        r.UserId, 
        u.Username AS ReporterName,
        r.Reason, 
        r.Description, 
        r.Status, 
        r.AdminAction, 
        r.CreatedAt
    FROM Reports r
    JOIN Recipes rcp ON r.RecipeId = rcp.Id
    JOIN Users u ON r.UserId = u.Id
    ORDER BY r.CreatedAt DESC;
END
GO

-- Stored Procedure to Update Report Status
CREATE OR ALTER PROCEDURE sp_UpdateReportStatus
    @ReportId INT,
    @Status NVARCHAR(50),
    @AdminAction NVARCHAR(50)
AS
BEGIN
    UPDATE Reports
    SET Status = @Status, AdminAction = @AdminAction
    WHERE Id = @ReportId;
END
GO
