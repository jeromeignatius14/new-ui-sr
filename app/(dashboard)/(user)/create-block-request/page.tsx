"use client";
import React, { useState, useEffect, useRef } from "react";
import { useCreateUserRequest } from "@/app/service/mutation/user-request";
import { useSession, signOut } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import {
  MajorSection,
  blockSection,
  workType,
  Activity,
  lineData,
  streamData,
  depot
} from "@/app/lib/store";
import Select from "react-select";
import { z } from "zod";
import {
  userRequestSchema,
  UserRequestInput,
} from "@/app/validation/user-request";
import {
  formatDateToISO,
  formatTimeToDatetime,
  isDateAfterThursdayCutoff,
  extractTimeFromDatetime,
} from "@/app/lib/helper";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useQuery } from "@tanstack/react-query";
import { userRequestService } from "@/app/service/api/user-request";
import roadData from "../../../../public/roadData.json";
import { createSiteLocationChangeHandler, getAutoAssignedDepots } from './features/siteLocation';


type Department = "TRD" | "S&T" | "ENGG";

// Add this after the helper functions and before the component function body
// Shared styles for all react-select components with improved contrast
const selectStyles = {
  dropdownIndicator: (base: any) => ({
    ...base,
    color: "#13529e",
  }),
  placeholder: (base: any) => ({
    ...base,
    fontSize: "12px",
    color: "black",
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 10,
    backgroundColor: "white",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    color: "black",
  }),
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: "white",
    color: "black",
    borderColor: state.isFocused ? "#2461aa" : "#45526c",
    borderWidth: "1px",
    borderRadius: "4px",
    padding: "1px",
    boxShadow: state.isFocused ? "0 0 0 1px rgba(37, 99, 176, 0.1)" : "none",
    fontSize: "12px",
    minHeight: "28px",
    "&:hover": {
      borderColor: "#2461aa",
    },
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "#f3f4f6",
    color: "black",
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: "black",
    fontSize: "11px",
    padding: "1px 3px",
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: "#ef4444",
    paddingLeft: "3px",
    paddingRight: "3px",
    ":hover": {
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
    },
  }),
  option: (base: any, state: any) => ({
    ...base,
    color: "black",
    backgroundColor: state.isSelected
      ? "#e0e7ef"
      : state.isFocused
        ? "#f3f4f6"
        : "white",
    fontSize: "12px",
    padding: "4px 8px",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
    "&:active": {
      backgroundColor: "#e0e7ef",
    },
  }),
  input: (base: any) => ({
    ...base,
    color: "black",
    fontSize: "12px",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "black",
    fontSize: "12px",
  }),
};

// Generate select styles with error state
const getSelectStyles = (hasError: boolean) => {
  return {
    ...selectStyles,
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: "white",
      color: "black",
      borderColor: hasError
        ? "#dc2626"
        : state.isFocused
          ? "#2461aa"
          : "#45526c",
      borderWidth: hasError ? "2px" : "1px",
      borderRadius: "4px",
      padding: "2px",
      boxShadow: hasError
        ? "0 0 0 1px rgba(220, 38, 38, 0.2)"
        : state.isFocused
          ? "0 0 0 1px rgba(37, 99, 176, 0.1)"
          : "none",
      fontSize: "14px",
      minHeight: "36px",
      "&:hover": {
        borderColor: hasError ? "#dc2626" : "#2461aa",
      },
    }),
  };
};

// Add a constant for S&T Disconnection assignment emails near the top of the file with other constants
const sntDisconnectionAssignToOptions = [
  { name: "S&T User", email: "snt.user@test.com" },
  { name: "Officer 2", email: "snt.officer2@railways.com" },
  { name: "Supervisor", email: "snt.supervisor@railways.com" },
  { name: "Manager", email: "snt.manager@railways.com" },
  { name: "Engineer", email: "snt.engineer@railways.com" },
];

// Add the ReviewModal props type
interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: any;
  blockSectionValue: string[];
  processedLineSections: any[];
  selectedActivities: string[];
  customActivity: string;
  formSubmitting?: boolean;
  readOnly?: boolean;
  userDepot?:string;
}

