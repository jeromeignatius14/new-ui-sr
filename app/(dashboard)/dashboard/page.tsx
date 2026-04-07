// "use client";

// import { Loader } from "@/app/components/ui/Loader";
// import ManagerQuickLinks from "@/app/(dashboard)/(manager)/manage/quick-links/component";
// import AdminQuickLinks from "@/app/(dashboard)/(admin)/admin/quick-links/component";
// import UserQuickLinks from "@/app/(dashboard)/(user)/quick-links/component";
// import { useSession } from "next-auth/react";
// import Link from "next/link";
// import { FaHome } from "react-icons/fa";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { userRequestService } from "@/app/service/api/user-request";
// import axiosInstance from "@/app/utils/axiosInstance";
// import {
//   format,
//   addDays,
//   parseISO
// } from "date-fns";
// import { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
// import { toZonedTime } from 'date-fns-tz';
// interface OverdueBlockModalProps {
//   requests: any[];
//   onAccept: (id: string) => void;
//   onReject: (id: string, reason: string) => void;
//   onClose: () => void;
// }

// // function OverdueBlockModal({ requests, onAccept, onReject, onClose }: OverdueBlockModalProps) {
// //   const [showRejectModal, setShowRejectModal] = useState(false);
// //   const [selectedRequest, setSelectedRequest] = useState<any>(null);
// //   const [rejectRemarks, setRejectRemarks] = useState("");
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   // Format date as dd/MM/yyyy
// //   const formatDateIST = (dateString: string) => {
// //     try {
// //       const date = parseISO(dateString);
// //       return format(date, 'dd/MM/yyyy');
// //     } catch (error) {
// //       return dateString;
// //     }
// //   };

// //   // Show DB times as-is (06:30, 07:30)
// //   const formatTimeIST = (dateString: string) => {
// //     try {
// //       // Extract time from "2025-12-04T06:30:00.000Z" → "06:30"
// //       return dateString.substring(11, 16);
// //     } catch (error) {
// //       return dateString;
// //     }
// //   };

// //   const handleAccept = async (requestId: string) => {
// //     setIsSubmitting(true);
// //     try {
// //       await onAccept(requestId);
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   const handleRejectClick = (request: any) => {
// //     setSelectedRequest(request);
// //     setShowRejectModal(true);
// //   };

// //   const handleRejectSubmit = async () => {
// //     if (!rejectRemarks.trim()) {
// //       toast.error("Please provide remarks for rejection");
// //       return;
// //     }
// //     if (!selectedRequest) return;
    
// //     setIsSubmitting(true);
// //     try {
// //       await onReject(selectedRequest.id, rejectRemarks);
// //       setShowRejectModal(false);
// //       setSelectedRequest(null);
// //       setRejectRemarks("");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   // CORRECT: Calculate overdue hours - Treat DB times as IST, compare with current Railway Time
// //   const calculateOverdueHours = (sanctionedTimeTo: string) => {
// //     try {
// //       // 1. Current Railway Time (IST)
// //       const now = new Date();
// //       const nowIST = toZonedTime(now, 'Asia/Kolkata');
      
// //       // 2. Extract time from DB string (e.g., "07:30" from "2025-12-05T07:30:00.000Z")
// //       const dbTimeStr = sanctionedTimeTo.substring(11, 16); // "07:30"
// //       const [dbHours, dbMinutes] = dbTimeStr.split(':').map(Number);
      
// //       // 3. Create a date object with DB time for TODAY (treating it as IST)
// //       const todayIST = toZonedTime(new Date(), 'Asia/Kolkata');
// //       const sanctionedEndIST = new Date(todayIST);
// //       sanctionedEndIST.setHours(dbHours, dbMinutes, 0, 0);
      
// //       // 4. Calculate difference
// //       const diffMs = nowIST.getTime() - sanctionedEndIST.getTime();
      
// //       if (diffMs <= 0) return 0;
      
// //       // Convert to full hours
// //       const hours = Math.floor(diffMs / (1000 * 60 * 60));
      
// //       return hours;
// //     } catch (error) {
// //       console.error("Error calculating overdue hours:", error);
// //       return 0;
// //     }
// //   };



// //   return (
// //     <>
// //       {/* Main Modal */}
// //       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
// //         <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200 shadow-2xl">
// //           {/* Header */}
// //           <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
// //             <div className="flex justify-between items-center">
// //               <div>
// //                 <h2 className="text-2xl font-bold">Overdue Block Notifications</h2>
// //                 <p className="text-blue-100 mt-1">
// //                   {requests.length} block(s) require your attention
// //                 </p>
// //               </div>
         
// //             </div>
         
// //           </div>

// //           {/* Content */}
// //           <div className="p-6">
    

// //             {/* Table */}
// //             <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
// //               <table className="min-w-full divide-y divide-gray-200">
// //                 <thead className="bg-gray-50">
// //                   <tr>
// //                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
// //                       DATE
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
// //                       DIVISION ID
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
// //                       BLOCK
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
// //                       FROM (IST)
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
// //                       TO (IST)
// //                     </th>
                 
// //                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
// //                       ACTIONS
// //                     </th>
// //                   </tr>
// //                 </thead>
// //                 <tbody className="bg-white divide-y divide-gray-200">
// //                   {requests.map((request) => {
// //                     const overdueHours = calculateOverdueHours(request.sanctionedTimeTo);
                    
// //                     return (
// //                       <tr key={request.id} className="hover:bg-gray-50 transition-colors">
// //                         {/* DATE */}
// //                         <td className="px-6 py-4 whitespace-nowrap">
// //                           <div className="text-sm font-medium text-gray-900">
// //                             {formatDateIST(request.date)}
// //                           </div>
// //                         </td>
                        
// //                         {/* DIVISION ID */}
// //                         <td className="px-6 py-4 whitespace-nowrap">
// //                           <div className="text-sm text-gray-900 font-medium">
// //                             {request.divisionId}
// //                           </div>
// //                         </td>
                        
// //                         {/* BLOCK */}
// //                         <td className="px-6 py-4 whitespace-nowrap">
// //                           <div className="text-sm font-semibold text-blue-600">
// //                             {request.missionBlock}
// //                           </div>
// //                         </td>
                        
// //                         {/* FROM (IST) */}
// //                         <td className="px-6 py-4 whitespace-nowrap">
// //                           <div className="text-sm text-gray-900">
// //                             {formatTimeIST(request.sanctionedTimeFrom)}
// //                           </div>
// //                         </td>
                        
// //                         {/* TO (IST) */}
// //                         <td className="px-6 py-4 whitespace-nowrap">
// //                           <div className="text-sm text-gray-900">
// //                             {formatTimeIST(request.sanctionedTimeTo)}
// //                           </div>
// //                         </td>
                        
                     
                        
// //                         {/* ACTIONS */}
// //                         <td className="px-6 py-4 whitespace-nowrap">
// //                           <div className="flex space-x-2">
// //                             <button
// //                               onClick={() => handleAccept(request.id)}
// //                               disabled={isSubmitting}
// //                               className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
// //                             >
// //                               <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
// //                               </svg>
// //                               Accept
// //                             </button>
                            
// //                             <button
// //                               onClick={() => handleRejectClick(request)}
// //                               disabled={isSubmitting}
// //                               className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
// //                             >
// //                               <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// //                               </svg>
// //                               Reject
// //                             </button>
// //                           </div>
// //                         </td>
// //                       </tr>
// //                     );
// //                   })}
// //                 </tbody>
// //               </table>
// //             </div>

         
// //           </div>
// //         </div>
// //       </div>

// //       {/* Reject Remarks Modal */}
// //       {showRejectModal && selectedRequest && (
// //         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
// //           <div className="bg-white rounded-xl max-w-md w-full overflow-hidden border border-gray-200 shadow-2xl">
// //             <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
// //               <h3 className="text-xl font-bold">Provide Rejection Remarks</h3>
// //             </div>
            
// //             <div className="p-6">
// //               <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
// //                 <p className="font-medium text-gray-800">Block: <span className="text-blue-600">{selectedRequest.missionBlock}</span></p>
// //                 <p className="text-sm text-gray-600 mt-1">
// //                   Scheduled: {formatTimeIST(selectedRequest.sanctionedTimeFrom)} - {formatTimeIST(selectedRequest.sanctionedTimeTo)} IST
// //                 </p>
// //                 <p className="text-sm text-red-600 mt-1">
// //                   Overdue by: {calculateOverdueHours(selectedRequest.sanctionedTimeTo)} hours
// //                 </p>
// //               </div>
              
// //               <div className="mb-4">
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Reason for rejection *
// //                 </label>
// //                 <textarea
// //                   value={rejectRemarks}
// //                   onChange={(e) => setRejectRemarks(e.target.value)}
// //                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
// //                   rows={4}
// //                   placeholder="Please provide details about why the block needs adjustment..."
// //                   required
// //                 />
            
// //               </div>

// //               <div className="flex gap-3 justify-end">
// //                 <button
// //                   onClick={() => {
// //                     setShowRejectModal(false);
// //                     setSelectedRequest(null);
// //                     setRejectRemarks("");
// //                   }}
// //                   disabled={isSubmitting}
// //                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
// //                 >
// //                   Cancel
// //                 </button>
// //                 <button
// //                   onClick={handleRejectSubmit}
// //                   disabled={isSubmitting || !rejectRemarks.trim()}
// //                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
// //                 >
// //                   {isSubmitting ? "Submitting..." : "Submit Remarks"}
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }
// export default function DashboardPage() {
//   const { data: session, status } = useSession({
//     required: true,
//     onUnauthenticated() {
//       window.location.href = "/auth/login";
//     },
//   });


