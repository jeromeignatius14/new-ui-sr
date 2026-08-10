import React from "react";
import { formatSectionBlockedLines } from "@/app/utils/blockLines";

interface FormData {
  date?: string;
  selectedDepartment?: string;
  selectedSection?: string;
  missionBlock?: string;
  workType?: string;
  activity?: string;
  corridorTypeSelection?: string | null;
  demandTimeFrom?: string;
  demandTimeTo?: string;
  selectedDepo?: string;
  workLocationFrom?: string;
  workLocationTo?: string;
  trdWorkLocation?: string;
  elementarySection?: string;
  requestremarks?: string;
  repercussions?: string;
  selectedStream?: string;
  processedLineSections?: Array<{
    block: string;
    type: string;
    lineName?: string;
    otherLines?: string;
    stream?: string;
    road?: string;
    otherRoads?: string;
  }>;
  sntDisconnectionRequired?: boolean | null;
  powerBlockRequired?: boolean | null;
  freshCautionRequired?: boolean | null;
  freshCautionLocationFrom?: string;
  freshCautionLocationTo?: string;
  freshCautionSpeed?: number;
  adjacentLinesAffected?: string;
  sntDisconnectionLineFrom?: string;
  sntDisconnectionLineTo?: string;
  powerBlockRequirements?: string[];
  sntDisconnectionRequirements?: string[];
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: FormData;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  formData,
}) => {
  if (!isOpen) return null;

  // Format time for display
  const formatTime = (time?: string): string => {
    if (!time) return "";
    return time;
  };

  // Format date for display
  const formatDate = (date?: string): string => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString("en-GB");
    } catch (error) {
      console.error("Error formatting date:", error);
      return date || "";
    }
  };

  // Format selected lines/roads.
  // Every line/road of a section belongs to the block — a combined UP & DN
  // block must read "UP & DN", not just "UP". See app/utils/blockLines.ts.
  const formatSelectedLines = (): string => {
    const lines: string[] = [];

    if (formData.processedLineSections) {
      formData.processedLineSections.forEach((section) => {
        const label = formatSectionBlockedLines(section, "");
        if (!label) return;
        if (section.type === "yard") {
          lines.push(
            section.stream
              ? `Road ${label} (${section.stream}) in yard ${section.block}`
              : `Road ${label} in yard ${section.block}`
          );
        } else {
          lines.push(`Line ${label} in block ${section.block}`);
        }
      });
    }

    return lines.length > 0 ? lines.join(", ") : "None";
  };

  // Format work description
  const formatWorkDescription = (desc?: string): string => {
    if (!desc) return "";
    return desc === "others" ? "Other" : desc;
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 backdrop-blur-sm text-black">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">
          Confirm Your Request
        </h2>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-lg font-semibold mb-2">
            Your request for traffic block in {formData.missionBlock} Block
            Section on {formatDate(formData.date)} from{" "}
            {formatTime(formData.demandTimeFrom)} hrs to{" "}
            {formatTime(formData.demandTimeTo)} hrs is ready to be submitted.
          </p>
          <p className="text-sm text-gray-600">
            Please review all details below before final submission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-semibold">Basic Information</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="font-medium pr-2">Date:</td>
                  <td>{formatDate(formData.date)}</td>
                </tr>
                <tr>
                  <td className="font-medium pr-2">Department:</td>
                  <td>{formData.selectedDepartment}</td>
                </tr>
                <tr>
                  <td className="font-medium pr-2">Major Section:</td>
                  <td>{formData.selectedSection}</td>
                </tr>
                {formData.selectedDepo && (
                  <tr>
                    <td className="font-medium pr-2">Depot/SSE:</td>
                    <td>{formData.selectedDepo}</td>
                  </tr>
                )}
                <tr>
                  <td className="font-medium pr-2">Block Section/Yard:</td>
                  <td>{formData.missionBlock}</td>
                </tr>
                <tr>
                  <td className="font-medium pr-2">Work Type:</td>
                  <td>{formData.workType}</td>
                </tr>
                <tr>
                  <td className="font-medium pr-2">Activity:</td>
                  <td>{formatWorkDescription(formData.activity)}</td>
                </tr>
                <tr>
                  <td className="font-medium pr-2">Demanded Time:</td>
                  <td>
                    {formatTime(formData.demandTimeFrom)} to{" "}
                    {formatTime(formData.demandTimeTo)}
                  </td>
                </tr>
                {formData.corridorTypeSelection && (
                  <tr>
                    <td className="font-medium pr-2">Corridor Type:</td>
                    <td>{formData.corridorTypeSelection}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-semibold">Selected Lines/Roads</h3>
            <p className="text-sm">{formatSelectedLines()}</p>
          </div>
        </div>

        {/* Work Location */}
        {formData.selectedDepartment === "TRD" && formData.trdWorkLocation && (
          <div className="mb-4">
            <h3 className="font-semibold">Work Location</h3>
            <p className="text-sm">{formData.trdWorkLocation}</p>
          </div>
        )}

        {(formData.workLocationFrom || formData.workLocationTo) && (
          <div className="mb-4">
            <h3 className="font-semibold">Work Location</h3>
            <p className="text-sm">
              {formData.workLocationFrom && formData.workLocationTo
                ? `From ${formData.workLocationFrom} to ${formData.workLocationTo}`
                : formData.workLocationFrom || formData.workLocationTo}
            </p>
          </div>
        )}

        {formData.elementarySection && (
          <div className="mb-4">
            <h3 className="font-semibold">Elementary Section</h3>
            <p className="text-sm">{formData.elementarySection}</p>
          </div>
        )}

        {/* Department-specific information */}
        {formData.selectedDepartment === "TRD" && formData.repercussions && (
          <div className="mb-4">
            <h3 className="font-semibold">TRD Specific Information</h3>
            <p className="text-sm">
              <span className="font-medium">Coaching Repercussions: </span>
              {formData.repercussions}
            </p>
          </div>
        )}

        {/* Safety Information */}
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Safety Information</h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr>
                <td className="font-medium w-44">Fresh Caution Imposed:</td>
                <td>{formData.freshCautionRequired ? "Yes" : "No"}</td>
              </tr>
              {formData.freshCautionRequired && (
                <>
                  <tr>
                    <td className="font-medium w-40">Caution Location:</td>
                    <td>
                      {formData.freshCautionLocationFrom &&
                        formData.freshCautionLocationTo
                        ? `From ${formData.freshCautionLocationFrom} to ${formData.freshCautionLocationTo}`
                        : "Not specified"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium w-40">Caution Speed:</td>
                    <td>
                      {formData.freshCautionSpeed || "Not specified"} km/hr
                    </td>
                  </tr>
                  {formData.adjacentLinesAffected && (
                    <tr>
                      <td className="font-medium w-40">
                        Adjacent Lines Affected:
                      </td>
                      <td>{formData.adjacentLinesAffected}</td>
                    </tr>
                  )}
                </>
              )}
              <tr>
                <td className="font-medium w-40">Power Block:</td>
                <td>{formData.powerBlockRequired ? "Yes" : "No"}</td>
              </tr>
              {formData.powerBlockRequired &&
                formData.powerBlockRequirements && (
                  <tr>
                    <td className="font-medium w-40">Requirements:</td>
                    <td>{formData.powerBlockRequirements.join(", ")}</td>
                  </tr>
                )}
              <tr>
                <td className="font-medium w-40">S&T Disconnection:</td>
                <td>{formData.sntDisconnectionRequired ? "Yes" : "No"}</td>
              </tr>
              {formData.sntDisconnectionRequired && (
                <>
                  <tr>
                    <td className="font-medium w-40">Line:</td>
                    <td>
                      {formData.sntDisconnectionLineFrom &&
                        formData.sntDisconnectionLineTo
                        ? `From ${formData.sntDisconnectionLineFrom} to ${formData.sntDisconnectionLineTo}`
                        : "Not specified"}
                    </td>
                  </tr>
                  {formData.sntDisconnectionRequirements && (
                    <tr>
                      <td className="font-medium w-40">Requirements:</td>
                      <td>
                        {formData.sntDisconnectionRequirements.join(", ")}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Remarks */}
        {formData.requestremarks && (
          <div className="mb-4">
            <h3 className="font-semibold">Remarks</h3>
            <p className="text-sm">{formData.requestremarks}</p>
          </div>
        )}

        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded transition duration-300"
          >
            Go Back to Editing
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-300"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
