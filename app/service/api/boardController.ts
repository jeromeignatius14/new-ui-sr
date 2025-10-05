import axiosInstance from "@/app/utils/axiosInstance";

interface BoardControllerRequestItem {
  id: string;
  date: string;
  section: string;
  time: string;
  workType: string;
  activity: string;
  line: string;
  status: string;
}

export const boardControllerService = {
  // Get all requests for board controller
  getRequests: async (timeFrame: "24hrs" | "16hrs" | "8hrs") => {
    try {
      // Convert timeFrame to hours for the API call
      const hours = timeFrame === "8hrs" ? 8 : timeFrame === "16hrs" ? 16 : 24;
      
      // Make the API call to get sanctioned requests
      const response = await axiosInstance.get(`/api/board-controller/sanctioned-requests?hours=${hours}`);

      
      // Handle both array and object responses
      if (Array.isArray(response.data)) {
        // If API returns an array directly
        return response.data;
      }
      
      // Process data to ensure required fields exist
      if (response.data && response.data.requests && Array.isArray(response.data.requests)) {
        const currentDate = new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).split('/').join('/');
        
        // Helper function to format sanctioned time
        const formatSanctionedTime = (timeString: string): string => {
          if (!timeString) return "";
          
          try {
            // If it's already in a simple format like "12:00 - 13:00", return it
            if (timeString.includes(" - ") && !timeString.includes("T")) {
              return timeString;
            }
            
            // Handle ISO date range format "2025-10-03T22:35:00.000Z - 2025-10-03T01:35:00.000Z"
            const parts = timeString.split(" - ");
            if (parts.length !== 2) return timeString;
            
            const fromTime = parts[0].includes("T") ? parts[0].split("T")[1].substring(0, 5) : parts[0];
            const toTime = parts[1].includes("T") ? parts[1].split("T")[1].substring(0, 5) : parts[1];
            
            return `${fromTime} - ${toTime}`;
          } catch (error) {
            console.error("Error formatting sanctioned time:", error);
            return timeString; // Return the original if parsing fails
          }
        };
        
        // Add default values to any requests missing required fields
        response.data.requests = response.data.requests.map((req: any) => {
          // Format sanctioned time if it's an object
          let formattedSanctionedTime = req.sanctionedTime;
          if (typeof req.sanctionedTime === 'object' && req.sanctionedTime !== null) {
            formattedSanctionedTime = `${req.sanctionedTime.from || ''} - ${req.sanctionedTime.to || ''}`;
          }
          
          // Format the sanctioned time string
          if (typeof formattedSanctionedTime === 'string') {
            formattedSanctionedTime = formatSanctionedTime(formattedSanctionedTime);
          }
          
          return {
            ...req,
            date: req.date || currentDate,
            sanctionedTime: formattedSanctionedTime || req.time || '12:00 - 13:00'
          };
        });
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching board controller requests:", error);
      throw error;
    }
  },
};