//   const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
//   const [pendingRequests, setPendingRequests] = useState<any[]>([]);
//   const queryClient = useQueryClient();

//   const today = new Date();
//   const endDate = addDays(today, 10);

//   const formattedStartDate = format(today, "yyyy-MM-dd");
//   const formattedEndDate = format(endDate, "yyyy-MM-dd");

//   const { data: requestsData } = useQuery({
//     queryKey: ["user-requests"],
//     queryFn: () => userRequestService.getUserRequests(1, 10, formattedStartDate, formattedEndDate),
//     enabled: !!session?.user,
//   });

//   const acceptMutation = useMutation({
//     mutationFn: (id: string) => userRequestService.acceptUserRequestRemark(id),
//     onSuccess: (data, id) => {
//       toast.success("Block marked as completed!");
//       queryClient.invalidateQueries({ queryKey: ["user-requests"] });
//       // Remove accepted request from modal
//       setPendingRequests(prev => prev.filter(req => req.id !== id));
//     },
//     onError: (error) => {
//       toast.error("Failed to accept request.");
//       console.error(error);
//     },
//   });

//   const rejectMutation = useMutation({
//     mutationFn: ({ id, reason }: { id: string; reason: string }) =>
//       userRequestService.rejectUserRequestRemark(id, reason),
//     onSuccess: (data, { id }) => {
//       toast.success("Remarks submitted!");
//       queryClient.invalidateQueries({ queryKey: ["user-requests"] });
//       // Remove rejected request from modal
//       setPendingRequests(prev => prev.filter(req => req.id !== id));
//     },
//     onError: (error) => {
//       toast.error("Failed to reject request.");
//       console.error(error);
//     },
//   });


// // Check if popup is needed for a request - MODIFIED WITH 4-HOUR DELAY
// // const checkIfPopupNeeded = (request: any) => {
// //   if (!request.sanctionedTimeTo) {
// //     return false;
// //   }
  
// //   try {
// //     // Current Railway Time (IST)
// //     const now = new Date();
// //     const nowIST = toZonedTime(now, 'Asia/Kolkata');
    
// //     // Extract time from DB string (treat as IST)
// //     const dbTimeStr = request.sanctionedTimeTo.substring(11, 16);
// //     const [dbHours, dbMinutes] = dbTimeStr.split(':').map(Number);
    
// //     // Create a date object with DB time for TODAY (treating it as IST)
// //     const todayIST = toZonedTime(new Date(), 'Asia/Kolkata');
// //     const sanctionedEndIST = new Date(todayIST);
// //     sanctionedEndIST.setHours(dbHours, dbMinutes, 0, 0);
    
// //     // Add 4 hours to sanctioned end time
// //     const fourHoursAfterEnd = new Date(sanctionedEndIST.getTime());
// //     fourHoursAfterEnd.setHours(fourHoursAfterEnd.getHours() + 4);
    
// //     // Check if current time is AFTER (sanctioned end time + 4 hours)
// //     const isFourHoursOverdue = nowIST > fourHoursAfterEnd;
    
// //     if (!isFourHoursOverdue) {
// //       return false;
// //     }
    
// //     // Check if user has already responded
// //     const hasResponded = (
// //       request.userAcceptanceForSanction === true ||
// //       (request.userAcceptanceForSanction === false && 
// //        request.userResponse !== null && 
// //        request.userResponse !== undefined && 
// //        request.userResponse.trim() !== "")
// //     );
    
// //     return !hasResponded;
    
// //   } catch (error) {
// //     console.error("Error checking popup condition:", error);
// //     return false;
// //   }
// // };
//   // Check for overdue blocks
//   // useEffect(() => {
//   //   if (requestsData?.data?.requests && (session?.user?.role === "USER" || session?.user?.role === "JE")) {
//   //     console.log('Checking for overdue blocks...');
      
//   //     const overdueRequests = requestsData.data.requests.filter((request: any) => {
//   //       return checkIfPopupNeeded(request);
//   //     });

//   //     console.log('Overdue requests found:', overdueRequests.length);

