import { useEffect, useState } from "react";
import { getMeals, updateMeal } from "@/api/admin";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dayNumber, sortMeals, titleCase, type Meal } from "@/lib/meals";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error";
}

function Food() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await getMeals<Meal[]>();
      setMeals(response);
    } catch (error: unknown) {
      toast.error(errorMessage(error) || "Failed to load meals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMeals();
  }, []);

  const toggleMealStatus = async (mealId: string, currentStatus: boolean) => {
    try {
      // If activating a meal, first deactivate all others
      if (!currentStatus) {
        const activeMeals = meals.filter((m) => m.is_active && m.id !== mealId);

        // Deactivate all currently active meals
        for (const meal of activeMeals) {
          await updateMeal(meal.id, false);
        }
      }

      // Now toggle the selected meal
      await updateMeal(mealId, !currentStatus);

      toast.success(`Meal ${!currentStatus ? "activated" : "deactivated"}`);

      // Refresh meals list
      await fetchMeals();
    } catch (error: unknown) {
      toast.error(errorMessage(error) || "Failed to update meal");
    }
  };

  return (
    <main className="min-w-0 flex-1 p-8 overflow-auto">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Food Management</h1>
        <p className="text-muted-foreground mb-6">
          Manage which meal is currently being served. Activating a new meal
          will automatically deactivate any previously active meal.
        </p>

        {loading ? (
          <div className="text-center py-8">Loading meals...</div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortMeals(meals).map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell className="font-medium">
                      Day {dayNumber(meal.day)} - {titleCase(meal.day)}
                    </TableCell>
                    <TableCell>{titleCase(meal.meal_type)}</TableCell>
                    <TableCell>
                      {meal.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={meal.is_active ? "outline" : "default"}
                        size="sm"
                        onClick={() =>
                          toggleMealStatus(meal.id, meal.is_active)
                        }
                      >
                        {meal.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </main>
  );
}

export default Food;
