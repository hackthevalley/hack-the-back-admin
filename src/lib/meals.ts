export interface Meal {
  id: string;
  day: string;
  meal_type: string;
  is_active: boolean;
  name: string;
}

const DAY_ORDER: Record<string, number> = { friday: 1, saturday: 2, sunday: 3 };
const MEAL_ORDER: Record<string, number> = {
  breakfast: 1,
  lunch: 2,
  dinner: 3,
  snack: 4,
};

export function dayNumber(day: string): number {
  return DAY_ORDER[day.toLowerCase()] ?? 0;
}

export function sortMeals(meals: Meal[]): Meal[] {
  return [...meals].sort((left, right) => {
    const dayDifference = dayNumber(left.day) - dayNumber(right.day);
    return (
      dayDifference ||
      (MEAL_ORDER[left.meal_type.toLowerCase()] ?? 0) -
        (MEAL_ORDER[right.meal_type.toLowerCase()] ?? 0)
    );
  });
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