//   //     // If there are overdue requests, show modal for all of them
//   //     if (overdueRequests.length > 0 && pendingRequests.length === 0) {
//   //       console.log('Setting pending requests and showing modal');
//   //       setPendingRequests(overdueRequests);
//   //       setShowAcceptanceModal(true);
//   //     }
//   //   }
//   // }, [requestsData, pendingRequests, session?.user?.role]);

//   const handleAccept = (id: string) => {
//     acceptMutation.mutate(id);
//   };

//   const handleReject = (id: string, reason: string) => {
//     rejectMutation.mutate({ id, reason });
//   };

//   // Close modal when all requests are processed
//   useEffect(() => {
//     if (pendingRequests.length === 0 && showAcceptanceModal) {
//       setShowAcceptanceModal(false);
//     }
//   }, [pendingRequests, showAcceptanceModal]);

// const hasInProgressBlock = requestsData?.data?.requests?.find(
//   (request: any) =>
//     ["inprogress", "in-progress"].includes(request.overAllStatus?.toLowerCase())
// );

//   // if ((session?.user?.role === "USER" || session?.user?.role === "JE") &&
//   //     showAcceptanceModal && pendingRequests.length > 0) {
//   //   return (
//   //     <OverdueBlockModal
//   //       requests={pendingRequests}
//   //       onAccept={handleAccept}
//   //       onReject={handleReject}
//   //       onClose={() => {
//   //         setShowAcceptanceModal(false);
//   //         setPendingRequests([]);
//   //       }}
//   //     />
//   //   );
//   // }

//   if (status === "loading") {
//     return <Loader name="dashboard" />;
//   }

//   // Current date formatting for government style
//   const currentDate = new Date();
//   const formattedDate = currentDate.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   // Custom user dashboard UI - same for USER and JE roles
//   if (session?.user?.role === "USER" || session?.user?.role === "JE") {
//     return (
//       <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
//         {/* Header */}
//         <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
//           <span className="absolute left-4 top-1/2 -translate-y-1/2">
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
//           </span>
//           <span className="text-2xl font-bold text-black" >Home</span>
//         </div>
//         {/* RBMS badge */}
//         <div className="w-full flex justify-center mt-4">
//           <div className="bg-[#8ed974] px-8 py-2">
//             <span className="text-[9vw] min-[430px]:text-4xl text-nowrap font-extrabold text-[#b07be0] tracking-wide">RBMS-{session?.user?.location}-DIVN</span>
//           </div>
//         </div>
//         {/* Designation bar */}
//         <div className="w-full flex justify-center mt-4">
//           <div className="bg-[#ffeaea] px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
//             <span className="text-2xl font-semibold text-gray-700 tracking-wide">DESGN:<span className="text-2xl font-bold text-black">{session?.user?.name || ''}</span></span>
//           </div>
//         </div>
//         {/* Navigation buttons */}
//         <div className="w-full flex flex-col items-center gap-5 mt-6 px-2 max-w-md">
//           <a href="/create-block-request" className="w-full rounded-full bg-[#eeb8f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">ENTER NEW BLOCK REQUEST</a>
//           <a href="/edit-request" className="w-full rounded-full bg-[#aee6f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">EDIT/CANCEL PREVIOUS BLOCK REQUESTS</a>
//           <a href="/request-table" className="w-full rounded-full bg-[#c7c7f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">SUMMARY OF MY BLOCK REQUESTS</a>
//           <a href="/avail-block" className="w-full rounded-full bg-[#a6f7a6] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">AVAIL BLOCK AT SITE</a>

// {hasInProgressBlock && (
//   <a
//     href={`https://mobile-bms.plattrtechstudio.com/?cugNumber=${session?.user?.phone}&section=MAS-GDR&in-progress=true`}
//     className="w-full rounded-full bg-[#f69697] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition"
//   >
//     Block under progress
//   </a>
// )}


//           <a href="/generate-reports" className="w-full rounded-full bg-[#ffd180] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">GENERATE REPORTS</a>
//         </div>

//         {/* Logout button */}
//         <div className="w-full flex justify-center mt-10 mb-4">
//           <form action="/auth/login" method="get" onSubmit={async (e) => { e.preventDefault(); await import('next-auth/react').then(mod => mod.signOut({ redirect: true, callbackUrl: '/auth/login' })); }}>
//             <button type="submit" className="flex items-center gap-2 bg-[#dbe6fd] border border-black rounded-[50%] px-6 py-2 text-lg font-bold text-black shadow hover:bg-[#c7d7f7] transition">
//               <span className=" w-7 h-7 bg-white rounded-[50%] border border-black flex items-center justify-center">
//                 <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black' strokeWidth={2} className='w-5 h-5'><path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' /></svg>
//               </span>
//               Logout
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }

// if (session?.user?.role === "DEPT_CONTROLLER") {
//     window.location.href = "/manage/request-table";
// }
// if (session?.user?.role === "HQ") {
//     window.location.href = "/hq/generate-report";
// }
// if (session?.user?.role === "BOARD_CONTROLLER") {
//     window.location.href = "/tpc";
// }

// if (session?.user?.role === "SM") {
//     // window.location.href = "https://smr-dashboard.plattorian.tech/?cugNumber=${session?.user?.phone}&section=MAS-GDR";
//     window.location.href=`https://smr-dashboard.plattorian.tech/?cugNumber=${session?.user?.phone}&stationCode=${session?.user?.depot}&user=SM&token=W1IU66ZFEBFBF6C1dGmouN6PVyHARQJg`
// }
//   // Custom admin dashboard UI (match manager dashboard style)
//   if (session?.user?.role === "ADMIN") {
//     return (
//       <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
//         {/* Header */}
//         <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
//           <span className="absolute left-4 top-1/2 -translate-y-1/2">
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
//           </span>
//           <span className="text-2xl font-bold text-black">Home</span>
//         </div>
//         {/* RBMS badge */}
//         <div className="w-full flex justify-center mt-4">
//           <div className="bg-green-200 rounded-2xl px-8 py-2">
//             <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">RBMS-{session?.user?.location}-DIVN</span>
//           </div>
//         </div>
//         {/* Designation bar */}
//         <div className="w-full flex justify-center mt-4">
//           <div className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
//             <span className="text-lg font-bold text-black tracking-wide">DESGN:Traffic Controller</span>
//           </div>
//         </div>
//         {/* Navigation buttons */}
//         <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md mb-2">
//           <Link href="/admin/request-table" className="w-full">
//             <button className="w-full rounded-2xl bg-[#eeb8f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
//               VIEW BLOCK DETAILS
//             </button>
//           </Link>
//           <Link href="/admin/revise-block" className="w-full">
//             <button className="w-full rounded-2xl bg-[#ffd180] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
//               REVISE THE BLOCK FOR THE DAY
//             </button>
//           </Link>
//           <Link href="/admin/sanction-table-data" className="w-full">
//             <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
//               BLOCK SUMMARY REPORT
//             </button>
//           </Link>
//         </div>
//         {/* Logout button */}
//         <button
//           onClick={async () => {
//             const { signOut } = await import("next-auth/react");
//             await signOut({ redirect: true, callbackUrl: "/auth/login" });
//           }}
//           className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
//         >
//           Logout
//         </button>
//       </div>
//     );
//   }





