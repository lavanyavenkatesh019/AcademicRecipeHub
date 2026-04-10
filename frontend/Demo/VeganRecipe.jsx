import React, { useState } from "react";

const veganRecipes = [
  {
    id: 1,
    name: "Vegan Buddha Bowl",
    image:
      "https://elavegan.com/wp-content/uploads/2021/05/vegan-buddha-bowl-with-chickpeas-avocado-colorful-veggies-and-green-dressing-on-the-side.jpg",
      
    time: "25 mins",
    ingredients: ["Quinoa", "Chickpeas", "Avocado", "Spinach", "Olive Oil"],
    steps: [
      "Cook quinoa",
      "Roast chickpeas",
      "Chop vegetables",
      "Mix everything in a bowl",
      "Serve fresh",
    ],
  },
  {
    id: 2,
    name: "Tofu Stir Fry",
    image:
      "https://tse1.mm.bing.net/th/id/OIP.8PjEu8U-Sw72jUFsw6CMTQHaK_?rs=1&pid=ImgDetMain&o=7&rm=3",
    time: "20 mins",
    ingredients: ["Tofu", "Bell peppers", "Soy sauce", "Garlic", "Ginger"],
    steps: [
      "Cut tofu into cubes",
      "Stir fry vegetables",
      "Add tofu & sauce",
      "Cook for 5 minutes",
    ],
  },
  
  {
    id: 3,
    name: "Vegan Lentil Curry",
    image:
      "https://tse3.mm.bing.net/th/id/OIP.JBW-YWUeATx1wiQDcAZ-OAHaLG?rs=1&pid=ImgDetMain&o=7&rm=3",
    time: "30 mins",
    ingredients: ["Red lentils", "Onion", "Tomato", "Garlic", "Curry powder"],
    steps: [
      "Rinse lentils",
      "Sauté onion and garlic",
      "Add tomatoes and spices",
      "Cook lentils until soft",
      "Serve hot",
    ],
  },
  {
    id: 4,
    name: "Avocado Toast",
    image:
      "https://tse1.explicit.bing.net/th/id/OIP.R8Suh3Z4LxZoBorM7nbQcwHaKX?rs=1&pid=ImgDetMain&o=7&rm=3",
    time: "10 mins",
    ingredients: ["Bread", "Avocado", "Lemon juice", "Salt", "Chili flakes"],
    steps: [
      "Toast the bread",
      "Mash avocado with lemon and salt",
      "Spread on toast",
      "Sprinkle chili flakes",
      "Serve immediately",
    ],
  },
  {
    id: 5,
    name: "Vegan Pasta Primavera",
    image:
      "https://tse4.mm.bing.net/th/id/OIP.If9Qy3T0PCQeHiFni9U8pQHaLM?rs=1&pid=ImgDetMain&o=7&rm=3",
    time: "25 mins",
    ingredients: ["Pasta", "Broccoli", "Bell peppers", "Garlic", "Olive oil"],
    steps: [
      "Cook pasta",
      "Sauté vegetables",
      "Add garlic and olive oil",
      "Mix with pasta",
      "Serve warm",
    ],
  },
  {
    id: 6,
    name: "Chickpea Salad",
    image:
      "https://natashaskitchen.com/wp-content/uploads/2019/02/Avocado-Chickpea-Salad-5.jpg",
    time: "15 mins",
    ingredients: ["Chickpeas", "Cucumber", "Tomato", "Onion", "Lemon juice"],
    steps: [
      "Rinse chickpeas",
      "Chop vegetables",
      "Mix everything",
      "Add lemon juice and salt",
      "Serve fresh",
    ],
  },
];

function VeganRecipes() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const closeModal = () => setSelectedRecipe(null);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-4xl font-bold text-center text-green-700 mb-8">
         Vegan Recipes
      </h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {veganRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="relative bg-white rounded-2xl shadow-lg hover:scale-105 hover:shadow-xl transition duration-300"
          >
            <button
                className="absolute top-3 right-3 z-10 p-2  border-black"
                onClick={() =>
                    setFavorites((prev) =>
                    prev.includes(recipe.id)
                        ? prev.filter((id) => id !== recipe.id)
                        : [...prev, recipe.id]
                    )
                }
                >
                <span
                    className={`text-4xl transition ${
                    favorites.includes(recipe.id)
                        ? "text-red-500"
                        : "text-white"
                    }`}
                    style={{
                        WebkitTextStroke: "1.5px black",
                    }}
                >
                    
                </span>
            </button>

            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-48 object-cover rounded-t-2xl"
            />

            <div className="p-5">
              <div className="flex">
                <h2 className="text-2xl font-semibold text-gray-800">
                    {recipe.name}
                </h2>
                <div className="flex justify-between items-center px-5 pt-3">
                    
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/90 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full shadow">
                        ⏱ {recipe.time}
                    </span>
                </div>
              </div>
              {/* Open Recipe Button */}
              <button
                onClick={() => setSelectedRecipe(recipe)}
                className="mt-3 w-full bg-orange-700 text-white py-2 rounded-xl hover:bg-orange-600 transition"
              >
                Open Recipe 📖
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              &times;
            </button>

            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.name}
              className="w-full h-64 object-cover rounded-xl mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {selectedRecipe.name}
            </h2>
            <p className="text-gray-500 mb-4">⏱ {selectedRecipe.time}</p>

            <h3 className="font-semibold text-green-600 mb-1">Ingredients</h3>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              {selectedRecipe.ingredients.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3 className="font-semibold text-green-600 mb-1">Steps</h3>
            <ol className="list-decimal list-inside text-gray-600 mb-4">
              {selectedRecipe.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>

            <div className="flex gap-4 mt-4">
              <button
                onClick={closeModal}
                className="flex-1 bg-orange-700 text-white py-2 rounded-xl hover:bg-orange-600 transition"
              >
                Back 🔙
              </button>
              <button className="flex-1 bg-orange-700 text-white py-2 rounded-xl hover:bg-orange-600 transition">
                Save Now 🍽️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VeganRecipes;