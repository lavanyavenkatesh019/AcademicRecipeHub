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
    public class RecipesController : ControllerBase
    {
        private readonly string _connectionString;

        public RecipesController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetRecipes()
        {
            var recipes = new List<Recipe>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_GetRecipes", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            recipes.Add(new Recipe
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
                            });
                        }
                    }
                }
            }
            return Ok(recipes);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public IActionResult GetRecipeById(int id)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_GetRecipeById", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Id", id);
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            var recipe = new Recipe
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
                            return Ok(recipe);
                        }
                    }
                }
            }
            return NotFound();
        }

        [HttpPost]
        [Authorize]
        public IActionResult CreateRecipe([FromBody] Recipe recipe)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_CreateRecipe", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Title", recipe.Title);
                    cmd.Parameters.AddWithValue("@Description", recipe.Description);
                    cmd.Parameters.AddWithValue("@ImageUrl", string.IsNullOrEmpty(recipe.ImageUrl) ? (object)DBNull.Value : recipe.ImageUrl);
                    cmd.Parameters.AddWithValue("@Category", recipe.Category);
                    cmd.Parameters.AddWithValue("@CookingTime", string.IsNullOrEmpty(recipe.CookingTime) ? (object)DBNull.Value : recipe.CookingTime);
                    cmd.Parameters.AddWithValue("@Ingredients", string.IsNullOrEmpty(recipe.Ingredients) ? (object)DBNull.Value : recipe.Ingredients);
                    cmd.Parameters.AddWithValue("@Instructions", string.IsNullOrEmpty(recipe.Instructions) ? (object)DBNull.Value : recipe.Instructions);
                    cmd.Parameters.AddWithValue("@CreatedBy", recipe.CreatedBy);
                    
                    conn.Open();
                    var result = cmd.ExecuteScalar();
                    if (result != null)
                    {
                        recipe.Id = Convert.ToInt32(result);
                        recipe.CreatedAt = DateTime.Now;
                        return CreatedAtAction(nameof(GetRecipeById), new { id = recipe.Id }, recipe);
                    }
                }
            }
            return BadRequest();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult UpdateRecipe(int id, [FromBody] Recipe recipe)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_UpdateRecipe", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Id", id);
                    cmd.Parameters.AddWithValue("@Title", recipe.Title);
                    cmd.Parameters.AddWithValue("@Description", recipe.Description);
                    cmd.Parameters.AddWithValue("@ImageUrl", string.IsNullOrEmpty(recipe.ImageUrl) ? (object)DBNull.Value : recipe.ImageUrl);
                    cmd.Parameters.AddWithValue("@Category", recipe.Category);
                    cmd.Parameters.AddWithValue("@CookingTime", string.IsNullOrEmpty(recipe.CookingTime) ? (object)DBNull.Value : recipe.CookingTime);
                    cmd.Parameters.AddWithValue("@Ingredients", string.IsNullOrEmpty(recipe.Ingredients) ? (object)DBNull.Value : recipe.Ingredients);
                    cmd.Parameters.AddWithValue("@Instructions", string.IsNullOrEmpty(recipe.Instructions) ? (object)DBNull.Value : recipe.Instructions);
                    cmd.Parameters.AddWithValue("@Status", recipe.Status);
                    
                    conn.Open();
                    cmd.ExecuteNonQuery();
                }
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteRecipe(int id)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_DeleteRecipe", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Id", id);
                    
                    conn.Open();
                    cmd.ExecuteNonQuery();
                }
            }
            return NoContent();
        }
        [HttpGet("random")]
        [AllowAnonymous]
        public IActionResult GetRandomRecipes([FromQuery] int count = 8)
        {
            var recipes = new List<Recipe>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_GetRandomRecipes", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Count", count);
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            recipes.Add(new Recipe
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
                            });
                        }
                    }
                }
            }
            return Ok(recipes);
        }
        [HttpGet("search")]
        [AllowAnonymous]
        public IActionResult SearchRecipes([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q)) return Ok(new List<Recipe>());
            
            var recipes = new List<Recipe>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_SearchRecipes", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Query", q);
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            recipes.Add(new Recipe
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
                            });
                        }
                    }
                }
            }
            return Ok(recipes);
        }

        [HttpGet("top")]
        [AllowAnonymous]
        public IActionResult GetTopRecipes([FromQuery] int count = 4)
        {
            var recipes = new List<Recipe>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("SELECT TOP (@Count) r.*, u.Username AS Author FROM Recipes r INNER JOIN Users u ON r.CreatedBy = u.Id WHERE r.Status = 'published' ORDER BY r.Rating DESC, r.CreatedAt DESC", conn))
                {
                    cmd.Parameters.AddWithValue("@Count", count);
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            recipes.Add(new Recipe
                            {
                                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                                Title = reader.GetString(reader.GetOrdinal("Title")),
                                Description = reader.GetString(reader.GetOrdinal("Description")),
                                ImageUrl = reader.IsDBNull(reader.GetOrdinal("ImageUrl")) ? null : reader.GetString(reader.GetOrdinal("ImageUrl")),
                                Category = reader.GetString(reader.GetOrdinal("Category")),
                                CookingTime = reader.IsDBNull(reader.GetOrdinal("CookingTime")) ? null : reader.GetString(reader.GetOrdinal("CookingTime")),
                                Rating = reader.GetDecimal(reader.GetOrdinal("Rating")),
                                Status = reader.GetString(reader.GetOrdinal("Status")),
                                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                                Author = reader.GetString(reader.GetOrdinal("Author"))
                            });
                        }
                    }
                }
            }
            return Ok(recipes);
        }
    }
}
