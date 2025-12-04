/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/utils/auth";
import { useNavigate } from "react-router";
import NavMenu from "@/components/Navmenu";
import fetchInstance from "@/utils/api";
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

interface Meal {
  id: string;
  day: string;
  meal_type: string;
  is_active: boolean;
  name: string;
}

function Food() {
  const { isAuthenticated } = useContext(UserContext) ?? {};
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await fetchInstance("meals");
      setMeals(response);
    } catch (error: any) {
      toast.error(error.message || "Failed to load meals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMeals();
    }
  }, [isAuthenticated]);

  const toggleMealStatus = async (mealId: string, currentStatus: boolean) => {
    try {
      // If activating a meal, first deactivate all others
      if (!currentStatus) {
        const activeMeals = meals.filter((m) => m.is_active && m.id !== mealId);

        // Deactivate all currently active meals
        for (const meal of activeMeals) {
          await fetchInstance(`meals/${meal.id}`, {
            method: "PATCH",
            body: JSON.stringify({ is_active: false }),
          });
        }
      }

      // Now toggle the selected meal
      await fetchInstance(`meals/${mealId}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      toast.success(`Meal ${!currentStatus ? "activated" : "deactivated"}`);

      // Refresh meals list
      await fetchMeals();
    } catch (error: any) {
      toast.error(error.message || "Failed to update meal");
    }
  };

  const getDayNumber = (day: string): number => {
    const dayMap: Record<string, number> = {
      friday: 1,
      saturday: 2,
      sunday: 3,
    };
    return dayMap[day.toLowerCase()] || 0;
  };

  const formatMealType = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDay = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <div className="flex h-screen gap-16">
      <NavMenu />
      <div className="flex-1 p-8 overflow-auto">
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
                  {meals
                    .sort((a, b) => {
                      const dayDiff = getDayNumber(a.day) - getDayNumber(b.day);
                      if (dayDiff !== 0) return dayDiff;

                      const mealOrder: Record<string, number> = {
                        breakfast: 1,
                        lunch: 2,
                        dinner: 3,
                        snack: 4,
                      };
                      return (
                        (mealOrder[a.meal_type.toLowerCase()] || 0) -
                        (mealOrder[b.meal_type.toLowerCase()] || 0)
                      );
                    })
                    .map((meal) => (
                      <TableRow key={meal.id}>
                        <TableCell className="font-medium">
                          Day {getDayNumber(meal.day)} - {formatDay(meal.day)}
                        </TableCell>
                        <TableCell>{formatMealType(meal.meal_type)}</TableCell>
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
      </div>
    </div>
  );
}

export default Food;
