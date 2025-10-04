import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardControllerService } from "../api/boardController";
import { toast } from "react-hot-toast";
import { data as sectionData, MajorSection } from "@/app/lib/store";

// Format board controller requests according to the section structure
const formatBoardControllerRequests = (requests: any[]) => {
  if (!Array.isArray(requests)) {
    console.error("formatBoardControllerRequests: requests is not an array", requests);
    return {};
  }
  
  // Initialize the result structure
  const result: Record<string, any> = {};
  
  // Initialize sections for all major sections
  for (const majorKey of Object.keys(MajorSection) as Array<keyof typeof MajorSection>) {
    const sections = MajorSection[majorKey];
    for (const section of sections) {
      const sectionKey = section.replace("-", "_");
      
      // Initialize with standard line types
      result[sectionKey] = {
        upLine: [],
        downLine: [],
        singleLine: []
      };
      
      // Special handling for sections with fast/slow lines
      if (section === "MSB-VM" || section === "MAS-AJJ" || section === "MAS-GDR") {
        result[sectionKey] = {
          upSlow: [],
          downSlow: [],
          upFast: [],
          downFast: [],
        };
      }
    }
  }
  
  // Also initialize sections from the section data
  sectionData.sections.forEach((section) => {
    const sectionName = section.name.replace("-", "_");
    
    // Skip if already initialized
    if (result[sectionName]) {
      return;
    }
    
    result[sectionName] = {};

    // For each line type in the section
    section.lines.forEach((lineType) => {
      const lineKey = lineType
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace("line", "Line");

      // Initialize arrays for different line types
      if (lineType.includes("UP") || lineType.includes("Up")) {
        result[sectionName][lineKey] = [];
      } else if (lineType.includes("DOWN") || lineType.includes("Down")) {
        result[sectionName][
          lineKey.replace("up", "down").replace("Up", "down")
        ] = [];
      } else if (lineType.includes("SINGLE")) {
        result[sectionName]["singleLine"] = [];
      }
    });
  });

  // Distribute requests to their respective sections and lines
  requests.forEach((request, index) => {
    if (!request || typeof request !== 'object') {
      console.warn(`Skipping invalid request at index ${index}:`, request);
      return;
    }
    
    // Ensure default values for required fields
    request.date = request.date || '-';
    request.time = request.time || '-';
    
    // Handle sanctioned time - format from sanctionedTimeFrom and sanctionedTimeTo
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
    const requestSection = request.section;
    if (!requestSection) {
      console.warn(`Request at index ${index} has no section:`, request);
      return;
    }
    
    const matchedSection = findMatchingSection(requestSection);

    if (matchedSection) {
      const sectionKey = matchedSection.replace("-", "_");
      
      if (!result[sectionKey]) {
        console.warn(`Section ${sectionKey} not found in result structure for request:`, request);
        return;
      }

      // Determine which line array to push to based on the request's line property
      let lineKey;
      const line = request.line?.toLowerCase() || "";

      if (line.includes("up") && line.includes("slow")) {
        lineKey = "upSlow";
      } else if (line.includes("down") && line.includes("slow")) {
        lineKey = "downSlow";
      } else if (line.includes("up") && line.includes("fast")) {
        lineKey = "upFast";
      } else if (line.includes("down") && line.includes("fast")) {
        lineKey = "downFast";
      } else if (line.includes("up")) {
        lineKey = "upLine";
      } else if (line.includes("down")) {
        lineKey = "downLine";
      } else if (line.includes("single")) {
        lineKey = "singleLine";
      } else {
        // Default fallback based on the section
        if (
          sectionKey === "MAS_AJJ" ||
          sectionKey === "MSB_VM" ||
          sectionKey === "MAS_GDR"
        ) {
          lineKey = "upSlow"; // Default to upSlow for sections with fast/slow lines
        } else {
          lineKey = "upLine"; // Default to upLine for other sections
        }
      }

      // Add to the appropriate section and line array if it exists
      if (result[sectionKey][lineKey]) {
        result[sectionKey][lineKey].push(request);
      } else {
        console.warn(`Line key ${lineKey} not found in section ${sectionKey} for request:`, request);
      }
    } else {
      console.warn(`No matching section found for request with section ${requestSection}:`, request);
    }
  });

  return result;
};

