using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RecipeAPI.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Security.Claims;

namespace RecipeAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly string _connectionString;

        public ReportsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        [HttpPost]
        [Authorize]
        public IActionResult SubmitReport([FromBody] ReportRequest request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    using (var cmd = new SqlCommand("sp_AddReport", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@RecipeId", request.RecipeId);
                        cmd.Parameters.AddWithValue("@UserId", userId);
                        cmd.Parameters.AddWithValue("@Reason", request.Reason);
                        cmd.Parameters.AddWithValue("@Description", request.Description ?? (object)DBNull.Value);

                        conn.Open();
                        cmd.ExecuteNonQuery();
                    }
                }
                return Ok(new { message = "Report submitted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAllReports()
        {
            var reports = new List<Report>();
            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    using (var cmd = new SqlCommand("sp_GetAllReports", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        conn.Open();
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                reports.Add(new Report
                                {
                                    Id = (int)reader["Id"],
                                    RecipeId = (int)reader["RecipeId"],
                                    RecipeTitle = reader["RecipeTitle"].ToString(),
                                    UserId = (int)reader["UserId"],
                                    ReporterName = reader["ReporterName"].ToString(),
                                    Reason = reader["Reason"].ToString(),
                                    Description = reader["Description"].ToString(),
                                    Status = reader["Status"].ToString(),
                                    AdminAction = reader["AdminAction"].ToString(),
                                    CreatedAt = (DateTime)reader["CreatedAt"]
                                });
                            }
                        }
                    }
                }
                return Ok(reports);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public IActionResult UpdateStatus(int id, [FromBody] UpdateReportStatusRequest request)
        {
            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    using (var cmd = new SqlCommand("sp_UpdateReportStatus", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@ReportId", id);
                        cmd.Parameters.AddWithValue("@Status", request.Status);
                        cmd.Parameters.AddWithValue("@AdminAction", request.AdminAction);

                        conn.Open();
                        cmd.ExecuteNonQuery();
                    }
                }
                return Ok(new { message = "Report status updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