// if (session?.user?.role === "PUNCTUALITY_CONTROLLER") {
//     return (
//       <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
//         {/* Header */}
//         <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
//           <span className="absolute left-4 top-1/2 -translate-y-1/2">
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
//           </span>
//           <span className="text-2xl font-bold text-black">Home</span>
//         </div>
//         {/* RBMS badge */}
//         <div className="w-full flex justify-center mt-4">
//           <div className="bg-green-200 rounded-2xl px-8 py-2">
//             <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">RBMS-{session?.user?.location}-DIVN</span>
//           </div>
//         </div>
//         {/* Designation bar */}
//         <div className="w-full flex justify-center mt-4">
//           <div className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
//             <span className="text-lg font-bold text-black tracking-wide">DESGN:{session?.user.name}</span>
//           </div>
//         </div>
//         {/* Navigation buttons */}
//         <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md mb-2">
          
//           <Link href="/punctuality_controller/generate-reports" className="w-full">
//             <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
//               GENERATE REPORT
//             </button>
//           </Link>
//         </div>
//         {/* Logout button */}
//         <button
//           onClick={async () => {
//             const { signOut } = await import("next-auth/react");
//             await signOut({ redirect: true, callbackUrl: "/auth/login" });
//           }}
//           className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
//         >
//           Logout
//         </button>
//       </div>
//     );
//   }





//   if (session?.user?.role === "JE") {
//   const handleClick = async () => {
//   if (!session?.user?.phone) {
//     alert("Phone number not available");
//     return;
//   }

//   try {
//     const response = await axiosInstance.get("/api/user-request/manager-cug", {
//       params: { cugNumber: session.user.phone },
//     });

//     const managerCug = response.data?.data?.managerPhone;

//     if (managerCug) {
//       window.location.href = `https://smr-dashboard.plattorian.tech/?cugNumber=${managerCug}&token=W1IU66ZFEBFBF6C1dGmouN6PVyHARQJg`
//     } else {
//       alert("Manager CUG number not found");
//     }
//   } catch (error) {
//     console.error("Error fetching manager phone:", error);
//     alert("Something went wrong while fetching manager CUG.");
//   }
// };
//     return (
//       <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
//         {/* Header */}
//         <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
//           <span className="absolute left-4 top-1/2 -translate-y-1/2">
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
//           </span>
//           <span className="text-2xl font-bold text-black">Home</span>
//         </div>
//         {/* RBMS badge */}
//         <div className="w-full flex justify-center mt-4">
//           <div className="bg-green-200 rounded-2xl px-8 py-2">
//             <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">RBMS-{session?.user?.location}-DIVN</span>
//           </div>
//         </div>
//         {/* Designation bar */}
//         <div className="w-full flex justify-center mt-4">
//           <div className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
//             <span className="text-xs font-semibold text-gray-700 tracking-wide">DESIGNATION:<span className="text-sm font-bold text-black">{session?.user?.name || ''}</span></span>
//           </div>
//         </div>
//         {/* Navigation buttons */}
//         <div className="flex flex-col gap-8 mt-8 w-full max-w-md items-center">
//           {/* <a href={`rbms://app?cugNumber=${session?.user?.phone}&token=W1IU66ZFEBFBF6C1dGmouN6PVyHARQJg`}>

//             <button className="w-72 bg-[#E6E6FA] py-6 rounded-2xl border-4 border-black text-2xl font-bold text-[#13529e] shadow-lg hover:bg-[#B57CF6] hover:text-white transition-colors">
//               AVAIL BLOCK AT SITE
//             </button>
//           </a> */}

//           <button
//       onClick={handleClick}
//       className="w-72 bg-[#E6E6FA] py-6 rounded-2xl border-4 border-black text-2xl font-bold text-[#13529e] shadow-lg hover:bg-[#B57CF6] hover:text-white transition-colors"
//     >
//       AVAIL BLOCK AT SITE
//     </button>
//         </div>
//         {/* Logout button */}
//         <div className="w-full flex justify-center mt-10 mb-4">
//           <form action="/auth/login" method="get" onSubmit={async (e) => { e.preventDefault(); await import('next-auth/react').then(mod => mod.signOut({ redirect: true, callbackUrl: '/auth/login' })); }}>
//             <button type="submit" className="flex items-center gap-2 bg-[#dbe6fd] border border-black rounded px-6 py-2 text-lg font-bold text-black shadow hover:bg-[#c7d7f7] transition">
//               <span className="inline-block w-7 h-7 bg-white rounded-full border border-black flex items-center justify-center">
//                 <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black' strokeWidth={2} className='w-5 h-5'><path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' /></svg>
//               </span>
//               Logout
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }
 


//   if (session?.user?.role === "DRM") {
//     return (
//       <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
//         {/* Header */}
//         <div
//           className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2"
//           style={{ minHeight: 60 }}
//         >
//           <span className="absolute left-4 top-1/2 -translate-y-1/2">
//             <FaHome className="w-9 h-9 text-black" />
//           </span>
//           <span className="text-2xl font-bold text-black">Home</span>
//         </div>
//         {/* RBMS badge */}
//         <div className="w-full flex justify-center mt-4">
//           <div className="bg-green-200 rounded-2xl px-8 py-2">
//             <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">
//               RBMS-{session?.user?.location}-DIVN
//             </span>
//           </div>
//         </div>
//         {/* Designation bar */}
//         <div className="w-full flex justify-center mt-4">
//           <div
//             className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center"
//             style={{ maxWidth: "90vw" }}
//           >
//             <span className="text-lg font-bold text-black tracking-wide">
//             {session?.user?.name || ''}
//             </span>
//           </div>
//         </div>
//         {/* Navigation buttons */}
//         <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md mb-2">
//           <Link href="/drm/generate-report" className="w-full">
//             <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
//               BLOCK SUMMARY REPORT
//             </button>
//           </Link>
//         </div>

//         <button
//           onClick={async () => {
//             const { signOut } = await import("next-auth/react");
//             await signOut({ redirect: true, callbackUrl: "/auth/login" });
//           }}
//           className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
//         >
//           Logout
//         </button>
//       </div>
//     );
//   }

