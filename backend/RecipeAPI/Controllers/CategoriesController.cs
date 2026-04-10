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
    public class CategoriesController : ControllerBase
    {
        private readonly string _connectionString;

        public CategoriesController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAllCategories()
        {
            var categories = new List<Category>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_GetAllCategories", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            categories.Add(new Category
                            {
                                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                                Name = reader.GetString(reader.GetOrdinal("Name"))
                            });
                        }
                    }
                }
            }
            return Ok(categories);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult AddCategory([FromBody] Category category)
        {
            if (string.IsNullOrWhiteSpace(category.Name)) return BadRequest("Category name is required.");

            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_AddCategory", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Name", category.Name);
                    
                    conn.Open();
                    try
                    {
                        var result = cmd.ExecuteScalar();
                        category.Id = Convert.ToInt32(result);
                        return CreatedAtAction(nameof(GetAllCategories), new { id = category.Id }, category);
                    }
                    catch (SqlException ex) when (ex.Number == 2627) // Unique constraint violation
                    {
                        return Conflict("A category with this name already exists.");
                    }
                }
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult UpdateCategory(int id, [FromBody] Category category)
        {
            if (string.IsNullOrWhiteSpace(category.Name)) return BadRequest("Category name is required.");

            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_UpdateCategory", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Id", id);
                    cmd.Parameters.AddWithValue("@NewName", category.Name);
                    
                    conn.Open();
                    try
                    {
                        cmd.ExecuteNonQuery();
                        return NoContent();
                    }
                    catch (SqlException ex) when (ex.Number == 2627) // Unique constraint violation
                    {
                        return Conflict("A category with this name already exists.");
                    }
                }
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteCategory(int id)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_DeleteCategory", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Id", id);
                    
                    conn.Open();
                    cmd.ExecuteNonQuery();
                }
            }
            return NoContent();
        }
    }
}
