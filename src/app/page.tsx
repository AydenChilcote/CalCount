"use client";

import { useState, useEffect } from "react";

interface Food {
  title: string;
  calories: number;
}

interface DayData {
  date: string;
  total: number;
  foods: Food[];
}

interface Library {
  foods: Food[];
}

export default function Home() {
  const [dayData, setDayData] = useState<DayData>({
    date: "",
    total: 0,
    foods: [],
  });
  const [library, setLibrary] = useState<Library>({ foods: [] });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFood, setNewFood] = useState({ title: "", calories: "" });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const storedDayData = localStorage.getItem("dayData");
    const storedLibrary = localStorage.getItem("library");

    if (storedDayData) {
      const parsed: DayData = JSON.parse(storedDayData);
      if (parsed.date === today) {
        setDayData(parsed);
      } else {
        // Reset for new day
        setDayData({ date: today, total: 0, foods: [] });
      }
    } else {
      setDayData({ date: today, total: 0, foods: [] });
    }

    if (storedLibrary) {
      setLibrary(JSON.parse(storedLibrary));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dayData", JSON.stringify(dayData));
  }, [dayData]);

  useEffect(() => {
    localStorage.setItem("library", JSON.stringify(library));
  }, [library]);

  const addFood = () => {
    const calories = parseInt(newFood.calories);
    if (newFood.title && !isNaN(calories)) {
      const food: Food = { title: newFood.title, calories };
      setDayData((prev) => ({
        ...prev,
        total: prev.total + calories,
        foods: [...prev.foods, food],
      }));
      // Add to library if not exists
      setLibrary((prev) => {
        const exists = prev.foods.some(
          (f) => f.title === food.title && f.calories === food.calories,
        );
        if (!exists) {
          return { foods: [...prev.foods, food] };
        }
        return prev;
      });
      setNewFood({ title: "", calories: "" });
      setShowAddForm(false);
    }
  };

  const addFromLibrary = (food: Food) => {
    setDayData((prev) => ({
      ...prev,
      total: prev.total + food.calories,
      foods: [...prev.foods, food],
    }));
  };

  const removeFromToday = (title: string, calories: number) => {
    setDayData((prev) => {
      const index = prev.foods.findIndex(
        (food) => food.title === title && food.calories === calories,
      );
      if (index === -1) {
        return prev;
      }
      const updatedFoods = [...prev.foods];
      updatedFoods.splice(index, 1);
      return {
        ...prev,
        total: Math.max(prev.total - calories, 0),
        foods: updatedFoods,
      };
    });
  };

  const removeFromLibrary = (index: number) => {
    setLibrary((prev) => ({
      foods: prev.foods.filter((_, i) => i !== index),
    }));
  };

  const progressPercent = Math.min(dayData.total / 2000, 1);
  const circleRadius = 64;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progressPercent);
  const circleColor =
    dayData.total > 2000
      ? "#ef4444"
      : `hsl(${220 - 80 * progressPercent}, 90%, 57%)`;

  const groupedFoods = Object.values(
    dayData.foods.reduce(
      (acc, food) => {
        const key = `${food.title}|${food.calories}`;
        if (!acc[key]) {
          acc[key] = { ...food, count: 0 };
        }
        acc[key].count += 1;
        return acc;
      },
      {} as Record<string, Food & { count: number }>,
    ),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Calorie Tracker
        </h1>

        {/* Total Calories */}
        <div className="flex flex-col items-center justify-center mb-8 p-6 bg-white/10 rounded-3xl shadow-xl border border-white/80">
          <div className="relative mb-4">
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              className="rotate-[-90deg]"
            >
              <circle
                cx="90"
                cy="90"
                r={circleRadius}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="90"
                cy="90"
                r={circleRadius}
                stroke={circleColor}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={circleCircumference}
                strokeDashoffset={strokeDashoffset}
                fill="none"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold text-gray-900">
                {dayData.total}
              </span>
              <span className="text-sm text-gray-600">/ 2000 kcal</span>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700">
            {dayData.total > 2000
              ? `Over limit by ${dayData.total - 2000} kcal`
              : `${Math.round(progressPercent * 100)}% of daily target`}
          </div>
        </div>

        {/* Add Food Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-5 rounded-2xl mb-6 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-xl text-lg font-semibold"
        >
          ➕ Add Food
        </button>

        {/* Add Food Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-inner">
            <input
              type="text"
              placeholder="Food title"
              value={newFood.title}
              onChange={(e) =>
                setNewFood((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Calories"
              value={newFood.calories}
              onChange={(e) =>
                setNewFood((prev) => ({ ...prev, calories: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={addFood}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold text-base"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-400 text-white py-4 rounded-2xl hover:bg-gray-500 transition-all duration-200 font-semibold text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Today's Foods */}
        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b border-gray-200 pb-2">
          🍽️ Today's Foods
        </h2>
        <ul className="mb-8 space-y-2">
          {groupedFoods.length === 0 ? (
            <li className="text-gray-500 text-center py-4">
              No foods added today
            </li>
          ) : (
            groupedFoods.map((food, index) => (
              <li
                key={index}
                className="flex flex-col gap-3 justify-between py-4 px-5 bg-gray-50 rounded-2xl border border-gray-200 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="font-semibold text-gray-900 text-base">
                    {food.title}
                    {food.count > 1 && (
                      <span className="text-sm text-gray-500">
                        {" "}
                        [{food.count}]
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {food.calories} kcal each
                  </div>
                </div>
                <div className="flex flex-col items-stretch gap-3 sm:items-end">
                  <span className="text-gray-700 font-semibold text-base">
                    {food.calories * food.count} kcal
                  </span>
                  <button
                    onClick={() => removeFromToday(food.title, food.calories)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 bg-slate-200 rounded-2xl p-3 transition-colors duration-200 font-semibold text-sm"
                    title="Remove one instance"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* Food Library */}
        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b border-gray-200 pb-2">
          📚 Food Library
        </h2>
        <ul className="space-y-2">
          {library.foods.length === 0 ? (
            <li className="text-gray-500 text-center py-4">
              No foods in library
            </li>
          ) : (
            library.foods.map((food, index) => (
              <li
                key={index}
                className="flex flex-col gap-3 justify-between py-4 px-5 bg-gray-50 rounded-2xl border border-gray-200 sm:flex-row sm:items-center"
              >
                <span className="font-semibold text-gray-900 text-base">
                  {food.title} - {food.calories} kcal
                </span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={() => addFromLibrary(food)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-2xl text-base hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold"
                  >
                    ➕ Add
                  </button>
                  <button
                    onClick={() => removeFromLibrary(index)}
                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-3 rounded-2xl text-base hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-semibold"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