//   if (session?.user?.role === "BRANCH_OFFICER"||session?.user?.role === "SENIOR_OFFICER" || session?.user?.role === "JUNIOR_OFFICER") {
//     return (
//       <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
//         {/* Header */}
//         <div
//           className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2"
//           style={{ minHeight: 60 }}
//         >
//           <span className="absolute left-4 top-1/2 -translate-y-1/2">
//             <FaHome className="w-9 h-9 text-black" />
//           </span>
//           <span className="text-2xl font-bold text-black">Home</span>
//         </div>
//         {/* RBMS badge */}
//         <div className="w-full flex justify-center mt-4">
//           <div className="bg-green-200 rounded-2xl px-8 py-2">
//             <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">
//               RBMS-{session?.user?.location}-DIVN
//             </span>
//           </div>
//         </div>
//         {/* Designation bar */}
//         <div className="w-full flex justify-center mt-4">
//           <div
//             className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center"
//             style={{ maxWidth: "90vw" }}
//           >
//             <span className="text-lg font-bold text-black tracking-wide">
//               {session?.user?.name || ''}
//             </span>
//           </div>
//         </div>
//         {/* Navigation buttons */}
//         <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md mb-2">
//           <Link href="/bo/generate-report" className="w-full">
//             <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
//               BLOCK SUMMARY REPORT
//             </button>
//           </Link>
//         </div>

//         <button
//           onClick={async () => {
//             const { signOut } = await import("next-auth/react");
//             await signOut({ redirect: true, callbackUrl: "/auth/login" });
//           }}
//           className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
//         >
//           Logout
//         </button>
//       </div>
//     );
//   }

//   // Default dashboard UI for other roles
//   return (
//     <div className="max-w-full overflow-hidden text-black">
//       <div className="bg-white p-3 border border-black mb-3">
//         <div className="border-b-2 border-[#13529e] pb-3 mb-4 flex justify-between items-center">
//           <h1 className="text-lg font-bold text-[#13529e]">Dashboard</h1>
//           <div className="text-sm text-gray-600">{formattedDate}</div>
//         </div>

//         {/* User information */}
//         <div className="mb-4">
//           <p className="font-medium">
//             Welcome, {session?.user?.name || "User"}
//           </p>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-sm">
//             <div className="border border-gray-300 bg-gray-50 p-2">
//               <span className="text-gray-600 text-xs">Employee ID:</span>
//               <p className="font-medium">{session?.user?.id || "N/A"}</p>
//             </div>
//             <div className="border border-gray-300 bg-gray-50 p-2">
//               <span className="text-gray-600 text-xs">Role :</span>
//               <p className="font-medium">{session?.user?.role || "N/A"}</p>
//             </div>
//           </div>
//         </div>

//         {/* Quick actions */}
//         {
//           session?.user?.role === "ADMIN" ? (
//             <div className="flex flex-col gap-8 mt-8 w-full max-w-md items-center">
//               <a href="/admin/request-table">
//                 <button className="w-72 bg-[#E6E6FA] py-6 rounded-2xl border-4 border-black text-2xl font-bold text-[#13529e] shadow-lg hover:bg-[#B57CF6] hover:text-white transition-colors">
//                   VIEW BLOCK DETAILS
//                 </button>
//               </a>
//               <a href="/dashboard/(admin)/admin/sanction-table-data">
//                 <button className="w-72 bg-[#E6E6FA] py-6 rounded-2xl border-4 border-black text-2xl font-bold text-[#13529e] shadow-lg hover:bg-[#B57CF6] hover:text-white transition-colors">
//                   BLOCK SUMMARY REPORT
//                 </button>
//               </a>
//             </div>
//           ) : null
//         }

//       </div>
//     </div>
//   );
// }
"use client";

import { Loader } from "@/app/components/ui/Loader";
import ManagerQuickLinks from "@/app/(dashboard)/(manager)/manage/quick-links/component";
import AdminQuickLinks from "@/app/(dashboard)/(admin)/admin/quick-links/component";
import UserQuickLinks from "@/app/(dashboard)/(user)/quick-links/component";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userRequestService } from "@/app/service/api/user-request";
import axiosInstance from "@/app/utils/axiosInstance";
import {
  format,
  addDays,
  parseISO
} from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { toZonedTime } from 'date-fns-tz';
interface OverdueBlockModalProps {
  requests: any[];
  onAccept: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onClose: () => void;
}

