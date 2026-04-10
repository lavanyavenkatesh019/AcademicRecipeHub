using System;

namespace RecipeAPI.Models
{
    public class UserRating
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int RecipeId { get; set; }
        public decimal RatingValue { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
