using System;

namespace RecipeAPI.Models
{
    public class Recipe
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int CreatedBy { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? CookingTime { get; set; }
        public string Level { get; set; } = "Medium";
        public decimal Rating { get; set; }
        public string Status { get; set; } = "published";
        public string? Ingredients { get; set; }
        public string? Instructions { get; set; }
        public int Views { get; set; }
        public DateTime CreatedAt { get; set; }
        
        public string? Author { get; set; }
    }
}