// Helper function to find which major section a block section belongs to
function findMatchingSection(blockSection: string): string | null {
  if (!blockSection) return null;
  
  // First check if the block section directly matches a section in MajorSection
  for (const majorKey of Object.keys(MajorSection) as Array<keyof typeof MajorSection>) {
    const sections = MajorSection[majorKey];
    
    // Direct match
    if (sections.includes(blockSection)) {
      return blockSection;
    }
    
    // Check if the block section contains or is contained within any section
    for (const section of sections) {
      if (blockSection.includes(section) || section.includes(blockSection)) {
        return section;
      }
    }
  }
  
  // Try matching by the first station code in the section name
  const blockSectionFirst = blockSection.split('-')[0];
  for (const majorKey of Object.keys(MajorSection) as Array<keyof typeof MajorSection>) {
    const sections = MajorSection[majorKey];
    
    for (const section of sections) {
      const sectionFirst = section.split('-')[0];
      if (blockSectionFirst === sectionFirst) {
        return section;
      }
    }
  }
  
  // Fall back to the old method using sectionData
  for (const section of sectionData.sections) {
    const blockSections = [
      ...section.section_blocks.map((block) => block.block),
      ...section.station_blocks.map((block) => block.block),
    ];

    if (blockSections.some((block) => blockSection.includes(block))) {
      return section.name;
    }
  }
  
  // If all else fails, return null
  return null;
}

// Get board controller requests
export const useBoardControllerRequests = (
  timeFrame: "24hrs" | "16hrs" | "8hrs"
) => {
  return useQuery({
    queryKey: ["boardControllerRequests", timeFrame],
    queryFn: async () => {
      const response = await boardControllerService.getRequests(timeFrame);
      // Format the data according to the sections structure
      
      // Check for different data structures and extract the requests array
      let requests = [];
      
      if (Array.isArray(response)) {
        // If response is directly an array of requests
        requests = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        // If response has data array
        requests = response.data;
      } else if (response && response.data && response.data.requests && Array.isArray(response.data.requests)) {
        // If response has nested data.requests array
        requests = response.data.requests;
      } else if (response && response.requests && Array.isArray(response.requests)) {
        // If response has requests array directly
        requests = response.requests;
      }
      
      
      // Log the first few requests to see their structure
      if (requests.length > 0) { 
        // Check for selectedSection vs section property
        if (requests[0].selectedSection && !requests[0].section) {
          // Map the data to ensure section property exists
          requests = requests.map((req: any) => {
            // Format sanctioned time if sanctionedTimeFrom and sanctionedTimeTo exist
            let sanctionedTime = req.sanctionedTime;
            if (req.sanctionedTimeFrom && req.sanctionedTimeTo) {
              try {
                const fromDate = new Date(req.sanctionedTimeFrom);
                const toDate = new Date(req.sanctionedTimeTo);
                const fromTime = `${fromDate.getHours().toString().padStart(2, '0')}:${fromDate.getMinutes().toString().padStart(2, '0')}`;
                const toTime = `${toDate.getHours().toString().padStart(2, '0')}:${toDate.getMinutes().toString().padStart(2, '0')}`;
                sanctionedTime = `${fromTime} - ${toTime}`;
              } catch (error) {
                console.error("Error formatting sanctioned time during mapping:", error, req.sanctionedTimeFrom, req.sanctionedTimeTo);
              }
            }
            
            return {
              ...req,
              section: req.selectedSection,
              // Ensure line property exists for line categorization
              line: req.line || 'upLine', // Default to upLine if not specified
              sanctionedTime: sanctionedTime || req.time || '-'
            };
          });
          
        }
      }
      const formattedData = formatBoardControllerRequests(requests);
      return { data: formattedData };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