function OverdueBlockModal({ requests, onAccept, onReject, onClose }: OverdueBlockModalProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date as dd/MM/yyyy
  const formatDateIST = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yy');
    } catch (error) {
      return dateString;
    }
  };

  // Show DB times as-is (06:30, 07:30)
  const formatTimeIST = (dateString: string) => {
    try {
      // Extract time from "2025-12-04T06:30:00.000Z" → "06:30"
      return dateString.substring(11, 16);
    } catch (error) {
      return dateString;
    }
  };

  const handleAccept = async (requestId: string) => {
    setIsSubmitting(true);
    try {
      await onAccept(requestId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = (request: any) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectRemarks.trim()) {
      toast.error("Please provide remarks for rejection");
      return;
    }
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    try {
      await onReject(selectedRequest.id, rejectRemarks);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectRemarks("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // CORRECT: Calculate overdue hours - Treat DB times as IST, compare with current Railway Time
  const calculateOverdueHours = (sanctionedTimeTo: string) => {
    try {
      // 1. Current Railway Time (IST)
      const now = new Date();
      const nowIST = toZonedTime(now, 'Asia/Kolkata');
      
      // 2. Extract time from DB string (e.g., "07:30" from "2025-12-05T07:30:00.000Z")
      const dbTimeStr = sanctionedTimeTo.substring(11, 16); // "07:30"
      const [dbHours, dbMinutes] = dbTimeStr.split(':').map(Number);
      
      // 3. Create a date object with DB time for TODAY (treating it as IST)
      const todayIST = toZonedTime(new Date(), 'Asia/Kolkata');
      const sanctionedEndIST = new Date(todayIST);
      sanctionedEndIST.setHours(dbHours, dbMinutes, 0, 0);
      
      // 4. Calculate difference
      const diffMs = nowIST.getTime() - sanctionedEndIST.getTime();
      
      if (diffMs <= 0) return 0;
      
      // Convert to full hours
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      
      return hours;
    } catch (error) {
      console.error("Error calculating overdue hours:", error);
      return 0;
    }
  };



  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200 shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-300 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Overdue Block Notifications</h2>
                <p className="text-blue-100 mt-1">
                  {requests.length} block(s) require your attention
                </p>
              </div>
         
            </div>
         
          </div>

          {/* Content */}
          <div className="p-4">
    

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      DATE
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      REQUEST ID
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      BLOCK-SECTION
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      DEMANDED TIME
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      SANCTIONED TIME
                    </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => {
                    const overdueHours = calculateOverdueHours(request.sanctionedTimeTo);
                    
                    return (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        {/* DATE */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDateIST(request.date)}
                          </div>
                        </td>
                        
                        {/* DIVISION ID */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {request.divisionId}
                          </div>
                        </td>
                        
                        {/* BLOCK */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-blue-600">
                            {request.missionBlock}
                          </div>
                        </td>
                        
                        {/* FROM (IST) */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatTimeIST(request.demandTimeFrom)} - {formatTimeIST(request.demandTimeTo)}
                          </div>
                        </td>
                        
                        {/* TO (IST) */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatTimeIST(request.sanctionedTimeFrom)} - {formatTimeIST(request.sanctionedTimeTo)}                            
                          </div>
                        </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {request.overAllStatus}                           
                          </div>
                        </td>
                     
                        
                        {/* ACTIONS */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAccept(request.id)}
                              disabled={isSubmitting}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Accept
                            </button>
                            
                            <button
                              onClick={() => handleRejectClick(request)}
                              disabled={isSubmitting}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

         
          </div>
        </div>
      </div>

      {/* Reject Remarks Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden border border-gray-200 shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <h3 className="text-xl font-bold">Provide Rejection Remarks</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-gray-800">Block: <span className="text-blue-600">{selectedRequest.missionBlock}</span></p>
                <p className="text-sm text-gray-600 mt-1">
                  Scheduled: {formatTimeIST(selectedRequest.sanctionedTimeFrom)} - {formatTimeIST(selectedRequest.sanctionedTimeTo)} IST
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Overdue by: {calculateOverdueHours(selectedRequest.sanctionedTimeTo)} hours
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection *
                </label>
                <textarea
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  rows={4}
                  placeholder="Please provide details about why the block needs adjustment..."
                  required
                />
            
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectRemarks("");
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={isSubmitting || !rejectRemarks.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? "Submitting..." : "Submit Remarks"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/auth/login";
    },
  });


  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const today = new Date();
  const endDate = addDays(today, 10);

  const formattedStartDate = format(today, "yyyy-MM-dd");
  const formattedEndDate = format(endDate, "yyyy-MM-dd");

  const { data: requestsData } = useQuery({
    queryKey: ["user-requests"],
    queryFn: () => userRequestService.getUserRequests(1, 10, formattedStartDate, formattedEndDate),
    enabled: !!session?.user,
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => userRequestService.acceptUserRequestRemark(id),
    onSuccess: (data, id) => {
      toast.success("Block marked as completed!");
      queryClient.invalidateQueries({ queryKey: ["user-requests"] });
      // Remove accepted request from modal
      setPendingRequests(prev => prev.filter(req => req.id !== id));
    },
    onError: (error) => {
      toast.error("Failed to accept request.");
      console.error(error);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      userRequestService.rejectUserRequestRemark(id, reason),
    onSuccess: (data, { id }) => {
      toast.success("Remarks submitted!");
      queryClient.invalidateQueries({ queryKey: ["user-requests"] });
      // Remove rejected request from modal
      setPendingRequests(prev => prev.filter(req => req.id !== id));
    },
    onError: (error) => {
      toast.error("Failed to reject request.");
      console.error(error);
    },
  });

  // Check if popup is needed for a request
  // const checkIfPopupNeeded = (request: any) => {
  //   if (!request.sanctionedTimeTo) {
  //     return false;
  //   }
    
  //   try {
  //     // Current Railway Time (IST)
  //     const now = new Date();
  //     const nowIST = toZonedTime(now, 'Asia/Kolkata');
      
  //     // Extract time from DB string (treat as IST)
  //     const dbTimeStr = request.sanctionedTimeTo.substring(11, 16);
  //     const [dbHours, dbMinutes] = dbTimeStr.split(':').map(Number);
      
  //     // Create a date object with DB time for TODAY (treating it as IST)
  //     const todayIST = toZonedTime(new Date(), 'Asia/Kolkata');
  //     const sanctionedEndIST = new Date(todayIST);
  //     sanctionedEndIST.setHours(dbHours, dbMinutes, 0, 0);
      
  //     // Check if current time is AFTER sanctioned end time
  //     const isOverdue = nowIST > sanctionedEndIST;
      
  //     if (!isOverdue) {
  //       return false;
  //     }
      
  //     // Check if user has already responded
  //     const hasResponded = (
  //       request.userAcceptanceForSanction === true ||
  //       (request.userAcceptanceForSanction === false && 
  //        request.userResponse !== null && 
  //        request.userResponse !== undefined && 
  //        request.userResponse.trim() !== "")
  //     );
      
  //     return !hasResponded;
      
  //   } catch (error) {
  //     console.error("Error checking popup condition:", error);
  //     return false;
  //   }
  // };
// Check if popup is needed for a request - MODIFIED WITH 4-HOUR DELAY
const checkIfPopupNeeded = (request: any) => {
  if (!request.sanctionedTimeTo) {
    return false;
  }
  
  try {
    // Current Railway Time (IST)
    const now = new Date();
    const nowIST = toZonedTime(now, 'Asia/Kolkata');
    
    // Extract time from DB string (treat as IST)
    const dbTimeStr = request.sanctionedTimeTo.substring(11, 16);
    const [dbHours, dbMinutes] = dbTimeStr.split(':').map(Number);
    
    // Create a date object with DB time for TODAY (treating it as IST)
    const todayIST = toZonedTime(new Date(), 'Asia/Kolkata');
    const sanctionedEndIST = new Date(todayIST);
    sanctionedEndIST.setHours(dbHours, dbMinutes, 0, 0);
    
    // Add 4 hours to sanctioned end time
    const fourHoursAfterEnd = new Date(sanctionedEndIST.getTime());
    fourHoursAfterEnd.setHours(fourHoursAfterEnd.getHours() + 4);
    
    // Check if current time is AFTER (sanctioned end time + 4 hours)
    const isFourHoursOverdue = nowIST > fourHoursAfterEnd;
    
    if (!isFourHoursOverdue) {
      return false;
    }
    
    // Check if user has already responded
    const hasResponded = (
      request.userAcceptanceForSanction === true ||
      (request.userAcceptanceForSanction === false && 
       request.userResponse !== null && 
       request.userResponse !== undefined && 
       request.userResponse.trim() !== "")
    );
    
    return !hasResponded;
    
  } catch (error) {
    console.error("Error checking popup condition:", error);
    return false;
  }
};
  // Check for overdue blocks
  useEffect(() => {
    if (requestsData?.data?.requests && (session?.user?.role === "USER" || session?.user?.role === "JE")) {
      console.log('Checking for overdue blocks...');
      
      const overdueRequests = requestsData.data.requests.filter((request: any) => {
        return checkIfPopupNeeded(request);
      });

      console.log('Overdue requests found:', overdueRequests.length);

      // If there are overdue requests, show modal for all of them
      if (overdueRequests.length > 0 && pendingRequests.length === 0) {
        console.log('Setting pending requests and showing modal');
        setPendingRequests(overdueRequests);
        setShowAcceptanceModal(true);
      }
    }
  }, [requestsData, pendingRequests, session?.user?.role]);

  const handleAccept = (id: string) => {
    acceptMutation.mutate(id);
  };

  const handleReject = (id: string, reason: string) => {
    rejectMutation.mutate({ id, reason });
  };

  // Close modal when all requests are processed
  useEffect(() => {
    if (pendingRequests.length === 0 && showAcceptanceModal) {
      setShowAcceptanceModal(false);
    }
  }, [pendingRequests, showAcceptanceModal]);

const hasInProgressBlock = requestsData?.data?.requests?.find(
  (request: any) =>
    ["inprogress", "in-progress"].includes(request.overAllStatus?.toLowerCase())
);

  if ((session?.user?.role === "USER" || session?.user?.role === "JE") &&
      showAcceptanceModal && pendingRequests.length > 0) {
    return (
      <OverdueBlockModal
        requests={pendingRequests}
        onAccept={handleAccept}
        onReject={handleReject}
        onClose={() => {
          setShowAcceptanceModal(false);
          setPendingRequests([]);
        }}
      />
    );
  }

  if (status === "loading") {
    return <Loader name="dashboard" />;
  }

  // Current date formatting for government style
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Custom user dashboard UI - same for USER and JE roles
  if (session?.user?.role === "USER" || session?.user?.role === "JE") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
        {/* Header */}
        <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
          </span>
          <span className="text-2xl font-bold text-black" >Home</span>
        </div>
        {/* RBMS badge */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-[#8ed974] px-8 py-2">
            <span className="text-[9vw] min-[430px]:text-4xl text-nowrap font-extrabold text-[#b07be0] tracking-wide">RBMS-{session?.user?.location}-DIVN</span>
          </div>
        </div>
        {/* Designation bar */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-[#ffeaea] px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
            <span className="text-2xl font-semibold text-gray-700 tracking-wide">DESGN:<span className="text-2xl font-bold text-black">{session?.user?.name || ''}</span></span>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="w-full flex flex-col items-center gap-5 mt-6 px-2 max-w-md">
          <a href="/create-block-request" className="w-full rounded-full bg-[#eeb8f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">ENTER NEW BLOCK REQUEST</a>
          <a href="/edit-request" className="w-full rounded-full bg-[#aee6f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">EDIT/CANCEL PREVIOUS BLOCK REQUESTS</a>
          <a href="/request-table" className="w-full rounded-full bg-[#c7c7f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">SUMMARY OF MY BLOCK REQUESTS</a>
          <a href="/avail-block" className="w-full rounded-full bg-[#a6f7a6] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">AVAIL BLOCK AT SITE</a>

{hasInProgressBlock && (
  <a
    href="/avail-block"
    className="w-full rounded-full bg-[#f69697] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition"
  >
    Block under progress
  </a>
)}


          <a href="/generate-reports" className="w-full rounded-full bg-[#ffd180] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">GENERATE REPORTS</a>
        </div>

        {/* Logout button */}
        <div className="w-full flex justify-center mt-10 mb-4">
          <form action="/auth/login" method="get" onSubmit={async (e) => { e.preventDefault(); await import('next-auth/react').then(mod => mod.signOut({ redirect: true, callbackUrl: '/auth/login' })); }}>
            <button type="submit" className="flex items-center gap-2 bg-[#dbe6fd] border border-black rounded-[50%] px-6 py-2 text-lg font-bold text-black shadow hover:bg-[#c7d7f7] transition">
              <span className=" w-7 h-7 bg-white rounded-[50%] border border-black flex items-center justify-center">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black' strokeWidth={2} className='w-5 h-5'><path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' /></svg>
              </span>
              Logout
            </button>
          </form>
        </div>
      </div>
    );
  }

if (session?.user?.role === "DEPT_CONTROLLER") {
    window.location.href = "/manage/request-table";
}
if (session?.user?.role === "HQ") {
    window.location.href = "/hq/generate-report";
}
if (session?.user?.role === "BOARD_CONTROLLER") {
    window.location.href = "/tpc";
}

if (session?.user?.role === "SM") {
    window.location.href = "/sm/pending-avails";
}
if (session?.user?.role === "ANALYST") {
    window.location.href = "/analyst";
}
  // Custom admin dashboard UI (match manager dashboard style)
  if (session?.user?.role === "ADMIN") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
        {/* Header */}
        <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
          </span>
          <span className="text-2xl font-bold text-black">Home</span>
        </div>
        {/* RBMS badge */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-green-200 rounded-2xl px-8 py-2">
            <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">RBMS-{session?.user?.location}-DIVN</span>
          </div>
        </div>
        {/* Designation bar */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
            <span className="text-lg font-bold text-black tracking-wide">DESGN:Traffic Controller</span>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md mb-2">
          <Link href="/admin/request-table" className="w-full">
            <button className="w-full rounded-2xl bg-[#eeb8f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              VIEW BLOCK DETAILS
            </button>
          </Link>
          <Link href="/admin/revise-block" className="w-full">
            <button className="w-full rounded-2xl bg-[#ffd180] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              REVISE THE BLOCK FOR THE DAY
            </button>
          </Link>
          <Link href="/admin/sanction-table-data" className="w-full">
            <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              BLOCK SUMMARY REPORT
            </button>
          </Link>
        </div>
        {/* Logout button */}
        <button
          onClick={async () => {
            const { signOut } = await import("next-auth/react");
            await signOut({ redirect: true, callbackUrl: "/auth/login" });
          }}
          className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
        >
          Logout
        </button>
      </div>
    );
  }





if (session?.user?.role === "PUNCTUALITY_CONTROLLER") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
        {/* Header */}
        <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
          </span>
          <span className="text-2xl font-bold text-black">Home</span>
        </div>
        {/* RBMS badge */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-green-200 rounded-2xl px-8 py-2">
            <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">RBMS-{session?.user?.location}-DIVN</span>
          </div>
        </div>
        {/* Designation bar */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
            <span className="text-lg font-bold text-black tracking-wide">DESGN:{session?.user.name}</span>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md mb-2">
          <Link href="/punctuality_controller/generate-reports" className="w-full">
            <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              GENERATE REPORT
            </button>
          </Link>
          <Link href="/analyst" className="w-full">
            <button className="w-full rounded-2xl bg-[#d4edda] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              ANALYSE IN DETAIL
            </button>
          </Link>
        </div>
        {/* Logout button */}
        <button
          onClick={async () => {
            const { signOut } = await import("next-auth/react");
            await signOut({ redirect: true, callbackUrl: "/auth/login" });
          }}
          className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
        >
          Logout
        </button>
      </div>
    );
  }





  if (session?.user?.role === "JE") {
  const handleClick = async () => {
  if (!session?.user?.phone) {
    alert("Phone number not available");
    return;
  }

  try {
    const response = await axiosInstance.get("/api/user-request/manager-cug", {
      params: { cugNumber: session.user.phone },
    });

    const managerCug = response.data?.data?.managerPhone;

    if (managerCug) {
      window.location.href = "/avail-block";
    }
  } catch (error) {
    window.location.href = "/avail-block";
  }
};
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
        {/* Header */}
        <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
          </span>
          <span className="text-2xl font-bold text-black">Home</span>
        </div>
        {/* RBMS badge */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-green-200 rounded-2xl px-8 py-2">
            <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">RBMS-{session?.user?.location}-DIVN</span>
          </div>
        </div>
        {/* Designation bar */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
            <span className="text-xs font-semibold text-gray-700 tracking-wide">DESIGNATION:<span className="text-sm font-bold text-black">{session?.user?.name || ''}</span></span>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="flex flex-col gap-8 mt-8 w-full max-w-md items-center">
          {/* <a href={`rbms://app?cugNumber=${session?.user?.phone}&token=W1IU66ZFEBFBF6C1dGmouN6PVyHARQJg`}>

            <button className="w-72 bg-[#E6E6FA] py-6 rounded-2xl border-4 border-black text-2xl font-bold text-[#13529e] shadow-lg hover:bg-[#B57CF6] hover:text-white transition-colors">
              AVAIL BLOCK AT SITE
            </button>
          </a> */}

          <button
      onClick={handleClick}
      className="w-72 bg-[#E6E6FA] py-6 rounded-2xl border-4 border-black text-2xl font-bold text-[#13529e] shadow-lg hover:bg-[#B57CF6] hover:text-white transition-colors"
    >
      AVAIL BLOCK AT SITE
    </button>
        </div>
        {/* Logout button */}
        <div className="w-full flex justify-center mt-10 mb-4">
          <form action="/auth/login" method="get" onSubmit={async (e) => { e.preventDefault(); await import('next-auth/react').then(mod => mod.signOut({ redirect: true, callbackUrl: '/auth/login' })); }}>
            <button type="submit" className="flex items-center gap-2 bg-[#dbe6fd] border border-black rounded px-6 py-2 text-lg font-bold text-black shadow hover:bg-[#c7d7f7] transition">
              <span className="inline-block w-7 h-7 bg-white rounded-full border border-black flex items-center justify-center">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black' strokeWidth={2} className='w-5 h-5'><path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' /></svg>
              </span>
              Logout
            </button>
          </form>
        </div>
      </div>
    );
  }
 


  if (session?.user?.role === "DRM") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
        {/* Header */}
        <div
          className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2"
          style={{ minHeight: 60 }}
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <FaHome className="w-9 h-9 text-black" />
          </span>
          <span className="text-2xl font-bold text-black">Home</span>
        </div>
        {/* RBMS badge */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-green-200 rounded-2xl px-8 py-2">
            <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">
              RBMS-{session?.user?.location}-DIVN
            </span>
          </div>
        </div>
        {/* Designation bar */}
        <div className="w-full flex justify-center mt-4">
          <div
            className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center"
            style={{ maxWidth: "90vw" }}
          >
            <span className="text-lg font-bold text-black tracking-wide">
            {session?.user?.name || ''}
            </span>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md mb-2">
          <Link href="/drm/generate-report" className="w-full">
            <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              BLOCK SUMMARY REPORT
            </button>
          </Link>
          <Link href="/analyst" className="w-full">
            <button className="w-full rounded-2xl bg-[#d4edda] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              ANALYSE IN DETAIL
            </button>
          </Link>
        </div>

        <button
          onClick={async () => {
            const { signOut } = await import("next-auth/react");
            await signOut({ redirect: true, callbackUrl: "/auth/login" });
          }}
          className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
        >
          Logout
        </button>
      </div>
    );
  }

  if (session?.user?.role === "BRANCH_OFFICER"||session?.user?.role === "SENIOR_OFFICER" || session?.user?.role === "JUNIOR_OFFICER") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
        {/* Header */}
        <div
          className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2"
          style={{ minHeight: 60 }}
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <FaHome className="w-9 h-9 text-black" />
          </span>
          <span className="text-2xl font-bold text-black">Home</span>
        </div>
        {/* RBMS badge */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-green-200 rounded-2xl px-8 py-2">
            <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">
              RBMS-{session?.user?.location}-DIVN
            </span>
          </div>
        </div>
        {/* Designation bar */}
        <div className="w-full flex justify-center mt-4">
          <div
            className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center"
            style={{ maxWidth: "90vw" }}
          >
            <span className="text-lg font-bold text-black tracking-wide">
              {session?.user?.name || ''}
            </span>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md mb-2">
          <Link href="/bo/generate-report" className="w-full">
            <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              BLOCK SUMMARY REPORT
            </button>
          </Link>
          {session?.user?.role === "BRANCH_OFFICER" && (
            <Link href="/analyst" className="w-full">
              <button className="w-full rounded-2xl bg-[#d4edda] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
                ANALYSE IN DETAIL
              </button>
            </Link>
          )}
        </div>

        <button
          onClick={async () => {
            const { signOut } = await import("next-auth/react");
            await signOut({ redirect: true, callbackUrl: "/auth/login" });
          }}
          className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
        >
          Logout
        </button>
      </div>
    );
  }

  // Default dashboard UI for other roles
  return (
    <div className="max-w-full overflow-hidden text-black">
      <div className="bg-white p-3 border border-black mb-3">
        <div className="border-b-2 border-[#13529e] pb-3 mb-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-[#13529e]">Dashboard</h1>
          <div className="text-sm text-gray-600">{formattedDate}</div>
        </div>

        {/* User information */}
        <div className="mb-4">
          <p className="font-medium">
            Welcome, {session?.user?.name || "User"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-sm">
            <div className="border border-gray-300 bg-gray-50 p-2">
              <span className="text-gray-600 text-xs">Employee ID:</span>
              <p className="font-medium">{session?.user?.id || "N/A"}</p>
            </div>
            <div className="border border-gray-300 bg-gray-50 p-2">
              <span className="text-gray-600 text-xs">Role :</span>
              <p className="font-medium">{session?.user?.role || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        {
          session?.user?.role === "ADMIN" ? (
            <div className="flex flex-col gap-8 mt-8 w-full max-w-md items-center">
              <a href="/admin/request-table">
                <button className="w-72 bg-[#E6E6FA] py-6 rounded-2xl border-4 border-black text-2xl font-bold text-[#13529e] shadow-lg hover:bg-[#B57CF6] hover:text-white transition-colors">
                  VIEW BLOCK DETAILS
                </button>
              </a>
              <a href="/dashboard/(admin)/admin/sanction-table-data">
                <button className="w-72 bg-[#E6E6FA] py-6 rounded-2xl border-4 border-black text-2xl font-bold text-[#13529e] shadow-lg hover:bg-[#B57CF6] hover:text-white transition-colors">
                  BLOCK SUMMARY REPORT
                </button>
              </a>
            </div>
          ) : session?.user?.role === "SUPER_ADMIN" ? (
            <div className="flex flex-col gap-8 mt-8 w-full max-w-md items-center">
              <Link href="/analyst" className="w-72">
                <button className="w-full rounded-2xl bg-[#d4edda] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
                  ANALYSE IN DETAIL
                </button>
              </Link>
            </div>
          ) : null
        }

      </div>
    </div>
  );
}

