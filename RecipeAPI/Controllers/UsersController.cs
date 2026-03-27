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
    public class UsersController : ControllerBase
    {
        private readonly string _connectionString;

        public UsersController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetUsers()
        {
            var users = new List<User>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_GetUsers", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            users.Add(new User
                            {
                                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                                Username = reader.GetString(reader.GetOrdinal("Username")),
                                Role = reader.GetString(reader.GetOrdinal("Role")),
                                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                            });
                        }
                    }
                }
            }
            return Ok(users);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult CreateUser([FromBody] User user)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_CreateUser", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Username", user.Username);
                    cmd.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
                    cmd.Parameters.AddWithValue("@Role", user.Role);
                    
                    conn.Open();
                    var newId = cmd.ExecuteScalar();
                    if (newId != null)
                    {
                        user.Id = Convert.ToInt32(newId);
                        user.CreatedAt = DateTime.Now;
                        return CreatedAtAction(nameof(GetUsers), new { username = user.Username }, user);
                    }
                }
            }
            return BadRequest();
        }

        [HttpGet("{username}")]
        [AllowAnonymous]
        public IActionResult GetUserByUsername(string username)
        {
            User? user = null;
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_GetUserByUsername", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Username", username);
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            user = new User
                            {
                                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                                Username = reader.GetString(reader.GetOrdinal("Username")),
                                PasswordHash = reader.GetString(reader.GetOrdinal("PasswordHash")),
                                Role = reader.GetString(reader.GetOrdinal("Role")),
                                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                            };
                        }
                    }
                }
            }
            if (user == null) return NotFound();
            return Ok(user);
        }
    }
}
