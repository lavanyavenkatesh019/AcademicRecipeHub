using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RecipeAPI.Models;
using System.Data;
using System.Security.Claims;
using System;

namespace RecipeAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RatingsController : ControllerBase
    {
        private readonly string _connectionString;

        public RatingsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        [HttpPost]
        public IActionResult RateRecipe([FromBody] UserRating rating)
        {
            // Get UserId from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("User ID not found in token.");
            
            int userId = int.Parse(userIdClaim.Value);

            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_AddOrUpdateRating", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    cmd.Parameters.AddWithValue("@RecipeId", rating.RecipeId);
                    cmd.Parameters.AddWithValue("@RatingValue", rating.RatingValue);

                    conn.Open();
                    var newAvg = cmd.ExecuteScalar();
                    
                    return Ok(new { 
                        Message = "Rating submitted successfully.", 
                        NewAverage = newAvg != null ? Convert.ToDecimal(newAvg) : 0.0m 
                    });
                }
            }
        }

        [HttpGet("user-rating/{recipeId}")]
        public IActionResult GetUserRating(int recipeId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("SELECT RatingValue FROM Ratings WHERE UserId = @UserId AND RecipeId = @RecipeId", conn))
                {
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    cmd.Parameters.AddWithValue("@RecipeId", recipeId);
                    conn.Open();
                    var result = cmd.ExecuteScalar();
                    if (result != null)
                    {
                        return Ok(new { RatingValue = Convert.ToDecimal(result) });
                    }
                }
            }
            return Ok(new { RatingValue = 0 });
        }
    }
}
