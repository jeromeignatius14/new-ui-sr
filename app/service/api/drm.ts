// import axios from "axios";
// import axiosInstance from "@/app/utils/axiosInstance";

// export interface GenerateReportParams {
//   startDate: string;
//   endDate: string;
//   location: string[];
//   department: string[];
//   blockType: string[];
// }

// interface PastBlockSummary {
//   SectionId: string;
//   Section: string;
//   Demanded: number;
//   Approved: number;
//   Granted: number;
//   Availed: number;
//   Percentage: number;
//   DemandsCount?: number;
//   ApprovedCount?: number;
//   AvailedCount?: number;
// }

// interface UpcomingBlock {
//   Date: string;
//   Section: string;
//   Duration: number;
//   stationId?: string;
//   AvailedTimeFrom?: string;
//   AvailedTimeTo?: string;
//   Type: string;
//   Status: string;
//   Department?: String;
//   corridorType?: String;
// }

// export interface GenerateReportResponse {
//   data: {
//     sanctionedCounts?: any;
//     pastBlockSummary?: PastBlockSummary[];
//     detailedData: UpcomingBlock[];
//   };
//   message: string;
//   status: boolean;
// }

// const BASE_URL = "api/drm";

// export const drmService = {
//   generateReport: async (
//     params: GenerateReportParams
//   ): Promise<GenerateReportResponse> => {
//     // Format array parameters correctly for URL
//     const locations = params.location.join(",");
//     const departments = params.department.join(",");
//     const blockTypes = params.blockType.join(",");

//     const response = await axiosInstance.get<GenerateReportResponse>(
//       `${BASE_URL}/generate-report?startDate=${params.startDate}&endDate=${params.endDate}&location=${locations}&department=${departments}&blockType=${blockTypes}`
//     );
//     console.log("response.data", response.data);
//     return response.data;
//   },
// };


// const BASE_URL = "api/drm";
// const EXTERNAL_URL = process.env.NEXT_PUBLIC_BACKEND_URL_OTHER;

// export const drmService = {
//   generateReport: async (params: GenerateReportParams): Promise<GenerateReportResponse> => {

//     const locations = params.location.join(",");
//     const departments = params.department.join(",");
//     const blockTypes = params.blockType.join(",");

//     const isMAS = params.location.length === 1 && params.location[0] === "MAS";

//     let url = "";

//     if (isMAS) {
//       // ✅ Call existing API
//       url = `${BASE_URL}/generate-report?startDate=${params.startDate}&endDate=${params.endDate}&location=${locations}&department=${departments}&blockType=${blockTypes}`;
//       const response = await axiosInstance.get<GenerateReportResponse>(url);
//       return response.data;
//     } 
//     else {
//       // ✅ Call external backend
//       url = `${EXTERNAL_URL}/api/drm/generate-report?startDate=${params.startDate}&endDate=${params.endDate}&location=${locations}&department=${departments}&blockType=${blockTypes}`;
//       const response = await axios.get<GenerateReportResponse>(url);
//       return response.data;
//     }
//   },
// };


import axios from "axios";
import axiosInstance from "@/app/utils/axiosInstance";

export interface GenerateReportParams {
  startDate: string;
  endDate: string;
  location: string[];
  department: string[];
  blockType: string[];
}

interface PastBlockSummary {
  SectionId: string;
  Section: string;
  Demanded: number;
  Approved: number;
  Granted: number;
  Availed: number;
  Percentage: number;
  DemandsCount?: number;
  ApprovedCount?: number;
  AvailedCount?: number;
}

interface UpcomingBlock {
  Date: string;
  Section: string;
  Duration: number;
  stationId?: string;
  AvailedTimeFrom?: string;
  AvailedTimeTo?: string;
  Type: string;
  Status: string;
  Department?: String;
  corridorType?: String;
}

export interface GenerateReportResponse {
  data: {
    sanctionedCounts?: any;
    pastBlockSummary?: PastBlockSummary[];
    detailedData: UpcomingBlock[];
  };
  message: string;
  status: boolean;
}

const BASE_URL = "api/drm";
const EXTERNAL_URL = process.env.NEXT_PUBLIC_BACKEND_URL_OTHER;

export const drmService = {
  generateReport: async (params: GenerateReportParams): Promise<GenerateReportResponse> => {
    const departments = params.department.join(",");
    const blockTypes = params.blockType.join(",");

    const isMAS = params.location.length === 1 && params.location[0] === "MAS";
    const isAll = params.location.includes("All");

    if (isAll) {
      // ✅ Call both APIs when location is "All"
      // For MAS API, use "MAS" as location
      const masQueryParams = `startDate=${params.startDate}&endDate=${params.endDate}&location=MAS&department=${departments}&blockType=${blockTypes}`;
      
      // For External API, use all locations except "All", or handle based on your backend requirements
      const externalLocations = params.location.filter(loc => loc !== "All").join(",");
      const externalQueryParams = `startDate=${params.startDate}&endDate=${params.endDate}&location=${externalLocations}&department=${departments}&blockType=${blockTypes}`;

      const [masResponse, externalResponse] = await Promise.all([
        // MAS API call with MAS location
        axiosInstance.get<GenerateReportResponse>(`${BASE_URL}/generate-report?${masQueryParams}`),
        // External API call with filtered locations
        axios.get<GenerateReportResponse>(`${EXTERNAL_URL}/api/drm/generate-report?${externalQueryParams}`)
      ]);

      // Combine the data from both responses
      const combinedData: GenerateReportResponse = {
        data: {
          sanctionedCounts: {
            ...(masResponse.data.data.sanctionedCounts || {}),
            ...(externalResponse.data.data.sanctionedCounts || {})
          },
          pastBlockSummary: [
            ...(masResponse.data.data.pastBlockSummary || []),
            ...(externalResponse.data.data.pastBlockSummary || [])
          ],
          detailedData: [
            ...(masResponse.data.data.detailedData || []),
            ...(externalResponse.data.data.detailedData || [])
          ]
        },
        message: `Combined data from MAS and external sources: ${masResponse.data.message} | ${externalResponse.data.message}`,
        status: masResponse.data.status && externalResponse.data.status
      };

      return combinedData;
    } 
    else if (isMAS) {
      // ✅ Call existing API for MAS only
      const locations = params.location.join(",");
      const url = `${BASE_URL}/generate-report?startDate=${params.startDate}&endDate=${params.endDate}&location=${locations}&department=${departments}&blockType=${blockTypes}`;
      const response = await axiosInstance.get<GenerateReportResponse>(url);
      return response.data;
    } 
    else {
      // ✅ Call external backend for other locations
      const locations = params.location.join(",");
      const url = `${EXTERNAL_URL}/api/drm/generate-report?startDate=${params.startDate}&endDate=${params.endDate}&location=${locations}&department=${departments}&blockType=${blockTypes}`;
      const response = await axios.get<GenerateReportResponse>(url);
      return response.data;
    }
  },
};