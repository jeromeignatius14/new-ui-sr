import { format, addDays, subDays, isBefore, isAfter, isSameDay, startOfWeek, endOfWeek, weeksToDays } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

interface DaySwitcherProps {
  currentDate: Date;
  onDateChange: (newDate: Date, direction: "prev" | "next") => void;
  minDate: Date;
  maxDate: Date;
  storageKey?: string; // Add a storageKey prop
}

export function DaySwitcher({
  currentDate,
  onDateChange,
  minDate,
  maxDate,
  storageKey = "selectedDate", // Default key
}: DaySwitcherProps) {

  // Ensure minDate is the start of the week (Monday)
  const weekStart = startOfWeek(minDate, { weekStartsOn: 1 });
  // Ensure maxDate is the end of the week (Sunday)
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const canGoPrev = currentDate > minDate && !isSameDay(currentDate, minDate);
  const canGoNext = !isSameDay(currentDate, maxDate) && currentDate < maxDate;

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate =
      direction === "prev"
        ? subDays(currentDate, 1)
        : addDays(currentDate, 1);

    // Make sure we stay within the current week boundaries
    if (
      (direction === "prev" && newDate < weekStart) ||
      (direction === "next" && newDate > weekEnd)
    ) {
      return;
    }

    // Save to localStorage when date changes
    if (storageKey) {
      localStorage.setItem(storageKey, newDate.toISOString());
    }

    onDateChange(newDate, direction);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="space-x-4 border border-gray-300 dark:border-gray-600 rounded w-fit p-1">
        <button
          onClick={() => handleDateChange("prev")}
          disabled={!canGoPrev}
          className={`px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded ${!canGoPrev
            ? "opacity-40 bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
            : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
        >
          Previous Day
        </button>
        <span className="text-sm font-medium text-black dark:text-black">
          Date: {format(currentDate, "dd-MM-yyyy")}
        </span>
        <button
          onClick={() => handleDateChange("next")}
          disabled={!canGoNext}
          className={`px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded ${!canGoNext
            ? "opacity-40 bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
            : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
        >
          Next Day
        </button>
      </div>
    </div>
  );
}