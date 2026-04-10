using System;

namespace RecipeAPI.Models
{
    public class Report
    {
        public int Id { get; set; }
        public int RecipeId { get; set; }
        public string RecipeTitle { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string ReporterName { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public string AdminAction { get; set; } = "None";
        public DateTime CreatedAt { get; set; }
    }

    public class ReportRequest
    {
        public int RecipeId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateReportStatusRequest
    {
        public string Status { get; set; } = string.Empty;
        public string AdminAction { get; set; } = string.Empty;
    }
}
