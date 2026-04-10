using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using RecipeAPI.Models;
using System.Data;

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

        [HttpGet("{id}")]
        public IActionResult GetUser(int id)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_GetUserById", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Id", id);
                    conn.Open();

                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return Ok(new
                            {
                                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                                Username = reader.GetString(reader.GetOrdinal("Username")),
                                Role = reader.GetString(reader.GetOrdinal("Role")),
                                ProfilePicture = reader.IsDBNull(reader.GetOrdinal("ProfilePicture")) 
                                    ? null : reader.GetString(reader.GetOrdinal("ProfilePicture"))
                            });
                        }
                    }
                }
            }
            return NotFound(new { message = "User not found." });
        }

        [HttpPut("{id}/profile-picture")]
        public IActionResult UpdateProfilePicture(int id, [FromBody] ProfilePictureUpdateDto request)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_UpdateUserProfilePicture", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Id", id);
                    
                    var paramProfilePic = cmd.Parameters.Add("@ProfilePicture", SqlDbType.NVarChar, -1);
                    paramProfilePic.Value = string.IsNullOrWhiteSpace(request.ProfilePicture) ? DBNull.Value : (object)request.ProfilePicture;
                    
                    conn.Open();
                    cmd.ExecuteNonQuery();
                    return Ok(new { message = "Profile picture updated successfully." });
                }
            }
        }

        [HttpPut("{id}/change-password")]
        public IActionResult ChangePassword(int id, [FromBody] ChangePasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest(new { message = "Current and new passwords are required." });

            using (var conn = new SqlConnection(_connectionString))
            {
                // 1. Get current password hash
                string currentHash = string.Empty;
                using (var cmd = new SqlCommand("sp_GetUserById", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Id", id);
                    conn.Open();

                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            currentHash = reader.GetString(reader.GetOrdinal("PasswordHash"));
                        }
                        else
                        {
                            return NotFound(new { message = "User not found." });
                        }
                    }
                }

                // 2. Verify current password
                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, currentHash))
                {
                    return BadRequest(new { message = "Invalid current password." });
                }

                // 3. Hash new password
                string newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

                // 4. Update password
                using (var cmd = new SqlCommand("sp_UpdateUserPassword", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Id", id);
                    cmd.Parameters.AddWithValue("@NewPasswordHash", newHash);

                    int rowsAffected = cmd.ExecuteNonQuery();
                    if (rowsAffected > 0)
                    {
                        return Ok(new { message = "Password updated successfully." });
                    }
                }
            }
            return BadRequest(new { message = "Failed to update password." });
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAllUsers()
        {
            var users = new List<object>();
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_GetAllUsers", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    conn.Open();

                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            users.Add(new
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteUser(int id)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_DeleteUser", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Id", id);
                    conn.Open();

                    cmd.ExecuteNonQuery();
                    return Ok(new { message = "User and associated data removed successfully." });
                }
            }
        }
    }

    public class ProfilePictureUpdateDto
    {
        public string ProfilePicture { get; set; } = string.Empty;
    }
}
