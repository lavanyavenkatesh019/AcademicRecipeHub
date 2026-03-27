using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;

namespace RecipeAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly string _connectionString;

        public AdminController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            var stats = new DashboardStats();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_GetAdminStats", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        // 1. Category Stats
                        while (reader.Read())
                        {
                            stats.CategoryStats.Add(new CategoryStat
                            {
                                Name = reader.GetString(0),
                                Count = reader.GetInt32(1)
                            });
                        }

                        // 2. Overall Stats
                        if (reader.NextResult() && reader.Read())
                        {
                            stats.TotalUsers = reader.GetInt32(0);
                            stats.TotalRecipes = reader.GetInt32(1);
                            stats.TotalCategories = reader.GetInt32(2);
                        }

                        // 3. Most Popular (Highest Rated) Recipe
                        if (reader.NextResult() && reader.Read())
                        {
                            stats.MostPopularRecipe = reader.GetString(0);
                            stats.MostPopularRating = reader.GetDecimal(1);
                        }

                        // 4. Top Rated Recipes (> 4.5)
                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                stats.TopRatedRecipes.Add(new RecipeSearchResult
                                {
                                    Id = reader.GetInt32(0),
                                    Title = reader.GetString(1),
                                    Rating = reader.GetDecimal(2),
                                    Category = reader.GetString(3)
                                });
                            }
                        }
                    }
                }
            }
            return Ok(stats);
        }
    }

    public class DashboardStats
    {
        public int TotalUsers { get; set; }
        public int TotalRecipes { get; set; }
        public int TotalCategories { get; set; }
        public string MostPopularRecipe { get; set; } = "None";
        public decimal MostPopularRating { get; set; }
        public List<CategoryStat> CategoryStats { get; set; } = new List<CategoryStat>();
        public List<RecipeSearchResult> TopRatedRecipes { get; set; } = new List<RecipeSearchResult>();
    }

    public class CategoryStat
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class RecipeSearchResult
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Rating { get; set; }
        public string Category { get; set; } = string.Empty;
    }
}
