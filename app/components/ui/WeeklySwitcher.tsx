import { format, endOfWeek, startOfWeek, Day } from "date-fns";

interface PeriodSwitcherProps {
  currentWeekStart: Date;
  onWeekChange: (direction: "prev" | "next") => void;
  isUrgentMode?: boolean;
  weekStartsOn?: Day;
}

export function WeeklySwitcher({
  currentWeekStart,
  onWeekChange,
  isUrgentMode = false,
  weekStartsOn = 1 as Day,
}: PeriodSwitcherProps) {
  const formatDateRange = () => {
    if (isUrgentMode) {
      return format(currentWeekStart, "dd-MM-yyyy");
    }
    const weekStart = startOfWeek(currentWeekStart, { weekStartsOn });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn });
    return `${format(weekStart, "dd-MM-yyyy")} to ${format(weekEnd, "dd-MM-yyyy")}`;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onWeekChange("prev")}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
      >
        Previous {isUrgentMode ? "Day" : "Week"}
      </button>
      <span className="text-sm font-medium text-black dark:text-black">
        {isUrgentMode ? "Date: " : "Week: "}
        {formatDateRange()}
      </span>
      <button
        onClick={() => onWeekChange("next")}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
      >
        Next {isUrgentMode ? "Day" : "Week"}
      </button>
    </div>
  );
}
