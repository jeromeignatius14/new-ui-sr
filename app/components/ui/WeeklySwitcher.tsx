import { format, endOfWeek, startOfWeek, Day } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const formatDateRange = () => {
    if (isUrgentMode) {
      return format(currentWeekStart, "dd-MM-yyyy");
    }
    // In non-urgent mode, ensure we're using the start of the week
    const weekStart = startOfWeek(currentWeekStart, { weekStartsOn });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn });
    return `${format(weekStart, "dd-MM-yyyy")} to ${format(weekEnd, "dd-MM-yyyy")}`;
  };

  const handleWeekChange = (direction: "prev" | "next") => {
    // Update URL with new date
    const newDate = direction === "prev"
      ? new Date(currentWeekStart.getTime() - (isUrgentMode ? 24 : 7 * 24) * 60 * 60 * 1000)
      : new Date(currentWeekStart.getTime() + (isUrgentMode ? 24 : 7 * 24) * 60 * 60 * 1000);

    const params = new URLSearchParams(searchParams.toString());
    params.set('date', format(newDate, 'yyyy-MM-dd'));

    // Update URL without refreshing the page
    router.push(`?${params.toString()}`, { scroll: false });

    // Call the original onWeekChange
    onWeekChange(direction);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleWeekChange("prev")}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
      >
        Previous {isUrgentMode ? "Day" : "Week"}
      </button>
      <span className="text-sm font-medium text-black dark:text-black">
        {isUrgentMode ? "Date: " : "Week: "}
        {formatDateRange()}
      </span>
      <button
        onClick={() => handleWeekChange("next")}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
      >
        Next {isUrgentMode ? "Day" : "Week"}
      </button>
    </div>
  );
}