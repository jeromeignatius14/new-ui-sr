import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardControllerService } from "../api/boardController";
import { toast } from "react-hot-toast";
import { data as sectionData, MajorSection, BoardControllerDepotMap } from "@/app/lib/store";
import { useSession } from "next-auth/react";

// New implementation for processing board controller requests
// Using processedLineSections to categorize requests by line name or road

// Format board controller requests by section and line type
const formatBoardControllerRequests = (requests: any[]) => {
  if (!Array.isArray(requests)) {
    console.error("formatBoardControllerRequests: requests is not an array", requests);
    return {};
  }
  
  // Initialize the result structure with sections
  const result: Record<string, Record<string, any[]>> = {};
  
  // Process each request and categorize by section and line type
  requests.forEach((request, index) => {
    if (!request || typeof request !== 'object') {
      console.warn(`Skipping invalid request at index ${index}:`, request);
      return;
    }
    
    // Ensure default values for required fields
    request.date = request.date || '-';
    request.time = request.time || '-';
    
    // Format sanctioned time if needed
    if (request.sanctionedTimeFrom && request.sanctionedTimeTo) {
      try {
        const fromDate = new Date(request.sanctionedTimeFrom);
        const toDate = new Date(request.sanctionedTimeTo);
        const fromTime = `${fromDate.getHours().toString().padStart(2, '0')}:${fromDate.getMinutes().toString().padStart(2, '0')}`;
        const toTime = `${toDate.getHours().toString().padStart(2, '0')}:${toDate.getMinutes().toString().padStart(2, '0')}`;
        request.sanctionedTime = `${fromTime} - ${toTime}`;
      } catch (error) {
        console.error("Error formatting sanctioned time:", error);
        request.sanctionedTime = '-';
      }
    } else {
      request.sanctionedTime = request.sanctionedTime || request.time || '-';
    }
    
    request.workType = request.workType || '-';
    request.activity = request.activity || '-';
    
    // Extract the section from the request
    const requestSection = request.section || request.selectedSection;
    if (!requestSection) {
      console.warn(`Request at index ${index} has no section:`, request);
      return;
    }
    
    // Format section key for consistency
    const sectionKey = requestSection.replace("-", "_");
    
    // Initialize section in result if it doesn't exist
    if (!result[sectionKey]) {
      result[sectionKey] = {};
    }
    
    // Determine the line category using processedLineSections
    let lineCategory = "Other";
    
    if (request.processedLineSections && Array.isArray(request.processedLineSections) && request.processedLineSections.length > 0) {
      // Get line name or road from the first processed line section
      const lineInfo = request.processedLineSections[0];
      if (lineInfo.road) {
        lineCategory = "Road";
      } else if (lineInfo.lineName) {
        lineCategory = lineInfo.lineName;
      }
    } else if (request.line) {
      // Fallback to the traditional line property
      const line = request.line.toLowerCase();

      if (line.includes("road") || line.includes("rd")) {
        lineCategory = "Road";
      } else if (line.includes("up") && line.includes("slow")) {
        lineCategory = "Up Slow Line";
      } else if (line.includes("down") && line.includes("slow")) {
        lineCategory = "Down Slow Line";
      } else if (line.includes("up") && line.includes("fast")) {
        lineCategory = "Up Fast Line";
      } else if (line.includes("down") && line.includes("fast")) {
        lineCategory = "Down Fast Line";
      } else if (line.includes("up")) {
        lineCategory = "Up Line";
      } else if (line.includes("down")) {
        lineCategory = "Down Line";
      } else if (line.includes("single")) {
        lineCategory = "Single Line";
      }
    }
    
    // Initialize the line category array if it doesn't exist
    if (!result[sectionKey][lineCategory]) {
      result[sectionKey][lineCategory] = [];
    }
    
    // Add the request to the appropriate category
    result[sectionKey][lineCategory].push(request);
  });
  
  return result;
};

// Get board controller requests using the user's depot
export const useBoardControllerRequests = (
  timeFrame: "24hrs" | "16hrs" | "8hrs"
) => {
  // Get the user's session to access depot information
  const { data: session } = useSession();
  const userDepot = session?.user?.depot;
  
  return useQuery({
    queryKey: ["boardControllerRequests", timeFrame, userDepot],
    queryFn: async () => {
      // Get sections for the user's depot
      let sections: string[] = [];
      if (userDepot && BoardControllerDepotMap[userDepot]) {
        sections = BoardControllerDepotMap[userDepot];
      }
      
      // Get requests from the API with the user's depot and sections
      const response = await boardControllerService.getRequests(timeFrame, sections);
      
      // Extract requests from the response
      let requests = [];
      
      if (Array.isArray(response)) {
        requests = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        requests = response.data;
      } else if (response && response.data && response.data.requests && Array.isArray(response.data.requests)) {
        requests = response.data.requests;
      } else if (response && response.requests && Array.isArray(response.requests)) {
        requests = response.requests;
      }
      
      // Log the first few requests to understand their structure
      if (requests.length > 0) {
        console.log("Sample request:", requests[0]);
      }
      
      // Format the data according to the new simplified structure
      const formattedData = formatBoardControllerRequests(requests);
      return { data: formattedData };
    },
    enabled: !!session,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
