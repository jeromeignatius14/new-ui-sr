
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/app/service/api/admin";
import { useAcceptUserRequest } from "@/app/service/mutation/admin";
import {
  format,
  parseISO,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserRequest } from "@/app/service/api/manager";
import { useOptimizeRequests } from "@/app/service/query/optimise";
import { flattenRecords } from "@/app/lib/optimse";
import { WeeklySwitcher } from "@/app/components/ui/WeeklySwitcher";
import { useUrgentMode } from "@/app/context/UrgentModeContext";
import { DaySwitcher } from "@/app/components/ui/DaySwitcher";
import dayjs from "dayjs";

// Data structure for dynamic filters
const workType = {
  'S&T': ['Gear'],
  'ENGG': ['Machine', 'Non-Machine'],
  'TRD': ['Tw', 'Lt'],
};

const trdActivities = ['AOH', 'POH', 'IOH', 'RE POH', 'RD WORK', 'TURN OUT CHECKING', 'CROSS OVER CHECKING', 'CROSS TRACK FEEDERS CHECKING', 'GANTRY MAINTENANCE', 'CONTACT WIRE RENEWAL WORK', 'CATENARY WIRE RENEWAL WORK', 'CANTILEVER ERECTION/REPLACEMENT(2x25KV WORK)', 'MAST ERECTION(2x25KV WORK)', 'FEEDERS ERECTION(2x25KV WORK)', 'OHE PROFILING', 'OHE/CN WORK', 'OTHER SPECIAL WORKS'];

const Activity = {
  'Gear': ['Point', 'EI', 'Signal', 'DC Track', 'AFTC', 'SSDAC', 'MSDAC', 'Panel', 'LC Gate Mechanical', 'LC Gate ELB', 'Emergency Sliding Boom', 'IPS', 'Conventional power supply equipment', 'System Integrity Test of each PI/EI/RRI stations', 'Cable Insulation testing (cable meggering) for one station.', 'DLBI- SGE', 'TLBI-FM Inst', 'UFSBI', 'Fuse', 'EKT'],
  'Tw': trdActivities,
  'Lt': trdActivities,
  'Machine': ['BCM', 'DTE', 'CSM', 'DUOMAT', 'UNIMAT', 'MPT', 'BRM', 'TRT', 'UTV', 'DTS', 'T28', 'SQRS', 'RGM working', 'SBCM'],
  'Non-Machine': ['Rail renewal', 'Welding work', 'Destressing work', 'Switch renewal', 'CMS Crossing renewal', 'SEJ Renewal', 'Glued Joint renewal', 'Dummy Glued Joint removal', 'TRR P 60 Kg', 'TRR S 60 Kg', 'TRR S 60 kg', 'TRR S 52 kg', 'Interchanging', 'Trucking out/Shifting materials', 'TWR with MFBW', 'TBTR (Br sleeper renewal)', 'TSR P 60 Kg', 'TSR S 60 Kg', 'TSR S 52 Kg', 'TTSR work', 'Jt Insp Notes Attn', 'Stretcherbar renewal', 'TFR Work', 'Ballast Unloading', 'Rail unloading', 'Lifting and packing', 'Gauge tie plate renewal', 'Sleeper renewal', 'Fish Plates O&E', 'Preliminary/Post works', 'Trucking out materials', 'Cutting Widening work', 'JCB working', 'Earth work/Muck removal', 'Crane Moving/Working', 'Attention to Track', 'Attention to Fittings', 'Attention to Bridge', 'Attention to Guard rail', 'Attention to Points & Xing', 'Attention to LC', 'Attention to Curve check rail', 'Sheet Piling work', 'Platform work', 'Platform Shelter work', 'ABSS work', 'Erection of Platform shelter purlins work', 'Erection of FOB Girders', 'Other FOB works', 'Other Track works', 'Other Bridge work'],
};

const getActivitiesForWorkType = (workTypeSelected: string): string[] => {
  if (workTypeSelected === 'ALL') return ['ALL'];
  return ['ALL', ...(Activity[workTypeSelected as keyof typeof Activity] || [])];
};

// Helper function to get activities based on department
const getActivitiesForDepartment = (dept: string): string[] => {
  if (dept === 'ALL') return ['ALL', ...Object.values(Activity).flat()];
  const workTypes = workType[dept as keyof typeof workType] || [];
  return ['ALL', ...workTypes.flatMap(type => Activity[type as keyof typeof Activity] || [])];
};

// Header icons for tables
const HeaderIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "id":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.5 9.5A2.5 2.5 0 018 12V8.5H5.5v1zm0 0V8.5H8V12a2.5 2.5 0 01-2.5-2.5zM12 12v-1.5h-1.5V12H12zm-1.5-3V12H12V9h-1.5zm3.5.5v1h1.5V8h-5v1.5h2V12h1.5V9.5h1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "date":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "section":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "time":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "work":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      );
    case "action":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      );
    case "line":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
};

// Column header component
const ColumnHeader = ({
  icon,
  title,
  showFilter = false,
}: {
  icon: string;
  title: string;
  showFilter?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <HeaderIcon type={icon} />
        <span>{title}</span>
      </div>
    </div>
  );
};

// Helper to get line/road display for a request
const getLineOrRoad = (request: UserRequest) => {
  if (
    request.processedLineSections &&
    Array.isArray(request.processedLineSections) &&
    request.processedLineSections.length > 0
  ) {
    return (
      request.processedLineSections
        .map((section) => {
          if (section.type === "yard") {
            if (section.stream && section.road) {
              return `${section.stream}/${section.road}`;
            }
            if (section.stream) {
              return section.stream;
            }
            if (section.road) {
              return section.road;
            }
          } else if (section.lineName) {
            return section.lineName;
          }
          return null;
        })
        .filter(Boolean)
        .join(", ") || "N/A"
    );
  }
  return "N/A";
};

// Add this helper function before the handleDownloadCSV function
const getAdjacentLinesAffected = (request: UserRequest): string => {
  if (request.adjacentLinesAffected) {
    return request.adjacentLinesAffected;
  }

  if (request.processedLineSections) {
    const affectedLines = request.processedLineSections
      .map((section) => {
        if (section.type === "yard") {
          return section.otherRoads;
        }
        return section.otherLines;
      })
      .filter(Boolean)
      .join(", ");

    return affectedLines || "N/A";
  }

  return "N/A";
};

// amazonq-ignore-next-line
export default function OptimiseTablePage() {
  const router = useRouter();

  const acceptMutation = useAcceptUserRequest();
  const searchParams = useSearchParams();
  const { isUrgentMode } = useUrgentMode();
  const queryClient = useQueryClient();

// Initialize currentWeekStart from URL parameter or default to current date
const [currentWeekStart, setCurrentWeekStart] = useState(() => {
  const dateParam = searchParams.get("date");
  if (dateParam) {
    const parsedDate = new Date(dateParam);
    if (!isNaN(parsedDate.getTime())) {
      return startOfWeek(parsedDate, { weekStartsOn: 1 });
    }
  }
  // Always return the current week's Monday
  return startOfWeek(new Date(), { weekStartsOn: 1 });
});

// Add this effect to synchronize week start properly
useEffect(() => {
  const dateParam = searchParams.get("date");
  if (!dateParam) {
    // If no date parameter, ensure we're using current week
    const currentWeekMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
    setCurrentWeekStart(currentWeekMonday);
  } else {
    // If date parameter exists, ensure it's properly set as week start
    const parsedDate = new Date(dateParam);
    if (!isNaN(parsedDate.getTime())) {
      setCurrentWeekStart(startOfWeek(parsedDate, { weekStartsOn: 1 }));
    }
  }
}, [searchParams]);
useEffect(() => {
  const params = new URLSearchParams();
  params.set("date", format(currentWeekStart, "yyyy-MM-dd"));
  router.push(`?${params.toString()}`, { scroll: false });
}, [currentWeekStart, router]);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [showDateValidationAlert, setShowDateValidationAlert] = useState(false);
  const [deptFilter, setDeptFilter] = useState<string>(() => {
    const deptParam = searchParams.get("dept");
    // Check if deptParam exists and matches one of our department options
    return deptParam && ['ENGG', 'S&T', 'TRD'].includes(decodeURIComponent(deptParam)) ? decodeURIComponent(deptParam) : 'ALL';
  });
  const [workTypeFilter, setWorkTypeFilter] = useState<string>('ALL');
  const [activityFilter, setActivityFilter] = useState<string>('ALL');
  const [timeSlotFilter, setTimeSlotFilter] = useState<string>('ALL');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showWorkTypeDropdown, setShowWorkTypeDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [showTimeSlotDropdown, setShowTimeSlotDropdown] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [draftRemark, setDraftRemark] = useState("");
  const [selectedRequests, setSelectedRequests] = useState<UserRequest[]>([]);
  const [selectedRequestsForOptimization, setSelectedRequestsForOptimization] = useState<Set<string>>(new Set());
  const [isSanctionModalOpen, setIsSanctionModalOpen] = useState(false);
const [sanctionRemark, setSanctionRemark] = useState("");
const [selectedRequestsForSanction, setSelectedRequestsForSanction] = useState<UserRequest[]>([]);
  // Update URL when deptFilter changes
  useEffect(() => {
    // Only update URL if dept filter changes to something other than ALL
    if (deptFilter !== 'ALL') {
      const params = new URLSearchParams(searchParams.toString());
      params.set("dept", encodeURIComponent(deptFilter));
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [deptFilter, router, searchParams]);

  // Helper function to check if request matches time slot
  const matchesTimeSlot = (request: UserRequest): boolean => {
    if (timeSlotFilter === 'ALL') return true;
    const demandTime = new Date(request.demandTimeFrom);
    const hour = demandTime.getUTCHours();

    switch (timeSlotFilter) {
      case 'Morning': return hour >= 4 && hour < 12;
      case 'Afternoon': return hour >= 12 && hour < 20;
      case 'Night': return hour >= 20 || hour < 4;
      default: return true;
    }
  };

  // Helper function to check if request matches work type
  const matchesWorkType = (request: UserRequest): boolean => {
    if (workTypeFilter === 'ALL') return true;
    const deptWorkTypes = workType[request.selectedDepartment as keyof typeof workType] || [];
    return deptWorkTypes.includes(workTypeFilter);
  };

  const matchesActivity = (request: UserRequest): boolean => {
    if (activityFilter === 'ALL') return true;
    if (!request.activity) return false;
    return request.activity.trim() === activityFilter.trim();
  };


// Add these functions with your other handlers
const handleSelectRequest = (requestId: string) => {
  setSelectedRequestsForOptimization(prev => {
    const newSet = new Set(prev);
    if (newSet.has(requestId)) {
      newSet.delete(requestId);
    } else {
      newSet.add(requestId);
    }
    return newSet;
  });
};

const handleSelectAllUrgent = () => {
  const urgentRequests = urgentRequestsFiltered.filter((request: UserRequest) => {
    const requestDate = typeof request.date === "string" ? parseISO(request.date) : request.date;
    return isSameDay(requestDate, selectedDate) && (request.Draft === false);
  });
  
  if (selectedRequestsForOptimization.size === urgentRequests.length) {
    // If all are selected, deselect all
    setSelectedRequestsForOptimization(new Set());
  } else {
    // Select all urgent requests
    setSelectedRequestsForOptimization(new Set(urgentRequests.map((req: { id: any; }) => req.id)));
  }
};

const handleSelectAllCorridor = () => {
  const corridorRequests = corridorRequestsFiltered.filter((request: UserRequest) => request.Draft === false);
  
  if (selectedRequestsForOptimization.size === corridorRequests.length) {
    // If all are selected, deselect all
    setSelectedRequestsForOptimization(new Set());
  } else {
    // Select all corridor requests
    setSelectedRequestsForOptimization(new Set(corridorRequests.map((req: { id: any; }) => req.id)));
  }
};

const isRequestSelected = (requestId: string) => {
  return selectedRequestsForOptimization.has(requestId);
};

// Use the helper function for consistent week boundaries
const getWeekBoundaries = (date: Date) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  return { weekStart, weekEnd };
};

// For urgent mode, use the same day for start and end
// For non-urgent mode, use Monday to Sunday
const { weekStart, weekEnd } = getWeekBoundaries(currentWeekStart);
const finalWeekStart = isUrgentMode ? currentWeekStart : weekStart;
const finalWeekEnd = isUrgentMode ? currentWeekStart : weekEnd;
  // Fetch approved requests data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["approved-requests", currentWeekStart, isUrgentMode],
    queryFn: () =>
      adminService.getApprovedRequests(
        format(finalWeekStart, "yyyy-MM-dd"),
        format(finalWeekEnd, "yyyy-MM-dd"),
        5000
      ),
  });

  const handleRejectClick = (requestId: string) => {
    setCurrentRequestId(requestId);
    setShowRejectionModal(true);
  };
  const handleRequestAction = async (
    requestId: string,
    accept: boolean,
    remark?: string
  ) => {
    if (accept || confirm("Are you sure you want to reject this request?")) {
      try {
        await acceptMutation.mutateAsync({
          id: requestId,
          accept: false,
          remark,
        });
        alert(`Request ${accept ? "accepted" : "rejected"} successfully`);
        setShowRejectionModal(false);
        setRejectionReason("");
      } catch (error) {
        console.error("Failed to process request:", error);
        alert("Failed to process request. Please try again.");
      }
    }
  };
  const filteredRequests = data?.data?.requests?.filter((request: UserRequest) => {
      return isUrgentMode
        ? request.corridorType === "Urgent Block" || request.workType === "EMERGENCY"
        : request.corridorType !== "Urgent Block" && request.workType !== "EMERGENCY";
    }) || [];



  const UrgentRequests =
    data?.data?.requests?.filter((request: UserRequest) => {
      return request.corridorType === "Urgent Block" && request.overAllStatus === "with optg.";
    }) || [];

  const isValidDate = (date: unknown): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  // In your component
  const { minDate, maxDate } = UrgentRequests.reduce(
    (
      acc: { minDate: Date | null; maxDate: Date | null },
      request: UserRequest
    ) => {
      try {
        const requestDate =
          typeof request.date === "string"
            ? parseISO(request.date)
            : new Date(request.date);

        if (!isValidDate(requestDate)) return acc;

        if (!acc.minDate || requestDate < acc.minDate) {
          acc.minDate = requestDate;
        }
        if (!acc.maxDate || requestDate > acc.maxDate) {
          acc.maxDate = requestDate;
        }
      } catch (error) {
        console.error("Error processing request date:", error);
      }
      return acc;
    },
    { minDate: null, maxDate: null }
  );


