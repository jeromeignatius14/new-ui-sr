import { format, addDays, subDays, isBefore, isAfter } from "date-fns";

// interface DaySwitcherProps {
//   currentDate: Date;
//   onDateChange: (newDate: Date, direction: "prev" | "next") => void;
//   minDate: Date;
//   maxDate: Date;
// }

// export function DaySwitcher({
//   currentDate,
//   onDateChange,
//   minDate,
//   maxDate,
// }: DaySwitcherProps) {
//   const canGoPrev = !isBefore(currentDate, addDays(minDate, 1));
//   const canGoNext = !isAfter(currentDate, subDays(maxDate, 1));

//   const handleDateChange = (direction: "prev" | "next") => {
//     const newDate =
//       direction === "prev"
//         ? subDays(currentDate, 1)
//         : addDays(currentDate, 1);

//     if (
//       (direction === "prev" && !canGoPrev) ||
//       (direction === "next" && !canGoNext)
//     ) {
//       return;
//     }

//     onDateChange(newDate, direction);
//   };

//   return (
//     <div className="flex items-center justify-center">
//     <div className=" space-x-4 border border-gray-300 dark:border-gray-600 rounded w-fit p-1">
//       <button
//         onClick={() => handleDateChange("prev")}
//         disabled={!canGoPrev}
//         className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         Previous Day
//       </button>
//       <span className="text-sm font-medium text-black dark:text-black">
//         Date: {format(currentDate, "dd-MM-yyyy")}
//       </span>
//       <button
//         onClick={() => handleDateChange("next")}
//         disabled={!canGoNext}
//         className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         Next Day
//       </button>
//     </div>
//     </div>
//   );
// }


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
  const canGoPrev = !isBefore(currentDate, addDays(minDate, 1));
  const canGoNext = !isAfter(currentDate, subDays(maxDate, 1));

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate =
      direction === "prev"
        ? subDays(currentDate, 1)
        : addDays(currentDate, 1);

    if (
      (direction === "prev" && !canGoPrev) ||
      (direction === "next" && !canGoNext)
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
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous Day
        </button>
        <span className="text-sm font-medium text-black dark:text-black">
          Date: {format(currentDate, "dd-MM-yyyy")}
        </span>
        <button
          onClick={() => handleDateChange("next")}
          disabled={!canGoNext}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Day
        </button>
      </div>
    </div>
  );
}