using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RecipeAPI.Models;
using System.Collections.Generic;
using System.Data;
using System;

namespace RecipeAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserActivityController : ControllerBase
    {
        private readonly string _connectionString;

        public UserActivityController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        [HttpGet("created/{userId}")]
        public IActionResult GetCreatedRecipes(int userId)
        {
            var recipes = new List<Recipe>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("SELECT r.*, u.Username AS Author FROM Recipes r INNER JOIN Users u ON r.CreatedBy = u.Id WHERE r.CreatedBy = @UserId", conn))
                {
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            recipes.Add(MapRecipe(reader));
                        }
                    }
                }
            }
            return Ok(recipes);
        }

        [HttpGet("liked/{userId}")]
        public IActionResult GetLikedRecipes(int userId)
        {
            var recipes = new List<Recipe>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("SELECT r.*, u.Username AS Author FROM Recipes r INNER JOIN UserLikes l ON r.Id = l.RecipeId INNER JOIN Users u ON r.CreatedBy = u.Id WHERE l.UserId = @UserId", conn))
                {
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            recipes.Add(MapRecipe(reader));
                        }
                    }
                }
            }
            return Ok(recipes);
        }

        [HttpGet("saved/{userId}")]
        public IActionResult GetSavedRecipes(int userId)
        {
            var recipes = new List<Recipe>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("SELECT r.*, u.Username AS Author FROM Recipes r INNER JOIN UserSaved s ON r.Id = s.RecipeId INNER JOIN Users u ON r.CreatedBy = u.Id WHERE s.UserId = @UserId", conn))
                {
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            recipes.Add(MapRecipe(reader));
                        }
                    }
                }
            }
            return Ok(recipes);
        }

        [HttpGet("total/{userId}")]
        public IActionResult GetTotalActivity(int userId)
        {
            var created = new List<Recipe>();
            var saved = new List<Recipe>();
            
            using (var conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                
                // Fetch Created
                using (var cmd1 = new SqlCommand("SELECT r.*, u.Username AS Author FROM Recipes r INNER JOIN Users u ON r.CreatedBy = u.Id WHERE r.CreatedBy = @UserId", conn))
                {
                    cmd1.Parameters.AddWithValue("@UserId", userId);
                    using (var reader1 = cmd1.ExecuteReader())
                    {
                        while (reader1.Read())
                        {
                            created.Add(MapRecipe(reader1));
                        }
                    }
                }

                // Fetch Saved
                using (var cmd2 = new SqlCommand("SELECT r.*, u.Username AS Author FROM Recipes r INNER JOIN UserSaved s ON r.Id = s.RecipeId INNER JOIN Users u ON r.CreatedBy = u.Id WHERE s.UserId = @UserId", conn))
                {
                    cmd2.Parameters.AddWithValue("@UserId", userId);
                    using (var reader2 = cmd2.ExecuteReader())
                    {
                        while (reader2.Read())
                        {
                            saved.Add(MapRecipe(reader2));
                        }
                    }
                }
            }
            
            return Ok(new { createdRecipes = created, savedRecipes = saved });
        }

        [HttpPost("toggle-like")]
        public IActionResult ToggleLike([FromBody] ActivityRequest request)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_ToggleLike", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserId", request.UserId);
                    cmd.Parameters.AddWithValue("@RecipeId", request.RecipeId);
                    conn.Open();
                    cmd.ExecuteNonQuery();
                }
            }
            return Ok();
        }

        [HttpPost("toggle-save")]
        public IActionResult ToggleSave([FromBody] ActivityRequest request)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_ToggleSave", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserId", request.UserId);
                    cmd.Parameters.AddWithValue("@RecipeId", request.RecipeId);
                    conn.Open();
                    cmd.ExecuteNonQuery();
                }
            }
            return Ok();
        }

        private Recipe MapRecipe(SqlDataReader reader)
        {
            return new Recipe
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                Title = reader.GetString(reader.GetOrdinal("Title")),
                Description = reader.GetString(reader.GetOrdinal("Description")),
                ImageUrl = reader.IsDBNull(reader.GetOrdinal("ImageUrl")) ? null : reader.GetString(reader.GetOrdinal("ImageUrl")),
                Category = reader.GetString(reader.GetOrdinal("Category")),
                CookingTime = reader.IsDBNull(reader.GetOrdinal("CookingTime")) ? null : reader.GetString(reader.GetOrdinal("CookingTime")),
                Rating = reader.GetDecimal(reader.GetOrdinal("Rating")),
                Status = reader.GetString(reader.GetOrdinal("Status")),
                Ingredients = reader.IsDBNull(reader.GetOrdinal("Ingredients")) ? null : reader.GetString(reader.GetOrdinal("Ingredients")),
                Instructions = reader.IsDBNull(reader.GetOrdinal("Instructions")) ? null : reader.GetString(reader.GetOrdinal("Instructions")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                Author = reader.GetString(reader.GetOrdinal("Author"))
            };
        }
    }

    public class ActivityRequest
    {
        public int UserId { get; set; }
        public int RecipeId { get; set; }
    }
}