function ReviewBlockRequestModal({
  isOpen,
  onClose,
  onConfirm,
  formData,
  blockSectionValue,
  processedLineSections,
  selectedActivities,
  customActivity,
  formSubmitting,
  readOnly,
  userDepot
}: ReviewModalProps) {
  if (!isOpen) return null;

  // Debug log to see what's being passed
  console.log("ReviewModal Safety Info:", formData);

  // Helper function to render safety information based on department
  const renderSafetyInfo = () => {
    const department = formData.selectedDepartment;

    // TRD department: Don't show any safety information
    if (department === "TRD") {
      return null;
    }

    // Helper function to check if a safety requirement is enabled
    const isEnabled = (value: any): boolean => {
      return value === true || value === "Y" || value === "true" || value === "yes" || value === "Yes";
    };

    // For other departments (ENGG and S&T)
    return (
     <div className="space-y-2 mt-5">
  <h2 className="font-bold">Safety Information</h2>

  {/* Fresh Caution - Show for both ENGG and S&T */}
  <div className="text-[14px]">
    <div className="font-semibold">Fresh Caution Imposed:</div>
    <div>{isEnabled(formData.freshCautionRequired) ? "" : "No"}</div>

    {/* Show fresh caution details only if it's enabled */}
    {isEnabled(formData.freshCautionRequired) && (
      <div className="ml-4 mt-2 space-y-4 text-sm">
        {formData.freshCautions && formData.freshCautions.map((caution: any, index: number) => (
          <div key={index} className="border-l-2 border-blue-300 pl-3 bg-blue-50 p-2 rounded">
            <div className="font-medium text-blue-800 mb-2">Fresh Caution #{index + 1}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
              {caution.freshCautionLocationFrom && (
                <div><span className="font-semibold">Location From:</span> {caution.freshCautionLocationFrom}</div>
              )}
              {caution.freshCautionLocationTo && (
                <div><span className="font-semibold">Location To:</span> {caution.freshCautionLocationTo}</div>
              )}
              {caution.freshCautionSpeed && (
                <div><span className="font-semibold">Speed (km/hr):</span> {caution.freshCautionSpeed}</div>
              )}
              {caution.adjacentLinesAffected && (
                <div><span className="font-semibold">Adjacent Lines Affected:</span> {caution.adjacentLinesAffected}</div>
              )}
              {caution.freshCautionFromDate && (
                <div><span className="font-semibold">From Date:</span> {caution.freshCautionFromDate}</div>
              )}
              {caution.freshCautionToDate && (
                <div><span className="font-semibold">To Date:</span> {caution.freshCautionToDate}</div>
              )}
              {caution.freshCautionFromTime && (
                <div><span className="font-semibold">From Time:</span> {caution.freshCautionFromTime}</div>
              )}
              {caution.freshCautionToTime && (
                <div><span className="font-semibold">To Time:</span> {caution.freshCautionToTime}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Power Block - Show for both ENGG and S&T */}
  <div>
    <div className="font-semibold text-[14px]">Power Block:</div>
    <div>{isEnabled(formData.powerBlockRequired) ? "" : "No"}</div>

    {/* Show power block details only if it's enabled */}
    {isEnabled(formData.powerBlockRequired) && (
      <div className="ml-4 mt-2 space-y-1 text-sm">
        {formData.elementarySection && (
          <div><span className="font-semibold">Elementary Section:</span> {formData.elementarySection}</div>
        )}
        {formData.powerBlockKmFrom && (
          <div><span className="font-semibold">KM From:</span> {formData.powerBlockKmFrom}</div>
        )}
        {formData.powerBlockKmTo && (
          <div><span className="font-semibold">KM To:</span> {formData.powerBlockKmTo}</div>
        )}
        {formData.powerBlockRoad && (
          <div><span className="font-semibold">Road:</span> {formData.powerBlockRoad}</div>
        )}
        {formData.powerBlockDisconnectionAssignTo && (
          <div><span className="font-semibold">Assign To:</span> {formData.powerBlockDisconnectionAssignTo}</div>
        )}
        {formData.powerBlockRequirements && formData.powerBlockRequirements.length > 0 && (
          <div>
            <span className="font-semibold">Requirements:</span>{" "}
            {formData.powerBlockRequirements.join(", ")}
          </div>
        )}
      </div>
    )}
  </div>

  {/* S&T Disconnection - Show only for ENGG */}
  {department === "ENGG" && (
    <div>
      <div className="font-semibold text-[14px]">S&T Disconnection:</div>
      <div>{isEnabled(formData.sntDisconnectionRequired) ? "" : "No"}</div>

      {/* Show S&T disconnection details only if it's enabled */}
      {isEnabled(formData.sntDisconnectionRequired) && (
        <div className="ml-4 mt-2 space-y-1 text-sm">
          {formData.sntDisconnectionLineFrom && (
            <div><span className="font-semibold">Line From:</span> {formData.sntDisconnectionLineFrom}</div>
          )}
          {formData.sntDisconnectionLineTo && (
            <div><span className="font-semibold">Line To:</span> {formData.sntDisconnectionLineTo}</div>
          )}
          {formData.sntDisconnectionPointNo && (
            <div><span className="font-semibold">Point No:</span> {formData.sntDisconnectionPointNo}</div>
          )}
          {formData.sntDisconnectionSignalNo && (
            <div><span className="font-semibold">Signal No:</span> {formData.sntDisconnectionSignalNo}</div>
          )}
          {formData.sntDisconnectionRequirements && formData.sntDisconnectionRequirements.length > 0 && (
            <div>
              <span className="font-semibold">Requirements:</span>{" "}
              {formData.sntDisconnectionRequirements.join(", ")}
            </div>
          )}
          {formData.sntDisconnectionAssignTo && (
            <div><span className="font-semibold">Assign To:</span> {formData.sntDisconnectionAssignTo}</div>
          )}
        </div>
      )}
    </div>
  )}
          {/* ENG Disconnection - Show for both ENGG and S&T */}
          {department==="S&T"&&(
               <div>
          <div className="font-semibold text-[14px]">ENG Disconnection:</div>
          <div>{isEnabled(formData.enggDisconnectionsRequired) ? "" : "No"}</div>

          {/* Show ENG disconnection details only if it's enabled */}
          {isEnabled(formData.enggDisconnectionsRequired) && (
            <div className="ml-4 mt-2 space-y-1 text-sm">
              {formData.engDisconnectionRemarks && (
                <div><span className="font-semibold">Remarks:</span> {formData.engDisconnectionRemarks}</div>
              )}
              {formData.engDisconnectionAssignTo && (
                <div><span className="font-semibold">Assign To:</span> {formData.engDisconnectionAssignTo}</div>
              )}
              {formData.selectedENGDepots && formData.selectedENGDepots.length > 0 && (
                <div>
                  <span className="font-semibold">Assigned Depots:</span>{" "}
                  {Array.isArray(formData.selectedENGDepots) 
                    ? formData.selectedENGDepots.join(", ")
                    : formData.selectedENGDepots}
                </div>
              )}
            </div>
          )}
        </div>
          )}
     
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 relative overflow-y-auto max-h-[90vh] text-gray-600">
        <h2 className="text-xl font-bold mb-6 text-center">Confirm Your Request</h2>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="mb-2 font-bold">Your request for traffic block in {blockSectionValue.join(", ")} Block Section on {formData.date} from {formData.demandTimeFrom} hrs to {formData.demandTimeTo} hrs and is ready to be submitted.</p>
          <p className="text-sm text-gray-600">Please review all details below before final submission.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Left Column - Basic Information & Safety Info */}
          <div>
            <h3 className="font-bold mb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-2 text-[14px]">
              <div className="text-gray-600 font-bold">Date:</div>
              <div>{formData.date}</div>

              <div className="text-gray-600 font-bold">Department:</div>
              <div>{formData.selectedDepartment}</div>

              <div className="text-gray-600 font-bold">Major Section:</div>
              <div>{formData.selectedSection}</div>

              <div className="text-gray-600 font-bold">Depot/SSE:</div>
              <div><div>{userDepot || formData.selectedDepo || "Not assigned"}</div></div>

              <div className="text-gray-600 font-bold">Work Type:</div>
              <div>{formData.workType}</div>

             <div className="text-gray-600 font-bold">Work Description:</div>
<div className="max-w-full break-words bg-blue-50 p-2 rounded text-sm max-h-32 overflow-y-auto">
  {selectedActivities && selectedActivities.length > 0 ? (
    <div className="flex flex-wrap gap-1">
      {selectedActivities.map((activity: string, index: number) => (
        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          {activity}
        </span>
      ))}
    </div>
  ) : customActivity ? (
    <div className="break-words whitespace-pre-wrap">
      {customActivity}
    </div>
  ) : (
    <span className="text-gray-400">No activity specified</span>
  )}
</div>

              <div className="text-gray-600 font-bold">Demanded Time:</div>
              <div>{formData.demandTimeFrom} to {formData.demandTimeTo}</div>
            </div>

            {/* Moved safety info here for ENGG and S&T departments */}
            {formData.selectedDepartment !== "TRD" && renderSafetyInfo()}

            {formData.requestremarks && formData.requestremarks.trim() !== "" && (
              <div className="mt-4">
                <h3 className="font-bold">Remarks</h3>
                <div>{formData.requestremarks}</div>
              </div>
            )}
            {formData.remarks && (
              <div className="mb-2">
                <b>Remarks:</b> {formData.remarks}
              </div>
            )}
          </div>

          {/* Right Column - Block Section & Other Affected Lines/Roads */}
          <div>
            <h3 className="font-bold mb-2">Block Section - Lines/Roads</h3>
            <div className="mb-4 space-y-2 text-[14px] text-gray-600">
              {formData.processedLineSections && formData.processedLineSections.length > 0 ? (
                formData.processedLineSections.map((section: any, index: number) => (
                  <div key={index}>
                    <div className="font-medium text-gray-800">{section.block} {section.type === "yard" ? "(Yard)" : "(Block Section)"}</div>

                    {/* Display Lines with UP/DOWN direction */}
                    {section.lineName && (
                      <div className="ml-2 mb-1">
                        {section.lineName.toLowerCase().includes('up') ? (
                          <div className="flex items-center">
                            <span className="font-medium bg-green-100 text-green-800 px-2 rounded mr-2">Up {section.lineName.replace(/up\s*/i, '').trim()}</span>
                            {section.type === "block" && section.lineName.toLowerCase().includes('slow') &&
                              <span className="ml-2 bg-amber-100 text-amber-600 font-medium">Slow in block</span>
                            }
                          </div>
                        ) : section.lineName.toLowerCase().includes('down') ? (
                          <div className="flex items-center">
                            <span className="font-medium bg-red-100 text-red-800 px-2 rounded mr-2">Down {section.lineName.replace(/down\s*/i, '').trim()}</span>
                            {section.type === "block" && section.lineName.toLowerCase().includes('slow') &&
                              <span className="ml-2 bg-amber-100 text-amber-600 font-medium">Slow in block</span>
                            }
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="font-medium">Line:</span>
                            <span className="ml-1">{section.lineName}</span>
                            {section.type === "block" && section.lineName.toLowerCase().includes('slow') &&
                              <span className="ml-2 bg-amber-100 text-amber-600 font-medium">Slow in block</span>
                            }
                          </div>
                        )}
                      </div>
                    )}

                    {/* Display Roads with numbered formatting */}
                    {section.road && (
                      <div className="ml-2">
                        {section.road.match(/rd\s*\d+/i) ? (
                          <div className="flex items-center">
                            <span className="font-medium bg-blue-100 text-blue-800 px-2 rounded mr-2">
                              {section.road.match(/rd\s*\d+/i)[0].toUpperCase()}
                            </span>
                            <span>{section.road.replace(/rd\s*\d+/i, '').trim()}</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="font-medium">Road:</span>
                            <span className="ml-1">{section.road}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                blockSectionValue.map((block, index) => (
                  <div key={index} className="">
                    <div className="font-medium text-gray-800">{block}</div>
                  </div>
                ))
              )}
            </div>

            {/* Always show Other Affected Lines/Roads section */}
            <div className="mt-4">
              <h3 className="font-bold mb-2">Other Affected Lines/Roads:</h3>
              {formData.processedLineSections && formData.processedLineSections.some((s: any) => s.otherLines?.trim() || s.otherRoads?.trim()) ? (
                <div className="">
                  {formData.processedLineSections.map((s: any, index: any) => (
                    <React.Fragment key={`other-${index}`}>
                      {s.otherLines?.trim() && (
                        <div className="mb-2">
                          <div className="font-medium mb-1">{s.block} - Other Lines:</div>
                          <div className="ml-2">
                            {s.otherLines.split(',').map((line: string, idx: number) => {
                              const trimmedLine = line.trim();
                              if (trimmedLine.toLowerCase().includes('up')) {
                                return (
                                  <div key={`line-${idx}`} className="flex items-center mb-1">
                                    <span className="font-medium bg-green-100 text-green-800 px-2 rounded mr-2">Up {trimmedLine.replace(/up\s*/i, '').trim()}</span>
                                  </div>
                                );
                              } else if (trimmedLine.toLowerCase().includes('down')) {
                                return (
                                  <div key={`line-${idx}`} className="flex items-center mb-1">
                                    <span className="font-medium bg-red-100 text-red-800 px-2 rounded mr-2">Down {trimmedLine.replace(/down\s*/i, '').trim()}</span>
                                  </div>
                                );
                              } else {
                                return (
                                  <div key={`line-${idx}`} className="mb-1">
                                    {trimmedLine}
                                  </div>
                                );
                              }
                            })}
                          </div>
                        </div>
                      )}

                      {s.otherRoads?.trim() && (
                        <div className="mb-2">
                          <div className="font-medium mb-1">{s.block} - Other Roads:</div>
                          <div className="ml-2">
                            {s.otherRoads.split(',').map((road: string, idx: number) => {
                              const trimmedRoad = road.trim();
                              const roadMatch = trimmedRoad.match(/rd\s*\d+/i);

                              if (roadMatch) {
                                return (
                                  <div key={`road-${idx}`} className="flex items-center mb-1">
                                    <span className="font-medium bg-blue-100 text-blue-800 px-2 rounded mr-2">
                                      {roadMatch[0].toUpperCase()}
                                    </span>
                                    <span>{trimmedRoad.replace(/rd\s*\d+/i, '').trim()}</span>
                                  </div>
                                );
                              } else {
                                return (
                                  <div key={`road-${idx}`} className="mb-1">
                                    {trimmedRoad}
                                  </div>
                                );
                              }
                            })}
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="text-[14px] text-gray-600">None</div>
              )}
            </div>

            {(formData.workLocationFrom?.trim() || formData.trdWorkLocation?.trim()) && (
              <div className="mt-4">
                <h3 className="font-bold">Work Location</h3>
                <div className="text-[14px] text-gray-600">
                  {formData.workLocationFrom || formData.trdWorkLocation}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-4">
          <div className="flex justify-center gap-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 rounded-md text-gray-800 font-medium hover:bg-gray-300"
            >
              Go Back to Editing
            </button>

            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={formSubmitting}
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


const otherAffectedSelectStyles = {
  ...selectStyles,
  option: (base: any, state: any) => ({
    ...base,
    color: "black",
    backgroundColor: state.isSelected
      ? "#e0e7ef"
      : state.isFocused
        ? "#e5e7eb"
        : "white",
    fontSize: "13px",
    padding: "6px 10px",
    fontWeight: state.isSelected ? "bold" : "normal",
    "&:hover": {
      backgroundColor: "#e5e7eb",
      color: "black",
    },
    "&:active": {
      backgroundColor: "#e0e7ef",
      color: "black",
    },
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "#f3f4f6",
    color: "black",
    border: "1px solid #bdbdbd",
    borderRadius: "4px",
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: "black",
    fontSize: "12px",
    padding: "2px 6px",
    fontWeight: "bold",
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: "#ef4444",
    paddingLeft: "4px",
    paddingRight: "4px",
    ":hover": {
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
    },
  }),
};

// Move this utility function above ReviewBlockRequestModal so it is in scope
function getDuration(from: string, to: string) {
  if (!from || !to) return "";
  const [fromH, fromM] = from.split(":").map(Number);
  const [toH, toM] = to.split(":").map(Number);
  let start = fromH * 60 + fromM;
  let end = toH * 60 + toM;
  if (end < start) end += 24 * 60;
  const diff = end - start;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hours}h ${mins}m`;
}

// Helper to calculate duration from two HH:MM strings
function getDurationFromTimes(from: string, to: string) {
  if (!from || !to) return "";
  const [fromH, fromM] = from.split(":").map(Number);
  const [toH, toM] = to.split(":").map(Number);
  let start = fromH * 60 + fromM;
  let end = toH * 60 + toM;
  if (end < start) end += 24 * 60;
  const diff = end - start;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hours}h ${mins}m`;
}

// Multi-Select Depot Component
interface MultiSelectDepotProps {
  department: "S&T" | "TRD"|"ENGG";
  selectedDepots: string[];
  onDepotsChange: (depots: string[]) => void;
  majorSection: string;
  blockSections: string[];
  disabled?: boolean;
  required?: boolean;
}

function MultiSelectDepot({
  department,
  selectedDepots,
  onDepotsChange,
  majorSection,
  blockSections,
  disabled = false,
  required = false
}: MultiSelectDepotProps) {
  // Get available depots: combine auto-assigned depots + all depot options for this major section
  const getAvailableDepots = () => {
    if (!majorSection) return [];

    // Get auto-assigned depots from block section mapping
    const autoAssignedDepots = getAutoAssignedDepots(majorSection, blockSections, department)
      .split(", ")
      .filter(d => d.trim());

    // Get all available depots from depot structure for this major section
    const allMajorSectionDepots = depot[majorSection]?.[department] || [];

    // Combine and deduplicate: auto-assigned depots first, then other available ones
    const combinedDepots = [...new Set([...autoAssignedDepots, ...allMajorSectionDepots])];

    return combinedDepots.sort();
  };

  // Get default depot from block section mapping
  const getDefaultDepot = () => {
    return getAutoAssignedDepots(majorSection, blockSections, department);
  };

  const availableDepots = getAvailableDepots();
  const defaultDepot = getDefaultDepot();

  // Initialize with default depot if no depots selected
  React.useEffect(() => {
    if (selectedDepots.length === 0 && defaultDepot) {
      const defaultDepots = defaultDepot.split(", ").filter(d => d.trim());
      if (defaultDepots.length > 0) {
        onDepotsChange(defaultDepots);
      }
    }
  }, [defaultDepot, selectedDepots.length, onDepotsChange]);

  const handleAddDepot = (depotToAdd: string) => {
    if (!selectedDepots.includes(depotToAdd)) {
      onDepotsChange([...selectedDepots, depotToAdd]);
    }
  };

  const handleRemoveDepot = (depotToRemove: string) => {
    // Don't allow removing if it's the last depot
    if (selectedDepots.length > 1) {
      onDepotsChange(selectedDepots.filter(d => d !== depotToRemove));
    }
  };

  return (
    <div className="flex flex-col my-5">
      <div className="flex flex-row flex-wrap gap-1 w-full items-center justify-center">
        <span className="text-black font-bold text-2xl">
          Assign To:
          {required && <span className="text-red-600 ml-1">*</span>}
        </span>
        <div className="flex flex-col space-y-2 w-full items-center justify-center">
          {/* Selected Depots as Tags */}
          <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
            {selectedDepots.map((depotCode, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-xl text-medium font-bold bg-blue-100 text-blue-800 border border-black"
              >
                {depotCode}
                {selectedDepots.length > 1 && !disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDepot(depotCode)}
                    className="ml-2 inline-flex items-center justify-center w-4 h-4 text-blue-600 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            {selectedDepots.length === 0 && (
              <span className="text-gray-500 text-sm">
                {majorSection && blockSections.length > 0
                  ? `No ${department} depots available for selected sections`
                  : "Select Major Section and Block Sections first"}
              </span>
            )}
          </div>

          {/* Dropdown to Add More Depots */}
          {!disabled && availableDepots.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddDepot(e.target.value);
                  e.target.value = ""; // Reset dropdown
                }
              }}
              className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black px-3 py-2 text-lg rounded w-full max-w-xs"
              defaultValue=""
            >
              <option value="" disabled>
                Add more depots...
              </option>
              {availableDepots
                .filter(depotOption => !selectedDepots.includes(depotOption))
                .map((depotOption, index) => (
                  <option key={index} value={depotOption}>
                    {depotOption}
                  </option>
                ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

type FormDataValue = string | number | boolean | null | string[];

interface FormData {
  engDisconnectionAssignTo: string;
  engDisconnectionRemarks: string;
  freshCautions: {
    adjacentLinesAffected: string;
    freshCautionLocationFrom: string;
    freshCautionLocationTo: string;
    freshCautionSpeed: string;
    freshCautionFromDate: string;        
    freshCautionToDate: string;          
    freshCautionFromTime: string;        
    freshCautionToTime: string;
  }[];
  powerBlockDisconnectionAssignTo: string;
  sntDisconnectionAssignTo: string;
  date: string;
  demandTimeFrom: string;
  demandTimeTo: string;
  processedLineSections: {
    type: string;
    block: string;
    lineName: string;
    otherLines: string;
    stream: string;
    road: string;
    otherRoads: string;
  }[];
  adminAcceptance: boolean;
  selectedDepartment: string;
  selectedSection: string;
  missionBlock: string;
  workType: string;
  activity: string;
  corridorTypeSelection:
  | "Corridor"
  | "Outside Corridor"
  | "Urgent Block"
  | null;
  corridorType: "Corridor" | "Outside Corridor" | "Urgent Block" | null;
  selectedStream: string;
  selectedRoad: string;
  selectedRoads: string[];
  selectedStreams: string[];
  trdWorkLocation?: string;
  cautionRequired: boolean;
  cautionSpeed: number;
  workLocationFrom: string;
  workLocationTo: string;
  sigDisconnection: boolean;
  elementarySection: string;
  cautionLocationFrom: string;
  cautionLocationTo: string;
  freshCautionRequired: boolean | null;
  freshCautionSpeed: number;
  freshCautionLocationFrom: string;
  adjacentLinesAffected: string;
  sigElementarySectionFrom: string;
  sigElementarySectionTo: string;
  sntDisconnectionLineFrom: string;
  sntDisconnectionLineTo: string;
  repercussions: string;
  assetName: string;
  assetNumber: string;
  sntDisconnectionLine: string;
  elementarySectionTo: string;
  freshCautionLocationTo: string;
  requestremarks: string;
  selectedDepo: string;
  routeFrom: string;
  routeTo: string;
  powerBlockRequired: boolean | null;
  sntDisconnectionRequired: boolean | null;
  enggDisconnectionsRequired: boolean | null;
  sntDisconnectionRequirements: string[];
  powerBlockRequirements: string[];
  sigResponse: string;
  ohDisconnection: string;
  oheDisconnection: string;
  oheResponse: string;
  sigActionsNeeded: boolean;
  trdActionsNeeded: boolean;
  powerBlockKmFrom: string;
  powerBlockKmTo: string;
  powerBlockRoad: string;
  sntDisconnectionPointNo: string;
  sntDisconnectionSignalNo: string;
  emergencyBlockRemarks: string;
}

export default function CreateBlockRequestPage() {
  const router = useRouter();

  const initialFormData: FormData = {
    date: "",
    demandTimeFrom: "",
    demandTimeTo: "",
    processedLineSections: [],
    adminAcceptance: false,
    selectedDepartment: "",
    selectedSection: "",
    missionBlock: "",
    workType: "",
    activity: "",
    corridorTypeSelection: null,
    corridorType: null,
    selectedStream: "",
    selectedRoad: "",
    selectedRoads: [],
    selectedStreams: [],
    cautionRequired: false,
    cautionSpeed: 0,
    workLocationFrom: "",
    workLocationTo: "",
    sigDisconnection: false,
    elementarySection: "",
    cautionLocationFrom: "",
    cautionLocationTo: "",
    freshCautionRequired: null,
    freshCautionSpeed: 0,
    freshCautionLocationFrom: "",
    adjacentLinesAffected: "",
    sigElementarySectionFrom: "",
    sigElementarySectionTo: "",
    sntDisconnectionLineFrom: "",
    sntDisconnectionLineTo: "",
    repercussions: "",
    assetName: "",
    assetNumber: "",
    sntDisconnectionLine: "",
    elementarySectionTo: "",
    freshCautionLocationTo: "",
    requestremarks: "",
    selectedDepo: "",
    routeFrom: "",
    routeTo: "",
    powerBlockRequired: null,
    sntDisconnectionRequired: null,
    enggDisconnectionsRequired: null,
    sntDisconnectionRequirements: [],
    powerBlockRequirements: [],
    sigResponse: "",
    ohDisconnection: "",
    oheDisconnection: "",
    oheResponse: "",
    sigActionsNeeded: false,
    trdActionsNeeded: false,
    powerBlockKmFrom: "",
    powerBlockKmTo: "",
    powerBlockRoad: "",
    sntDisconnectionPointNo: "",
    sntDisconnectionSignalNo: "",
    trdWorkLocation: "",
    sntDisconnectionAssignTo: "",
    powerBlockDisconnectionAssignTo: "",
    emergencyBlockRemarks: "",
    engDisconnectionAssignTo: "",
    engDisconnectionRemarks: "",
    freshCautions: [
      {
        adjacentLinesAffected: "",
        freshCautionLocationFrom: "",
        freshCautionLocationTo: "",
        freshCautionSpeed: "",
        freshCautionFromDate: "",        
      freshCautionToDate: "",          
      freshCautionFromTime: "",       
      freshCautionToTime: "",
      },
    ],
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
const [userDepots, setUserDepots] = useState<string>("");

  // State for multi-select depots
  const [selectedSTDepots, setSelectedSTDepots] = React.useState<string[]>([]);
  // Add this with your other state declarations
const [selectedENGDepots, setSelectedENGDepots] = React.useState<string[]>([]);
  const [selectedTRDDepots, setSelectedTRDDepots] = React.useState<string[]>([]);
  const [selectionHistory, setSelectionHistory] = useState<Record<string, ('line' | 'road')[]>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [processedLineSections, setProcessedLineSections] = useState<any[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customActivity, setCustomActivity] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [blockSectionValue, setBlockSectionValue] = useState<string[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [validCorridorType, setValidCorridorType] = useState(false);
  const [sntDisconnectionChecked, setSntDisconnectionChecked] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [powerBlockRequirements, setPowerBlockRequirements] = useState<
    string[]
  >([]);
  const [sntDisconnectionRequirements, setSntDisconnectionRequirements] =
    useState<string[]>([]);
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/auth/login";
    },
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupLink, setPopupLink] = useState("");
  const [proceedAnyway, setProceedAnyway] = useState(false);
  // Initialize the depot from session when the session loads
  useEffect(() => {
    if (session?.user?.depot) {
      setUserDepots(session.user.depot || "");
      setFormData(prev => ({
        ...prev,
        selectedDepo: session.user.depot
      }));
    }
  }, [session]);

  // Real-time site location validation
  // useEffect(() => {
  //   if (formData.workLocationFrom || formData.workLocationTo) {
  //     const currentErrors = { ...errors };

  //     // Clear previous site location errors
  //     delete currentErrors.workLocationFrom;
  //     delete currentErrors.workLocationTo;

  //     if (formData.selectedSection && blockSectionValue.length > 0 && userDepartment) {
  //       if (formData.workLocationFrom && formData.workLocationTo) {
  //         const siteLocationValidation = validateSiteLocationPair(
  //           formData.workLocationFrom,
  //           formData.workLocationTo,
  //           formData.selectedSection,
  //           blockSectionValue,
  //           userDepartment,
  //           userDepot
  //         );

  //         if (!siteLocationValidation.fromValid && siteLocationValidation.fromError) {
  //           currentErrors.workLocationFrom = siteLocationValidation.fromError;
  //         }

  //         if (!siteLocationValidation.toValid && siteLocationValidation.toError) {
  //           currentErrors.workLocationTo = siteLocationValidation.toError;
  //         }

  //         if (siteLocationValidation.pairError) {
  //           currentErrors.workLocationTo = siteLocationValidation.pairError;
  //         }
  //       }
  //     }

  //     setErrors(currentErrors);
  //   }
  // }, [formData.workLocationFrom, formData.workLocationTo, formData.selectedSection, blockSectionValue]);

  // Add this helper function to check if multiple lines exist
  const hasMultipleLinesSelected = () => {
    return blockSectionValue.some(block => {
      const section = (formData.processedLineSections || []).find(
        (s: any) => s.block === block
      );
      if (!section) return false;
      const lineCount = [section.lineName, section.otherLines]
        .filter(Boolean).length + (section.otherLines ? section.otherLines.split(',').length : 0);
      return lineCount > 1;
    });
  };

  // Auto-assign depot assignments when block sections change
  useEffect(() => {
    if (blockSectionValue.length > 0 && formData.selectedSection) {

      // Auto-assign S&T depots
      const sntDepots = getAutoAssignedDepots(formData.selectedSection, blockSectionValue, "S&T");
      if (sntDepots) {
        const sntDepotArray = sntDepots.split(", ").filter(d => d.trim());
        if (sntDepotArray.length > 0) {
          // Always update when block sections change to ensure we get all depots
          setSelectedSTDepots(sntDepotArray);
        }
      } else {
        setSelectedSTDepots([]);
      }

      // Auto-assign TRD depots
      const trdDepots = getAutoAssignedDepots(formData.selectedSection, blockSectionValue, "TRD");
      if (trdDepots) {
        const trdDepotArray = trdDepots.split(", ").filter(d => d.trim());
        if (trdDepotArray.length > 0) {
          // Always update when block sections change to ensure we get all depots
          setSelectedTRDDepots(trdDepotArray);
        }
      } else {
        setSelectedTRDDepots([]);
      }
    } else {
      // Clear depots when no block sections are selected
      setSelectedSTDepots([]);
      setSelectedTRDDepots([]);
    }
  }, [blockSectionValue, formData.selectedSection]);


  // Sync depot arrays with form data for API submission
  useEffect(() => {
    const sntDepotsString = selectedSTDepots.join(", ");
    const trdDepotsString = selectedTRDDepots.join(", ");
    const engDepotsString = selectedENGDepots.join(", ");

    setFormData(prev => ({
      ...prev,
      sntDisconnectionAssignTo: sntDepotsString,
      powerBlockDisconnectionAssignTo: trdDepotsString,
      engDisconnectionAssignTo: engDepotsString
    }));
  }, [selectedSTDepots, selectedTRDDepots,selectedENGDepots]);

  const mutation = useCreateUserRequest();
  const userLocation = session?.user.location;
  // const majorSectionOptions =
  //   userLocation && MajorSection[userLocation as keyof typeof MajorSection]
  //     ? MajorSection[userLocation as keyof typeof MajorSection]
  //     : [];

  // const selectedDepo = "AJJE";   //temprory fix we need to change it

  const userDepot = session?.user.depot||"";
  const userDept = session?.user.department ?? "";

  const locationSections =
    userLocation && MajorSection[userLocation as keyof typeof MajorSection]
      ? MajorSection[userLocation as keyof typeof MajorSection]
      : [];

  // const majorSectionOptions =
  //   userDepot === "OVERALL"
  //     ? locationSections
  //     : locationSections.filter((section) => {
  //       const depotData: any = depot[section as keyof typeof depot];
  //       if (!depotData) return false;

  //       if (!(userDept in depotData)) return false;

  //       return depotData[userDept].includes(userDepot);
  //     });
  const majorSectionOptions =
  userDepot === "OVERALL"
    ? locationSections
    : locationSections.filter((section) => {
        const depotData: any = depot[section as keyof typeof depot];
        if (!depotData) return false;

        if (!(userDept in depotData)) return false;

        // FIX: Handle multiple depots
        const userDepots = userDepot.split(',').map(d => d.trim());
        const sectionDepots = depotData[userDept];
        
        // Check if ANY user depot exists in section depots
        return userDepots.some(depot => sectionDepots.includes(depot));
      });

  const selectedMajorSection = formData.selectedSection;
  const blockSectionOptions =
    selectedMajorSection &&
      blockSection[selectedMajorSection as keyof typeof blockSection]
      ? blockSection[selectedMajorSection as keyof typeof blockSection]
      : [];
  const userDepartment = session?.user.department;
  const workTypeOptions =
    userDepartment && workType[userDepartment as keyof typeof workType]
      ? workType[userDepartment as keyof typeof workType]
      : [];
  const selectedWorkType = formData.workType;
  // const activityOptions =
  //   selectedWorkType && Activity[selectedWorkType as keyof typeof Activity]
  //     ? Activity[selectedWorkType as keyof typeof Activity]
  //     : [];

const getActivityOptions = () => {
  if (!formData.workType) return [];
  
  // Handle both single and multiple work types
  const workTypes = formData.workType.split(',').map(type => type.trim()).filter(type => type !== '');
  
  // Get all unique activities from all selected work types
  const allActivities = new Set<string>();
  
  workTypes.forEach(workType => {
    const activitiesForType = Activity[workType as keyof typeof Activity] || [];
    activitiesForType.forEach(activity => {
      if (activity && activity.trim() !== '') {
        allActivities.add(activity.trim());
      }
    });
  });
  
  return Array.from(allActivities);
};

const activityOptions = getActivityOptions();
  const blockSectionOptionsList = blockSectionOptions.map((block: string) => ({
    value: block,
    label: block,
  }));

  // Utility functions to map between block sections and yards
  const getYardsFromBlockSection = (block: string): string[] => {
    if (!block.includes("-")) return [];
    const parts = block.split("-");
    // Handle cases like "MASS-BBQ" (2 parts) and "MAS-BBQ" (2 parts)
    if (parts.length === 2) {
      const [from, to] = parts;
      return [`${from}-YD`, `${to}-YD`];
    }
    // Handle cases like "VPY-KOK-TNP" (3 parts)
    return parts.map((part) => `${part}-YD`);
  };

  const getBlockSectionsFromYard = (
    yard: string,
    majorSection: string
  ): string[] => {
    if (!yard.includes("-YD")) return [];
    const station = yard.replace("-YD", "");

    // Get all block sections for the major section
    const allBlocks =
      blockSection[majorSection as keyof typeof blockSection] || [];

    // Find block sections that include this station
    return allBlocks.filter(
      (block) =>
        block.includes("-") &&
        (block.startsWith(`${station}-`) || block.endsWith(`-${station}`))
    );
  };

  const getFilteredOptions = (
    selectedSection: string,
    blockSectionValue: string[]
  ) => {
    if (blockSectionValue.length === 0) {
      return blockSectionOptions;
    }

    const relatedOptions = new Set<string>();

    blockSectionValue.forEach((selected) => {
      if (selected.endsWith("-YD")) {
        // Selected a yard - show its related blocks
        const blocks = getBlockSectionsFromYard(
          selected,
          formData.selectedSection
        );
        blocks.forEach((block) => relatedOptions.add(block));
      } else {
        // Selected a block - show its related yards
        const yards = getYardsFromBlockSection(selected);
        yards.forEach((yard) => relatedOptions.add(yard));
      }

      // Always keep the selected values
      relatedOptions.add(selected);
    });

    return blockSectionOptions.filter((option) => relatedOptions.has(option));
  };

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Use UTC methods to ensure consistent timezone handling
    return `${tomorrow.getUTCFullYear()}-${String(
      tomorrow.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(tomorrow.getUTCDate()).padStart(2, "0")}`;
  };

  const isDateInCurrentWeek = (dateString: string): boolean => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const targetDate = new Date(dateString + "T00:00:00Z");
    targetDate.setUTCHours(0, 0, 0, 0);

    const currentWeekMonday = new Date(today);
    const daysSinceMonday = today.getUTCDay() === 0 ? 6 : today.getUTCDay() - 1;
    currentWeekMonday.setUTCDate(today.getUTCDate() - daysSinceMonday);

    const currentWeekSunday = new Date(currentWeekMonday);
    currentWeekSunday.setUTCDate(currentWeekMonday.getUTCDate() + 6);

    return targetDate >= currentWeekMonday && targetDate <= currentWeekSunday;
  };

  //new change
  const isDateInWeekAfterNext = (dateString: string): boolean => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const targetDate = new Date(dateString + "T00:00:00Z");
    targetDate.setUTCHours(0, 0, 0, 0);

    const nextWeekSunday = new Date(today);
    nextWeekSunday.setUTCDate(today.getUTCDate() + (7 - today.getUTCDay() + 7));

    const weekAfterNextMonday = new Date(nextWeekSunday);
    weekAfterNextMonday.setUTCDate(nextWeekSunday.getUTCDate() + 1);

    const weekAfterNextSunday = new Date(weekAfterNextMonday);
    weekAfterNextSunday.setUTCDate(weekAfterNextMonday.getUTCDate() + 6);

    return (
      targetDate >= weekAfterNextMonday && targetDate <= weekAfterNextSunday
    );
  };

  const isWithinNextTwoDays = (dateString: string): boolean => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const targetDate = new Date(dateString + "T00:00:00Z");
    targetDate.setUTCHours(0, 0, 0, 0);

    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setUTCDate(today.getUTCDate() + 2);

    return targetDate >= today && targetDate <= twoDaysFromNow;
  };

  const isDateInNextWeek = (dateString: string): boolean => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const targetDate = new Date(dateString + "T00:00:00Z");
    targetDate.setUTCHours(0, 0, 0, 0);

    const currentWeekSunday = new Date(today);
    const daysUntilSunday = today.getUTCDay() === 0 ? 0 : 7 - today.getUTCDay();
    currentWeekSunday.setUTCDate(today.getUTCDate() + daysUntilSunday);

    const nextWeekMonday = new Date(currentWeekSunday);
    nextWeekMonday.setUTCDate(currentWeekSunday.getUTCDate() + 1);

    const nextWeekSunday = new Date(nextWeekMonday);
    nextWeekSunday.setUTCDate(nextWeekMonday.getUTCDate() + 6);

    return targetDate >= nextWeekMonday && targetDate <= nextWeekSunday;
  };

  // const isPastThursdayCutoff = (): boolean => {
  //   const now = new Date();
  //   const dayOfWeek = now.getUTCDay();
  //   const hour = now.getUTCHours();

  //   return (dayOfWeek === 4 && hour >= 22) || dayOfWeek > 4;
  // };
const isPastThursdayCutoff = () => {
  const now = new Date();
  const thursday = new Date();
  thursday.setDate(now.getDate() - now.getDay() + 4); // Thursday
  thursday.setHours(22, 0, 0, 0); 

  return now > thursday;
};

  // const getCorridorTypeRestrictions = (
  //   dateString: string
  // ): {
  //   urgentOnly: boolean;
  //   urgentAllowed: boolean;
  //   message: string;
  // } => {
  //   if (!dateString) {
  //     return { urgentOnly: false, urgentAllowed: false, message: "" };
  //   }

  //   const isUrgentTimeframe = isWithinNextTwoDays(dateString);

  //   const isNextWeek = isDateInNextWeek(dateString);

  //   const pastThursdayCutoff = isPastThursdayCutoff();

  //   const urgentAllowed = isUrgentTimeframe;

  //   const urgentOnly = isUrgentTimeframe || (isNextWeek && pastThursdayCutoff);

  //   let message = "";
  //   if (isUrgentTimeframe) {
  //     message =
  //       "Dates within today and next 2 days must be Urgent Block requests.";
  //   } else if (isNextWeek && pastThursdayCutoff) {
  //     message =
  //       "Week 2 requests after Thursday 22:00 cutoff must be Urgent Block requests.";
  //   }

  //   return { urgentOnly, urgentAllowed, message };
  // };

  // const getCorridorTypeRestrictions = (
  //   dateString: string
  // ): {
  //   urgentOnly: boolean;
  //   urgentAllowed: boolean;
  //   message: string;
  //   corridorTypeAllowed: boolean;
  // } => {
  //   if (!dateString) {
  //     return {
  //       urgentOnly: false,
  //       urgentAllowed: false,
  //       message: "",
  //       corridorTypeAllowed: false,
  //     };
  //   }

  //   const isUrgentTimeframe = isWithinNextTwoDays(dateString);
  //   const isNextWeek = isDateInNextWeek(dateString);
  //   const pastThursdayCutoff = isPastThursdayCutoff();
  //   const urgentAllowed = isUrgentTimeframe;
  //   const urgentOnly = isUrgentTimeframe;
  //   const corridorTypeAllowed = !(isNextWeek && pastThursdayCutoff);
  //   let message = "";
  //   if (isUrgentTimeframe) {
  //     message =
  //       "Dates within today and next 2 days must be Urgent Block requests.";
  //   } else if (isNextWeek && pastThursdayCutoff) {
  //     message =
  //       "Week 2 requests after Thursday 22:00 cutoff must be Urgent Block requests.";
  //   }

  //   return { urgentOnly, urgentAllowed, message, corridorTypeAllowed };
  // };
const getCorridorTypeRestrictions = (dateString: string) => {
  if (!dateString) {
    return {
      urgentOnly: false,
      urgentAllowed: false,
      message: "",
      corridorTypeAllowed: false,
    };
  }

  // 1. Urgent logic
  const urgentOnly = isWithinNextTwoDays(dateString);

  // 2. Calculate diffDays for blocking logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );

  // 3. Thursday cutoff check
  const isPastCutoff = isPastThursdayCutoff();

  // 4. After cutoff → block 14–21 (diffDays 3–10)
  if (isPastCutoff && diffDays >= 3 && diffDays <= 10) {
    return {
      urgentOnly: false,
      urgentAllowed: false,
      message: "Not a valid date",
      corridorTypeAllowed: false,
    };
  }

  // 5. Normal output before cutoff
  return {
    urgentOnly,
    urgentAllowed: urgentOnly,
    message: "",
    corridorTypeAllowed: !urgentOnly,
  };
};


  const isBlockedCurrentWeekDate = (dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);

    const maxUrgentDate = new Date(today);
    maxUrgentDate.setDate(today.getDate() + 2);

    const currentWeekSunday = new Date(today);
    const daysUntilSunday = today.getDay() === 0 ? 0 : 7 - today.getDay();
    currentWeekSunday.setDate(today.getDate() + daysUntilSunday);

    return targetDate > maxUrgentDate && targetDate <= currentWeekSunday;
  };

  const isDateSelectable = (dateString: string): boolean => {
    if (!dateString) return false;

    return !isBlockedCurrentWeekDate(dateString);
  };

  const getMinDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const getMaxUrgentDateString = () => {
    const today = new Date();
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setUTCDate(today.getUTCDate() + 2);
    return `${dayAfterTomorrow.getUTCFullYear()}-${String(
      dayAfterTomorrow.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(dayAfterTomorrow.getUTCDate()).padStart(
      2,
      "0"
    )}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      const newData = { ...prev };
      const key = name as keyof FormData;

      if (type === "checkbox") {
        (newData as any)[key] = (e.target as HTMLInputElement).checked;
      } else if (type === "number" || key === "freshCautionSpeed") {
        // Handle both explicit number inputs and freshCautionSpeed
        const numValue = parseFloat(value);
        (newData as any)[key] = isNaN(numValue) ? 0 : numValue;
      } else {
        (newData as any)[key] = value;
      }

      return newData as FormData;
    });
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const getStreamDataSafely = (
    blockKey: string,
    streamKey: string
  ): string[] => {
    if (!(blockKey in streamData)) {
      return [];
    }

    const blockData = streamData[blockKey as keyof typeof streamData];
    if (typeof blockData !== "object" || !(streamKey in blockData)) {
      return [];
    }
    const streamDataTyped = blockData as Record<string, string[]>;
    return streamDataTyped[streamKey] || [];
  };

  // Helper to scroll to the first error field
  const scrollToFirstError = (errors: Record<string, string>) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      let errorElement = document.querySelector(`[name="${firstErrorKey}"]`);
      if (!errorElement) {
        errorElement = document.getElementById(firstErrorKey);
      }
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        (errorElement as HTMLElement).focus();
      }
    }
  };

  const shouldForceUrgentBlock = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(formData.date);
    targetDate.setHours(0, 0, 0, 0);
    const dayDiff = Math.floor(
      (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dayDiff === 0 || dayDiff === 1 || dayDiff === 2) {
      return true;
    }
    const isDateInNextWeek = (dateString: string): boolean => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const targetDate = new Date(dateString + "T00:00:00Z");
      targetDate.setUTCHours(0, 0, 0, 0);
      const currentWeekSunday = new Date(today);
      const daysUntilSunday =
        today.getUTCDay() === 0 ? 0 : 7 - today.getUTCDay();
      currentWeekSunday.setUTCDate(today.getUTCDate() + daysUntilSunday);
      const nextWeekMonday = new Date(currentWeekSunday);
      nextWeekMonday.setUTCDate(currentWeekSunday.getUTCDate() + 1);
      const nextWeekSunday = new Date(nextWeekMonday);
      nextWeekSunday.setUTCDate(nextWeekMonday.getUTCDate() + 6);
      return targetDate >= nextWeekMonday && targetDate <= nextWeekSunday;
    };
    const isPastThursdayCutoff = (): boolean => {
      const now = new Date();
      const dayOfWeek = now.getUTCDay();
      const hour = now.getUTCHours();
      return (dayOfWeek === 4 && hour >= 22) || dayOfWeek > 4;
    };
    return isDateInNextWeek(formData.date) && isPastThursdayCutoff();
  })();

  useEffect(() => {
    if (
      shouldForceUrgentBlock &&
      formData.corridorTypeSelection !== "Urgent Block"
    ) {
      setFormData((prev) => ({
        ...prev,
        corridorTypeSelection: "Urgent Block",
      }));
    }
  }, [shouldForceUrgentBlock, formData.date]);

  // Add reviewMode state
  const [reviewMode, setReviewMode] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("level entry");

    console.log("errors", errors);
    if (Object.keys(errors).length > 0) {
      toast.error(`Please check ${Object.keys(errors)[0]}`);
      return;
    }

    // ─── 1. Review‑mode guard ──────────────────────────────────────────────
    if (!reviewMode) {
      // Instead of immediately setting reviewMode, show the confirmation modal
      setShowReviewModal(true);
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    setFormSubmitting(true);
    setFormError(null);
    console.log("level 0 passed");

    try {
      // ─── 2. Fetch existing requests and run block check ──────────────────
      // const existing = await userRequestService.getUserRequests(1, 100);
      // const requests: any[] = Array.isArray(existing?.data.requests)
      //   ? existing.data.requests
      //   : [];
      // const now = Date.now();

      // let hasUnavailedSanctionedBlock = false;

      // for (let i = 0; i < requests.length; i++) {
      //   const req = requests[i];
      //   if (
      //     req?.isSanctioned === true && // sanctioned
      //     req?.availedResponse === null && // not availed
      //     req?.sanctionedTimeFrom // has date
      //   ) {
      //     const sanctionMs = new Date(req.sanctionedTimeFrom).getTime();
      //     if (!Number.isNaN(sanctionMs) && now >= sanctionMs) {
      //       // sanction start time is in the past (covers >24 h automatically)
      //       hasUnavailedSanctionedBlock = true;
      //       break;
      //     }
      //   }
      // }
      // console.log("level 1 passed");

      // if (hasUnavailedSanctionedBlock && !proceedAnyway) {
      //   const link = `https://mobile-bms.plattrtechstudio.com/?cugNumber=${
      //     session?.user?.phone
      //   }&section=${formData.missionBlock || "MAS-GDR"}`;
      //   setPopupLink(link);
      //   setShowPopup(true);
      //   setFormSubmitting(false);
      //   return;
      // }

      console.log("level 2 passed");
      // ─── 3. Client‑side validation ───────────────────────────────────────
      const validation = handleFormValidation();
      if (!validation.isValid) {
        console.log(validation.errors);
        setErrors(validation.errors);
        scrollToFirstError(validation.errors);
        setFormSubmitting(false);
        return;
      }
      console.log("level 3 passed");

      // ─── 4. Prepare processedLineSections ────────────────────────────────
      const validSecs = (formData.processedLineSections || []).filter((s) =>
        blockSectionValue.includes(s.block)
      );

      const processedSections = validSecs.map((s) =>
        s.type === "yard"
          ? {
            ...s,
            lineName: s.lineName || "",
            otherLines: s.otherLines || "",
            stream: s.stream || "",
            road: s.road || "",
            otherRoads: s.otherRoads || "",
          }
          : {
            ...s,
            lineName: s.lineName || "",
            otherLines: s.otherLines || "",
            stream: "",
            road: "",
            otherRoads: "",
          }
      );

      // ─── 5. Flatten first fresh‑caution (backend still expects single set)
      const firstCaution = formData.freshCautions?.[0] || {
        freshCautionLocationFrom: "",
        freshCautionLocationTo: "",
        adjacentLinesAffected: "",
        freshCautionSpeed: 0,
      };


      // Calculate duration in minutes
      const [fromH, fromM] = (formData.demandTimeFrom || "00:00").split(":").map(Number);
      const [toH, toM] = (formData.demandTimeTo || "00:00").split(":").map(Number);
      let start = fromH * 60 + fromM;
      let end = toH * 60 + toM;
      if (end < start) end += 24 * 60;
      const durationMins = end - start;

      // ─── 6. Build payload ────────────────────────────────────────────────
      const submitData: UserRequestInput = {
        ...formData,
        corridorType: formData.corridorTypeSelection,
        sntDisconnectionRequired: formData.sntDisconnectionRequired ?? false,
        enggDisconnectionsRequired: formData.enggDisconnectionsRequired ?? false,
        powerBlockRequired: formData.powerBlockRequired ?? false,
        freshCautionRequired: formData.freshCautionRequired ?? false,
        freshCautionFromDate: formData.freshCautions[0]?.freshCautionFromDate 
    ? formatDateToISO(formData.freshCautions[0].freshCautionFromDate)
    : null,
  freshCautionToDate: formData.freshCautions[0]?.freshCautionToDate 
    ? formatDateToISO(formData.freshCautions[0].freshCautionToDate)
    : null,
  freshCautionFromTime: formData.freshCautions[0]?.freshCautionFromTime 
    ? formatTimeToDatetime(formData.date || "", formData.freshCautions[0].freshCautionFromTime)
    : null,
  freshCautionToTime: formData.freshCautions[0]?.freshCautionToTime 
    ? formatTimeToDatetime(formData.date || "", formData.freshCautions[0].freshCautionToTime)
    : null,
        sntDisconnectionRequirements: formData.sntDisconnectionRequired
          ? [
            formData.sntDisconnectionPointNo.toString(),
            formData.sntDisconnectionSignalNo.toString(),
          ]
          : [],
        sntDisconnectionAssignTo: formData.sntDisconnectionAssignTo || "",
        powerBlockRequirements: formData.powerBlockRequired
          ? [
            formData.powerBlockKmFrom.toString(),
            formData.powerBlockKmTo.toString(),
            formData.powerBlockRoad.toString(),
          ]
          : [],
        powerBlockDisconnectionAssignTo:
          formData.powerBlockDisconnectionAssignTo || "",
        adjacentLinesAffected: formData.freshCautions
          .map((c) => c.adjacentLinesAffected)
          .filter(Boolean)
          .join(","),
        freshCautionLocationFrom: formData.freshCautions
          .map((c) => c.freshCautionLocationFrom)
          .filter(Boolean)
          .join(","),
        freshCautionLocationTo: formData.freshCautions
          .map((c) => c.freshCautionLocationTo)
          .filter(Boolean)
          .join(","),
        freshCautionSpeed:
          Number(formData.freshCautions[0]?.freshCautionSpeed) || 0,
        date: formatDateToISO(formData.date || ""),
        demandTimeFrom: formatTimeToDatetime(
          formData.date || "",
          formData.demandTimeFrom || ""
        ),
        demandTimeTo: formatTimeToDatetime(
          formData.date || "",
          formData.demandTimeTo || ""
        ),
        processedLineSections: processedSections,
        adminAcceptance: false,
        selectedDepo: userDepot || "",
        ...(durationMins <= 45 && !formData.sigActionsNeeded && !formData.trdActionsNeeded && {
          managerAcceptance: true,
          isSanctioned: true,
        }),
        // activity: formData.activity === "others" ? customActivity : formData.activity
         activity: selectedActivities.includes("others") 
    ? [...selectedActivities.filter(a => a !== "others"), customActivity].join(",")
    : selectedActivities.join(","),
      };

      // ─── 7. Submit to backend ────────────────────────────────────────────
      const response = await mutation.mutateAsync(submitData);
      if (response) {
        toast.success("Block request submitted successfully!");
        setSubmittedSummary({
          date: submitData.date,
          id: response.data?.divisionId || response.data?.id,
          blockSection: submitData.missionBlock || "-",
          lineOrRoad:
            submitData.processedLineSections
              ?.map((s) => s.lineName || s.road)
              .join(", ") || "-",
          duration:
            getDurationFromTimes(
              formData.demandTimeFrom || "",
              formData.demandTimeTo || ""
            ) || "-",
        });

        // Reset form + UI
        setFormData(initialFormData);
        setBlockSectionValue([]);
        setProcessedLineSections([]);
        setSelectedActivities([]);
        setCustomActivity("");
        setErrors({});
        setShowSuccessPage(true);
        setReviewMode(false);
      }
    } catch (err: any) {
      console.error("Form submission error:", err);
      setFormError(err.message || "Submission failed.");
      toast.error(err.message || "Failed to submit block request");
    } finally {
      setFormSubmitting(false);
    }
  };

  function isToday(dateString: string) {
    if (!dateString) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);

    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  }

  // Refactor handleSubmit to work with reviewMode
  //   const handleFormSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     if (!reviewMode) {
  //       setReviewMode(true); // Enter review mode
  //       return;
  //     }
  //     // Only submit in review mode
  //     setFormSubmitting(true);
  //     setFormError(null);
  //     try {
  //       const validationResult = handleFormValidation();
  //       if (!validationResult.isValid) {
  //         setErrors(validationResult.errors);
  //         scrollToFirstError(validationResult.errors);
  //         setFormSubmitting(false);
  //         return;
  //       }
  //       const validProcessedSections = (
  //         formData.processedLineSections || []
  //       ).filter((section) => blockSectionValue.includes(section.block));
  //       const processedSectionsWithDefaults = validProcessedSections.map(
  //         (section) => {
  //           if (section.type === "yard") {
  //             return {
  //               ...section,
  //               lineName: section.lineName || "",
  //               otherLines: section.otherLines || "",
  //               stream: section.stream || "",
  //               road: section.road || "",
  //               otherRoads: section.otherRoads || "",
  //             };
  //           } else {
  //             return {
  //               ...section,
  //               lineName: section.lineName || "",
  //               otherLines: section.otherLines || "",
  //               stream: "",
  //               road: "",
  //               otherRoads: "",
  //             };
  //           }
  //         }
  //       );
  // //       const firstCaution = formData.freshCautions[0] || {
  // //   freshCautionLocationFrom: "",
  // //   freshCautionLocationTo: "",
  // //   adjacentLinesAffected: "",
  // //   freshCautionSpeed: 0,
  // // };
  //       const submitData: UserRequestInput = {
  //         ...formData,
  //         corridorType: formData.corridorTypeSelection,
  //         sntDisconnectionRequired: formData.sntDisconnectionRequired ?? false,
  //         powerBlockRequired: formData.powerBlockRequired ?? false,
  //         freshCautionRequired: formData.freshCautionRequired ?? false,
  //          adjacentLinesAffected: formData.freshCautions.map(c => c.adjacentLinesAffected).filter(Boolean).join(","),
  //   freshCautionLocationFrom: formData.freshCautions.map(c => c.freshCautionLocationFrom).filter(Boolean).join(","),
  //   freshCautionLocationTo: formData.freshCautions.map(c => c.freshCautionLocationTo).filter(Boolean).join(","),
  //   freshCautionSpeed: Number(formData.freshCautions[0]?.freshCautionSpeed) || 0,
  //         date: formatDateToISO(formData.date || ""),
  //         demandTimeFrom: formatTimeToDatetime(
  //           formData.date || "",
  //           formData.demandTimeFrom || ""
  //         ),
  //         demandTimeTo: formatTimeToDatetime(
  //           formData.date || "",
  //           formData.demandTimeTo || ""
  //         ),
  //         processedLineSections: processedSectionsWithDefaults,
  //         adminAcceptance: false,
  //         selectedDepo: formData.selectedDepo,
  //       };
  //       const response = await mutation.mutateAsync(submitData);
  //       if (response) {
  //         toast.success("Block request submitted successfully!");
  //         setSubmittedSummary({
  //           date: submitData.date,
  //           id: response.data?.divisionId || response.data?.id,
  //           blockSection: submitData.missionBlock || "-",
  //           lineOrRoad:
  //             submitData.processedLineSections &&
  //             submitData.processedLineSections.length > 0
  //               ? submitData.processedLineSections
  //                   .map((s: any) => s.lineName || s.road)
  //                   .join(", ")
  //               : "-",
  //           duration:
  //             getDurationFromTimes(
  //               formData.demandTimeFrom || "",
  //               formData.demandTimeTo || ""
  //             ) || "-",
  //         });
  //         setFormData(initialFormData);
  //         setBlockSectionValue([]);
  //         setProcessedLineSections([]);
  //         setSelectedActivities([]);
  //         setCustomActivity("");
  //         setErrors({});
  //         setShowSuccessPage(true);
  //         setReviewMode(false);
  //       }
  //     } catch (error: any) {
  //       console.error("Form submission error:", error);
  //       if (error.response) {
  //         console.error("Error response data:", error.response.data);
  //         console.error("Error response status:", error.response.status);
  //         console.error("Error response headers:", error.response.headers);
  //       }
  //       setFormError(
  //         error.message ||
  //           "An error occurred while submitting the form. Please try again."
  //       );
  //       toast.error(error.message || "Failed to submit block request");
  //     } finally {
  //       setFormSubmitting(false);
  //     }
  //   };

  const handleFormValidation = () => {
    const errors: Record<string, string> = {};

    // Basic validations
    if (!formData.date) errors.date = "Date is required";
    if (!formData.demandTimeFrom)
      errors.demandTimeFrom = "From time is required";
    if (!formData.demandTimeTo) errors.demandTimeTo = "To time is required";
    if (!formData.selectedDepartment)
      errors.selectedDepartment = "Department is required";
    if (!formData.selectedSection)
      errors.selectedSection = "Section is required";
    if (!formData.missionBlock)
      errors.missionBlock = "Mission block is required";
    if (!formData.workType) errors.workType = "Work type is required";
    // if (!formData.activity) errors.activity = "Activity is required";
    
    if (!formData.corridorTypeSelection)
      errors.corridorTypeSelection = "Corridor type is required";

    // Corridor-specific validations
    if (formData.corridorTypeSelection === "Corridor") {
      // if (!formData.workLocationFrom)
      //   errors.workLocationFrom = "Work location from is required";
      // if (!formData.workLocationTo)
      //   errors.workLocationTo = "Work location to is required";

      // Enhanced site location validation with range checking
      // if (formData.workLocationFrom && formData.workLocationTo) {
      //   const siteLocationValidation = validateSiteLocationPair(
      //     formData.workLocationFrom,
      //     formData.workLocationTo,
      //     formData.selectedSection,
      //     blockSectionValue,
      //     userDepartment || "",
      //     userDepot
      //   );

      //   if (!siteLocationValidation.fromValid && siteLocationValidation.fromError) {
      //     errors.workLocationFrom = siteLocationValidation.fromError;
      //   }

      //   if (!siteLocationValidation.toValid && siteLocationValidation.toError) {
      //     errors.workLocationTo = siteLocationValidation.toError;
      //   }

      //   if (siteLocationValidation.pairError) {
      //     errors.workLocationTo = siteLocationValidation.pairError;
      //   }
      // }

      if (formData.cautionRequired) {
        if (!formData.cautionSpeed)
          errors.cautionSpeed = "Caution speed is required";
        if (!formData.cautionLocationFrom)
          errors.cautionLocationFrom = "Caution location from is required";
        if (!formData.cautionLocationTo)
          errors.cautionLocationTo = "Caution location to is required";
      }
    }

    // Outside Corridor validations
    if (formData.corridorTypeSelection === "Outside Corridor") {
      // if (!formData.routeFrom) errors.routeFrom = "Route from is required";
      // if (!formData.routeTo) errors.routeTo = "Route to is required";
      if (!formData.emergencyBlockRemarks)
        errors.emergencyBlockRemarks = "Reason is required";
    }

    // Urgent Block validations
    if (formData.corridorTypeSelection === "Urgent Block") {
      if (formData.freshCautionRequired) {
        formData.freshCautions.forEach((c, i) => {
          if (!c.freshCautionSpeed)
            errors[`freshCautions-${i}-speed`] = "Speed required";
          if (!c.freshCautionLocationFrom)
            errors[`freshCautions-${i}-from`] = "KM From required";
          if (!c.freshCautionLocationTo)
            errors[`freshCautions-${i}-to`] = "KM To required";
          if (!c.adjacentLinesAffected)
            errors[`freshCautions-${i}-adj`] = "Direction/Road required";
        });
      }
    }

    // Power Block validations
    if (formData.powerBlockRequired) {
      if (!formData.powerBlockKmFrom)
        errors.powerBlockKmFrom = "KM From is required for Power Block";
      if (!formData.powerBlockKmTo)
        errors.powerBlockKmTo = "KM To is required for Power Block";
      if (!formData.powerBlockRoad)
        errors.powerBlockRoad = "Road No. is required for Power Block";
        if (selectedTRDDepots.length === 0) { // Check selectedTRDDepots directly
    errors.powerBlockDisconnectionAssignTo = "Please assign at least one TRD depot";
  }
    }
if(formData.enggDisconnectionsRequired){
            if (selectedENGDepots.length === 0) {
      errors.engDisconnectionAssignTo = "Please assign at least one ENGG depot for Disconnection";
    }
}
    // S&T Disconnection validations
    if (formData.sntDisconnectionRequired) {
      // if (!formData.sntDisconnectionLineFrom)
      //   errors.sntDisconnectionLineFrom =
      //     "KM From is required for S&T Disconnection";
      // if (!formData.sntDisconnectionLineTo)
      //   errors.sntDisconnectionLineTo =
      //     "KM To is required for S&T Disconnection";
      if (!formData.sntDisconnectionPointNo)
        errors.sntDisconnectionPointNo =
          "Point No. is required for S&T Disconnection";
      if (!formData.sntDisconnectionSignalNo)
        errors.sntDisconnectionSignalNo =
          "Signal No. is required for S&T Disconnection";
             if (selectedSTDepots.length === 0) {
      errors.sntDisconnectionAssignTo = "Please assign at least one S&T depot for Disconnection";
    }
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      scrollToFirstError(errors);
      return { isValid: false, errors };
    }

    return { isValid: true, errors: {} };
  };
  /** ────────────────────────────────
   *  Fresh Caution helpers
   *  ────────────────────────────────*/
  const handleFreshCautionChange = <
    K extends keyof FormData["freshCautions"][number]
  >(
    index: number,
    field: K,
    value: FormData["freshCautions"][number][K]
  ) => {
    setFormData((prev) => {
      const updated = [...prev.freshCautions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, freshCautions: updated };
    });
  };

  const addFreshCaution = () => {
    setFormData((prev) => ({
      ...prev,
      freshCautions: [
        ...prev.freshCautions,
        {
          adjacentLinesAffected: "",
          freshCautionLocationFrom: "",
          freshCautionLocationTo: "",
          freshCautionSpeed: "",
          freshCautionFromDate: "",  
        freshCautionToDate: "",    
        freshCautionFromTime: "", 
        freshCautionToTime: "",
        },
      ],
    }));
  };

  const removeFreshCaution = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      freshCautions: prev.freshCautions.filter((_, i) => i !== index),
    }));
  };

  const getInputClassName = (fieldName: string) => {
    return `w-full border-2 rounded-lg px-4 py-2 text-lg font-bold bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-black placeholder-black text-xs px-2 py-1 ${errors[fieldName] ? "border-red-600 ring-2 ring-red-300" : "border-black"
      }`;
  };

  const getSelectClassName = (fieldName: string) => {
    return `w-full border-2 rounded-lg px-4 py-2 text-lg font-bold bg-white focus:outline-none focus:ring-2 focus:ring-green-300 text-black placeholder-black text-xs px-2 py-1 ${errors[fieldName] ? "border-red-600 ring-2 ring-red-300" : "border-black"
      }`;
  };

  const getTextareaClassName = (fieldName: string) => {
    return `w-full border-2 rounded-lg px-4 py-2 text-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-black placeholder-black text-xs px-2 py-1 ${errors[fieldName] ? "border-red-600 ring-2 ring-red-300" : "border-black"
      }`;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log(
      "Current powerBlockRequired state:",
      formData.powerBlockRequired
    );
  }, [formData.powerBlockRequired]);

  // Sync depot arrays with formData
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      stDepotAssignTo: selectedSTDepots.join(", "),
      trdDepotAssignTo: selectedTRDDepots.join(", ")
    }));
  }, [selectedSTDepots, selectedTRDDepots]);

  // Handle date change and corridor type selection logic
  useEffect(() => {
    setErrors((prev: any) =>
      Object.keys(prev).reduce((newErrors, key) => {
        if (key !== "date") newErrors[key] = prev[key];
        return newErrors;
      }, {} as Record<string, any>)
    );

    if (!formData.date) {
      console.log("No date selected");
      setIsDisabled(true);
      setValidCorridorType(true);
      setFormData({ ...formData, corridorTypeSelection: null });
    } else {
      // Get corridor type restrictions based on selected date
      const { urgentOnly, urgentAllowed, corridorTypeAllowed, message } =
        getCorridorTypeRestrictions(formData.date);

      if (urgentOnly) {
        // If urgent block is required, disable other options and set to Urgent
        console.log("PPPPPPurgentOnly", urgentOnly);
        setIsDisabled(true);
        setValidCorridorType(true);
        setFormData({
          ...formData,
          corridorTypeSelection: "Urgent Block",
        });
      } else if (!corridorTypeAllowed) {
        // If corridor type is not allowed, disable other options and set to null
        console.log("PPPPPPcorridorTypeAllowed", corridorTypeAllowed);
        setIsDisabled(true);
        setValidCorridorType(false);
        setFormData({
          ...formData,
          corridorTypeSelection: null,
        });
        console.log("setting error", corridorTypeAllowed);
        setErrors((prev: any) => ({ ...prev, date: "Not a valid date" }));
      } else {
        // Otherwise, normal options are available
        console.log("PPPPPPurgentAllowed", urgentAllowed);
        setIsDisabled(false);
        setValidCorridorType(true);
        // If user had Urgent Block selected but it's not allowed, reset selection
        if (
          formData.corridorTypeSelection === "Urgent Block" &&
          !urgentAllowed
        ) {
          setFormData({
            ...formData,
            corridorTypeSelection: null,
          });
        }
      }
    }
  }, [formData.date]);

  useEffect(() => {
    setSntDisconnectionChecked(
      String(formData.sntDisconnectionRequired) === "Y"
    );
  }, [formData.sntDisconnectionRequired]);

  const handlePowerBlockRequirementsChange = (
    value: string,
    checked: boolean
  ) => {
    let newRequirements = [...(powerBlockRequirements || [])].filter(
      Boolean
    ) as string[];
    if (checked) {
      newRequirements.push(value);
    } else {
      newRequirements = newRequirements.filter((item) => item !== value);
    }

    setPowerBlockRequirements(newRequirements);
    setFormData((prevData) => ({
      ...prevData,
      powerBlockRequirements: newRequirements,
    }));
    if (checked && errors.powerBlockRequirements) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.powerBlockRequirements;
        return newErrors;
      });
    }
  };

  const handleSntDisconnectionRequirementsChange = (
    value: string,
    checked: boolean
  ) => {
    let newRequirements = [...sntDisconnectionRequirements];
    if (checked) {
      newRequirements.push(value);
    } else {
      newRequirements = newRequirements.filter((item) => item !== value);
    }

    setSntDisconnectionRequirements(newRequirements);
    setFormData((prevData) => ({
      ...prevData,
      sntDisconnectionRequirements: newRequirements,
    }));
    if (checked && errors.sntDisconnectionRequirements) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.sntDisconnectionRequirements;
        return newErrors;
      });
    }
  };

  // const handleLineNameSelection = (block: string, values: string[]) => {
  //   setFormData((prev) => {
  //     const existingProcessedSections = [...(prev.processedLineSections || [])];
  //     const sectionIndex = existingProcessedSections.findIndex(
  //       (section) => section.block === block
  //     );

  //     if (values.length === 0) {
  //       if (sectionIndex !== -1) {
  //         existingProcessedSections.splice(sectionIndex, 1);
  //       }
  //     } else {
  //       const lineName = values[0].trim(); // First selected
  //       const otherLines = values
  //         .slice(1)
  //         .map((v) => v.trim())
  //         .filter(Boolean)
  //         .join(","); // Rest

  //       const newSection = {
  //         block,
  //         type: "line",
  //         lineName,
  //         otherLines,
  //         stream: "",
  //         road: "",
  //         otherRoads: "",
  //       };

  //       if (sectionIndex !== -1) {
  //         existingProcessedSections[sectionIndex] = {
  //           ...existingProcessedSections[sectionIndex],
  //           ...newSection,
  //         };
  //       } else {
  //         existingProcessedSections.push(newSection);
  //       }
  //     }

  //     return {
  //       ...prev,
  //       processedLineSections: existingProcessedSections,
  //     };
  //   });
  // };
  const updateSelectionHistory = (block: string, type: 'line' | 'road' | 'clear') => {
    setSelectionHistory(prev => {
      const blockHistory = prev[block] || [];

      if (type === 'clear') {
        // Clear history when nothing is selected
        const newHistory = { ...prev };
        delete newHistory[block];
        return newHistory;
      }

      // Add to history if it's different from last
      if (blockHistory[blockHistory.length - 1] !== type) {
        return {
          ...prev,
          [block]: [...blockHistory, type]
        };
      }

      return prev;
    });
  };

  const getFirstSelection = (block: string): 'line' | 'road' | null => {
    const history = selectionHistory[block];
    return history && history.length > 0 ? history[0] : null;
  };

  const getCurrentFirstSelection = (block: string, currentLines: number, currentRoads: number): 'line' | 'road' | null => {
    // If nothing selected now, return null
    if (currentLines === 0 && currentRoads === 0) return null;

    const history = selectionHistory[block];
    if (!history || history.length === 0) {
      // Determine based on current state
      return currentLines > 0 ? 'line' : 'road';
    }

    return history[0];
  };


  const handleLineNameSelection = (block: string, values: string[]) => {
    setFormData((prev) => {
      const existingProcessedSections = [...(prev.processedLineSections || [])];
      const sectionIndex = existingProcessedSections.findIndex(
        (section) => section.block === block
      );

      if (values.length === 0) {
        // Clear line selection
        if (sectionIndex !== -1) {
          const section = existingProcessedSections[sectionIndex];
          const hasRoads = section.road || section.otherRoads;

          if (!hasRoads) {
            // No roads left, clear everything
            existingProcessedSections.splice(sectionIndex, 1);
            updateSelectionHistory(block, 'clear');
          } else {
            // Keep section but clear line data
            existingProcessedSections[sectionIndex] = {
              ...section,
              lineName: "",
              otherLines: "",
              type: "yard",
            };
            // Update history - roads become first selection
            updateSelectionHistory(block, 'road');
          }
        }
      } else {
        const lineName = values[0].trim();
        const otherLines = values
          .slice(1)
          .map((v) => v.trim())
          .filter(Boolean)
          .join(",");

        const lineCount = values.length;
        const newSectionData = {
          block,
          lineName,
          otherLines,
          stream: "",
        };

        if (sectionIndex !== -1) {
          const existingSection = existingProcessedSections[sectionIndex];
          const hasRoads = existingSection.road || existingSection.otherRoads;
          const currentRoadCount = [existingSection.road, existingSection.otherRoads]
            .filter(Boolean).length + (existingSection.otherRoads ? existingSection.otherRoads.split(',').length : 0);

          const firstSelection = getCurrentFirstSelection(block, lineCount, currentRoadCount);

          if (firstSelection === 'road') {
            // Road was first - show NOTHING (Scenario 5)
            existingProcessedSections[sectionIndex] = {
              ...existingSection,
              ...newSectionData,
              type: "yard", // Force nothing display
            };
          } else {
            // Line first or no roads - follow line count rules
            existingProcessedSections[sectionIndex] = {
              ...existingSection,
              ...newSectionData,
              type: lineCount === 1 ? "line" : "combined",
            };
            updateSelectionHistory(block, 'line');
          }
        } else {
          // New section with lines
          existingProcessedSections.push({
            ...newSectionData,
            type: lineCount === 1 ? "line" : "combined",
            road: "",
            otherRoads: "",
          });
          updateSelectionHistory(block, 'line');
        }
      }

      return {
        ...prev,
        processedLineSections: existingProcessedSections,
      };
    });
  };
  const handleOtherAffectedLinesChange = (
    block: string,
    options: { value: string }[]
  ) => {
    setFormData((prev) => {
      const existingProcessedSections = [...prev.processedLineSections];
      const sectionIndex = existingProcessedSections.findIndex(
        (section) => section.block === block
      );

      if (sectionIndex !== -1) {
        const section = existingProcessedSections[sectionIndex];
        if (section.type === "line") {
          const updatedSection = {
            ...section,
            otherLines: options.map((opt) => opt.value).join(","),
          };
          existingProcessedSections[sectionIndex] = updatedSection;
        }
      } else {
        existingProcessedSections.push({
          block,
          type: "line",
          lineName: "",
          otherLines: options.map((opt) => opt.value).join(","),
          stream: "",
          road: "",
          otherRoads: "",
        });
      }

      return {
        ...prev,
        processedLineSections: existingProcessedSections,
      };
    });
  };

  useEffect(() => {
    if (blockSectionValue.length > 0) {
      setFormData((prev) => ({
        ...prev,
        missionBlock: blockSectionValue.join(","),
      }));
    }
  }, [blockSectionValue]);

  useEffect(() => {
    if (session?.user?.department) {
      setFormData((prev) => ({
        ...prev,
        selectedDepartment: session.user.department,
      }));
    }
  }, [session]);

  const handleStreamSelection = (block: string, value: string) => {
    setFormData((prev) => {
      const existingProcessedSections = [...prev.processedLineSections];
      const sectionIndex = existingProcessedSections.findIndex(
        (section) => section.block === block
      );

      if (sectionIndex !== -1) {
        const section = existingProcessedSections[sectionIndex];
        if (section.type === "line") {
          const updatedSection = {
            ...section,
            stream: value,
          };
          existingProcessedSections[sectionIndex] = updatedSection;
        }
      } else {
        existingProcessedSections.push({
          block,
          type: "line",
          lineName: "",
          otherLines: "",
          stream: value,
          road: "",
          otherRoads: "",
        });
      }

      return {
        ...prev,
        processedLineSections: existingProcessedSections,
        selectedStream: value,
      };
    });
  };

  const getAllRoadsForYard = (blockKey: string): string[] => {
    if (!blockKey || !blockKey.includes("-YD") || !(blockKey in streamData)) {
      return [];
    }

    const blockData = streamData[blockKey as keyof typeof streamData];
    if (!blockData || typeof blockData !== "object") {
      return [];
    }

    const allRoads: string[] = [];

    Object.keys(blockData).forEach((streamKey) => {
      const roads = (blockData as Record<string, string[]>)[streamKey] || [];
      roads.forEach((road) => {
        if (!allRoads.includes(road)) {
          allRoads.push(road);
        }
      });
    });

    return allRoads;
  };

  // const handleRoadSelection = (block: string, value: string) => {
  //   setFormData((prev) => {
  //     const existingProcessedSections = [...prev.processedLineSections];
  //     const sectionIndex = existingProcessedSections.findIndex(
  //       (section) => section.block === block
  //     );

  //     if (sectionIndex !== -1) {
  //       // Update existing section
  //       const section = existingProcessedSections[sectionIndex];
  //       if (section.type === "yard") {
  //         // Split the value into road and otherRoads
  //         const roads = value
  //           .split(",")
  //           .map((r) => r.trim())
  //           .filter(Boolean);
  //         const updatedSection = {
  //           ...section,
  //           road: roads[0] || "", // First item is road
  //           otherRoads: roads.length > 1 ? roads.slice(1).join(",") : "", // Rest are otherRoads
  //         };
  //         existingProcessedSections[sectionIndex] = updatedSection;
  //       }
  //     } else {
  //       // Create new section
  //       const roads = value
  //         .split(",")
  //         .map((r) => r.trim())
  //         .filter(Boolean);
  //       existingProcessedSections.push({
  //         block,
  //         type: "yard",
  //         lineName: "",
  //         otherLines: "",
  //         stream: "",
  //         road: roads[0] || "", // First item is road
  //         otherRoads: roads.length > 1 ? roads.slice(1).join(",") : "", // Rest are otherRoads
  //       });
  //     }

  //     return {
  //       ...prev,
  //       processedLineSections: existingProcessedSections,
  //     };
  //   });
  // };

  // Add state to track if the success page should be shown and the submitted request summary

  const handleRoadSelection = (block: string, value: string) => {
    setFormData((prev) => {
      const existingProcessedSections = [...prev.processedLineSections];
      const sectionIndex = existingProcessedSections.findIndex(
        (section) => section.block === block
      );

      if (!value) {
        // Clear road selection
        if (sectionIndex !== -1) {
          const section = existingProcessedSections[sectionIndex];
          const hasLines = section.lineName || section.otherLines;

          if (!hasLines) {
            // No lines left, clear everything
            existingProcessedSections.splice(sectionIndex, 1);
            updateSelectionHistory(block, 'clear');
          } else {
            // Keep section but clear road data
            existingProcessedSections[sectionIndex] = {
              ...section,
              road: "",
              otherRoads: "",
              type: section.otherLines ? "combined" : "line",
            };
            // Update history - lines become first selection
            updateSelectionHistory(block, 'line');
          }
        }
      } else {
        const roads = value
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);

        const roadCount = roads.length;
        const roadData = {
          block,
          road: roads[0] || "",
          otherRoads: roads.length > 1 ? roads.slice(1).join(",") : "",
        };

        if (sectionIndex !== -1) {
          const existingSection = existingProcessedSections[sectionIndex];
          const hasLines = existingSection.lineName || existingSection.otherLines;
          const currentLineCount = [existingSection.lineName, existingSection.otherLines]
            .filter(Boolean).length + (existingSection.otherLines ? existingSection.otherLines.split(',').length : 0);

          const firstSelection = getCurrentFirstSelection(block, currentLineCount, roadCount);

          if (firstSelection === 'line') {
            // Line was first - roads don't affect display (Scenario 4)
            existingProcessedSections[sectionIndex] = {
              ...existingSection,
              ...roadData,
              type: currentLineCount === 1 ? "line" : "combined",
            };
          } else {
            // Road first or no lines - show NOTHING
            existingProcessedSections[sectionIndex] = {
              ...existingSection,
              ...roadData,
              type: "yard", // Force nothing display
            };
            updateSelectionHistory(block, 'road');
          }
        } else {
          // New section with only roads
          existingProcessedSections.push({
            ...roadData,
            type: "yard", // Show nothing
            lineName: "",
            otherLines: "",
            stream: "",
          });
          updateSelectionHistory(block, 'road');
        }
      }

      return {
        ...prev,
        processedLineSections: existingProcessedSections,
      };
    });
  };
  const getDisplayInfo = (block: string) => {
    const section = (formData.processedLineSections || []).find(
      (s: any) => s.block === block
    );

    if (!section) return { display: 'nothing', text: 'Nothing' };

    const lineCount = [section.lineName, section.otherLines]
      .filter(Boolean).length + (section.otherLines ? section.otherLines.split(',').length : 0);
    const roadCount = [section.road, section.otherRoads]
      .filter(Boolean).length + (section.otherRoads ? section.otherRoads.split(',').length : 0);

    const firstSelection = getCurrentFirstSelection(block, lineCount, roadCount);

    // Apply the rules from your scenarios
    if (firstSelection === 'road') {
      // Road first → NOTHING (Scenarios 1, 5)
      return { display: 'nothing', text: 'Nothing' };
    }

    if (firstSelection === 'line') {
      // Line first → follow line count rules
      if (lineCount === 0) {
        return { display: 'nothing', text: 'Nothing' };
      } else if (lineCount === 1) {
        return { display: 'corridor', text: 'Corridor for this section' };
      } else {
        return { display: 'combined', text: 'Combined block' };
      }
    }

    // Default fallback
    return { display: 'nothing', text: 'Nothing' };
  };



  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [submittedSummary, setSubmittedSummary] = useState<any>(null);
  // Add state for showing the details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Add state for corridor CSV data
  const [corridorData, setCorridorData] = useState<any[]>([]);
  const [corridorTime, setCorridorTime] = useState<{
    from: string;
    to: string;
    duration: string;
  } | null>(null);
  const csvLoadedRef = useRef(false);

  // Load and parse the corridor CSV on mount
  useEffect(() => {
    if (csvLoadedRef.current) return;
    fetch("/Corridor%20-%20Final%20(1).csv")
      .then((res) => res.text())
      .then((text) => {
        const parsed = Papa.parse(text, { header: true });
        setCorridorData(parsed.data as any[]);
        csvLoadedRef.current = true;
      });
  }, []);

  // Compute corridor time when block section or line changes
  // useEffect(() => {
  //   if (!corridorData.length || !blockSectionValue.length) {
  //     setCorridorTime(null);
  //     return;
  //   }
  //   // For each selected block section, get the first selected line
  //   const firstLines = blockSectionValue.map((block: string) => {
  //     const sectionEntry =
  //       (formData.processedLineSections || []).find(
  //         (s: any) => s.block === block
  //       ) || {};
  //     return (sectionEntry as any).lineName
  //       ? (sectionEntry as any).lineName.split(",")[0]
  //       : null;
  //   });
  //   // Only consider block sections with a selected line
  //   const validPairs = blockSectionValue
  //     .map((block: string, idx: number) => {
  //       const line = firstLines[idx];
  //       if (!line) return null;
  //       // Find matching corridor row
  //       const row = corridorData.find((row: any) => {
  //         return (
  //           (row["Section/ station"] || row["section"])?.trim() === block &&
  //           (row["Line"] || "").trim() === line
  //         );
  //       });
  //       return row || null;
  //     })
  //     .filter(Boolean);
  //   if (!validPairs.length) {
  //     setCorridorTime(null);
  //     return;
  //   }
  //   // Find intersection of corridor times (latest from, earliest to)
  //   let fromTimes = validPairs.map((row: any) => row["From"]);
  //   let toTimes = validPairs.map((row: any) => row["To"]);
  //   let duration = validPairs[0]["Duration"];
  //   // Use max of fromTimes and min of toTimes
  //   const maxFrom = fromTimes.reduce((a, b) => (a > b ? a : b));
  //   const minTo = toTimes.reduce((a, b) => (a < b ? a : b));
  //   setCorridorTime({ from: maxFrom, to: minTo, duration });
  // }, [corridorData, blockSectionValue, formData.processedLineSections]);
  // useEffect(() => {
  //   if (!blockSectionValue.length) {
  //     setCorridorTime(null);
  //     return;
  //   }

  //   /* ---------- 1.  LINE‑BASED LOGIC (UNCHANGED) ---------- */
  //   const linePairs = blockSectionValue
  //     .map((block: string) => {
  //       // look up the entry for this block
  //       const sectionEntry =
  //         (formData.processedLineSections || []).find(
  //           (s: any) => s.block === block
  //         ) || {};

  //       // first line chosen (if any)
  //       const firstLine = sectionEntry?.lineName
  //         ? sectionEntry.lineName.split(",")[0]
  //         : null;

  //       // if no line chosen for this block, skip – road logic will handle it
  //       if (!firstLine) return null;

  //       // find matching row in corridorData
  //       const row = corridorData.find((r: any) => {
  //         return (
  //           (r["Section/ station"] || r["section"])?.trim() === block &&
  //           (r["Line"] || "").trim() === firstLine
  //         );
  //       });

  //       return row || null;
  //     })
  //     .filter(Boolean); // removes nulls

  //   /* ---------- 2.  YARD / ROAD LOGIC (FOR BLOCKS WITH NO LINE) ---------- */

  //   const roadTimeMap: Record<string, { from: string; to: string }> = {
  //     "AJJ-RU-Up": { from: "01:30", to: "04:30" },
  //     "AJJ-RU-Down": { from: "00:30", to: "03:30" },
  //     "AJJ-RU-Both": { from: "01:30", to: "04:30" },

  //     "MAS-AJJ-Up": { from: "00:05", to: "03:05" },
  //     "MAS-AJJ-Down": { from: "00:30", to: "03:30" },
  //     "MAS-AJJ-Both": { from: "00:05", to: "03:05" },

  //     "AJJ-KPD-Up": { from: "21:15", to: "00:15" },
  //     "AJJ-KPD-Down": { from: "11:00", to: "14:00" },
  //     "AJJ-KPD-Both": { from: "21:15", to: "00:15" },

  //     "KPD-JTJ-Up": { from: "22:30", to: "00:45" },
  //     "KPD-JTJ-Down": { from: "12:45", to: "15:15" },
  //     "KPD-JTJ-Both": { from: "22:30", to: "00:45" },

  //     "AJJ-CGL-Up": { from: "01:00", to: "04:00" },
  //     "AJJ-CGL-Down": { from: "01:00", to: "04:00" },
  //     "AJJ-CGL-Both": { from: "01:00", to: "04:00" },

  //     "MAS-GDR-Up": { from: "00:20", to: "03:20" },
  //     "MAS-GDR-Down": { from: "23:30", to: "01:30" },
  //     "MAS-GDR-Both": { from: "00:20", to: "03:20" },

  //     "MSB-VM-Up": { from: "21:15", to: "00:15" },
  //     "MSB-VM-Down": { from: "01:30", to: "04:30" },
  //     "MSB-VM-Both": { from: "21:15", to: "00:15" },

  //     "MSB-VLCY-Up": { from: "00:30", to: "03:30" },
  //     "MSB-VLCY-Down": { from: "00:30", to: "03:30" },
  //     "MSB-VLCY-Both": { from: "00:30", to: "03:30" },
  //   };

  //   const roadPairs = blockSectionValue
  //     .map((block: string) => {
  //       // if a line was already chosen for this block, skip (line logic handled it)
  //       const hadLine =
  //         (formData.processedLineSections || []).some(
  //           (s: any) => s.block === block && s.lineName
  //         );
  //       if (hadLine) return null;

  //       // road logic starts here …
  //       const sectionEntry =
  //         (formData.processedLineSections || []).find(
  //           (s: any) => s.block === block
  //         ) || {};
  //       if (!sectionEntry.road) return null;

  //       const roads = sectionEntry.road
  //         .split(",")
  //         .map((r: string) => r.trim().toLowerCase());

  //       const streamEntry = streamData[block];
  //       const majorSection = formData.selectedSection;
  //       if (!streamEntry || !majorSection) return null;

  //       const checkDirection = (dir: "Up" | "Down" | "Both") =>
  //         roads.some((r: string) =>
  //           (streamEntry[`${dir} Direction Affected`] || [])
  //             .map((x: string) => x.trim().toLowerCase())
  //             .includes(r)
  //         );

  //       const dirs = ["Both", "Up", "Down"] as const;
  //       for (const dir of dirs) {
  //         if (checkDirection(dir)) {
  //           const time = roadTimeMap[`${majorSection}-${dir}`];
  //           if (time) return { from: time.from, to: time.to };
  //         }
  //       }
  //       return null;
  //     })
  //     .filter(Boolean);

  //   /* ---------- 3.  COMBINE BOTH RESULTS ---------- */

  //   // nothing found in either? → clear the state
  //   if (!linePairs.length && !roadPairs.length) {
  //     setCorridorTime(null);
  //     return;
  //   }

  //   // gather all times from lines + roads
  //   const fromTimes = [
  //     ...linePairs.map((p: any) => p["From"]),
  //     ...roadPairs.map((p: any) => p.from),
  //   ];
  //   const toTimes = [
  //     ...linePairs.map((p: any) => p["To"]),
  //     ...roadPairs.map((p: any) => p.to),
  //   ];

  //   const maxFrom = fromTimes.reduce((a, b) => (a > b ? a : b));
  //   const minTo = toTimes.reduce((a, b) => (a < b ? a : b));

  //   // duration only exists on line rows – take the first one if any
  //   const duration =
  //     linePairs.length > 0 ? (linePairs[0] as any)["Duration"] : undefined;

  //   setCorridorTime({ from: maxFrom, to: minTo, duration });
  // }, [
  //   corridorData,
  //   blockSectionValue,
  //   formData.processedLineSections,
  //   formData.selectedSection,
  // ]);
  useEffect(() => {
    if (!blockSectionValue.length) {
      setCorridorTime(null);
      return;
    }

    /* ---------- 1.  LINE‑BASED LOGIC (UNCHANGED) ---------- */
    const linePairs = blockSectionValue
      .map((block: string) => {
        const sectionEntry = (formData.processedLineSections || []).find(
          (s: { block: string; lineName?: string }) => s.block === block
        ) as { block: string; lineName?: string };

        const firstLine = sectionEntry?.lineName
          ? sectionEntry.lineName.split(",")[0]
          : null;

        if (!firstLine) return null;
        const row = corridorData.find((r: { [key: string]: string }) => {
          return (
            (r["Section/ station"] || r["section"])?.trim() === block &&
            (r["Line"] || "").trim() === firstLine
          );
        });

        return row || null;
      })
      .filter(Boolean) as Array<{ [key: string]: string }>; // removes nulls and asserts type

    /* ---------- 2.  YARD / ROAD LOGIC (FOR BLOCKS WITH NO LINE) ---------- */

    const roadTimeMap: Record<string, { from: string; to: string }> = roadData;

    const roadPairs = blockSectionValue
      .map((block: string) => {
        // if a line was already chosen for this block, skip (line logic handled it)
        const hadLine = (formData.processedLineSections || []).some(
          (s: { block: string; lineName?: string }) =>
            s.block === block && s.lineName
        );
        if (hadLine) return null;

        // road logic starts here …
        const sectionEntry = (formData.processedLineSections || []).find(
          (s: { block: string; road?: string }) => s.block === block
        );

        if (!sectionEntry?.road) return null;

        const roads = sectionEntry.road
          .split(",")
          .map((r: string) => r.trim().toLowerCase());

        const streamEntry = streamData[block as keyof typeof streamData];
        const majorSection = formData.selectedSection;
        if (!streamEntry || !majorSection) return null;

        const checkDirection = (dir: "Up" | "Down" | "Both") =>
          roads.some((r: string) =>
            ((streamEntry as any)[`${dir} Direction Affected`] || [])
              .map((x: string) => x.trim().toLowerCase())
              .includes(r)
          );

        const dirs = ["Both", "Up", "Down"] as const;
        for (const dir of dirs) {
          if (checkDirection(dir)) {
            const time = roadTimeMap[`${majorSection}-${dir}`];
            if (time) return { from: time.from, to: time.to };
          }
        }
        return null;
      })
      .filter(Boolean) as Array<{ from: string; to: string }>; // removes nulls and asserts type

    /* ---------- 3.  COMBINE BOTH RESULTS ---------- */

    // nothing found in either? → clear the state
    if (!linePairs.length && !roadPairs.length) {
      setCorridorTime(null);
      return;
    }

    // gather all times from lines + roads
    const fromTimes = [
      ...linePairs.map((p) => p["From"]),
      ...roadPairs.map((p) => p.from),
    ].filter((t): t is string => !!t); // ensure all times are strings

    const toTimes = [
      ...linePairs.map((p) => p["To"]),
      ...roadPairs.map((p) => p.to),
    ].filter((t): t is string => !!t); // ensure all times are strings

    if (!fromTimes.length || !toTimes.length) {
      setCorridorTime(null);
      return;
    }

    const maxFrom = fromTimes.reduce((a, b) => (a > b ? a : b));
    const minTo = toTimes.reduce((a, b) => (a < b ? a : b));

    // duration only exists on line rows – take the first one if any
    const duration = linePairs[0]?.["Duration"];

    setCorridorTime({ from: maxFrom, to: minTo, duration });
  }, [
    corridorData,
    blockSectionValue,
    formData.processedLineSections,
    formData.selectedSection,
    streamData,
    setCorridorTime,
  ]);

  // Inline error rendering helper
  const renderError = (field: string) =>
    errors[field] ? (
      <div className="text-red-600 text-xs font-bold mt-0.5 mb-1">
        {errors[field]}
      </div>
    ) : null;

  if (showSuccessPage) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-[#fcfaf3]">
        <div className="w-full max-w-2xl mx-auto mt-4">
          <div className=" text-center bg-[#f7f7a1] rounded-t-2xl p-4 border-b-2 border-[#b6f7e6]">
            <div className="font-extrabold text-[9vw] min-[430px]:text-4xl   text-[#b07be0]">
              RBMS-{session?.user?.location}-DIVN
            </div>
          </div>
          <div className="bg-[#fffaf0] rounded-b-2xl p-4 sm:p-6 w-full max-w-2xl overflow-auto">
            <div className="bg-[#c6e6f7] rounded-xl p-4 mb-6 w-full overflow-auto">
              <h2 className="text-2xl font-extrabold mb-4 text-[#222]">
                Your Block Request has been Registered
              </h2>
              <table className="w-full mb-2 border rounded-xl overflow-hidden shadow-md">
                <tbody>
                  {/* Date Row */}
                  <tr className="bg-white border-b hover:bg-[#f7f7fa]">
                    <td className="px-2 py-1 border-t border-b-0 border-l-0 border-r-0">
                      <div className="font-bold text-black text-[24px]">
                        Date
                      </div>
                      <div className="text-black text-[24px]">
                        {submittedSummary?.date
                          ? new Date(submittedSummary.date).toLocaleDateString(
                            "en-GB",
                            {
                              year: "2-digit",
                              month: "2-digit",
                              day: "2-digit",
                            }
                          )
                          : "-"}
                      </div>
                    </td>
                  </tr>

                  {/* ID Row */}
                  <tr className="bg-white border-b hover:bg-[#f7f7fa]">
                    <td className="px-2 py-1 border-t border-b-0 border-l-0 border-r-0">
                      <div className="font-bold text-black text-[24px]">ID</div>
                      <div className="text-black text-[24px]">
                        {submittedSummary?.id || "-"}
                      </div>
                    </td>
                  </tr>

                  {/* Block Section Row */}
                  <tr className="bg-white border-b hover:bg-[#f7f7fa]">
                    <td className="px-2 py-1 border-t border-b-0 border-l-0 border-r-0">
                      <div className="font-bold text-black text-[24px]">
                        Block Section
                      </div>
                      <div className="text-black text-[24px]">
                        {submittedSummary?.blockSection || "-"}
                      </div>
                    </td>
                  </tr>

                  {/* Line Row */}
                  <tr className="bg-white border-b hover:bg-[#f7f7fa]">
                    <td className="px-2 py-1 border-t border-b-0 border-l-0 border-r-0">
                      <div className="font-bold text-black text-[24px]">
                        Line
                      </div>
                      <div className="text-black text-[24px]">
                        {submittedSummary?.lineOrRoad || "-"}
                      </div>
                    </td>
                  </tr>

                  {/* Demanded Row */}
                  <tr className="bg-white hover:bg-[#f7f7fa]">
                    <td className="px-2 py-1 border-t border-b-0 border-l-0 border-r-0">
                      <div className="font-bold text-black text-[24px]">
                        Demanded
                      </div>
                      <div className="text-black text-[24px]">
                        {submittedSummary?.duration || "-"}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-6 items-center mt-8 w-full">
              <button
                className="w-full rounded-2xl bg-[#e6e6fa] text-black font-bold text-[24px] py-4 tracking-wider border border-[#b7b7d1] hover:bg-[#f0eaff] transition"
                onClick={() => {
                  setFormData({
                    ...initialFormData,
                    selectedDepartment: session?.user?.department || ""
                  });
                  setBlockSectionValue([]);
                  setProcessedLineSections([]);
                  setSelectedActivities([]);
                  setCustomActivity("");
                  setErrors({});
                  setShowSuccessPage(false);
                  setReviewMode(false);
                }}
              >
                ENTER MORE BLOCK REQUESTS
              </button>
              <button
                className="w-full rounded-2xl bg-[#e6e6fa] text-black font-bold text-[24px] py-4 tracking-wider border border-[#b7b7d1] hover:bg-[#f0eaff] transition"
                onClick={() => router.push("/edit-request")}
              >
                EDIT OR CANCEL PREVIOUS REQUESTS
              </button>
              <button
                className="w-full rounded-2xl bg-[#e6e6fa] text-black font-bold text-[24px] py-4 tracking-wider border border-[#b7b7d1] hover:bg-[#f0eaff] transition"
                onClick={() => router.push("/request-table")}
              >
                SUMMARY OF MY BLOCK REQUESTS
              </button>
              <div className="mt-6">
                <button
                  className="flex items-center gap-2 bg-lime-300 border-2 border-black rounded-[50%] px-4 py-2 text-[24px] font-bold text-black"
                  onClick={() => router.push("/dashboard")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 32 32"
                    stroke="black"
                    strokeWidth={2}
                    className="w-6 h-6"
                  >
                    <rect
                      x="6"
                      y="12"
                      width="20"
                      height="12"
                      rx="2"
                      fill="#fffbe9"
                      stroke="black"
                      strokeWidth="2"
                    />
                    <path
                      d="M4 14L16 4L28 14"
                      stroke="black"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                  Home
                </button>
              </div>
              <button
                className="w-full   rounded-full bg-[#f69697] text-white font-bold text-[24px] py-4 tracking-wider border border-[#d43b1a] hover:bg-[#ff7c6a] transition"
                onClick={() => signOut()}
              >
                CLOSE THE APP AND LOGOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#f7fafc] py-0">
      {/* Header */}
      <div className="w-full bg-[#fff9b2] py-6 flex flex-col items-center border-b-2 border-black">
        <span
          className="text-[9vw] min-[430px]:text-4xl font-extrabold tracking-widest"
          style={{
            color: "#b07be0",
            letterSpacing: "0.08em",
            fontFamily: "Arial Black, Arial, sans-serif",
          }}
        >
          RBMS-{session?.user?.location}-DIVN
        </span>
      </div>
      {/* Sub-header */}
      <div className="w-full bg-[#d6f7c6] py-4 flex flex-col items-center border-b-2 border-black">
        <span
          className="text-[24px] font-bold text-black"
          style={{ letterSpacing: "0.04em" }}
        >
          {reviewMode
            ? "Review/Edit the Block Request Before Submission"
            : "Enter New Block Request"}
        </span>
      </div>
      {/* Form Card */}
      <div
        className="w-full max-w-3xl mt-0 p-6 bg-[#c6e6f7] border-4  border-black rounded-3xl shadow-xl mx-3"
        style={{ minWidth: 350 }}
      >
        {/* Display Depot/SSE information */}
        <div className="mb-4 bg-white p-3 border-2 border-black rounded-lg">
          <span className="text-lg font-bold text-black">Depot/SSE:</span>
          <span className="ml-2 text-lg font-semibold text-gray-700">{formData.selectedDepo || session?.user?.depot || "Not assigned"}</span>
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-10">
          <div className="grid grid-cols-1 gap-y-8 mb-8">
            {/* Date of Block */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
              <label
                className="text-[24px] font-bold text-black min-w-[180px]"
                htmlFor="date-of-block"
              >
                Date of Block
              </label>
              <div className="flex flex-row items-center gap-2 w-full">
                <input
                  id="date-of-block"
                  type="date"
                  name="date"
                  value={formData.date || ""}
                  onChange={handleInputChange}
                  className="border-2 border-black rounded-xl px-8 py-4 text-[24px] font-bold bg-[#f7f7a1] text-black shadow-md focus:outline-none focus:ring-2 focus:ring-[#b07be0] min-w-[180px] max-w-[240px]"
                  aria-required="true"
                  aria-label="Select date of block"
                  style={{ boxShadow: "2px 2px 6px #bbb" }}
                  min={getMinDateString()}
                  max={(() => {
                    const today = new Date();
                    today.setDate(today.getDate() + 30);
                    return `${today.getFullYear()}-${String(
                      today.getMonth() + 1
                    ).padStart(2, "0")}-${String(today.getDate()).padStart(
                      2,
                      "0"
                    )}`;
                  })()}
                  placeholder="Select date"
                  required
                />
                {/* Type of Block - compact, right of date */}
                {formData.date && (
                  <div className="flex flex-row items-center gap-2 ml-2">
                    {/* <label className="text-[22px] font-bold text-black mr-2">Type:</label> */}
                    {validCorridorType ? (
                      isDisabled ? (
                        <span className="px-5 py-2 rounded-lg bg-[#f7a1a1] border-2 border-black text-[24px] font-extrabold text-black shadow-sm">
                          U
                        </span>
                      ) : (
                        <div className="flex flex-row gap-2">
                          <button
                            type="button"
                            className={`px-5 py-2 rounded-lg border-2 text-[24px] font-extrabold shadow-sm focus:outline-none transition-all ${formData.corridorTypeSelection === "Corridor"
                              ? "bg-[#e6f7c6] border-black text-black"
                              : "bg-white border-[#b6e6c6] text-[#888]"
                              }`}
                            onClick={() =>
                              handleInputChange({
                                target: {
                                  name: "corridorTypeSelection",
                                  value: "Corridor",
                                },
                              } as any)
                            }
                            disabled={hasMultipleLinesSelected()}
                          >
                            C
                          </button>
                          <button
                            type="button"
                            className={`px-5 py-2 rounded-lg border-2 text-[24px] font-extrabold shadow-sm focus:outline-none transition-all ${formData.corridorTypeSelection ===
                              "Outside Corridor"
                              ? "bg-[#ffe082] border-black text-black"
                              : "bg-white border-[#ffe082] text-[#888]"
                              }`}
                            onClick={() =>
                              handleInputChange({
                                target: {
                                  name: "corridorTypeSelection",
                                  value: "Outside Corridor",
                                },
                              } as any)
                            }
                          >
                            NC
                          </button>
                        </div>
                      )
                    ) : null}
                  </div>
                )}



              </div>
              {errors.date && (
                <span className="text-[24px] text-[#e07a5f] font-medium mt-2 block">
                  {errors.date}
                </span>
              )}
            </div>
            {/* If not Corridor Block, show reason box (compact) */}
            {formData.corridorTypeSelection &&
              !["Corridor Block", "Corridor"].includes(
                formData.corridorTypeSelection
              ) && (
                <div className="w-full">
                  <input
                    type="text"
                    name="emergencyBlockRemarks"
                    value={formData.emergencyBlockRemarks || ""}
                    onChange={handleInputChange}
                    placeholder="Reasons for asking outside Corridor or Emergency Block"
                    className="w-full bg-white border-2 border-black rounded px-2 py-1 text-[24px] font-bold text-black focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-gray-600"
                    required
                  />
                  {renderError("emergencyBlockRemarks")}
                </div>
              )}
            {/* Major Section Dropdown - compact, no label */}
            <div className="flex flex-row items-center gap-4 w-full ">
              <select
                id="major-section"
                name="selectedSection"
                value={formData.selectedSection || ""}
                onChange={handleInputChange}
                className="border-2 border-black rounded-xl px-8 py-4 text-[24px] font-bold bg-[#e6f7c6] text-black shadow-md focus:outline-none focus:ring-2 focus:ring-[#b6e6c6] min-w-[240px] max-w-[320px]"
                aria-required="true"
                aria-label="Select major section"
                required
                style={{
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23000' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "1.2rem",
                }}
              >
                <option value="" disabled>
                  Select Major Section
                </option>
                {majorSectionOptions.map((section: string) => (
                  <option key={section} value={section} className="text-[24px]">
                    {section}
                  </option>
                ))}
              </select>
              {errors.selectedSection && (
                <span className="text-[24px] text-[#e07a5f] font-medium mt-2 block">
                  {errors.selectedSection}
                </span>
              )}
            </div>
            {/* Block Section/Yard Multi-select - max 2 selections */}
            <div className="flex flex-row items-center gap-3 w-full mt-1">
              <Select
                isMulti
                name="blockSection"
                options={getFilteredOptions(
                  formData.selectedSection,
                  blockSectionValue
                ).map((block: string) => ({
                  value: block,
                  label: block,
                }))}
                value={blockSectionValue.map((val: string) => ({
                  value: val,
                  label: val,
                }))}
                // onChange={(selected) => {
                //   const values = selected
                //     ? selected.map((opt: any) => opt.value)
                //     : [];
                //   if (values.length <= 2) {
                //     setBlockSectionValue(values);
                //     setFormData((prev) => ({
                //       ...prev,
                //       missionBlock: values.join(","),
                //       processedLineSections: (
                //         prev.processedLineSections || []
                //       ).filter((s: any) => values.includes(s.block)),
                //     }));
                //   }
                // }}
                onChange={(selected) => {
                  const values = selected
                    ? selected.map((opt: any) => opt.value)
                    : [];

                  if (userDepartment !== "TRD" && values.length > 2) {
                    return;
                  }
                  setBlockSectionValue(values);
                  setFormData((prev) => ({
                    ...prev,
                    missionBlock: values.join(","),
                    processedLineSections: (
                      prev.processedLineSections || []
                    ).filter((s: any) => values.includes(s.block)),
                  }));
                }}
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "#ffe6b3",
                    borderColor: "black",
                    borderWidth: 2,
                    borderRadius: 12,
                    minHeight: "44px",
                    fontWeight: "bold",
                    fontSize: "22px",
                    boxShadow: "none",
                    padding: "0 1px",
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#f6fff6",
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "22px",
                    border: "1.5px solid #b6e6c6",
                    borderRadius: 8,
                    marginRight: 4,
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "22px",
                    padding: "2px 8px",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: "#e07a5f",
                    ":hover": {
                      backgroundColor: "#f6fff6",
                      color: "#b91c1c",
                    },
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#ffe082"
                      : state.isFocused
                        ? "#ffe08299"
                        : "#ffe6b3",
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "24px",
                    padding: "4px 8px",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "22px",
                  }),
                  dropdownIndicator: (base) => ({
                    ...base,
                    color: "black",
                    fontSize: "24px",
                    padding: 0,
                  }),
                }}
                placeholder={
                  userDepartment === "TRD"
                    ? "Select Block Sections/Yards"
                    : "Select up to 2 Block Sections/Yards"
                }
                closeMenuOnSelect={false}
                isOptionDisabled={() =>
                  userDepartment !== "TRD" && blockSectionValue.length >= 2
                }
                required
              />
              {errors.missionBlock && (
                <span className="text-[24px] text-[#e07a5f] font-medium mt-1 block">
                  {errors.missionBlock}
                </span>
              )}
            </div>
            {blockSectionValue.map((block: string, idx: number) => {
              const isYard = block.includes("-YD");
              const lineOrRoadOptions = isYard
                ? getAllRoadsForYard(block).map((road: string) => ({
                  value: road,
                  label: road,
                }))
                : (lineData[block as keyof typeof lineData] || []).map(
                  (line: string) => ({
                    value: line,
                    label: line,
                  })
                );

              const sectionEntry: any = (formData.processedLineSections || []).find(
                (s: any) => s.block === block
              ) || {};

              const displayInfo = getDisplayInfo(block);

              return (
                <div key={block} className="flex flex-col gap-1 w-full">
                  <span className="text-[24px] font-bold text-black mb-1">
                    Select {isYard ? "Road(s)" : "Line(s)"} for{" "}
                    <span className="text-[#3a506b]">{block}</span>
                  </span>

                  <div className="flex flex-row items-center gap-3 w-full">
                    <Select
                      isMulti
                      name={`lineOrRoad-${block}`}
                      options={lineOrRoadOptions}
                      value={(() => {
                        const selectedValues: { value: string; label: string }[] = [];
                        if (isYard) {
                          if (sectionEntry?.road) {
                            selectedValues.push({ value: sectionEntry.road, label: sectionEntry.road });
                          }
                          if (sectionEntry?.otherRoads) {
                            const otherRoadList = sectionEntry.otherRoads.split(",").map((road: string) => road.trim()).filter(Boolean);
                            selectedValues.push(...otherRoadList.map((road: string) => ({ value: road, label: road })));
                          }
                        } else {
                          if (sectionEntry?.lineName) {
                            selectedValues.push({ value: sectionEntry.lineName, label: sectionEntry.lineName });
                          }
                          if (sectionEntry?.otherLines) {
                            const otherLineList = sectionEntry.otherLines.split(",").map((line: string) => line.trim()).filter(Boolean);
                            selectedValues.push(...otherLineList.map((line: string) => ({ value: line, label: line })));
                          }
                        }
                        return selectedValues;
                      })()}
                      onChange={(selected) => {
                        const values = selected ? selected.map((opt: any) => opt.value) : [];
                        if (isYard) {
                          handleRoadSelection(block, values.join(","));
                        } else {
                          handleLineNameSelection(block, values);
                        }
                      }}
                      classNamePrefix="react-select"
                      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                      styles={{
                        control: (base) => ({
                          ...base,
                          backgroundColor: "#e6f7fa",
                          borderColor: "black",
                          borderWidth: 2,
                          borderRadius: 12,
                          minHeight: "44px",
                          fontWeight: "bold",
                          fontSize: "24px",
                          boxShadow: "none",
                          padding: "0 2px",
                        }),
                        menu: (base) => ({ ...base, zIndex: 9999 }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: isYard ? "#e6f7fa" : "#f6fff6",
                          color: "black",
                          fontWeight: "bold",
                          fontSize: "22px",
                          border: "1.5px solid #b6e6c6",
                          borderRadius: 8,
                          marginRight: 4,
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: "black",
                          fontWeight: "bold",
                          fontSize: "24px",
                          padding: "2px 8px",
                        }),
                        multiValueRemove: (base) => ({
                          ...base,
                          color: "#e07a5f",
                          ":hover": {
                            backgroundColor: "#f6fff6",
                            color: "#b91c1c",
                          },
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? "#b6e6f7"
                            : state.isFocused
                              ? "#b6e6f799"
                              : "#e6f7fa",
                          color: "black",
                          fontWeight: "bold",
                          fontSize: "22px",
                          padding: "4px 8px",
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: "black",
                          fontWeight: "bold",
                          fontSize: "24px",
                        }),
                        dropdownIndicator: (base) => ({
                          ...base,
                          color: "black",
                          fontSize: "24px",
                          padding: 0,
                        }),
                      }}
                      placeholder={isYard ? "Select Road(s)" : "Select Line(s)"}
                      closeMenuOnSelect={false}
                      required
                    />
                    {renderError(`${block}.lineName`)}
                    {renderError(`${block}.road`)}
                    {renderError(`${block}.stream`)}
                  </div>
                </div>
              );
            })}

            {/* Corridor display - ONLY SHOW when NOT "nothing" */}
            {getDisplayInfo(blockSectionValue[0])?.display !== 'nothing' && (
              <div
                className="w-full mt-3 mb-2 px-4 py-2 rounded-lg border-2 border-[#e07a5f] bg-[#ffd6d6] flex flex-col items-center justify-center shadow-sm whitespace-nowrap overflow-x-auto min-w-0"
                style={{ boxSizing: "border-box" }}
              >
                <span className="text-[26px] font-bold text-black text-center mr-4">
                  {getDisplayInfo(blockSectionValue[0])?.text === 'Corridor for this section'
                    ? 'Corridor for this section'
                    : 'Combined block'}
                </span>
                {getDisplayInfo(blockSectionValue[0])?.text === 'Corridor for this section' && (
                  <span className="text-[24px] font-bold text-black text-center">
                    {corridorTime?.from || "--:--"}
                    <span className="mx-2">TO</span>
                    {corridorTime?.to || "--:--"}
                  </span>
                )}
              </div>
            )}
            {/* Preferred Slot and Site Location grouped in a box - ALIGNED, PROFESSIONAL, NO OVERFLOW, SINGLE LINE */}
            <div className="w-full mt-1 mb-4 p-6 rounded-2xl border-4 border-[#b6e6c6] bg-gradient-to-br from-[#f7f7a1] to-[#f0f0c0] flex flex-col gap-4 shadow-xl min-w-0 hover:shadow-2xl transition-shadow duration-300">
              {/* Preferred Slot label */}
              {/* Time selectors and duration row - always single line, scrollable if needed */}
              <div className="flex flex-col flex-nowrap items-center w-full overflow-x-auto py-4 space-y-4 border-2 border-[#b7cbe8] rounded-2xl bg-gradient-to-b from-[#fffbe9] to-[#fff7d6]">
                <span
                  className="text-black font-bold text-[24px] mb-1 tracking-wide"
                  style={{ lineHeight: "1", marginLeft: "4px" }}
                >
                  Preferred Slot
                </span>
                <div className="flex flex-row flex-wrap items-center justify-center gap-2 px-3 py-2 text-2xl">
                  <div className="bg-white border-2 border-[#2c3e50] text-[#2c3e50] font-bold text-2xl px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3498db]  shadow-inner hover:bg-[#f8f9fa] transition-colors duration-200">
                    <select
                      name="demandTimeFromHour"
                      value={
                        formData.demandTimeFrom
                          ? formData.demandTimeFrom.split(":")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const hour = e.target.value;
                        const min = formData.demandTimeFrom
                          ? formData.demandTimeFrom.split(":")[1]
                          : "00";
                        handleInputChange({
                          target: {
                            name: "demandTimeFrom",
                            value: `${hour}:${min}`,
                          },
                        } as any);
                      }}
                      className="appearance-none text-center"
                      required
                    >
                      <option value="">--</option>
                      {[...Array(24).keys()].map((h) => {
                        const hourStr = h.toString().padStart(2, "0");
                        if (isToday(formData.date)) {
                          const now = new Date();
                          const currentHour = now.getHours();
                          if (h < currentHour && h !== 0) {
                            return null;
                          }
                        }

                        return (
                          <option key={h} value={hourStr}>
                            {hourStr}
                          </option>
                        );
                      })}
                    </select>
                    <span className="text-[#2c3e50] font-bold text-[24px]">:</span>
                    <select
                      name="demandTimeFromMin"
                      value={
                        formData.demandTimeFrom
                          ? formData.demandTimeFrom.split(":")[1]
                          : ""
                      }
                      onChange={(e) => {
                        const min = e.target.value;
                        const hour = formData.demandTimeFrom
                          ? formData.demandTimeFrom.split(":")[0]
                          : "00";
                        handleInputChange({
                          target: {
                            name: "demandTimeFrom",
                            value: `${hour}:${min}`,
                          },
                        } as any);
                      }}
                      className="appearance-none text-center"
                      required
                    >
                      <option value="">--</option>
                      {[...Array(12).keys()].map((m) => (
                        <option
                          key={m}
                          value={(m * 5).toString().padStart(2, "0")}
                        >
                          {(m * 5).toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[#2c3e50] font-bold text-[24px] px-2">
                    TO
                  </span>
                  <div className="bg-white border-2 border-[#2c3e50] text-[#2c3e50] font-bold text-2xl px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3498db]  text-center shadow-inner hover:bg-[#f8f9fa] transition-colors duration-200">
                    <select
                      name="demandTimeToHour"
                      value={
                        formData.demandTimeTo
                          ? formData.demandTimeTo.split(":")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const hour = e.target.value;
                        const min = formData.demandTimeTo
                          ? formData.demandTimeTo.split(":")[1]
                          : "00";
                        handleInputChange({
                          target: {
                            name: "demandTimeTo",
                            value: `${hour}:${min}`,
                          },
                        } as any);
                      }}
                      className="appearance-none text-center"
                      required
                    >
                      <option value="">--</option>
                      {[...Array(24).keys()].map((h) => {
                        const hourStr = h.toString().padStart(2, "0");
                        // If selected date is today, ensure "To" time is after "From" time
                        // if (isToday(formData.date)) {
                        //   const fromHour = formData.demandTimeFrom
                        //     ? parseInt(formData.demandTimeFrom.split(":")[0])
                        //     : new Date().getHours() + 1;
                        //   // Only allow hours that are after the from time
                        //   if (h <= fromHour) {
                        //     return null; // Skip rendering this option
                        //   }
                        // }
                        return (
                          <option key={h} value={hourStr}>
                            {hourStr}
                          </option>
                        );
                      })}
                    </select>
                    <span className="text-[#2c3e50] font-bold text-[24px]">:</span>
                    <select
                      name="demandTimeToMin"
                      value={
                        formData.demandTimeTo
                          ? formData.demandTimeTo.split(":")[1]
                          : ""
                      }
                      onChange={(e) => {
                        const min = e.target.value;
                        const hour = formData.demandTimeTo
                          ? formData.demandTimeTo.split(":")[0]
                          : "00";
                        handleInputChange({
                          target: {
                            name: "demandTimeTo",
                            value: `${hour}:${min}`,
                          },
                        } as any);
                      }}
                      className="appearance-none text-center"
                      required
                    >
                      <option value="">--</option>
                      {[...Array(12).keys()].map((m) => (
                        <option
                          key={m}
                          value={(m * 5).toString().padStart(2, "0")}
                        >
                          {(m * 5).toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <span className="text-[#2c3e50] font-bold text-[24px] mb-1 tracking-wide">
                  Duration
                </span>
                <span className="bg-white border-2 border-[#2c3e50] rounded-lg px-6 py-2 text-2xl font-bold text-[#2c3e50] min-w-[120px] text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                  {getDurationFromTimes(
                    formData.demandTimeFrom || "",
                    formData.demandTimeTo || ""
                  ) || "--"}
                </span>
              </div>
              {/* Site Location row */}
              {getDisplayInfo(blockSectionValue[0])?.text === 'Corridor for this section' &&(
 <div className="flex flex-row items-center gap-4 w-full pl-1">
                <div className="flex flex-col items-center bg-gradient-to-b from-[#fffbe9] to-[#fff7d6] border-2 border-[#b7cbe8] rounded-xl px-4 py-5 space-y-4 w-full shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="font-bold text-[#2c3e50] text-[24px] leading-none tracking-wide">
                      Site Location
                    </span>
                    {/* Display range information */}
                    {/* {formData.selectedSection && blockSectionValue.length > 0 && userDepartment && (
                      <span className="text-sm text-[#666] font-medium bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        {getSiteLocationRange(formData.selectedSection, blockSectionValue, userDepartment).displayText}
                      </span>
                    )} */}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex flex-col items-center">
                      <input
                        type="text"
                        name="workLocationFrom"
                        value={formData.workLocationFrom || ""}
                        onChange={createSiteLocationChangeHandler(
                          'workLocationFrom',
                          formData,
                          handleInputChange,
                          formData.selectedSection,
                          blockSectionValue,
                          userDepartment || "",
                          userDepot
                        )}
                        maxLength={7}
                        placeholder="From"
                        className={`border-2 ${errors.workLocationFrom ?  'border-[#2c3e50]' : 'border-[#2c3e50]'} rounded-lg px-3 py-2 text-[24px] font-bold text-[#2c3e50] placeholder-[#95a5a6] focus:outline-none focus:ring-2 focus:ring-[#3498db] w-[120px] text-center bg-white shadow-inner hover:bg-[#f8f9fa] transition-colors duration-200`}
                      />
                      {/* <div className="h-8 mt-1 flex items-center justify-center">
                        <span className={`text-xs text-center max-w-[120px] leading-tight ${errors.workLocationFrom ? 'text-red-500' : 'text-transparent'}`}>
                          {errors.workLocationFrom || "No error"}
                        </span>
                      </div> */}
                    </div>
                    <span className="font-bold text-[#2c3e50] text-[24px] mb-10">
                      TO
                    </span>
                    <div className="flex flex-col items-center">
                      <input
                        type="text"
                        name="workLocationTo"
                        value={formData.workLocationTo || ""}
                        onChange={createSiteLocationChangeHandler(
                          'workLocationTo',
                          formData,
                          handleInputChange,
                          formData.selectedSection,
                          blockSectionValue,
                          userDepartment || "",
                          userDepot
                        )}
                        maxLength={7}
                        placeholder="To"
                        className={`border-2 ${errors.workLocationTo ? 'border-[#2c3e50]' : 'border-[#2c3e50]'} rounded-lg px-3 py-2 text-[24px] font-bold text-[#2c3e50] placeholder-[#95a5a6] focus:outline-none focus:ring-2 focus:ring-[#3498db] w-[120px] text-center bg-white shadow-inner hover:bg-[#f8f9fa] transition-colors duration-200`}
                      />
                      {/* <div className="h-8 mt-1 flex items-center justify-center">
                        <span className={`text-xs text-center max-w-[120px] leading-tight ${errors.workLocationTo ? 'text-red-500' : 'text-transparent'}`}>
                          {errors.workLocationTo || "No error"}
                        </span>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
              )}
             
            </div>
          </div>

          {/*  TODO:    remove "!" should be only for snt */}
          {/* {userDepartment === "S&T" && (
            <div className="flex flex-row items-center gap-4 w-full pl-1">
              <div className="flex flex-col items-center bg-gradient-to-b from-[#fffbe9] to-[#fff7d6] border-2 border-[#b7cbe8] rounded-xl px-4 py-5 space-y-4 w-full shadow-md hover:shadow-lg transition-shadow duration-200">
                <span className="font-bold text-[#2c3e50] text-[24px] leading-none tracking-wide">
                  Route
                </span>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <input
                    type="text"
                    name="routeFrom"
                    value={formData.routeFrom || ""}
                    onChange={handleInputChange}
                    placeholder="From"
                    className="border-2 border-[#2c3e50] rounded-lg px-3 py-2 text-[24px] font-bold text-[#2c3e50] placeholder-[#95a5a6] focus:outline-none focus:ring-2 focus:ring-[#3498db] w-[120px] text-center bg-white shadow-inner hover:bg-[#f8f9fa] transition-colors duration-200"
                    required
                  />
                  <span className="font-bold text-[#2c3e50] text-[24px]">
                    to
                  </span>
                  <input
                    type="text"
                    name="routeTo"
                    value={formData.routeTo || ""}
                    onChange={handleInputChange}
                    placeholder="To"
                    className="border-2 border-[#2c3e50] rounded-lg px-3 py-2 text-[24px] font-bold text-[#2c3e50] placeholder-[#95a5a6] focus:outline-none focus:ring-2 focus:ring-[#3498db] w-[120px] text-center bg-white shadow-inner hover:bg-[#f8f9fa] transition-colors duration-200"
                    required
                  />
                </div>
              </div>
            </div>
          )} */}

          {/*  TODO:    remove "!" should be only for trd */}

          {userDepartment === "TRD" && (
            <div className="w-full flex flex-row  items-center bg-[#e6f7c6] rounded-2xl p-3 mb-8 border-2 border-[#b6e6c6] shadow">
              {/* Type of Work dropdown */}
              <div className="flex-1 pr-2 ">
                <label
                  htmlFor="elementarySection"
                  className="block text-[24px] text-nowrap font-bold text-black mb-2"
                >
                  Elementary Section
                </label>
                <input
                  id="elementarySection"
                  name="elementarySection"
                  value={formData.elementarySection || ""}
                  onChange={handleInputChange}
                  required
                  placeholder="Elementary Section"
                  className="w-full border-2 border-[#2c3e50] rounded-lg px-3 py-2 text-[24px] font-bold text-[#2c3e50] placeholder-[#95a5a6] focus:outline-none focus:ring-2 focus:ring-[#3498db] text-center bg-white shadow-inner hover:bg-[#f8f9fa] transition-colors duration-200"
                  aria-label="Route from location"
                />
                {errors.elementarySection && (
                  <span className="text-[24px] text-[#e07a5f] font-medium mt-2 block">
                    {errors.elementarySection}
                  </span>
                )}
              </div>
              {/* Activity dropdown */}
            </div>
          )}


          {/* Type of Work and Activity - horizontal, pastel green */}
          {/* <div className="w-full flex flex-row  items-center bg-[#e6f7c6] rounded-2xl p-3 mb-8 border-2 border-[#b6e6c6] shadow">
            <div className="flex-1 pr-2 border-r-2 border-slate-400">
              <label
                htmlFor="workType"
                className="block text-[24px] text-nowrap font-bold text-black mb-2"
              >
                Type of Work
              </label>
              <select
                id="workType"
                name="workType"
                value={formData.workType || ""}
                onChange={handleInputChange}
                className="h-full w-full border-2 border-[#b7cbe8] rounded-xl px-4 pr-8 py-3 text-[24px] font-bold bg-white text-[#3a506b]  focus:outline-none focus:ring-2 focus:ring-[#b7cbe8] appearance-none"
                aria-required="true"
                style={{
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23000' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "1.2rem",
                }}
                required
              >
                <option value="" disabled>
                  Select Type of Work
                </option>
                {workTypeOptions.map((type: string) => (
                  <option key={type} value={type} className="text-[24px]">
                    {type}
                  </option>
                ))}
              </select>
              {errors.workType && (
                <span className="text-[24px] text-[#e07a5f] font-medium mt-2 block">
                  {errors.workType}
                </span>
              )}
            </div>
         
            <div className="flex-1 pl-2">
              <label
                htmlFor="activity"
                className="block text-[24px] font-bold text-black mb-2"
              >
                Activity
              </label>
              <select
                id="activity"
                name="activity"
                value={formData.activity || ""}
                onChange={handleInputChange}
                className="h-full w-full border-2 border-[#b7cbe8] rounded-xl px-4 pr-8 py-3 text-[24px] font-bold bg-white text-[#3a506b] shadow focus:outline-none focus:ring-2 focus:ring-[#b7cbe8] appearance-none"
                aria-required="true"
                style={{
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23000' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "1.2rem",
                }}
                required
              >
                <option value="" disabled>
                  {formData.workType
                    ? "Select Activity"
                    : "Select Type of Work first"}
                </option>
                {activityOptions.map((activity: string) => (
                  <option
                    key={activity}
                    value={activity}
                    className="text-[24px]"
                  >
                    {activity}
                  </option>
                ))}
                <option value="others" className="text-[24px]">
                  Others
                </option>
              </select>
              {formData.activity === "others" && (
                <input
                  type="text"
                  className="w-full border-2 border-[#b7cbe8] rounded-xl px-4 py-3 text-[24px] font-medium bg-white text-[#3a506b] shadow mt-4 focus:outline-none focus:ring-2 focus:ring-[#b7cbe8]"
                  placeholder="Enter custom activity"
                  value={customActivity}
                  onChange={(e) => setCustomActivity(e.target.value)}
                  required
                />
              )}
              {errors.activity && (
                <span className="text-[24px] text-[#e07a5f] font-medium mt-2 block">
                  {errors.activity}
                </span>
              )}
            </div>
          </div> */}
{/* Type of Work and Activity - horizontal, pastel green */}


{/* Type of Work and Activity - both multi-select */}
<div className="w-full flex flex-row items-center bg-[#e6f7c6] rounded-2xl p-3 mb-8 border-2 border-[#b6e6c6] shadow">
  {/* Type of Work Multi-Select */}
  <div className="flex-1 pr-2 border-r-2 border-slate-400">
    <label className="block text-[24px] text-nowrap font-bold text-black mb-2">
      Type of Work
    </label>
    <Select
      isMulti
      value={formData.workType 
        ? formData.workType.split(',').map(type => ({
            value: type.trim(),
            label: type.trim()
          }))
        : []
      }
      onChange={(selectedOptions) => {
        const selected = selectedOptions || [];
        const selectedValues = selected.map(option => option.value);
        const workTypeValues = selectedValues.join(",");
        
        setFormData(prev => ({
          ...prev,
          workType: workTypeValues,
          activity: ""
        }));
        
        setSelectedActivities([]);
        setCustomActivity("");
      }}
      options={workTypeOptions.map((type: string) => ({
        value: type,
        label: type,
      }))}
      classNamePrefix="react-select"
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: "white",
          borderColor: state.isFocused ? "#b7cbe8" : "#b7cbe8",
          borderWidth: 2,
          borderRadius: 12,
          minHeight: "60px",
          maxHeight: "60px",
          fontWeight: "bold",
          fontSize: "18px",
          boxShadow: "none",
        }),
        valueContainer: (base) => ({
          ...base,
          padding: "4px 8px",
          height: "52px",
          overflowY: "auto",
          flexWrap: "wrap",
          alignItems: "flex-start",
          alignContent: "flex-start",
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "#e6f7fa",
          color: "black",
          fontWeight: "bold",
          fontSize: "16px",
          border: "1.5px solid #b6e6c6",
          borderRadius: 6,
          margin: "2px 4px 2px 0",
          flexShrink: 0,
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "black",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "4px 8px",
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: "#e07a5f",
          padding: "0 6px",
          ":hover": {
            backgroundColor: "#f6fff6",
            color: "#b91c1c",
          },
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "#b6e6f7"
            : state.isFocused
            ? "#b6e6f799"
            : "white",
          color: "black",
          fontWeight: "bold",
          fontSize: "18px",
          padding: "8px 12px",
        }),
        menu: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        menuList: (base) => ({
          ...base,
          maxHeight: "200px",
          overflowY: "auto",
        }),
        placeholder: (base) => ({
          ...base,
          color: "#3a506b",
          fontWeight: "bold",
          fontSize: "18px",
        }),
        dropdownIndicator: (base) => ({
          ...base,
          color: "#3a506b",
          fontSize: "18px",
          padding: "0 8px",
        }),
        input: (base) => ({
          ...base,
          fontSize: "18px",
          color: "black",
          margin: 0,
          padding: 0,
        }),
        indicatorsContainer: (base) => ({
          ...base,
          height: "52px",
        }),
      }}
      placeholder="Select Types of Work"
      closeMenuOnSelect={false}
      required
    />
    {errors.workType && (
      <span className="text-[24px] text-[#e07a5f] font-medium mt-2 block">
        {errors.workType}
      </span>
    )}
  </div>

  {/* Activity Multi-Select */}
  <div className="flex-1 pl-2">
    <label className="block text-[24px] font-bold text-black mb-2">
      Activity
    </label>
    <Select
      isMulti
      value={(() => {
        const selectedValues: { value: string; label: string }[] = [];
        
        if (formData.activity) {
          const activities = formData.activity.split(",").filter(a => a.trim() && a !== "others");
          activities.forEach(activity => {
            if (activityOptions.includes(activity)) {
              selectedValues.push({ value: activity, label: activity });
            }
          });
        }
        
        if (customActivity && selectedActivities.includes("others")) {
          selectedValues.push({ value: "others", label: "Others" });
        }
        
        return selectedValues;
      })()}
      onChange={(selectedOptions) => {
        const selected = selectedOptions || [];
        const selectedValues = selected.map(option => option.value);
        
        setSelectedActivities(selectedValues);
        
        const activityValues = selectedValues.filter(val => val !== "others").join(",");
        
        setFormData(prev => ({
          ...prev,
          activity: activityValues
        }));
        
        if (!selectedValues.includes("others")) {
          setCustomActivity("");
        }
      }}
      options={[
        ...activityOptions.map((activity: string) => ({
          value: activity,
          label: activity,
        })),
        { value: "others", label: "Others" }
      ]}
      classNamePrefix="react-select"
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: "white",
          borderColor: state.isFocused ? "#b7cbe8" : "#b7cbe8",
          borderWidth: 2,
          borderRadius: 12,
          minHeight: "60px",
          maxHeight: "60px",
          fontWeight: "bold",
          fontSize: "18px",
          boxShadow: "none",
        }),
        valueContainer: (base) => ({
          ...base,
          padding: "4px 8px",
          height: "52px",
          overflowY: "auto",
          flexWrap: "wrap",
          alignItems: "flex-start",
          alignContent: "flex-start",
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "#e6f7fa",
          color: "black",
          fontWeight: "bold",
          fontSize: "16px",
          border: "1.5px solid #b6e6c6",
          borderRadius: 6,
          margin: "2px 4px 2px 0",
          flexShrink: 0,
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "black",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "4px 8px",
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: "#e07a5f",
          padding: "0 6px",
          ":hover": {
            backgroundColor: "#f6fff6",
            color: "#b91c1c",
          },
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "#b6e6f7"
            : state.isFocused
            ? "#b6e6f799"
            : "white",
          color: "black",
          fontWeight: "bold",
          fontSize: "18px",
          padding: "8px 12px",
        }),
        menu: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        menuList: (base) => ({
          ...base,
          maxHeight: "200px",
          overflowY: "auto",
        }),
        placeholder: (base) => ({
          ...base,
          color: "#3a506b",
          fontWeight: "bold",
          fontSize: "18px",
        }),
        dropdownIndicator: (base) => ({
          ...base,
          color: "#3a506b",
          fontSize: "18px",
          padding: "0 8px",
        }),
        input: (base) => ({
          ...base,
          fontSize: "18px",
          color: "black",
          margin: 0,
          padding: 0,
        }),
        indicatorsContainer: (base) => ({
          ...base,
          height: "52px",
        }),
      }}
      placeholder={formData.workType ? `Select Activities (${activityOptions.length} available)` : "Select Type of Work first"}
      closeMenuOnSelect={false}
      isDisabled={!formData.workType}
      required
    />
    
    {/* Custom activity input for "Others" */}
    {selectedActivities.includes("others") && (
      <div className="mt-4">
        <input
          type="text"
          className="w-full border-2 border-[#b7cbe8] rounded-xl px-4 py-3 text-[20px] font-medium bg-white text-[#3a506b] shadow focus:outline-none focus:ring-2 focus:ring-[#b7cbe8]"
          placeholder="Enter custom activity"
          value={customActivity}
          onChange={(e) => setCustomActivity(e.target.value)}
          required
        />
      </div>
    )}
    
    {errors.activity && (
      <span className="text-[24px] text-[#e07a5f] font-medium mt-2 block">
        {errors.activity}
      </span>
    )}
  </div>
</div>
          {/*Coaching*/}
          <div className="w-full flex flex-row  items-center bg-[#e6f7c6] rounded-2xl p-3 mb-8 border-2 border-[#b6e6c6] shadow">
            {/* Type of Work dropdown */}
            <div className="flex-1 pr-2 ">
              <label
                htmlFor="repercussions"
                className="block text-[24px] text-nowrap font-bold text-black mb-2"
              >
                Movement Restriction
              </label>
              <input
                id="repercussions"
                name="repercussions"
                value={formData.repercussions || ""}
                onChange={handleInputChange}
                required
                placeholder="Movement Restriction"
                className="w-full border-2 border-[#2c3e50] rounded-lg px-3 py-2 text-[24px] font-bold text-[#2c3e50] placeholder-[#95a5a6] focus:outline-none focus:ring-2 focus:ring-[#3498db] text-center bg-white shadow-inner hover:bg-[#f8f9fa] transition-colors duration-200"
                aria-label="Route from location"
              />
              {errors.repercussions && (
                <span className="text-[24px] text-[#e07a5f] font-medium mt-2 block">
                  {errors.repercussions}
                </span>
              )}
            </div>
            {/* Activity dropdown */}
          </div>


<div className="w-full flex flex-col items-center bg-[#e6f7c6] rounded-2xl p-3 mb-8 border-2 border-[#b6e6c6] shadow">
  {/* Common heading */}
  <div className="w-full mb-4">
    <label className="block text-[24px] text-nowrap font-bold text-black text-center">
      Asset Details
    </label>
  </div>
  
  {/* Input fields row */}
  <div className="w-full flex flex-row items-center">
    {/* Asset Name input */}
    <div className="flex-1 pr-2">
      <input
        id="assetName"
        name="assetName"
        value={formData.assetName || ""}
        onChange={handleInputChange}
        placeholder="Asset Name"
        className="w-full border-2 border-[#2c3e50] rounded-lg px-3 py-2 text-[24px] font-bold text-[#2c3e50] placeholder-[#95a5a6] focus:outline-none focus:ring-2 focus:ring-[#3498db] text-center bg-white shadow-inner hover:bg-[#f8f9fa] transition-colors duration-200"
        aria-label="Asset Name"
      />
      {/* {errors.assetName && (
        <span className="text-[24px] text-[#e07a5f] font-medium mt-2 block">
          {errors.assetName}
        </span>
      )} */}
    </div>
    
    {/* Asset Number input */}
    <div className="flex-1 pl-2">
      <input
        id="assetNumber"
        name="assetNumber"
        value={formData.assetNumber || ""}
        onChange={handleInputChange}
        placeholder="Asset Number"
        className="w-full border-2 border-[#2c3e50] rounded-lg px-3 py-2 text-[24px] font-bold text-[#2c3e50] placeholder-[#95a5a6] focus:outline-none focus:ring-2 focus:ring-[#3498db] text-center bg-white shadow-inner hover:bg-[#f8f9fa] transition-colors duration-200"
        aria-label="Asset Number"
      />
      {/* {errors.assetNumber && (
        <span className="text-[24px] text-[#e07a5f] font-medium mt-2 block">
          {errors.assetNumber}
        </span>
      )} */}
    </div>
  </div>
</div>


          {userDepartment !== "TRD" && (
            <div className="flex flex-col gap-2 border-2 border-[#b6e6c6] shadow rounded-2xl px-4 py-2 bg-white">
              {/* <div className="w-full mt-2 bg-fuchsia-100 rounded-2xl ">
                <div className="flex justify-between items-center mb-1 bg-fuchsia-300  rounded-2xl  px-2">
                  <span className="text-black font-bold text-[24px] ">
                    Fresh Caution Needed?
                  </span>
                  <select
                    name="freshCautionRequired"
                    value={formData.freshCautionRequired ? "Y" : "N"}
                    onChange={(e) => {
                      const value = e.target.value === "Y";
                      console.log("Setting freshCautionRequired to:", value);
                      setFormData({
                        ...formData,
                        freshCautionRequired: value,
                      });
                    }}
                    className="ml-2 pr-8 border-2  border-black rounded 
                  px-1 my-3 text-2xl font-bold bg-white text-black placeholder-black"
                    style={{
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23000' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.5rem center",
                      backgroundSize: "1.2rem",
                    }}
                  >
                    <option value="N">N</option>
                    <option value="Y">Y</option>
                  </select>
                  {renderError("freshCautionRequired")}
                </div>
            

                {formData.freshCautionRequired && (
                  <div className="flex flex-col gap-2 mt-2 pb-2">
                    {formData.freshCautions.map((caution, idx) => (
                      <div
                        key={idx}
                        className="flex flex-row flex-wrap gap-1 bg-[#fffbe9] border-2 border-[#b71c1c] rounded items-center p-1"
                        style={{ fontSize: "24px", fontWeight: "bold" }}
                      >
                        <input
                          list={`adjacentLinesList-${idx}`}
                          value={caution.adjacentLinesAffected}
                          onChange={(e) =>
                            handleFreshCautionChange(
                              idx,
                              "adjacentLinesAffected",
                              e.target.value
                            )
                          }
                          placeholder="UP/DN/SL/Road No."
                          required
                          className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-28 text-2xl"
                        />
                        <datalist id={`adjacentLinesList-${idx}`}>
                          {blockSectionValue.flatMap((block) => {
                            const isYard = block.includes("-YD");
                            return isYard
                              ? getAllRoadsForYard(block).map((r) => (
                                <option key={r} value={r} />
                              ))
                              : (
                                lineData[block as keyof typeof lineData] || []
                              ).map((l) => <option key={l} value={l} />);
                          })}
                        </datalist>

                        <input
                          value={caution.freshCautionLocationFrom}
                          onChange={(e) =>
                            handleFreshCautionChange(
                              idx,
                              "freshCautionLocationFrom",
                              e.target.value
                            )
                          }
                          placeholder="KM"
                          required
                          className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-12 text-2xl"
                        />
                        <span className="px-1 text-2xl text-black">to</span>
                        <input
                          value={caution.freshCautionLocationTo}
                          onChange={(e) =>
                            handleFreshCautionChange(
                              idx,
                              "freshCautionLocationTo",
                              e.target.value
                            )
                          }
                          placeholder="KM"
                          required
                          className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-12 text-2xl"
                        />

                        <input
                          type="number"
                          value={caution.freshCautionSpeed}
                          onChange={(e) =>
                            handleFreshCautionChange(
                              idx,
                              "freshCautionSpeed",
                              e.target.value
                            )
                          }
                          placeholder="Speed"
                          required
                          className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-12 flex-1 text-2xl"
                        />

                        {formData.freshCautions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFreshCaution(idx)}
                            className="px-2 py-1 text-2xl bg-red-600 text-white rounded"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addFreshCaution}
                      className="self-center px-2 py-1  bg-green-600 text-white rounded text-2xl font-semibold"
                    >
                      + Add Fresh Caution
                    </button>
                  </div>
                )}
              </div> */}

<div className="w-full mt-2 bg-fuchsia-100 rounded-2xl ">
  <div className="flex justify-between items-center mb-1 bg-fuchsia-300  rounded-2xl  px-2">
    <span className="text-black font-bold text-[24px] ">
      Fresh Caution Needed?
    </span>
    <select
      name="freshCautionRequired"
      value={formData.freshCautionRequired ? "Y" : "N"}
      onChange={(e) => {
        const value = e.target.value === "Y";
        console.log("Setting freshCautionRequired to:", value);
        setFormData({
          ...formData,
          freshCautionRequired: value,
        });
      }}
      className="ml-2 pr-8 border-2  border-black rounded 
      px-1 my-3 text-2xl font-bold bg-white text-black placeholder-black"
      style={{
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23000' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.5rem center",
        backgroundSize: "1.2rem",
      }}
    >
      <option value="N">N</option>
      <option value="Y">Y</option>
    </select>
    {renderError("freshCautionRequired")}
  </div>

  {formData.freshCautionRequired && (
    <div className="flex flex-col gap-2 mt-2 pb-2">
      {formData.freshCautions.map((caution, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-1 bg-[#fffbe9] border-2 border-[#b71c1c] rounded p-1"
          style={{ fontSize: "24px", fontWeight: "bold" }}
        >
          {/* First Row: Direction, KM From/To, Speed */}
          <div className="flex flex-row flex-wrap gap-1 items-center">
            <input
              list={`adjacentLinesList-${idx}`}
              value={caution.adjacentLinesAffected}
              onChange={(e) =>
                handleFreshCautionChange(
                  idx,
                  "adjacentLinesAffected",
                  e.target.value
                )
              }
              placeholder="UP/DN/SL/Road No."
              required
              className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-28 text-2xl"
            />
            <datalist id={`adjacentLinesList-${idx}`}>
              {blockSectionValue.flatMap((block) => {
                const isYard = block.includes("-YD");
                return isYard
                  ? getAllRoadsForYard(block).map((r) => (
                    <option key={r} value={r} />
                  ))
                  : (
                    lineData[block as keyof typeof lineData] || []
                  ).map((l) => <option key={l} value={l} />);
              })}
            </datalist>

            <input
              value={caution.freshCautionLocationFrom}
              onChange={(e) =>
                handleFreshCautionChange(
                  idx,
                  "freshCautionLocationFrom",
                  e.target.value
                )
              }
              placeholder="KM"
              required
              className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-12 text-2xl"
            />
            <span className="px-1 text-2xl text-black">to</span>
            <input
              value={caution.freshCautionLocationTo}
              onChange={(e) =>
                handleFreshCautionChange(
                  idx,
                  "freshCautionLocationTo",
                  e.target.value
                )
              }
              placeholder="KM"
              required
              className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-12 text-2xl"
            />

            <input
              type="number"
              value={caution.freshCautionSpeed}
              onChange={(e) =>
                handleFreshCautionChange(
                  idx,
                  "freshCautionSpeed",
                  e.target.value
                )
              }
              placeholder="Speed"
              required
              className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-12 flex-1 text-2xl"
            />

            {formData.freshCautions.length > 1 && (
              <button
                type="button"
                onClick={() => removeFreshCaution(idx)}
                className="px-2 py-1 text-2xl bg-red-600 text-white rounded"
              >
                Remove
              </button>
            )}
          </div>

          {/* Second Row: Dates */}
          <div className="flex flex-row flex-wrap gap-1 items-center">
            <input
              type="date"
              value={caution.freshCautionFromDate || ""}
              onChange={(e) =>
                handleFreshCautionChange(
                  idx,
                  "freshCautionFromDate",
                  e.target.value
                )
              }
              className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black px-1 text-2xl"
            />
            
            <input
              type="date"
              value={caution.freshCautionToDate || ""}
              onChange={(e) =>
                handleFreshCautionChange(
                  idx,
                  "freshCautionToDate",
                  e.target.value
                )
              }
              className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black px-1 text-2xl"
            />
          </div>

          {/* Third Row: Times */}
          <div className="flex flex-row flex-wrap gap-1 items-center">
            <input
              type="time"
              value={caution.freshCautionFromTime || ""}
              onChange={(e) =>
                handleFreshCautionChange(
                  idx,
                  "freshCautionFromTime",
                  e.target.value
                )
              }
              className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black px-1 text-2xl"
            />
            
            <input
              type="time"
              value={caution.freshCautionToTime || ""}
              onChange={(e) =>
                handleFreshCautionChange(
                  idx,
                  "freshCautionToTime",
                  e.target.value
                )
              }
              className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black px-1 text-2xl"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addFreshCaution}
        className="self-center px-2 py-1  bg-green-600 text-white rounded text-2xl font-semibold"
      >
        + Add Fresh Caution
      </button>
    </div>
  )}
</div>

              {/* Power Block Section */}
              <div className="w-full mt-2 bg-indigo-200 rounded-2xl">
                <div className="flex justify-between items-center mb-1 bg-indigo-400  rounded-2xl  px-2">
                  <span className="text-black font-bold text-[24px]">
                    Power Block Needed?
                  </span>
                  <select
                    name="powerBlockRequired"
                    value={formData.powerBlockRequired ? "Y" : "N"}
                    onChange={(e) => {
                      const value = e.target.value === "Y";
                      console.log("Setting powerBlockRequired to:", value);
                      setFormData({
                        ...formData,
                        powerBlockRequired: value,
                      });
                       if (!value) {
    setSelectedTRDDepots([]);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.powerBlockDisconnectionAssignTo;
      delete newErrors.powerBlockKmFrom;
      delete newErrors.powerBlockKmTo;
      delete newErrors.powerBlockRoad;
      return newErrors;
    });
  }
                    }}
                    className="ml-2 pr-8 border-2  border-black  
                px-1 my-3 text-2xl font-bold bg-white text-black placeholder-black"
                    style={{
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23000' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.5rem center",
                      backgroundSize: "1.2rem",
                    }}
                  >
                    <option value="N">N</option>
                    <option value="Y">Y</option>
                  </select>
                  {renderError("powerBlockRequired")}
                </div>
                {/* ───── Power Block ───── */}
                {formData.powerBlockRequired && (
                  <div className="flex flex-col gap-2 mt-2 pb-2">
                    <div className="flex flex-row flex-wrap gap-1">
                      <input
                        type="text"
                        name="powerBlockKmFrom"
                        value={formData.powerBlockKmFrom || ""}
                        onChange={handleInputChange}
                        placeholder="KM"
                        required
                        className="flex-1 border-2  border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-12 text-2xl"
                      />
                      <span className="text-black font-bold text-2xl">to</span>
                      <input
                        type="text"
                        name="powerBlockKmTo"
                        value={formData.powerBlockKmTo || ""}
                        onChange={handleInputChange}
                        placeholder="KM"
                        required
                        className=" flex-1 border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-12 text-2xl"
                      />
                      <input
                        type="text"
                        name="powerBlockRoad"
                        value={formData.powerBlockRoad || ""}
                        onChange={handleInputChange}
                        placeholder="Road No."
                        required
                        className=" flex-1 border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-12 text-2xl"
                      />
                    </div>
                    <div className="col-span-1">
                      <MultiSelectDepot
                        department="TRD"
                        selectedDepots={selectedTRDDepots}
                        // onDepotsChange={setSelectedTRDDepots}
                          onDepotsChange={(depots) => {
    setSelectedTRDDepots(depots);
    // Clear error when user selects a depot
    if (depots.length > 0 && errors.powerBlockDisconnectionAssignTo) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.powerBlockDisconnectionAssignTo;
        return newErrors;
      });
    }
  }}
                        majorSection={formData.selectedSection}
                        blockSections={blockSectionValue}
                        disabled={false}
                         required={formData.powerBlockRequired}
                      />
                      {errors.powerBlockDisconnectionAssignTo && (
                        <span className="text-xs text-red-700 font-medium mt-1 block">
                          {errors.powerBlockDisconnectionAssignTo}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* S&T Disconnection Section */}
              {session?.user.department !== "S&T" && (
                <div className="w-full mt-2 bg-teal-200 rounded-2xl">
                  <div className="flex justify-between items-center mb-1 bg-teal-400 rounded-2xl  px-2">
                    <span className="text-black font-bold text-[24px]">
                      S&T Disconnection Needed?
                    </span>
                    <select
                      name="sntDisconnectionRequired"
                      value={formData.sntDisconnectionRequired ? "Y" : "N"}
                      onChange={(e) => {
                        const value = e.target.value === "Y";
                        setFormData({
                          ...formData,
                          sntDisconnectionRequired: e.target.value === "Y",
                        })
                          if (!value) {
            setSelectedSTDepots([]);
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.sntDisconnectionAssignTo;
              delete newErrors.sntDisconnectionPointNo;
              delete newErrors.sntDisconnectionSignalNo;
              return newErrors;
            });
          }
                      }}
                      className="ml-2 pr-8 border-2  border-black rounded px-1 my-3 text-2xl font-bold bg-white text-black placeholder-black"
                      style={{
                        appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23000' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.5rem center",
                        backgroundSize: "1.2rem",
                      }}
                    >
                      <option value="N">N</option>
                      <option value="Y">Y</option>
                    </select>
                    {renderError("sntDisconnectionRequired")}
                  </div>
                  {/* ───── S&T Disconnection ───── */}
                  {formData.sntDisconnectionRequired && (
                    <div className="flex flex-col items-center gap-2 mt-2 pb-2">
                      <div className="flex flex-row flex-wrap gap-1 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                          {/* Point No. Section */}
                          <div className="w-full bg-[#f8fafc] border border-[#b71c1c] rounded-lg p-2">
                            <label className="text-black font-bold text-2xl mb-3 flex items-center gap-2">
                              Point No.
                            </label>
                            <div className="flex flex-col gap-1">
                              {(
                                formData.sntDisconnectionPointNo?.split(",") || [
                                  "",
                                ]
                              ).map((point, index, arr) => (
                                <div
                                  className="flex items-center gap-1 relative group"
                                  key={index}
                                >
                                  <input
                                    type="text"
                                    value={point}
                                    onChange={(e) => {
                                      const points = [
                                        ...(formData.sntDisconnectionPointNo?.split(
                                          ","
                                        ) || []),
                                      ];
                                      points[index] = e.target.value;
                                      handleInputChange({
                                        target: {
                                          name: "sntDisconnectionPointNo",
                                          value: points
                                            .filter((p) => p.trim() !== "")
                                            .join(","),
                                        },
                                      } as React.ChangeEvent<HTMLInputElement>);
                                    }}
                                    placeholder={`Point No. ${index + 1}`}
                                    required
                                    className="w-full border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 text-2xl"
                                  />
                                  {arr.length > 1 && (
                                    <button
                                      type="button"
                                      aria-label="Remove point"
                                      onClick={() => {
                                        const points =
                                          formData.sntDisconnectionPointNo?.split(
                                            ","
                                          ) || [];
                                        const updated = points.filter(
                                          (_, i) => i !== index
                                        );
                                        handleInputChange({
                                          target: {
                                            name: "sntDisconnectionPointNo",
                                            value: updated.join(","),
                                          },
                                        } as React.ChangeEvent<HTMLInputElement>);
                                      }}
                                      className="text-red-600 hover:text-white hover:bg-red-600 rounded-full p-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                                      style={{ lineHeight: 0 }}
                                    >
                                      <svg
                                        width="20"
                                        height="20"
                                        fill="none"
                                        viewBox="0 0 20 20"
                                      >
                                        <circle
                                          cx="10"
                                          cy="10"
                                          r="10"
                                          fill="#fff"
                                        />
                                        <path
                                          d="M6 6l8 8M14 6l-8 8"
                                          stroke="#b71c1c"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              ))}
                              {(formData.sntDisconnectionPointNo
                                ?.split(",")
                                .filter((p) => p.trim() !== "").length || 0) <
                                2 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const points =
                                        formData.sntDisconnectionPointNo
                                          ?.split(",")
                                          .filter((p) => p.trim() !== "") || [];
                                      points.push("");
                                      handleInputChange({
                                        target: {
                                          name: "sntDisconnectionPointNo",
                                          value: points.join(","),
                                        },
                                      } as React.ChangeEvent<HTMLInputElement>);
                                    }}
                                    className="flex items-center gap-1 mt-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-base font-semibold rounded shadow hover:from-green-700 hover:to-green-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400"
                                  >
                                    <svg
                                      width="18"
                                      height="18"
                                      fill="none"
                                      viewBox="0 0 20 20"
                                    >
                                      <circle cx="10" cy="10" r="10" fill="#fff" />
                                      <path
                                        d="M10 5v10M5 10h10"
                                        stroke="#166534"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                    Add Point
                                  </button>
                                )}
                            </div>
                          </div>

                          {/* Signal No. Section */}
                          <div className="w-full bg-[#f8fafc] border border-[#b71c1c] rounded-lg p-2">
                            <label className="text-black font-bold text-2xl mb-3 flex items-center gap-2">
                              Signal No.
                            </label>
                            <div className="flex flex-col gap-1">
                              {(
                                formData.sntDisconnectionSignalNo?.split(",") || [
                                  "",
                                ]
                              ).map((point, index, arr) => (
                                <div
                                  className="flex items-center gap-1 relative group"
                                  key={index}
                                >
                                  <input
                                    type="text"
                                    value={point}
                                    onChange={(e) => {
                                      const points = [
                                        ...(formData.sntDisconnectionSignalNo?.split(
                                          ","
                                        ) || []),
                                      ];
                                      points[index] = e.target.value;
                                      handleInputChange({
                                        target: {
                                          name: "sntDisconnectionSignalNo",
                                          value: points
                                            .filter((p) => p.trim() !== "")
                                            .join(","),
                                        },
                                      } as React.ChangeEvent<HTMLInputElement>);
                                    }}
                                    placeholder={`Signal No. ${index + 1}`}
                                    required
                                    className="w-full border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 text-2xl"
                                  />
                                  {arr.length > 1 && (
                                    <button
                                      type="button"
                                      aria-label="Remove point"
                                      onClick={() => {
                                        const points =
                                          formData.sntDisconnectionSignalNo?.split(
                                            ","
                                          ) || [];
                                        const updated = points.filter(
                                          (_, i) => i !== index
                                        );
                                        handleInputChange({
                                          target: {
                                            name: "sntDisconnectionSignalNo",
                                            value: updated.join(","),
                                          },
                                        } as React.ChangeEvent<HTMLInputElement>);
                                      }}
                                      className="text-red-600 hover:text-white hover:bg-red-600 rounded-full p-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                                      style={{ lineHeight: 0 }}
                                    >
                                      <svg
                                        width="20"
                                        height="20"
                                        fill="none"
                                        viewBox="0 0 20 20"
                                      >
                                        <circle
                                          cx="10"
                                          cy="10"
                                          r="10"
                                          fill="#fff"
                                        />
                                        <path
                                          d="M6 6l8 8M14 6l-8 8"
                                          stroke="#b71c1c"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              ))}
                              {(formData.sntDisconnectionSignalNo
                                ?.split(",")
                                .filter((p) => p.trim() !== "").length || 0) <
                                2 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const points =
                                        formData.sntDisconnectionSignalNo
                                          ?.split(",")
                                          .filter((p) => p.trim() !== "") || [];
                                      points.push("");
                                      handleInputChange({
                                        target: {
                                          name: "sntDisconnectionSignalNo",
                                          value: points.join(","),
                                        },
                                      } as React.ChangeEvent<HTMLInputElement>);
                                    }}
                                    className="flex items-center gap-1 mt-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-base font-semibold rounded shadow hover:from-green-700 hover:to-green-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400"
                                  >
                                    <svg
                                      width="18"
                                      height="18"
                                      fill="none"
                                      viewBox="0 0 20 20"
                                    >
                                      <circle cx="10" cy="10" r="10" fill="#fff" />
                                      <path
                                        d="M10 5v10M5 10h10"
                                        stroke="#166534"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                    Add Signal
                                  </button>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <MultiSelectDepot
                        department="S&T"
                        selectedDepots={selectedSTDepots}
                        // onDepotsChange={setSelectedSTDepots}
                                                 onDepotsChange={(depots) => {
    setSelectedSTDepots(depots);
    // Clear error when user selects a depot
    if (depots.length > 0 && errors.sntDisconnectionAssignTo) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.sntDisconnectionAssignTo;
        return newErrors;
      });
    }
  }}
                        majorSection={formData.selectedSection}
                        blockSections={blockSectionValue}
                        disabled={false}
                      />
                      {errors.sntDisconnectionAssignTo && (
                        <span className="text-xs text-red-700 font-medium mt-1 block">
                          {errors.sntDisconnectionAssignTo}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}




{session?.user.department === "S&T" && (
  <div className="w-full mt-2 bg-orange-200 rounded-2xl">
    <div className="flex justify-between items-center mb-1 bg-orange-400 rounded-2xl px-2">
      <span className="text-black font-bold text-[24px]">
        ENG Disconnection Needed?
      </span>
      <select
        name="enggDisconnectionsRequired"
        value={formData.enggDisconnectionsRequired ? "Y" : "N"}
        onChange={(e) => {
          const value = e.target.value === "Y";
          console.log("Setting enggDisconnectionsRequired to:", value);
          setFormData({
            ...formData,
            enggDisconnectionsRequired: value,
          });
        }}
        className="ml-2 pr-8 border-2 border-black rounded px-1 my-3 text-2xl font-bold bg-white text-black placeholder-black"
        style={{
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23000' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.5rem center",
          backgroundSize: "1.2rem",
        }}
      >
        <option value="N">N</option>
        <option value="Y">Y</option>
      </select>
      {renderError("enggDisconnectionsRequired")}
    </div>
    
    {/* ENG Disconnection Details */}
    {formData.enggDisconnectionsRequired && (
      <div className="flex flex-col gap-2 mt-2 pb-2">
        {/* Remarks Field */}
        <div className="flex flex-col gap-1">
          <span className="text-black font-bold text-2xl">Remarks:</span>
          <textarea
            name="engDisconnectionRemarks"
            value={formData.engDisconnectionRemarks || ""}
            onChange={handleInputChange}
            placeholder="Enter ENG disconnection remarks"
            rows={2}
            className="w-full border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-2 py-1 text-2xl rounded"
            required
          />
          {renderError("engDisconnectionRemarks")}
        </div>

        {/* Assign To using MultiSelectDepot component */}
        <MultiSelectDepot
          department="ENGG"
          selectedDepots={selectedENGDepots}
          // onDepotsChange={setSelectedENGDepots}
                                                           onDepotsChange={(depots) => {
    setSelectedENGDepots(depots);
    // Clear error when user selects a depot
    if (depots.length > 0 && errors.engDisconnectionAssignTo) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.engDisconnectionAssignTo;
        return newErrors;
      });
    }
  }}
          majorSection={formData.selectedSection}
          blockSections={blockSectionValue}
          disabled={false}
        />
        {errors.engDisconnectionAssignTo && (
          <span className="text-xs text-red-700 font-medium mt-1 block">
            {errors.engDisconnectionAssignTo}
          </span>
        )}
      </div>
    )}
  </div>
)}




            </div>
          )}

          {/* Remarks */}
          <div className="flex flex-row flex-wrap gap-1">
            <span className="text-black font-bold text-[24px]">Remarks:</span>
            <textarea
              name="requestremarks"
              value={formData.requestremarks || ""}
              onChange={handleInputChange}
              placeholder="Enter any additional remarks"
              rows={1}
              className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-full text-[24px]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-8 gap-4">
            {/* <button
              type="button"
              onClick={() => { window.location.href = "/dashboard"; }}
              className="w-full rounded-[50%] max-w-72 bg-violet-200 text-black font-bold text-[24px] py-4 tracking-wider border border-[#b7b7d1] hover:bg-[#baffc9] transition"
            >
              Home
            </button> */}
            <button
              type="button"
              className="w-full rounded-[50%] max-w-72 bg-cyan-200 text-black font-bold text-[24px] py-4 tracking-wider border border-[#b7b7d1] hover:bg-[#f0eaff] transition"
              onClick={() => {
                if (reviewMode) {
                  setReviewMode(false);
                } else {
                  router.back();
                }
              }}
            >
              Back
            </button>
            {showPopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/20">
                <div className="bg-white p-4 rounded shadow-lg w-[90%] max-w-sm text-center border border-gray-300">
                  <h2 className="text-lg font-semibold mb-2 text-black">
                    Availed Status Not Entered
                  </h2>
                  <p className="text-sm text-gray-700 mb-4">
                    You already have a sanctioned block for which availing is pending.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setShowPopup(false);
                        setProceedAnyway(true);
                        // Re-trigger the submit or logic
                        // handleFormSubmit; // Call the same handler again
                      }}
                      className="bg-gray-300 text-black px-4 py-1 rounded hover:bg-gray-400"
                    >
                      Proceed
                    </button>
                    <button
                      onClick={() => {
                        window.open(popupLink, "_blank");
                        setShowPopup(false);
                      }}
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                    >
                      Go to Avail Page
                    </button>
                  </div>
                  <div className="text-sm text-orange-700 mt-4">
                    Proceed is available only because the Rolling Block
                    Authorization app is under construction.{" "}
                  </div>
                </div>
              </div>
            )}

            <ReviewBlockRequestModal
              isOpen={showReviewModal}
              onClose={() => setShowReviewModal(false)}
              onConfirm={() => {
                setReviewMode(true);
                setShowReviewModal(false);
                // Programmatically submit the form
                const form = document.querySelector("form");
                if (form) form.requestSubmit();
              }}
              formData={formData}
              blockSectionValue={blockSectionValue}
              processedLineSections={processedLineSections}
              selectedActivities={selectedActivities}
              customActivity={customActivity}
              formSubmitting={formSubmitting}
              userDepot={userDepots}
            />
            <button
              type="submit"
              className={`w-full bg-[#eeb8f7] border-2 border-black rounded-[50%] max-w-72 px-6 py-2 text-lg font-extrabold text-white hover:brightness-90 ${formSubmitting ? "brightness-95 cursor-not-allowed" : ""
                }`}
              disabled={formSubmitting}
            >
              {formSubmitting ? "SUBMITTING..." : "SUBMIT REQUEST"}
            </button>
            <ToastContainer />
          </div>
        </form>
      </div>
    </div>
  );
}