const [selectedDate, setSelectedDate] = useState<Date>(() => {
  // Try to get saved date from localStorage
  const savedDate = localStorage.getItem("urgentSelectedDate");
  if (savedDate) {
    const parsedDate = new Date(savedDate);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  // Fallback to current date (today)
  return new Date();
});


  // --- Custom: Only show requests that are pending with me, not sanctioned, and after today ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);


  const pendingRequests = (data?.data?.requests || []).filter((request: UserRequest) => {
     if (!request.status || request.status.toUpperCase() !== "APPROVED") return false;
  if (request.isSanctioned) return false;
  if (!request.date) return false;
  const reqDate = new Date(request.date);
  reqDate.setHours(0, 0, 0, 0);

  // Include requests for today and future dates
  return reqDate >= today
  });




const urgentRequestsFiltered = pendingRequests
  .filter((r: UserRequest) => {
    // First check if it's an urgent request
    const isUrgent = r.corridorType === "Urgent Block" || r.workType === "EMERGENCY";
    if (!isUrgent) return false;

    // Global filters
    if (deptFilter !== 'ALL' && r.selectedDepartment !== deptFilter) return false;
    if (!matchesWorkType(r)) return false;
    if (!matchesActivity(r)) return false;
    if (!matchesTimeSlot(r)) return false;

    // Handle cases where all three flags are true
    if (r.powerBlockRequired && r.sntDisconnectionRequired && r.enggDisconnectionsRequired) {
      return ((r.trdActionsNeeded && r.sigActionsNeeded) || 
             (r.allTrdAcceptance === "ACCEPTED" && r.allSntAcceptance === "ACCEPTED" && r.allEnggAcceptance === "ACCEPTED"));
    }

    // Handle powerBlockRequired case
    if (r.powerBlockRequired&&((r.enggDisconnectionsRequired===true&&r.allEnggAcceptance === "ACCEPTED")||(r.enggDisconnectionsRequired===false))&&((r.sntDisconnectionRequired===true&&r.allSntAcceptance === "ACCEPTED")||(r.sntDisconnectionRequired===false))) {
      return r.trdActionsNeeded || r.allTrdAcceptance === "ACCEPTED";
    }

    // Handle enggDisconnectionsRequired case
    if (r.enggDisconnectionsRequired&&((r.powerBlockRequired===true&&r.allTrdAcceptance === "ACCEPTED")||(r.powerBlockRequired===false))&&((r.sntDisconnectionRequired===true&&r.allSntAcceptance === "ACCEPTED")||(r.sntDisconnectionRequired===false))) {
      return r.allEnggAcceptance === "ACCEPTED";
    }

    // Handle sntDisconnectionRequired case
    if (r.sntDisconnectionRequired&&((r.powerBlockRequired===true&&r.allTrdAcceptance === "ACCEPTED")||(r.powerBlockRequired===false))&&((r.enggDisconnectionsRequired===true&&r.allEnggAcceptance === "ACCEPTED")||(r.enggDisconnectionsRequired===false))) {
      return r.sigActionsNeeded || r.allSntAcceptance === "ACCEPTED";
    }

    // If neither special flag is true, just return the urgent status
    return true;
  })
  .sort((a: UserRequest, b: UserRequest) => new Date(a.date).getTime() - new Date(b.date).getTime());




  const corridorRequestsFiltered = pendingRequests
  .filter((r: UserRequest) => {
    // First check if it's a corridor request
    const isCorridor = r.corridorType === "Corridor" || r.corridorType === "Corridor Block";
    if (!isCorridor) return false;

    // Global filters
    if (deptFilter !== 'ALL' && r.selectedDepartment !== deptFilter) return false;
    if (!matchesWorkType(r)) return false;
    if (!matchesActivity(r)) return false;
    if (!matchesTimeSlot(r)) return false;

    const hasOtherLines = r.processedLineSections?.some((section: any) => 
      section.otherLines && section.otherLines.trim() !== ''
    );
    if (hasOtherLines) return false;

    const allSntAcceptance = r.allSntAcceptance === "ACCEPTED";
    const allTrdAcceptance = r.allTrdAcceptance === "ACCEPTED";
    const allEnggAcceptance = r.allEnggAcceptance === "ACCEPTED";

    // Handle cases where all three flags are true - FIXED PARENTHESES
    if (r.powerBlockRequired && r.sntDisconnectionRequired && r.enggDisconnectionsRequired) {
      return (r.trdActionsNeeded && r.sigActionsNeeded) || (allTrdAcceptance && allSntAcceptance && allEnggAcceptance);
    }

    // // Handle powerBlockRequired case
    // if (r.powerBlockRequired) {
    //   return r.trdActionsNeeded || allTrdAcceptance;
    // }

    // // Handle enggDisconnectionsRequired case
    // if (r.enggDisconnectionsRequired) {
    //   return allEnggAcceptance;
    // }

    // // Handle sntDisconnectionRequired case
    // if (r.sntDisconnectionRequired) {
    //   return r.sigActionsNeeded || allSntAcceptance;
    // }
    if (r.powerBlockRequired&&((r.enggDisconnectionsRequired===true&&r.allEnggAcceptance === "ACCEPTED")||(r.enggDisconnectionsRequired===false))&&((r.sntDisconnectionRequired===true&&r.allSntAcceptance === "ACCEPTED")||(r.sntDisconnectionRequired===false))) {
      return r.trdActionsNeeded || r.allTrdAcceptance === "ACCEPTED";
    }

    // Handle enggDisconnectionsRequired case
    if (r.enggDisconnectionsRequired&&((r.powerBlockRequired===true&&r.allTrdAcceptance === "ACCEPTED")||(r.powerBlockRequired===false))&&((r.sntDisconnectionRequired===true&&r.allSntAcceptance === "ACCEPTED")||(r.sntDisconnectionRequired===false))) {
      return r.allEnggAcceptance === "ACCEPTED";
    }

    // Handle sntDisconnectionRequired case
    if (r.sntDisconnectionRequired&&((r.powerBlockRequired===true&&r.allTrdAcceptance === "ACCEPTED")||(r.powerBlockRequired===false))&&((r.enggDisconnectionsRequired===true&&r.allEnggAcceptance === "ACCEPTED")||(r.enggDisconnectionsRequired===false))) {
      return r.sigActionsNeeded || r.allSntAcceptance === "ACCEPTED";
    }
    // If neither special flag is true, just return the status
    return true;
  })
  .sort((a: UserRequest, b: UserRequest) => new Date(a.date).getTime() - new Date(b.date).getTime());

const nonCorridorRequestsFiltered = pendingRequests
  .filter((r: UserRequest) => {
    // First check if it's a non-corridor request
    const isNoncorridor = r.corridorType === "Outside Corridor" || r.corridorType === "Non-Corridor Block";
    if (!isNoncorridor) return false;

    // Global filters
    if (deptFilter !== 'ALL' && r.selectedDepartment !== deptFilter) return false;
    if (!matchesWorkType(r)) return false;
    if (!matchesActivity(r)) return false;
    if (!matchesTimeSlot(r)) return false;

    const hasOtherLines = r.processedLineSections?.some((section: any) => 
      section.otherLines && section.otherLines.trim() !== ''
    );
    if (hasOtherLines) return false;

    const allSntAcceptance = r.allSntAcceptance === "ACCEPTED";
    const allTrdAcceptance = r.allTrdAcceptance === "ACCEPTED";
    const allEnggAcceptance = r.allEnggAcceptance === "ACCEPTED";

    // Handle cases where all three flags are true - FIXED PARENTHESES
    if (r.powerBlockRequired && r.sntDisconnectionRequired && r.enggDisconnectionsRequired) {
      return (r.trdActionsNeeded && r.sigActionsNeeded) || (allTrdAcceptance && allSntAcceptance && allEnggAcceptance);
    }

    // // Handle powerBlockRequired case
    // if (r.powerBlockRequired) {
    //   return r.trdActionsNeeded || allTrdAcceptance;
    // }

    // // Handle enggDisconnectionsRequired case
    // if (r.enggDisconnectionsRequired) {
    //   return allEnggAcceptance;
    // }

    // // Handle sntDisconnectionRequired case
    // if (r.sntDisconnectionRequired) {
    //   return r.sigActionsNeeded || allSntAcceptance;
    // }
    if (r.powerBlockRequired&&((r.enggDisconnectionsRequired===true&&r.allEnggAcceptance === "ACCEPTED")||(r.enggDisconnectionsRequired===false))&&((r.sntDisconnectionRequired===true&&r.allSntAcceptance === "ACCEPTED")||(r.sntDisconnectionRequired===false))) {
      return r.trdActionsNeeded || r.allTrdAcceptance === "ACCEPTED";
    }

    // Handle enggDisconnectionsRequired case
    if (r.enggDisconnectionsRequired&&((r.powerBlockRequired===true&&r.allTrdAcceptance === "ACCEPTED")||(r.powerBlockRequired===false))&&((r.sntDisconnectionRequired===true&&r.allSntAcceptance === "ACCEPTED")||(r.sntDisconnectionRequired===false))) {
      return r.allEnggAcceptance === "ACCEPTED";
    }

    // Handle sntDisconnectionRequired case
    if (r.sntDisconnectionRequired&&((r.powerBlockRequired===true&&r.allTrdAcceptance === "ACCEPTED")||(r.powerBlockRequired===false))&&((r.enggDisconnectionsRequired===true&&r.allEnggAcceptance === "ACCEPTED")||(r.enggDisconnectionsRequired===false))) {
      return r.sigActionsNeeded || r.allSntAcceptance === "ACCEPTED";
    }
    // If neither special flag is true, just return the status
    return true;
  })
  .sort((a: UserRequest, b: UserRequest) => new Date(a.date).getTime() - new Date(b.date).getTime());

const combinedRequestsFiltered = pendingRequests
  .filter((r: UserRequest) => {
    // Check if the request has otherLines in processedLineSections
    const hasOtherLines = r.processedLineSections?.some((section: any) => 
      section.otherLines && section.otherLines.trim() !== ''
    );
    if (!hasOtherLines) return false;

    // Global filters
    if (deptFilter !== 'ALL' && r.selectedDepartment !== deptFilter) return false;
    if (!matchesWorkType(r)) return false;
    if (!matchesActivity(r)) return false;
    if (!matchesTimeSlot(r)) return false;

    // For combined requests, use the same complex logic as other tables for consistency
    const allSntAcceptance = r.allSntAcceptance === "ACCEPTED";
    const allTrdAcceptance = r.allTrdAcceptance === "ACCEPTED";
    const allEnggAcceptance = r.allEnggAcceptance === "ACCEPTED";

    // Handle cases where all three flags are true - FIXED PARENTHESES
    if (r.powerBlockRequired && r.sntDisconnectionRequired && r.enggDisconnectionsRequired) {
      return (r.trdActionsNeeded && r.sigActionsNeeded) || (allTrdAcceptance && allSntAcceptance && allEnggAcceptance);
    }

    // // Handle powerBlockRequired case
    // if (r.powerBlockRequired) {
    //   return r.trdActionsNeeded || allTrdAcceptance;
    // }

    // // Handle enggDisconnectionsRequired case
    // if (r.enggDisconnectionsRequired) {
    //   return allEnggAcceptance;
    // }

    // // Handle sntDisconnectionRequired case
    // if (r.sntDisconnectionRequired) {
    //   return r.sigActionsNeeded || allSntAcceptance;
    // }
    if (r.powerBlockRequired&&((r.enggDisconnectionsRequired===true&&r.allEnggAcceptance === "ACCEPTED")||(r.enggDisconnectionsRequired===false))&&((r.sntDisconnectionRequired===true&&r.allSntAcceptance === "ACCEPTED")||(r.sntDisconnectionRequired===false))) {
      return r.trdActionsNeeded || r.allTrdAcceptance === "ACCEPTED";
    }

    // Handle enggDisconnectionsRequired case
    if (r.enggDisconnectionsRequired&&((r.powerBlockRequired===true&&r.allTrdAcceptance === "ACCEPTED")||(r.powerBlockRequired===false))&&((r.sntDisconnectionRequired===true&&r.allSntAcceptance === "ACCEPTED")||(r.sntDisconnectionRequired===false))) {
      return r.allEnggAcceptance === "ACCEPTED";
    }

    // Handle sntDisconnectionRequired case
    if (r.sntDisconnectionRequired&&((r.powerBlockRequired===true&&r.allTrdAcceptance === "ACCEPTED")||(r.powerBlockRequired===false))&&((r.enggDisconnectionsRequired===true&&r.allEnggAcceptance === "ACCEPTED")||(r.enggDisconnectionsRequired===false))) {
      return r.sigActionsNeeded || r.allSntAcceptance === "ACCEPTED";
    }
    // If neither special flag is true, just return the status
    return true;
  })
  .sort((a: UserRequest, b: UserRequest) => new Date(a.date).getTime() - new Date(b.date).getTime());


  const [isOptimizeDialogOpen, setIsOptimizeDialogOpen] = useState(false);
  const [isUrgentRequests, setIsUrgentRequests] = useState<boolean>(false);
  const [optimizedData, setOptimizedData] = useState<UserRequest[] | null>(
    null
  );
  const optimizeMutation = useOptimizeRequests();

  // Edit functionality
  const handleEditClick = (request: UserRequest) => {
    setEditingId(request.id);
    setEditDate(request.date.split("T")[0]);
    setTimeFrom(
      request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : ""
    );
    setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDate("");
    setTimeFrom("");
    setTimeTo("");
  };

  // Update mutation
  const updateOptimizedTimes = useMutation({
    mutationFn: (data: {
      requestId: string;
      newDate: string;
      optimizeTimeFrom: string;
      optimizeTimeTo: string;
    }) => adminService.updateRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["approved-requests", currentWeekStart],
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setEditingId(null);
    },
    onError: (error) => {
      // amazonq-ignore-next-line
      console.error("Error updating times:", error);
      alert("Failed to update. Please check your inputs and try again.");
    },
  });

  // Helper function to format time for backend
  const formatForBackend = (date: Date) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}:00.000Z`;
  };

  // Helper function to format date for backend
  const formatDateForBackend = (date: Date) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T00:00:00.000Z`;
  };

  // Helper function to pad numbers with leading zero
  const pad = (num: number) => num.toString().padStart(2, "0");

  const handleUpdateClick = (requestId: string) => {
    if (!editDate || !timeFrom || !timeTo) {
      alert("Please fill all fields: Date, Start Time, and End Time");
      return;
    }

    try {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(timeFrom) || !timeRegex.test(timeTo)) {
        throw new Error("Time must be in HH:mm format (e.g., 14:30)");
      }

      // Create Date objects in local time
      const localFrom = new Date(`${editDate}T${timeFrom}`);
      const localTo = new Date(`${editDate}T${timeTo}`);
      const localDate = new Date(editDate);

      // Convert to ISO strings without timezone adjustment
      const optimizeTimeFromISO = formatForBackend(localFrom);
      const optimizeTimeToISO = formatForBackend(localTo);
      const dateISO = formatDateForBackend(localDate);

      updateOptimizedTimes.mutate({
        requestId,
        newDate: dateISO,
        optimizeTimeFrom: optimizeTimeFromISO,
        optimizeTimeTo: optimizeTimeToISO,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Invalid input");
    }
  };

  const handleSendOptimizedRequests = async () => {
    try {
      const requestIds =
        data?.data?.requests?.map((request: UserRequest) => request.id) || [];
      if (requestIds.length === 0) {
        alert("No requests to optimize");
        return;
      }
      const response = await adminService.saveOptimizedRequestsStatus(
        requestIds
      );
      if (response.success) {
        alert("Optimization status updated successfully!");
      } else {
        alert("Failed to update optimization status");
      }
    } catch (err) {
      console.error("Failed to update optimization status", err);
      alert("Error updating optimization status. Please try again.");
    }
  };

  const handleSanctionClick = (request: UserRequest) => {
  setSelectedRequestsForSanction([request]);
  setIsSanctionModalOpen(true);
};

  const handleSendSanctionedRequests = async (requests: UserRequest[], remark: string) => {
    try {
      // Only send the required fields for each non-urgent request
      const nonUrgentRequestsData =
        requests?.filter(
          (request: UserRequest) =>
            request.optimizeTimeFrom != null &&
            request.optimizeTimeTo != null
        )
          .map((request: UserRequest) => ({
            id: request.id,
            optimizeTimeFrom: request.optimizeTimeFrom,
            optimizeTimeTo: request.optimizeTimeTo,
            sanctionedRemark: remark,
          })) || [];

      if (nonUrgentRequestsData.length === 0) {
        alert("No requests to update");
        return;
      }

      console.dir("nonUrgentRequestsData");
      console.dir(nonUrgentRequestsData);

      console.dir(data);
      const response = await adminService.updateSanctionStatus(
        nonUrgentRequestsData
      );
      if (response.success) {
        alert("Optimization status updated successfully!");
        refetch();
           setIsSanctionModalOpen(false);
      setSanctionRemark("");
      setSelectedRequestsForSanction([]);
      } else {
        alert("Failed to update optimization status");
      }
    } catch (err) {
      console.error("Failed to update optimization status", err);
      alert("Error updating optimization status. Please try again.");
    }
  };

  // Format date
  
  const handleDraftClick = (request: UserRequest) => {
  setSelectedRequests([request]);
  setIsDraftModalOpen(true);
};
const handleSendNonUrgentRequests = async (requests: UserRequest[], remark: string) => {
  try {
    const draftRequestsData = requests?.map((request: UserRequest) => ({
      id: request.id,
      sanctionedRemark: remark,
    })) || [];

    if (draftRequestsData.length === 0) {
      alert("No requests to update");
      return;
    }

    console.log("Updating draft status:", draftRequestsData);
    
    const response = await adminService.updateDraftStatus(draftRequestsData);
    
    if (response.success) {
      alert("Requests moved to draft successfully!");
      refetch();
      setIsDraftModalOpen(false);
      setDraftRemark("");
    } else {
      alert("Failed to update draft status");
    }
  } catch (err) {
    console.error("Failed to update draft status", err);
    alert("Error updating draft status. Please try again.");
  }
};
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd-MM-yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    try {
      // Parse the ISO string and get the hours and minutes
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";

      // Format as 24-hour time (HH:mm)
      const hours = date.getUTCHours().toString().padStart(2, "0");
      const minutes = date.getUTCMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (error) {
      // amazonq-ignore-next-line
      console.error("Error formatting time:", error, dateString);
      return "N/A";
    }
  };

  // Function to navigate to previous or next period (day for urgent, week for non-urgent)
  const handleWeekChange = (direction: "prev" | "next") => {
    setCurrentWeekStart((prev) => {
      let newDate;
      if (isUrgentMode) {
        newDate = direction === "prev" ? subDays(prev, 1) : addDays(prev, 1);
      } else {
        newDate = direction === "prev" ? subDays(prev, 7) : addDays(prev, 7);
      }
      setSelectedDate(startOfWeek(newDate, { weekStartsOn: 1 }));
      return newDate;
    });
  };

  // const handleOptimize = async () => {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   const nextWeekStart = new Date(today);
  //   nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
  //   nextWeekStart.setHours(0, 0, 0, 0);

  //   const preData = isUrgentRequests ? urgentRequestsFiltered : [...corridorRequestsFiltered, ...  nonCorridorRequestsFiltered]
  //   if (!preData) return;

  //   // For non-urgent requests, check if trying to optimize for current week
  //   if (!isUrgentRequests) {
  //     const hasCurrentWeekDates = preData.some((request: UserRequest) => {
  //       const requestDate = new Date(request.date);
  //       requestDate.setHours(0, 0, 0, 0);
  //       return requestDate < nextWeekStart;
  //     });

  //     if (hasCurrentWeekDates) {
  //       setShowDateValidationAlert(true);
  //       return;
  //     }
  //   } else {
  //     // For urgent requests, check if any requests are for previous dates
  //     const hasPreviousDates = preData.some((request: UserRequest) => {
  //       const requestDate = new Date(request.date);
  //       requestDate.setHours(0, 0, 0, 0);
  //       return requestDate < today;
  //     });

  //     if (hasPreviousDates) {
  //       setShowDateValidationAlert(true);
  //       return;
  //     }
  //   }
  //   try {
  //     // Preprocess the requests
  //     //const preprocessedRequests = await flattenRecords(data.data.requests);
  //     const requestsToOptimize = preData.filter(
  //       (request: UserRequest) => {
  //         const requestDate = format(parseISO(request.date), "yyyy-MM-dd");
  //         const selected = format(selectedDate, "yyyy-MM-dd");

  //         return isUrgentRequests
  //           ? request.corridorType === "Urgent Block" &&
  //           requestDate === selected
  //           : request.corridorType !== "Urgent Block";
  //       }
  //     );

  //     // Then preprocess the filtered requests
  //     const preprocessedRequests = await flattenRecords(requestsToOptimize);
  //     // Call optimization API
  //     const result = await optimizeMutation.mutateAsync(preprocessedRequests);

  //     if (result.optimizedData) {
  //       // Process the optimized data to handle "WrongRequest" values by setting to "00:00"
  //       const processedOptimizedData = result.optimizedData.map((request) => ({
  //         ...request,
  //         optimisedTimeFrom:
  //           request.optimisedTimeFrom === "Wrong Request"
  //             ? "00:00"
  //             : request.optimisedTimeFrom,
  //         optimisedTimeTo:
  //           request.optimisedTimeTo === "Wrong Request"
  //             ? "00:00"
  //             : request.optimisedTimeTo,
  //       })) as UserRequest[];

  //       // Save Functionality
  //       const requestIds =
  //         preprocessedRequests.map((request: any) => request.id) || [];
  //       if (requestIds.length === 0) {
  //         alert("No requests to optimize");
  //         return;
  //       }
  //       await adminService.saveOptimizedRequestsCombined({
  //         processedOptimizedData: processedOptimizedData,
  //         requestIds: requestIds,
  //       });
  //       setOptimizedData(processedOptimizedData);
  //       setIsOptimizeDialogOpen(false);
  //       await refetch();

  //     } else {
  //       alert("Failed to optimize requests");
  //     }
  //   } catch (error) {
  //     console.error("Optimization error:", error);
  //     alert("Failed to optimize requests. Please try again.");
  //   }
  // };

  // Helper function to calculate hours between two dates

  // Update the handleOptimize function
const handleOptimize = async () => {
  // Check if any requests are selected
  if (selectedRequestsForOptimization.size === 0) {
    alert("Please select at least one request to optimize.");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeekStart = new Date(today);
  nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
  nextWeekStart.setHours(0, 0, 0, 0);

  // Get the base data based on request type (urgent or corridor)
  let preData;
  if (isUrgentRequests) {
    preData = urgentRequestsFiltered.filter((request: UserRequest) => {
      const requestDate = typeof request.date === "string" ? parseISO(request.date) : request.date;
      return isSameDay(requestDate, selectedDate) && (request.Draft === false);
    });
  } else {
    preData = corridorRequestsFiltered.filter((request: UserRequest) => request.Draft === false);
  }
  
  if (!preData || preData.length === 0) return;

  // Filter to only selected requests
  const selectedPreData = preData.filter((request: UserRequest) => 
    selectedRequestsForOptimization.has(request.id)
  );

  if (selectedPreData.length === 0) {
    alert("No selected requests found for optimization.");
    return;
  }

  // For non-urgent requests, check if trying to optimize for current week
  if (!isUrgentRequests) {
    const hasCurrentWeekDates = selectedPreData.some((request: UserRequest) => {
      const requestDate = new Date(request.date);
      requestDate.setHours(0, 0, 0, 0);
      return requestDate < nextWeekStart;
    });

    if (hasCurrentWeekDates) {
      setShowDateValidationAlert(true);
      return;
    }
  } else {
    // For urgent requests, check if any requests are for previous dates
    const hasPreviousDates = selectedPreData.some((request: UserRequest) => {
      const requestDate = new Date(request.date);
      requestDate.setHours(0, 0, 0, 0);
      return requestDate < today;
    });

    if (hasPreviousDates) {
      setShowDateValidationAlert(true);
      return;
    }
  }

  try {
    // Filter requests to optimize based on selection and date
    const requestsToOptimize = selectedPreData.filter(
      (request: UserRequest) => {
        const requestDate = format(parseISO(request.date), "yyyy-MM-dd");
        const selected = format(selectedDate, "yyyy-MM-dd");
        return isUrgentRequests
          ? request.corridorType === "Urgent Block" && requestDate === selected
          : request.corridorType !== "Urgent Block";
      }
    );

    if (requestsToOptimize.length === 0) {
      alert("No selected requests match the current criteria.");
      return;
    }

    // Then preprocess the filtered requests
    const preprocessedRequests = await flattenRecords(requestsToOptimize);
    
    // Call optimization API
    const result = await optimizeMutation.mutateAsync(preprocessedRequests);

    if (result.optimizedData) {
      // Process the optimized data
      const processedOptimizedData = result.optimizedData.map((request) => ({
        ...request,
        optimisedTimeFrom:
          request.optimisedTimeFrom === "Wrong Request"
            ? "00:00"
            : request.optimisedTimeFrom,
        optimisedTimeTo:
          request.optimisedTimeTo === "Wrong Request"
            ? "00:00"
            : request.optimisedTimeTo,
      })) as UserRequest[];

      // Save Functionality - only for selected requests
      const requestIds = preprocessedRequests.map((request: any) => request.id) || [];
      
      await adminService.saveOptimizedRequestsCombined({
        processedOptimizedData: processedOptimizedData,
        requestIds: requestIds,
      });
      
      setOptimizedData(processedOptimizedData);
      setIsOptimizeDialogOpen(false);
      
      // Clear selection after optimization
      setSelectedRequestsForOptimization(new Set());
      
      await refetch();
    } else {
      alert("Failed to optimize requests");
    }
  } catch (error) {
    console.error("Optimization error:", error);
    alert("Failed to optimize requests. Please try again.");
  }
};


  const getHoursDifference = (dateFrom: string, dateTo: string): number => {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const diffMs = to.getTime() - from.getTime();
    return Math.abs(diffMs / (1000 * 60 * 60)); // Convert milliseconds to hours
  };

  // Check if reject button should be shown
  const shouldShowRejectButton = (request: UserRequest): boolean => {
    // 1. Check if demand time is more than 3 hours
    const demandHours = getHoursDifference(
      request.demandTimeFrom,
      request.demandTimeTo
    );
    if (demandHours > 3) return true;

    // 2. Check if otherLines/otherRoads have data AND demand time > 1 hour
    const hasOtherLinesOrRoads =
      request.processedLineSections?.some(
        (section) =>
          (section.otherLines && section.otherLines.trim() !== "") ||
          (section.otherRoads && section.otherRoads.trim() !== "")
      ) ?? false;

    if (hasOtherLinesOrRoads && demandHours > 1) return true;

    // 3. Check if corridorType is outside-corridor AND demand time > 1 hour
    if (
      request.corridorType?.toLowerCase() === "Outside Corridor" || request.corridorType?.toLowerCase() === "non-corridor" &&
      demandHours > 1
    )
      return true;

    // 4. Check if multiple mission blocks (assuming missionBlock is a comma-separated list)
    if (request.missionBlock && request.missionBlock.split(",").length > 1)
      return true;

    return false;
  };

  const handleDownloadCSV = () => {
    if (!data?.data?.requests) return;

    // Get the current filtered requests
    const requestsToDownload = filteredRequests;

    // Create CSV headers
    const headers = [
      "Date",
      "Major Section",
      "Depot",
      "Block Section",
      "Line/Road",
      "Adjacent Lines Affected",
      "Work Type",
      "Corridor Type",
      "Activity",
      "Demanded Time From",
      "Demanded Time To",
      "Optimized Time From",
      "Optimized Time To",
      "Requested By",
      "Department",
      "Description",
    ];

    // Create CSV rows
    const rows = requestsToDownload.map((request: UserRequest) => [
      formatDate(request.date),
      request.selectedSection || "N/A",
      request.selectedDepo || "N/A",
      request.missionBlock || "N/A",
      getLineOrRoad(request),
      request.adjacentLinesAffected || getAdjacentLinesAffected(request),
      request.workType || "N/A",
      request.corridorType || "N/A",
      request.activity || "N/A",
      formatTime(request.demandTimeFrom || ""),
      formatTime(request.demandTimeTo || ""),
      formatTime(request.optimizeTimeFrom || ""),
      formatTime(request.optimizeTimeTo || ""),
      request.user?.name || "N/A",
      request.selectedDepartment || "N/A",
      request.requestremarks || "N/A",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row: string[]) =>
        row.map((cell: string) => `"${cell}"`).join(",")
      ),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `optimized_requests_${format(currentWeekStart, "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add state to track which row's Modify/Return is open
  const [modifyReturnOpenId, setModifyReturnOpenId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen text-black bg-white p-3 border border-black flex items-center justify-center">
        <div className="text-center py-5">Loading approved requests...</div>
      </div>
    );
  }

  if (error) {
    router.push('/auth/login');
    return null;
  }




  // CSS for flashing animation
  const flashingRowStyle = `
  @keyframes flashRed {
    0% { background-color: white; }
    50% { background-color: #f76363; } /* lighter, softer red */
    100% { background-color: white; }
  }
  .urgent-block-row {
    animation: flashRed 5s infinite ease-in-out; /* slower and smoother */
  }
`;
  return (

    <div className="min-h-screen w-screen flex flex-col justify-between bg-white p-3 border border-black">
      <style jsx global>{flashingRowStyle}</style>
      <div>
        {/* Overall Title */}
        <h1 className="text-2xl font-bold text-center mb-6 text-[#13529e]">Requests With Me</h1>
        {showSuccess && (
          <div className="fixed top-20 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
            Operation successful!
          </div>
        )}

        {/* Week Switcher at the top */}
      

        {/* Global Filter Buttons */}
        <div className="flex gap-4 mb-4 p-3 bg-gray-50 border border-gray-300 rounded">
         
          <div className="relative">
            <button
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
              className="px-4 py-2 bg-white border border-black rounded flex items-center gap-2 text-black"
            >
              Dept: {deptFilter}
              <span>▼</span>
            </button>
            {showDeptDropdown && (
              <div className="absolute top-full left-0 bg-white border border-black shadow-lg z-50 min-w-[120px]">
                {['ALL', 'S&T', 'ENGG', 'TRD'].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setDeptFilter(dept);
                      setWorkTypeFilter('ALL');
                      setActivityFilter('ALL');
                      setShowDeptDropdown(false);

                      
                      if (dept !== 'ALL') {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("dept", encodeURIComponent(dept));
                        router.push(`?${params.toString()}`, { scroll: false });
                      } else {
                        
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("dept");
                        router.push(`?${params.toString()}`, { scroll: false });
                      }
                    }}
                    className={`block w-full text-left px-3 py-2 hover:bg-gray-100 text-black ${deptFilter === dept ? 'bg-blue-100' : ''
                      }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>

          
          <div className="relative">
            <button
              onClick={() => deptFilter !== 'ALL' && setShowWorkTypeDropdown(!showWorkTypeDropdown)}
              className={`px-4 py-2 bg-white border border-black rounded flex items-center gap-2 text-black ${deptFilter === 'ALL' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              disabled={deptFilter === 'ALL'}
            >
              Work Type: {workTypeFilter}
              <span>▼</span>
            </button>
            {showWorkTypeDropdown && deptFilter !== 'ALL' && (
              <div className="absolute top-full left-0 bg-white border border-black shadow-lg z-50 min-w-[150px]">
                {['ALL', ...(workType[deptFilter as keyof typeof workType] || [])].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setWorkTypeFilter(type);
                      setActivityFilter('ALL');
                      setShowWorkTypeDropdown(false);
                    }}
                    className={`block w-full text-left px-3 py-2 hover:bg-gray-100 text-black ${workTypeFilter === type ? 'bg-blue-100' : ''
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

         
          <div className="relative">
            <button
              onClick={() => workTypeFilter !== 'ALL' && setShowActivityDropdown(!showActivityDropdown)}
              className={`px-4 py-2 bg-white border border-black rounded flex items-center gap-2 text-black ${workTypeFilter === 'ALL' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={workTypeFilter === 'ALL'}
            >
              Activity: {activityFilter}
              <span>▼</span>
            </button>
            {showActivityDropdown && workTypeFilter !== 'ALL' && (
              <div className="absolute top-full left-0 bg-white border border-black shadow-lg z-50 min-w-[200px] max-h-60 overflow-y-auto">
                {getActivitiesForWorkType(workTypeFilter).map((activity) => (
                  <button
                    key={activity}
                    onClick={() => {
                      setActivityFilter(activity);
                      setShowActivityDropdown(false);
                    }}
                    className={`block w-full text-left px-3 py-2 hover:bg-gray-100 text-black ${activityFilter === activity ? 'bg-blue-100' : ''}`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            )}
          </div>

         
          <div className="relative">
            <button
              onClick={() => setShowTimeSlotDropdown(!showTimeSlotDropdown)}
              className="px-4 py-2 bg-white border border-black rounded flex items-center gap-2 text-black"
            >
              Time: {timeSlotFilter}
              <span>▼</span>
            </button>
            {showTimeSlotDropdown && (
              <div className="absolute top-full left-0 bg-white border border-black shadow-lg z-50 min-w-[180px]">
                {[
                  { key: 'ALL', label: 'ALL' },
                  { key: 'Morning', label: 'Morning (4:00-12:00)' },
                  { key: 'Afternoon', label: 'Afternoon (12:00-20:00)' },
                  { key: 'Night', label: 'Night (20:00-4:00)' }
                ].map((slot) => (
                  <button
                    key={slot.key}
                    onClick={() => {
                      setTimeSlotFilter(slot.key);
                      setShowTimeSlotDropdown(false);
                    }}
                    className={`block w-full text-left px-3 py-2 hover:bg-gray-100 text-black ${timeSlotFilter === slot.key ? 'bg-blue-100' : ''
                      }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
          </div>

         
          <button
            onClick={() => {
              setDeptFilter('ALL');
              setWorkTypeFilter('ALL');
              setActivityFilter('ALL');
              setTimeSlotFilter('ALL');
            }}
            className="px-4 py-2 bg-red-500 text-white border border-black rounded"
          >
            Clear All
          </button>
        </div>

        </div>
        {/* Week Switcher at the top */}
        <div className="border-b-2 border-[#13529e] pb-3 flex justify-between items-center mb-4">
          <WeeklySwitcher
            currentWeekStart={currentWeekStart}
            onWeekChange={handleWeekChange}
            weekStartsOn={1}
          />


            <div className="relative group">
    <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors">
      <div className="w-5 h-5 bg-gradient-to-r from-blue-200 via-purple-200 to-red-200 border border-gray-400 rounded"></div>
      <span className="text-black font-medium">Color Legend</span>
      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    {/* Dropdown Legend */}
    <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 min-w-[220px]">
      <h3 className="text-black font-bold text-sm mb-3 pb-2 border-b border-gray-200">Department Colors</h3>
        <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-3 py-1">
                <div className="w-5 h-5 bg-red-400 border border-gray-400 rounded-sm"></div>
                <span className="text-black font-medium">ENGG</span>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="w-5 h-5 bg-blue-400 border border-gray-400 rounded-sm"></div>
                <span className="text-black font-medium">TRD</span>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="w-5 h-5 bg-green-400 border border-gray-400 rounded-sm"></div>
                <span className="text-black font-medium">S&T</span>
              </div>
            </div>
    </div>
  </div>
        </div>
{/* {isOptimizeDialogOpen && (() => {
  // Calculate the requests to be optimized for dialog preview
  const preData = isUrgentRequests ? urgentRequestsFiltered : [...corridorRequestsFiltered, ...nonCorridorRequestsFiltered];
  const requestsToOptimize = preData.filter(
    (request: UserRequest) => {
      const requestDate = format(parseISO(request.date), "yyyy-MM-dd");
      const selected = format(selectedDate, "yyyy-MM-dd");
      return isUrgentRequests
        ? request.corridorType === "Urgent Block" && requestDate === selected
        : request.corridorType !== "Urgent Block";
    }
  );
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
      <div className="bg-white p-6 w-full max-w-md border border-black">
        <div className="border-b-2 border-[#13529e] pb-3 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-[#13529e]">
              Optimize Requests
            </h2>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                isUrgentMode
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              } border border-black`}
            >
              {isUrgentMode ? "Urgent Mode" : "Normal Mode"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsOptimizeDialogOpen(false)}
              className="px-4 py-1 text-sm bg-white text-[#13529e] border border-black"
            >
              Cancel
            </button>
            <button
              onClick={() => handleOptimize()}
              disabled={optimizeMutation.isPending}
              className="px-4 py-1 text-sm bg-[#13529e] text-white border border-black disabled:opacity-50"
            >
              {optimizeMutation.isPending ? "Optimizing..." : "Optimize"}
            </button>
          </div>
        </div>
        <div className="mb-4 space-y-2">
          <p>Are you sure you want to optimize the requests for:</p>
          <p className="font-medium">
            Week: {format(weekStart, "dd MMM")} -{" "}
            {format(weekEnd, "dd MMM yyyy")}
          </p>
          <p className="font-medium">
    {isUrgentRequests
      ? `Total Block Request for Urgent: ${requestsToOptimize.length}`
      : `Total Block Request for Corridor and Outside Corridor: ${requestsToOptimize.length}`}
  </p>
        </div>
      </div>
    </div>
  );
})()} */}
{isOptimizeDialogOpen && (() => {
  let preData;
  if (isUrgentRequests) {
    preData = urgentRequestsFiltered.filter((request: UserRequest) => {
      const requestDate = typeof request.date === "string" ? parseISO(request.date) : request.date;
      return isSameDay(requestDate, selectedDate) && (request.Draft === false);
    });
  } else {
    preData = corridorRequestsFiltered.filter((request: UserRequest) => request.Draft === false);
  }
  
  const selectedPreData = preData.filter((request: UserRequest) => 
    selectedRequestsForOptimization.has(request.id)
  );
  
  const requestsToOptimize = selectedPreData.filter(
    (request: UserRequest) => {
      const requestDate = format(parseISO(request.date), "yyyy-MM-dd");
      const selected = format(selectedDate, "yyyy-MM-dd");
      return isUrgentRequests
        ? request.corridorType === "Urgent Block" && requestDate === selected
        : request.corridorType !== "Urgent Block";
    }
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
      <div className="bg-white p-6 w-full max-w-md border border-black">
        <div className="border-b-2 border-[#13529e] pb-3 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-[#13529e]">
              Optimize Requests
            </h2>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                isUrgentMode
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              } border border-black`}
            >
              {isUrgentMode ? "Urgent Mode" : "Normal Mode"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsOptimizeDialogOpen(false)}
              className="px-4 py-1 text-sm bg-white text-[#13529e] border border-black"
            >
              Cancel
            </button>
            <button
              onClick={() => handleOptimize()}
              disabled={optimizeMutation.isPending}
              className="px-4 py-1 text-sm bg-[#13529e] text-white border border-black disabled:opacity-50"
            >
              {optimizeMutation.isPending ? "Optimizing..." : "Optimize"}
            </button>
          </div>
        </div>
        <div className="mb-4 space-y-2">
          <p>Are you sure you want to optimize the selected requests?</p>
          <p className="font-medium">
            Selected Requests: {requestsToOptimize.length}
          </p>
          <p className="font-medium">
            {isUrgentRequests
              ? `Urgent Block Requests: ${requestsToOptimize.length}`
              : `Corridor Block Requests: ${requestsToOptimize.length}`}
          </p>
          <p className="font-medium">
            Week: {format(weekStart, "dd MMM")} -{" "}
            {format(weekEnd, "dd MMM yyyy")}
          </p>
        </div>
      </div>
    </div>
  );
})()}
        {/* Urgent Blocks Section - now at the top */}
        <div className="mt-4 mb-8">
         
          <h2 className="border-b-2 pb-2 border-[#13529e] text-[24px] font-semibold text-[#13529e]">Urgent Blocks</h2>
          <div className="flex justify-end py-2 gap-2">
            <button
              onClick={() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const hasPreviousDays = urgentRequestsFiltered.some((request: UserRequest) => {
                  const reqDate = new Date(request.date);
                  reqDate.setHours(0, 0, 0, 0);
                  return reqDate < today;
                });
                if (hasPreviousDays) {
                  setShowDateValidationAlert(true);
                  return;
                }
                setIsOptimizeDialogOpen(true);
                setIsUrgentRequests(true);
              }}
              className="px-3 py-1 text-[24px] bg-white text-[#13529e] border border-black cursor-pointer hover:bg-gray-50 flex items-center"
            >
              <svg className="w-6 h-6 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Optimise
            </button>
          </div>
  <DaySwitcher
  currentDate={selectedDate}
  onDateChange={(newDate) => {
    setSelectedDate(newDate);
    // Save to localStorage for persistence
    localStorage.setItem("urgentSelectedDate", newDate.toISOString());
  }}
  minDate={weekStart} 
  maxDate={weekEnd}
  storageKey="urgentSelectedDate"
/>

          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-lg border border-gray-300 shadow-sm mt-4">
  <table className="w-full border-collapse text-black bg-white">
    <thead className={`sticky top-0 ${showRejectionModal ? "z-0" : "z-10"} bg-gray-100 shadow`}>
      <tr className="bg-gray-50">
            <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
      <input
        type="checkbox"
        onChange={handleSelectAllUrgent}
        checked={
          urgentRequestsFiltered.filter((request: UserRequest) => {
            const requestDate = typeof request.date === "string" ? parseISO(request.date) : request.date;
            return isSameDay(requestDate, selectedDate) && (request.Draft === false);
          }).length > 0 &&
          selectedRequestsForOptimization.size === urgentRequestsFiltered.filter((request: UserRequest) => {
            const requestDate = typeof request.date === "string" ? parseISO(request.date) : request.date;
            return isSameDay(requestDate, selectedDate) && (request.Draft === false);
          }).length
        }
      />
    </th>
        <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10"><ColumnHeader icon="date" title="Date" /></th>
        <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
          <ColumnHeader icon="date" title="Dept" />
        </th>
        <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10"><ColumnHeader icon="section" title="Major Section" /></th>
        <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10"><ColumnHeader icon="section" title="SSE" /></th>
        <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10"><ColumnHeader icon="section" title="Block Section" /></th>
        <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10"><ColumnHeader icon="line" title="Line / Road" /></th>
        <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10"><ColumnHeader icon="time" title="Demanded" /></th>
        <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10"><ColumnHeader icon="time" title="Optimize" /></th>
        <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
          <ColumnHeader icon="work" title="Activity" />
        </th>
        <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10"><ColumnHeader icon="action" title="Actions" /></th>
        <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10"><ColumnHeader icon="view" title="View" /></th>
      </tr>
    </thead>
    <tbody>
      {urgentRequestsFiltered.length === 0 && (
        <tr>
          <td colSpan={12} className="border border-black p-2 text-[24px] text-left">
            <div className="text-center py-4">
              <p className="mb-2">No requests found.</p>
            </div>
          </td>
        </tr>
      )}
      {urgentRequestsFiltered.filter((request: UserRequest) => {
        const requestDate = typeof request.date === "string" ? parseISO(request.date) : request.date;
        return isSameDay(requestDate, selectedDate)&&(request.Draft === false);
      }).map((request: UserRequest) => {
          const getDepartmentColor = (request: UserRequest) => {
                         const {
                           selectedDepartment,
                         } = request;
                         if (selectedDepartment === "ENGG"&&(request.sntDisconnectionRequired|| request.powerBlockRequired || request.enggDisconnectionsRequired)) {
                             return "bg-gray-200"; // Pure ENGG         
                         }
                         // TRD Department
                         else if (selectedDepartment === "TRD"&&(request.sntDisconnectionRequired|| request.powerBlockRequired || request.enggDisconnectionsRequired)) {
                           return "bg-gray-200"; // Pure TRD
                         }
                         // S&T Department with combinations
                         else if (selectedDepartment === "S&T"&&(request.sntDisconnectionRequired|| request.powerBlockRequired || request.enggDisconnectionsRequired)) { 
                             return "bg-gray-200"; // Pure S&T        
                         }
                         return "bg-white-200";
                       };
     
                       const rowColor = getDepartmentColor(request);
        
        return (
          <tr 
            key={`request-${request.id}-${request.date}`} 
            className={`hover:bg-gray-100 transition-colors ${rowColor}`}
          >
              <td className="border border-black p-2 text-[24px]">
          <input
            type="checkbox"
            checked={isRequestSelected(request.id)}
            onChange={() => handleSelectRequest(request.id)}
          />
        </td>
            {/* <td className="border border-black p-2 text-[24px]">
              {editingId === request.id ? (
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-28 border p-1 text-sm rounded"
                />
              ) : (
                dayjs(request.date).format("DD-MM-YY")
              )}
            </td> */}
 <td className="border border-black p-2 text-[24px]">
  {editingId === request.id ? (
    <input
      type="date"
      value={editDate}
      onChange={(e) => setEditDate(e.target.value)}
      className="w-28 border p-1 text-sm rounded"
    />
  ) : (
    dayjs(request.date).format("DD-MM-YY")
  )}
</td>
                             <td className="border border-black p-2 text-[24px]">
  <div className="flex flex-col items-start gap-1">
    <span>{request.selectedDepartment}</span>
    <div className="flex gap-1">
      {request.sntDisconnectionRequired && (
        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold min-w-6 text-center">S</span>
      )}
      {request.powerBlockRequired && (
        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-bold min-w-6 text-center">T</span>
      )}
      {request.enggDisconnectionsRequired && (
        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold min-w-6 text-center">E</span>
      )}
    </div>
  </div>
</td>
            <td className="border border-black p-2 text-[24px]">{request.selectedSection}</td>
            <td className="border border-black p-2 text-[24px]">{request.selectedDepo}</td>
            <td className="border border-black p-2 text-[24px]">{request.missionBlock}</td>
            <td className="border border-black p-2 text-[24px]">{getLineOrRoad(request)}</td>
            <td className="border border-black p-2 text-[24px]">{formatTime(request.demandTimeFrom)} - {formatTime(request.demandTimeTo)}</td>
            <td className="border border-black p-2 text-[24px]">
              {editingId === request.id ? (
                <div className="flex gap-1 items-center">
                  <input
                    type="time"
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                    className="w-20 border p-1 text-sm rounded"
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={timeTo}
                    onChange={(e) => setTimeTo(e.target.value)}
                    className="w-20 border p-1 text-sm rounded"
                  />
                </div>
              ) : (
                <>
                  {request.optimizeTimeFrom &&
                    request.optimizeTimeFrom !== "WrongRequest"
                    ? formatTime(request.optimizeTimeFrom)
                    : "N/A"}{" "}
                  -{" "}
                  {request.optimizeTimeTo &&
                    request.optimizeTimeTo !== "WrongRequest"
                    ? formatTime(request.optimizeTimeTo)
                    : "N/A"}
                </>
              )}
            </td>

            <td className="border border-black p-2 text-[24px]">{request.activity}</td>
            <td className="border border-black p-2 text-[24px]">
              <div className="flex gap-2">
                {editingId === request.id ? (
                  <>
                    <button
                      onClick={() => handleUpdateClick(request.id)}
                      className="px-2 py-1 text-[24px] bg-green-600 text-white border border-black rounded"
                      disabled={updateOptimizedTimes.isPending}
                    >
                      {updateOptimizedTimes.isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-2 py-1 text-[24px] bg-gray-400 text-white border border-black rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : modifyReturnOpenId === request.id ? (
                  <>
                    {/* <button
                      className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
                      onClick={() => {
                        setEditingId(request.id);
                        setEditDate(request.date.split("T")[0]);
                        setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
                        setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
                        setModifyReturnOpenId(null);
                      }}
                    >
                      Modify
                    </button> */}
                    <button
  className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
  onClick={() => {
    setEditingId(request.id);
    setEditDate(request.date.split("T")[0]);
    setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
    setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
    
    setModifyReturnOpenId(null);
  }}
>
  Modify
</button>
                    <button
                      className="px-2 py-1 text-[24px] bg-[#f69697] text-white border border-black rounded"
                      onClick={() => {
                        handleRejectClick(request.id);
                        setModifyReturnOpenId(null);
                      }}
                    >
                      Return
                    </button>
                    <button
                      className="px-2 py-1 text-[24px] bg-gray-300 text-black border border-black rounded"
                      onClick={() => setModifyReturnOpenId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {request.optimizeStatus === false ? (
                      // <button
                      //   className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
                      //   onClick={() => {
                      //     setEditingId(request.id);
                      //     setEditDate(request.date.split("T")[0]);
                      //     setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
                      //     setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
                      //     setModifyReturnOpenId(null);
                      //   }}
                      // >
                      //   Modify
                      // </button>
                      <button
  className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
  onClick={() => {
    setEditingId(request.id);
    setEditDate(request.date.split("T")[0]);
    setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
    setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
    

    setModifyReturnOpenId(null);
  }}
>
  Modify
</button>
                    ) : (
                      <>
                        <button
                          className="px-2 py-1 text-[24px] bg-green-600 text-white border border-black rounded"
                         onClick={() => handleDraftClick(request)}
                        >
                          Draft
                        </button>
                              <button
              className="px-2 py-1 text-[24px] bg-green-600 text-white border border-black rounded"
                         onClick={() => handleSanctionClick(request)}

            >
              Sanction
            </button>
                        <button
                          className="px-2 py-1 text-[24px] bg-gray-300 text-black border border-black rounded"
                          onClick={() => setModifyReturnOpenId(request.id)}
                        >
                          Modify/Return
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </td>
            <td className="border border-black p-2 text-[24px] min-w-[140px]">
              <div className="flex gap-2">
                <Link
                  href={`/admin/view-request/${request.id}?from=request-table`}
                  className="px-2 py-1 bg-blue-600 text-white border border-black rounded inline-block text-center w-full min-w-[120px]"
                >
                  View
                </Link>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
        </div>

        {/* Corridor Requests Section (with its own controls) */}
        <div className="mb-8">
          <h2 className="text-[24px] font-semibold mb-2 text-[#13529e]">Corridor Requests</h2>
          <div className="flex justify-end py-2 gap-2">
            <button
              onClick={() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const nextWeekStart = new Date(today);
                nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
                nextWeekStart.setHours(0, 0, 0, 0);

                const hasCurrentWeekDates = [...corridorRequestsFiltered].some((request: UserRequest) => {
                  const reqDate = new Date(request.date);
                  reqDate.setHours(0, 0, 0, 0);
                  return reqDate < nextWeekStart;
                });

                if (hasCurrentWeekDates) {
                  setShowDateValidationAlert(true);
                  return;
                }
                setIsOptimizeDialogOpen(true);
                setIsUrgentRequests(false);
              }}
              className="px-3 py-1 text-[24px] bg-white text-[#13529e] border border-black cursor-pointer hover:bg-gray-50 flex items-center"
            >
              <svg className="w-6 h-6 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Optimise
            </button>
          </div>
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-lg border border-gray-300 shadow-sm">
            <table className="w-full border-collapse text-black bg-white">
              <thead className="sticky top-0 z-10 bg-gray-100 shadow">
                <tr className="bg-gray-50">
                    <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
      <input
        type="checkbox"
        onChange={handleSelectAllCorridor}
        checked={
          corridorRequestsFiltered.filter((request: UserRequest) => request.Draft === false).length > 0 &&
          selectedRequestsForOptimization.size === corridorRequestsFiltered.filter((request: UserRequest) => request.Draft === false).length
        }
      />
    </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="date" title="Date" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="date" title="Dept" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="section" title="Major Section" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="section" title="SSE" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="section" title="Block Section" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="line" title="Line / Road" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="time" title="Demanded" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="time" title="Optimize" />
                  </th>

                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <div className="flex items-center justify-between relative">
                      <ColumnHeader icon="work" title="Activity" />
                      <button
                        onClick={() => { }}
                        className="ml-2 text-xs hover:bg-gray-300 px-1 rounded"
                      >
                        ▼
                      </button>

                    </div>
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="action" title="Actions" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="view" title="View" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {corridorRequestsFiltered.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      className="border border-black p-2 text-[24px] text-left"
                    >
                      <div className="text-center py-4">
                        <p className="mb-2">No requests found.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {corridorRequestsFiltered.filter((request: UserRequest) => request.Draft === false).sort((a: any, b: any) => new Date(a.demandTimeFrom).getTime() - new Date(b.demandTimeFrom).getTime()).map((request: UserRequest) => (
                  <tr
 key={`request-${request.id}-${request.date}`}
className={`transition-colors ${
  request.selectedDepartment === "ENGG" &&
  (request.sntDisconnectionRequired ||
    request.powerBlockRequired ||
    request.enggDisconnectionsRequired)
    ? "bg-gray-200"
    : request.selectedDepartment === "S&T" &&
      (request.sntDisconnectionRequired ||
        request.powerBlockRequired ||
        request.enggDisconnectionsRequired)
    ? "bg-gray-200"
    : request.selectedDepartment === "TRD" &&
      (request.sntDisconnectionRequired ||
        request.powerBlockRequired ||
        request.enggDisconnectionsRequired)
    ? "bg-gray-200"
    : "bg-white-200"
}`}
                  >
                       <td className="border border-black p-2 text-[24px]">
        <input
          type="checkbox"
          checked={isRequestSelected(request.id)}
          onChange={() => handleSelectRequest(request.id)}
        />
      </td>
                    {/* <td className="border border-black p-2 text-[24px]">
                      {editingId === request.id ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-28 border p-1 text-sm rounded"
                        />
                      ) : (
                        dayjs(request.date).format("DD-MM-YY")
                      )}
                    </td> */}
<td className="border border-black p-2 text-[24px]">
  {editingId === request.id ? (
    <input
      type="date"
      value={editDate}
      onChange={(e) => setEditDate(e.target.value)}
      className="w-28 border p-1 text-sm rounded"
    />
  ) : (
    dayjs(request.date).format("DD-MM-YY")
  )}
</td>
                                    <td className="border border-black p-2 text-[24px]">
  <div className="flex flex-col items-start gap-1">
    <span>{request.selectedDepartment}</span>
    <div className="flex gap-1">
      {request.sntDisconnectionRequired && (
        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold min-w-6 text-center">S</span>
      )}
      {request.powerBlockRequired && (
        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-bold min-w-6 text-center">T</span>
      )}
      {request.enggDisconnectionsRequired && (
        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold min-w-6 text-center">E</span>
      )}
    </div>
  </div>
</td>
                    <td className="border border-black p-2 text-[24px]">
                      {request.selectedSection}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {request.selectedDepo}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {request.missionBlock}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {getLineOrRoad(request)}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {formatTime(request.demandTimeFrom)} -{" "}
                      {formatTime(request.demandTimeTo)}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {editingId === request.id ? (
                        <div className="flex gap-1 items-center">
                          <input
                            type="time"
                            value={timeFrom}
                            onChange={(e) => setTimeFrom(e.target.value)}
                            className="w-20 border p-1 text-sm rounded"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={timeTo}
                            onChange={(e) => setTimeTo(e.target.value)}
                            className="w-20 border p-1 text-sm rounded"
                          />
                        </div>
                      ) : (
                        <>
                          {request.optimizeTimeFrom &&
                            request.optimizeTimeFrom !== "WrongRequest"
                            ? formatTime(request.optimizeTimeFrom)
                            : "N/A"}{" "}
                          -{" "}
                          {request.optimizeTimeTo &&
                            request.optimizeTimeTo !== "WrongRequest"
                            ? formatTime(request.optimizeTimeTo)
                            : "N/A"}
                        </>
                      )}
                    </td>

                    <td className="border border-black p-2 text-[24px]">
                      {request.activity}
                    </td>
                                        <td className="border border-black p-2 text-[24px]">
  <div className="flex gap-2">
    {editingId === request.id ? (
      <>
        <button
          onClick={() => handleUpdateClick(request.id)}
          className="px-2 py-1 text-[24px] bg-green-600 text-white border border-black rounded"
          disabled={updateOptimizedTimes.isPending}
        >
          {updateOptimizedTimes.isPending ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleCancelEdit}
          className="px-2 py-1 text-[24px] bg-gray-400 text-white border border-black rounded"
        >
          Cancel
        </button>
      </>
    ) : modifyReturnOpenId === request.id ? (
      <>
        {/* <button
          className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
          onClick={() => {
            setEditingId(request.id);
            setEditDate(request.date.split("T")[0]);
            setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
            setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
            setModifyReturnOpenId(null);
          }}
        >
          Modify
        </button> */}
        <button
  className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
  onClick={() => {
    setEditingId(request.id);
    setEditDate(request.date.split("T")[0]);
    setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
    setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");

    setModifyReturnOpenId(null);
  }}
>
  Modify
</button>
        <button
          className="px-2 py-1 text-[24px] bg-[#f69697] text-white border border-black rounded"
          onClick={() => {
            handleRejectClick(request.id);
            setModifyReturnOpenId(null);
          }}
        >
          Return
        </button>
        <button
          className="px-2 py-1 text-[24px] bg-gray-300 text-black border border-black rounded"
          onClick={() => setModifyReturnOpenId(null)}
        >
          Cancel
        </button>
      </>
    ) : (
      <>
        {request.optimizeStatus === false ? (
          // <button
          //   className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
          //   onClick={() => {
          //     setEditingId(request.id);
          //     setEditDate(request.date.split("T")[0]);
          //     setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
          //     setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
          //     setModifyReturnOpenId(null);
          //   }}
          // >
          //   Modify
          // </button>
          <button
  className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
  onClick={() => {
    setEditingId(request.id);
    setEditDate(request.date.split("T")[0]);
    setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
    setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
    

    setModifyReturnOpenId(null);
  }}
>
  Modify
</button>
        ) : (
          <>
            <button
              className="px-2 py-1 text-[24px] bg-green-600 text-white border border-black rounded"
             onClick={() => handleDraftClick(request)}
            >
              Draft
            </button>
                  <button
              className="px-2 py-1 text-[24px] bg-green-600 text-white border border-black rounded"
             onClick={() => handleSanctionClick(request)}
            >
              Sanction
            </button>
            <button
              className="px-2 py-1 text-[24px] bg-gray-300 text-black border border-black rounded"
              onClick={() => setModifyReturnOpenId(request.id)}
            >
              Modify/Return
            </button>
          </>
        )}
      </>
    )}
  </div>
</td>
                    <td className="border border-black p-2 text-[24px] min-w-[140px]">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/view-request/${request.id}?from=request-table`}
                          className="px-2 py-1 bg-blue-600 text-white border border-black rounded inline-block text-center  w-full min-w-[120px]"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>




{/* Draft Modal */}
{isDraftModalOpen && (
  <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-bold mb-4 text-black">Repurcussion</h2>
      <textarea
        className="w-full border p-2 rounded mb-4 text-black"
        rows={4}
        placeholder="Enter repurcussion remark..."
        value={draftRemark}
        onChange={(e) => setDraftRemark(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded"
          onClick={() => {
            setIsDraftModalOpen(false);
            setDraftRemark("");
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => handleSendNonUrgentRequests(selectedRequests, draftRemark)}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}
{/* Sanction Modal */}
{isSanctionModalOpen && (
  <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-bold mb-4 text-black">Sanction Request</h2>
      <p className="mb-4 text-black">
        Are you sure you want to sanction this request?
      </p>
      <textarea
        className="w-full border p-2 rounded mb-4 text-black"
        rows={4}
        placeholder="Enter sanction remark (optional)..."
        value={sanctionRemark}
        onChange={(e) => setSanctionRemark(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded"
          onClick={() => {
            setIsSanctionModalOpen(false);
            setSanctionRemark("");
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => handleSendSanctionedRequests(selectedRequestsForSanction, sanctionRemark)}
        >
          Sanction
        </button>
      </div>
    </div>
  </div>
)}

               <div className="mb-8">
          <h2 className="text-[24px] font-semibold mb-2 text-[#13529e]">Combined Requests (Multiple Line Selected)</h2>
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-lg border border-gray-300 shadow-sm">
            <table className="w-full border-collapse text-black bg-white">
              <thead className="sticky top-0 z-10 bg-gray-100 shadow">
                <tr className="bg-gray-50">
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="date" title="Date" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="date" title="Dept" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="section" title="Major Section" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="section" title="SSE" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="section" title="Block Section" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="line" title="Line / Road" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="time" title="Demanded" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="time" title="Optimize" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="work" title="Activity" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="action" title="Actions" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="view" title="View" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {combinedRequestsFiltered.filter((request: UserRequest) => request.Draft === false&& request.corridorType !== "Urgent Block").length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      className="border border-black p-2 text-[24px] text-left"
                    >
                      <div className="text-center py-4">
                        <p className="mb-2">No requests found.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {combinedRequestsFiltered.filter((request: UserRequest) => request.Draft === false&& request.corridorType !== "Urgent Block").sort((a: any, b: any) => new Date(a.demandTimeFrom).getTime() - new Date(b.demandTimeFrom).getTime()).map((request: UserRequest) => (
                  <tr
   key={`request-${request.id}-${request.date}`}
className={`transition-colors ${
  request.selectedDepartment === "ENGG" &&
  (request.sntDisconnectionRequired ||
    request.powerBlockRequired ||
    request.enggDisconnectionsRequired)
    ? "bg-gray-200"
    : request.selectedDepartment === "S&T" &&
      (request.sntDisconnectionRequired ||
        request.powerBlockRequired ||
        request.enggDisconnectionsRequired)
    ? "bg-gray-200"
    : request.selectedDepartment === "TRD" &&
      (request.sntDisconnectionRequired ||
        request.powerBlockRequired ||
        request.enggDisconnectionsRequired)
    ? "bg-gray-200"
    : "bg-white-200"
}`}
                  >
                    {/* <td className="border border-black p-2 text-[24px]">
                      {editingId === request.id ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-28 border p-1 text-sm rounded"
                        />
                      ) : (
                        dayjs(request.date).format("DD-MM-YY")
                      )}
                    </td> */}
  <td className="border border-black p-2 text-[24px]">
  {editingId === request.id ? (
    <input
      type="date"
      value={editDate}
      onChange={(e) => setEditDate(e.target.value)}
      className="w-28 border p-1 text-sm rounded"
    />
  ) : (
    dayjs(request.date).format("DD-MM-YY")
  )}
</td>
                                    <td className="border border-black p-2 text-[24px]">
  <div className="flex flex-col items-start gap-1">
    <span>{request.selectedDepartment}</span>
    <div className="flex gap-1">
      {request.sntDisconnectionRequired && (
        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold min-w-6 text-center">S</span>
      )}
      {request.powerBlockRequired && (
        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-bold min-w-6 text-center">T</span>
      )}
      {request.enggDisconnectionsRequired && (
        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold min-w-6 text-center">E</span>
      )}
    </div>
  </div>
</td>
                    <td className="border border-black p-2 text-[24px]">
                      {request.selectedSection}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {request.selectedDepo}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {request.missionBlock}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {getLineOrRoad(request)}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {formatTime(request.demandTimeFrom)} -{" "}
                      {formatTime(request.demandTimeTo)}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {editingId === request.id ? (
                        <div className="flex gap-1 items-center">
                          <input
                            type="time"
                            value={timeFrom}
                            onChange={(e) => setTimeFrom(e.target.value)}
                            className="w-20 border p-1 text-sm rounded"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={timeTo}
                            onChange={(e) => setTimeTo(e.target.value)}
                            className="w-20 border p-1 text-sm rounded"
                          />
                        </div>
                      ) : (
                        <>
                          {request.optimizeTimeFrom &&
                            request.optimizeTimeFrom !== "WrongRequest"
                            ? formatTime(request.optimizeTimeFrom)
                            : "N/A"}{" "}
                          -{" "}
                          {request.optimizeTimeTo &&
                            request.optimizeTimeTo !== "WrongRequest"
                            ? formatTime(request.optimizeTimeTo)
                            : "N/A"}
                        </>
                      )}
                    </td>

                    <td className="border border-black p-2 text-[24px]">
                      {request.activity}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
  <div className="flex gap-2">
    {editingId === request.id ? (
      <>
        <button
          onClick={() => handleUpdateClick(request.id)}
          className="px-2 py-1 text-[24px] bg-green-600 text-white border border-black rounded"
          disabled={updateOptimizedTimes.isPending}
        >
          {updateOptimizedTimes.isPending ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleCancelEdit}
          className="px-2 py-1 text-[24px] bg-gray-400 text-white border border-black rounded"
        >
          Cancel
        </button>
      </>
    ) : modifyReturnOpenId === request.id ? (
      <>
        {/* <button
          className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
          onClick={() => {
            setEditingId(request.id);
            setEditDate(request.date.split("T")[0]);
            setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
            setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
            setModifyReturnOpenId(null);
          }}
        >
          Modify
        </button> */}
        <button
  className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
  onClick={() => {
    setEditingId(request.id);
    setEditDate(request.date.split("T")[0]);
    setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
    setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
    

    setModifyReturnOpenId(null);
  }}
>
  Modify
</button>
        <button
          className="px-2 py-1 text-[24px] bg-[#f69697] text-white border border-black rounded"
          onClick={() => {
            handleRejectClick(request.id);
            setModifyReturnOpenId(null);
          }}
        >
          Return
        </button>
        <button
          className="px-2 py-1 text-[24px] bg-gray-300 text-black border border-black rounded"
          onClick={() => setModifyReturnOpenId(null)}
        >
          Cancel
        </button>
      </>
    ) : (
      <>
        {request.optimizeStatus === false ? (
          // <button
          //   className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
          //   onClick={() => {
          //     setEditingId(request.id);
          //     setEditDate(request.date.split("T")[0]);
          //     setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
          //     setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
          //     setModifyReturnOpenId(null);
          //   }}
          // >
          //   Modify
          // </button>
          <button
  className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
  onClick={() => {
    setEditingId(request.id);
    setEditDate(request.date.split("T")[0]);
    setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
    setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
    setModifyReturnOpenId(null);
  }}
>
  Modify
</button>
        ) : (
          <>
            <button
              className="px-2 py-1 text-[24px] bg-green-600 text-white border border-black rounded"
              onClick={() => handleDraftClick(request)}
            >
              Draft
            </button>
                  <button
              className="px-2 py-1 text-[24px] bg-green-600 text-white border border-black rounded"
                         onClick={() => handleSanctionClick(request)}

            >
              Sanction
            </button>
            <button
              className="px-2 py-1 text-[24px] bg-gray-300 text-black border border-black rounded"
              onClick={() => setModifyReturnOpenId(request.id)}
            >
              Modify/Return
            </button>
          </>
        )}
      </>
    )}
  </div>
</td>

                    <td className="border border-black p-2 text-[24px] min-w-[140px]">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/view-request/${request.id}?from=request-table`}
                          className="px-2 py-1 bg-blue-600 text-white border border-black rounded inline-block text-center w-full min-w-[120px]"
                        >
                          View
                        </Link>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>





        {/* Non-Corridor Requests Section */}
        <div className="mb-8">
          <h2 className="text-[24px] font-semibold mb-2 text-[#13529e]">Non-Corridor Requests</h2>
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-lg border border-gray-300 shadow-sm">
            <table className="w-full border-collapse text-black bg-white">
              <thead className="sticky top-0 z-10 bg-gray-100 shadow">
                <tr className="bg-gray-50">
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="date" title="Date" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="date" title="Dept" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="section" title="Major Section" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="section" title="SSE" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="section" title="Block Section" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="line" title="Line / Road" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="time" title="Demanded" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="time" title="Optimize" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="work" title="Activity" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="action" title="Actions" />
                  </th>
                  <th className="border border-black p-2 text-left text-[24px] font-semibold text-black sticky top-0 bg-gray-100 z-10">
                    <ColumnHeader icon="view" title="View" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {nonCorridorRequestsFiltered.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      className="border border-black p-2 text-[24px] text-left"
                    >
                      <div className="text-center py-4">
                        <p className="mb-2">No requests found.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {nonCorridorRequestsFiltered.filter((request: UserRequest) => request.Draft === false).sort((a: any, b: any) => new Date(a.demandTimeFrom).getTime() - new Date(b.demandTimeFrom).getTime()).map((request: UserRequest) => (
                  <tr
  key={`request-${request.id}-${request.date}`}
className={`transition-colors ${
  request.selectedDepartment === "ENGG" &&
  (request.sntDisconnectionRequired ||
    request.powerBlockRequired ||
    request.enggDisconnectionsRequired)
    ? "bg-gray-200"
    : request.selectedDepartment === "S&T" &&
      (request.sntDisconnectionRequired ||
        request.powerBlockRequired ||
        request.enggDisconnectionsRequired)
    ? "bg-gray-200"
    : request.selectedDepartment === "TRD" &&
      (request.sntDisconnectionRequired ||
        request.powerBlockRequired ||
        request.enggDisconnectionsRequired)
    ? "bg-gray-200"
    : "bg-white-200"
}`}
                  >
                    {/* <td className="border border-black p-2 text-[24px]">
                      {editingId === request.id ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-28 border p-1 text-sm rounded"
                        />
                      ) : (
                        dayjs(request.date).format("DD-MM-YY")
                      )}
                    </td> */}
  <td className="border border-black p-2 text-[24px]">
  {editingId === request.id ? (
    <input
      type="date"
      value={editDate}
      onChange={(e) => setEditDate(e.target.value)}
      className="w-28 border p-1 text-sm rounded"
    />
  ) : (
    dayjs(request.date).format("DD-MM-YY")
  )}
</td>
                                    <td className="border border-black p-2 text-[24px]">
  <div className="flex flex-col items-start gap-1">
    <span>{request.selectedDepartment}</span>
    <div className="flex gap-1">
      {request.sntDisconnectionRequired && (
        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold min-w-6 text-center">S</span>
      )}
      {request.powerBlockRequired && (
        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-bold min-w-6 text-center">T</span>
      )}
      {request.enggDisconnectionsRequired && (
        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold min-w-6 text-center">E</span>
      )}
    </div>
  </div>
</td>
                    <td className="border border-black p-2 text-[24px]">
                      {request.selectedSection}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {request.selectedDepo}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {request.missionBlock}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {getLineOrRoad(request)}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {formatTime(request.demandTimeFrom)} -{" "}
                      {formatTime(request.demandTimeTo)}
                    </td>
                    <td className="border border-black p-2 text-[24px]">
                      {editingId === request.id ? (
                        <div className="flex gap-1 items-center">
                          <input
                            type="time"
                            value={timeFrom}
                            onChange={(e) => setTimeFrom(e.target.value)}
                            className="w-20 border p-1 text-sm rounded"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={timeTo}
                            onChange={(e) => setTimeTo(e.target.value)}
                            className="w-20 border p-1 text-sm rounded"
                          />
                        </div>
                      ) : (
                        <>
                          {request.optimizeTimeFrom &&
                            request.optimizeTimeFrom !== "WrongRequest"
                            ? formatTime(request.optimizeTimeFrom)
                            : "N/A"}{" "}
                          -{" "}
                          {request.optimizeTimeTo &&
                            request.optimizeTimeTo !== "WrongRequest"
                            ? formatTime(request.optimizeTimeTo)
                            : "N/A"}
                        </>
                      )}
                    </td>

                    <td className="border border-black p-2 text-[24px]">
                      {request.activity}
                    </td>
                                        <td className="border border-black p-2 text-[24px]">
  <div className="flex gap-2">
    {editingId === request.id ? (
      <>
        <button
          onClick={() => handleUpdateClick(request.id)}
          className="px-2 py-1 text-[24px] bg-green-600 text-white border border-black rounded"
          disabled={updateOptimizedTimes.isPending}
        >
          {updateOptimizedTimes.isPending ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleCancelEdit}
          className="px-2 py-1 text-[24px] bg-gray-400 text-white border border-black rounded"
        >
          Cancel
        </button>
      </>
    ) : modifyReturnOpenId === request.id ? (
      <>
        {/* <button
          className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
          onClick={() => {
            setEditingId(request.id);
            setEditDate(request.date.split("T")[0]);
            setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
            setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
            setModifyReturnOpenId(null);
          }}
        >
          Modify
        </button> */}
        <button
  className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
  onClick={() => {
    setEditingId(request.id);
    setEditDate(request.date.split("T")[0]);
    setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
    setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
    setModifyReturnOpenId(null);
  }}
>
  Modify
</button>
        <button
          className="px-2 py-1 text-[24px] bg-[#f69697] text-white border border-black rounded"
          onClick={() => {
            handleRejectClick(request.id);
            setModifyReturnOpenId(null);
          }}
        >
          Return
        </button>
        <button
          className="px-2 py-1 text-[24px] bg-gray-300 text-black border border-black rounded"
          onClick={() => setModifyReturnOpenId(null)}
        >
          Cancel
        </button>
      </>
    ) : (
      <>
        {request.optimizeStatus === false ? (
          // <button
          //   className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
          //   onClick={() => {
          //     setEditingId(request.id);
          //     setEditDate(request.date.split("T")[0]);
          //     setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
          //     setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
          //     setModifyReturnOpenId(null);
          //   }}
          // >
          //   Modify
          // </button>
          <button
  className="px-2 py-1 text-[24px] bg-yellow-500 text-white border border-black rounded"
  onClick={() => {
    setEditingId(request.id);
    setEditDate(request.date.split("T")[0]);
    setTimeFrom(request.optimizeTimeFrom ? formatTime(request.optimizeTimeFrom) : "");
    setTimeTo(request.optimizeTimeTo ? formatTime(request.optimizeTimeTo) : "");
    setModifyReturnOpenId(null);
  }}
>
  Modify
</button>
        ) : (
          <>
            <button
              className="px-2 py-1 text-[24px] bg-green-600 text-white border border-black rounded"
             onClick={() => handleDraftClick(request)}
            >
              Draft  
            </button>
             <button
              className="px-2 py-1 text-[24px] bg-green-600 text-white border border-black rounded"
                        onClick={() => handleSanctionClick(request)}

            >
              Sanction
            </button>
            <button
              className="px-2 py-1 text-[24px] bg-gray-300 text-black border border-black rounded"
              onClick={() => setModifyReturnOpenId(request.id)}
            >
              Modify/Return
            </button>
          </>
        )}
      </>
    )}
  </div>
</td>
                    <td className="border border-black p-2 text-[24px] min-w-[140px]">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/view-request/${request.id}?from=request-table`}
                          className="px-2 py-1 bg-blue-600 text-white border border-black rounded inline-block text-center w-full min-w-[120px]"
                        >
                          View
                        </Link>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>








       
       
        {/* Optimization Dialog */}
        {showRejectionModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="bg-white p-4 rounded shadow-lg z-30">
              <h3 className="font-bold text-lg mb-2">Reason for Rejection</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-4"
                placeholder="Enter reason for rejection..."
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (currentRequestId) {
                      handleRequestAction(
                        currentRequestId,
                        false,
                        rejectionReason
                      );
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-center gap-3 mb-2 mt-8">

          <a
            href="/admin/request-table"
            className="flex items-center gap-1 bg-[#E6E6FA] border border-black px-8 py-1.5 rounded-[50%] text-[24px] font-bold"
            style={{ color: "black" }}
          >
            Back
          </a>
        </div>

        <div className="text-[10px] text-gray-600 mt-2 border-t border-black pt-1 text-right">
          © {new Date().getFullYear()} Indian Railways
        </div>
      </div>
  );
}

function min(allDates: Date[]): Date | null {
  if (!allDates || allDates.length === 0) return null;
  return allDates.reduce((minDate, currDate) =>
    currDate < minDate ? currDate : minDate
  );
}


