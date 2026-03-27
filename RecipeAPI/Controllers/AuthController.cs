using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using RecipeAPI.Models;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RecipeAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            _configuration = configuration;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Username and password are required." });

            // Check if username already exists
            using (var conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                using (var checkCmd = new SqlCommand("SELECT COUNT(*) FROM Users WHERE Username = @Username", conn))
                {
                    checkCmd.Parameters.AddWithValue("@Username", request.Username);
                    int count = (int)checkCmd.ExecuteScalar();
                    if (count > 0)
                        return BadRequest(new { message = "Username already exists." });
                }

                // Hash password with BCrypt
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                using (var cmd = new SqlCommand("sp_CreateUser", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Username", request.Username);
                    cmd.Parameters.AddWithValue("@PasswordHash", passwordHash);
                    cmd.Parameters.AddWithValue("@Role", "User"); // Always register as User

                    var newId = cmd.ExecuteScalar();
                    if (newId != null)
                    {
                        int userId = Convert.ToInt32(newId);
                        string token = GenerateJwtToken(userId, request.Username, "User");

                        return Ok(new AuthResponse
                        {
                            Token = token,
                            Username = request.Username,
                            Role = "User",
                            UserId = userId
                        });
                    }
                }
            }
            return BadRequest(new { message = "Registration failed." });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Username and password are required." });

            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("sp_GetUserByUsername", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Username", request.Username);
                    conn.Open();

                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            int userId = reader.GetInt32(reader.GetOrdinal("Id"));
                            string username = reader.GetString(reader.GetOrdinal("Username"));
                            string storedHash = reader.GetString(reader.GetOrdinal("PasswordHash"));
                            string role = reader.GetString(reader.GetOrdinal("Role"));

                            // Verify password with BCrypt
                            if (BCrypt.Net.BCrypt.Verify(request.Password, storedHash))
                            {
                                string token = GenerateJwtToken(userId, username, role);

                                return Ok(new AuthResponse
                                {
                                    Token = token,
                                    Username = username,
                                    Role = role,
                                    UserId = userId
                                });
                            }
                            else
                            {
                                return Unauthorized(new { message = "Invalid password." });
                            }
                        }
                        else
                        {
                            return Unauthorized(new { message = "User not found." });
                        }
                    }
                }
            }
        }

        [HttpPost("seed-admins")]
        public IActionResult SeedAdmins()
        {
            string adminPassword = "Admin@123";
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(adminPassword);
            
            var admins = new[] {
                new { Username = "lavanyav", Role = "Admin" },
                new { Username = "pradeep", Role = "Admin" }
            };

            using (var conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                foreach (var admin in admins)
                {
                    // Check if user exists
                    using (var checkCmd = new SqlCommand("SELECT COUNT(*) FROM Users WHERE Username = @Username", conn))
                    {
                        checkCmd.Parameters.AddWithValue("@Username", admin.Username);
                        int exists = (int)checkCmd.ExecuteScalar();

                        if (exists > 0)
                        {
                            // Update existing user's password and role
                            using (var updateCmd = new SqlCommand("UPDATE Users SET PasswordHash = @Hash, Role = @Role WHERE Username = @Username", conn))
                            {
                                updateCmd.Parameters.AddWithValue("@Hash", hashedPassword);
                                updateCmd.Parameters.AddWithValue("@Role", admin.Role);
                                updateCmd.Parameters.AddWithValue("@Username", admin.Username);
                                updateCmd.ExecuteNonQuery();
                            }
                        }
                        else
                        {
                            // Insert new admin user
                            using (var insertCmd = new SqlCommand("INSERT INTO Users (Username, PasswordHash, Role) VALUES (@Username, @Hash, @Role)", conn))
                            {
                                insertCmd.Parameters.AddWithValue("@Username", admin.Username);
                                insertCmd.Parameters.AddWithValue("@Hash", hashedPassword);
                                insertCmd.Parameters.AddWithValue("@Role", admin.Role);
                                insertCmd.ExecuteNonQuery();
                            }
                        }
                    }
                }
            }

            return Ok(new { message = "Admin users lavanyav and pradeep seeded with password: Admin@123" });
        }

        private string GenerateJwtToken(int userId, string username, string role)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"]
                ?? throw new InvalidOperationException("JWT SecretKey not configured.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role),
                new Claim("userId", userId.ToString()),
                new Claim("username", username),
                new Claim("role", role)
            };

            int expiryMinutes = int.Parse(jwtSettings["ExpiryInMinutes"] ?? "60");

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
