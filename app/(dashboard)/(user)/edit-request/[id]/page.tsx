"use client";
import React, { useState, useEffect } from "react";
import { useUpdateUserRequest } from "@/app/service/mutation/user-request";
import { useSession } from "next-auth/react";
import { MajorSection, blockSection } from "@/app/lib/store";
import { useParams } from "next/navigation";
import { useGetUserRequestById } from "@/app/service/query/user-request";
import { Loader } from "@/app/components/ui/Loader";
import { format, parse, parseISO } from "date-fns";
import { useDeleteUserRequest } from "@/app/service/mutation/user-request";
import Select from "react-select";

interface FormData {
  isSanctioned: boolean;
  sntDisconnectionRequirements: string[];
  sntDisconnectionLineFrom: string;
  sntDisconnectionLineTo: string;
  powerBlockRequirements: string[];
  elementarySection: string;
  id: string;
  date: string;
  selectedDepartment: string;
  selectedSection: string;
  freshCautionRequired: boolean;
  freshCautionSpeed: number;
  freshCautionLocationFrom: string;
  freshCautionLocationTo: string;
  workLocationFrom: string;
  otherLinesAffected: string;
  workLocationTo: string;
  demandTimeFrom: string;
  demandTimeTo: string;
  powerBlockRequired: boolean;
  sntDisconnectionRequired: boolean;
  elementarySectionTo: string;
  lineType?: string;
  missionBlock: string;
  processedLineSections: {
  block: string;
  road?: string;
  type: "line" | "road" | "yard";
  lineName?: string;
  otherLines?: string;
  otherRoads?: string;
}[];
  [key: string]: any;
}

export default function CreateBlockRequestPage() {
  const params = useParams();
  const { data: userDataById, isLoading } = useGetUserRequestById(
    params.id as string
  );
  const [formData, setFormData] = useState<FormData>({
    id: "",
    date: "",
    sntDisconnectionRequirements: [],
    sntDisconnectionLineFrom: "",
    sntDisconnectionLineTo: "",
    selectedDepartment: "",
    selectedSection: "",
    freshCautionRequired: false,
    freshCautionSpeed: 0,
    freshCautionLocationFrom: "",
    freshCautionLocationTo: "",
    workLocationFrom: "",
    workLocationTo: "",
    demandTimeFrom: "",
    demandTimeTo: "",
    powerBlockRequired: false,
    sntDisconnectionRequired: false,
    elementarySectionTo: "",
    otherLinesAffected: "",
    isSanctioned: false,
    powerBlockRequirements: [],
    elementarySection: "",
    missionBlock: "",
    processedLineSections: [],

  });

  const { data: session } = useSession({ required: true });
  const mutation = useUpdateUserRequest(params.id as string);
  const deleteMutation = useDeleteUserRequest();
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelRemark, setCancelRemark] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (userDataById?.data) {
      const data = userDataById.data;

      const getTimeFromISO = (isoString: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return `${String(date.getUTCHours()).padStart(2, "0")}:${String(
          date.getUTCMinutes()
        ).padStart(2, "0")}`;
      };

      setFormData({
        id: data.id,
        date: data.date ? new Date(data.date).toISOString() : "",
        selectedDepartment: data.selectedDepartment || "",
        selectedSection: data.selectedSection || "",
        freshCautionRequired: data.freshCautionRequired || false,
        freshCautionSpeed: data.freshCautionSpeed || 0,
        freshCautionLocationFrom: data.freshCautionLocationFrom || "",
        freshCautionLocationTo: data.freshCautionLocationTo || "",
        workLocationFrom: data.workLocationFrom || "",
        workLocationTo: data.workLocationTo || "",
        demandTimeFrom: getTimeFromISO(data.demandTimeFrom),
        demandTimeTo: getTimeFromISO(data.demandTimeTo),
        powerBlockRequired: data.powerBlockRequired || false,
        sntDisconnectionRequired: data.sntDisconnectionRequired || false,
        elementarySectionTo: data.elementarySectionTo || "",
        otherLinesAffected: data.processedLineSections?.[0]?.otherLines || "",
        isSanctioned: data.isSanctioned || false,
        powerBlockRequirements: data.powerBlockRequirements || [],
        elementarySection: data.elementarySection || "",
        sntDisconnectionRequirements: data.sntDisconnectionRequirements || [],
        sntDisconnectionLineFrom: data.sntDisconnectionLineFrom || "",
        sntDisconnectionLineTo: data.sntDisconnectionLineTo || "",
        missionBlock: data.missionBlock || "",
        processedLineSections: (data.processedLineSections || []).map(
          (section: any) => ({
            ...section,
            type: section.type === "line" ? "line" : "road",
          })
        ),

      });
    }
  }, [userDataById]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "date" && value) {
      const date = parse(value, "yyyy-MM-dd", new Date());
      setFormData((prev) => ({
        ...prev,
        [name]: date.toISOString(),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    setFormData((prev) => {
      const currentArray =
        prev[
          name as "powerBlockRequirements" | "sntDisconnectionRequirements"
        ] || [];
      return {
        ...prev,
        [name]: checked
          ? [...currentArray, value]
          : currentArray.filter((item) => item !== value),
      };
    });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isChecked = value === "true";

    setFormData((prev) => ({
      ...prev,
      [name]: isChecked,
      ...(name === "powerBlockRequired" &&
        !isChecked && {
          powerBlockRequirements: [],
          elementarySection: "",
        }),
      ...(name === "sntDisconnectionRequired" &&
        !isChecked && {
          sntDisconnectionRequirements: [],
          sntDisconnectionLineFrom: "",
          sntDisconnectionLineTo: "",
        }),
        ...(name === "freshCautionRequired" &&
      !isChecked && {
        freshCautionLocationFrom: "",
        freshCautionLocationTo: "",
        freshCautionSpeed: 0,
      }),
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : parseInt(value, 10),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        ...(!formData.powerBlockRequired && {
          powerBlockRequirements: [],
          elementarySection: "",
        }),
        ...(!formData.sntDisconnectionRequired && {
          sntDisconnectionRequirements: [],
          sntDisconnectionLineFrom: "",
          sntDisconnectionLineTo: "",
        }),
        date: formData.date,
        demandTimeFrom:
          formData.date && formData.demandTimeFrom
            ? new Date(
                `${formData.date.split("T")[0]}T${formData.demandTimeFrom}:00`
              ).toISOString()
            : "",
        demandTimeTo:
          formData.date && formData.demandTimeTo
            ? new Date(
                `${formData.date.split("T")[0]}T${formData.demandTimeTo}:00`
              ).toISOString()
            : "",
        // processedLineSections: [
        //   {
        //     ...(userDataById?.data.processedLineSections?.[0] || {}),
        //     otherLines: formData.otherLinesAffected,
        //   },
        // ],
      };

      await mutation.mutateAsync(formattedData as any);
      // Show toast and redirect
      if (typeof window !== 'undefined') {
        window.alert('Request updated successfully!');
        setTimeout(() => {
          window.location.href = '/edit-request';
        }, 1000);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update request");
    }
  };

  const handleCancelRequest = async () => {
    try {
      await mutation.mutateAsync({ ...(formData as any) });
      alert("Request cancelled successfully!");
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Failed to cancel request");
    }
  };

  // Helper to get roads for the selected mission block, excluding the selected road
  const getOtherRoads = () => {
    const roads = blockSection[
      formData.selectedSection as keyof typeof blockSection
    ] || [];
    // Exclude the selected mission block and the selected road
    return roads.filter(
      (road) =>
        road !== formData.missionBlock &&
        road !== formData.lineType &&
        ["UP", "DN", "SL", "No", "SINGLE"].indexOf(road) === -1 // Exclude generic values
    );
  };

  const handleOtherRoadsChange = (road: string, checked: boolean) => {
    let affected = formData.otherLinesAffected
      ? formData.otherLinesAffected.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];
    if (checked) {
      if (!affected.includes(road)) affected.push(road);
    } else {
      affected = affected.filter((r: string) => r !== road);
    }
    setFormData((prev) => ({
      ...prev,
      otherLinesAffected: affected.join(","),
    }));
  };

const handleDeleteSection = (indexToRemove: number) => {
  setFormData((prev) => {
    if (prev.processedLineSections.length <= 1) {
      alert("At least one block section is required.");
      return prev;
    }

    return {
      ...prev,
      processedLineSections: prev.processedLineSections.filter((_, i) => i !== indexToRemove),
    };
  });
};


  if (isLoading) return <Loader name="Loading request..." />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-md mx-auto p-2">
        <div className="bg-yellow-100 rounded-t-xl p-2 border-b-2 border-teal-200 text-center">
          <span className="text-[24px] font-extrabold text-purple-600 tracking-wide">
            RBMS-{session?.user?.location}-DIVN
          </span>
        </div>

        <div className="bg-blue-100 rounded-b-xl p-3">
          <div className="bg-green-500 text-gray-800 font-bold text-[23px] rounded-xl p-2 text-center mb-4 border-2 border-green-700 tracking-wide">
            Edit/Cancel the Block ID {userDataById?.data.divisionId||formData.id}
          </div>

          <div className="flex gap-3 justify-center mb-4">
            <button
              className="flex-1 max-w-[160px] rounded-xl bg-blue-800 text-white font-bold text-[22px] py-2 border-2 border-gray-800 shadow-sm relative"
              type="submit"
              form="edit-block-form"
            >
              EDIT
              <span className="block text-xs italic font-normal mt-0.5">
                (Permitted upto 3 days before)
              </span>
            </button>
            <button
              className="flex-1 max-w-[160px] rounded-xl bg-red-600 text-white font-bold text-[22px] py-3 border-2 border-gray-800 shadow-sm"
              onClick={() => setCancelModal(true)}
              type="button"
            >
              CANCEL
            </button>
          </div>

          {/* Cancel Modal */}
          {cancelModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-lg font-bold mb-2 text-black">Cancel Request</h2>
                <p className="mb-2 text-black">Please enter a remark for cancellation:</p>
                <textarea
                  className="w-full border border-gray-400 rounded p-2 mb-2 text-black"
                  rows={3}
                  value={cancelRemark}
                  onChange={e => setCancelRemark(e.target.value)}
                  placeholder="Enter cancellation remark..."
                />
                {cancelError && <div className="text-red-600 text-xs mb-2">{cancelError}</div>}
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setCancelModal(false)}
                    className="px-4 py-1 bg-gray-200 text-black rounded border border-gray-400 hover:bg-gray-300"
                    disabled={deleting}
                  >
                    Back
                  </button>
                  <button
                    onClick={async () => {
                      if (!cancelRemark.trim()) {
                        setCancelError("Remark is required.");
                        return;
                      }
                      setCancelError("");
                      setDeleting(true);
                      try {
                        await deleteMutation.mutateAsync(params.id as string);
                        setCancelModal(false);
                        setDeleting(false);
                        window.location.href = "/edit-request";
                      } catch (err) {
                        setCancelError("Failed to cancel request. Please try again.");
                        setDeleting(false);
                      }
                    }}
                    className="px-4 py-1 bg-red-600 text-white rounded border border-red-700 hover:bg-red-700 disabled:opacity-50"
                    disabled={deleting}
                  >
                    {deleting ? "Cancelling..." : "Confirm Cancel"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <form
            id="edit-block-form"
            onSubmit={handleSubmit}
            className="w-full bg-white rounded-xl shadow-sm border-2 border-gray-800 mb-6 overflow-hidden"
          >
            <table className="w-full border-collapse font-sans text-[20px] table-fixed">
              <tbody>
                <tr>
                  <td className="bg-purple-200 font-semibold p-1.5 w-1/4 text-gray-900" >
                    Block Date
                  </td>
                  <td className="bg-green-200 p-1.5 w-1/4">
                    <input
                      type="date"
                      name="date"
                      value={
                        formData.date
                          ? format(parseISO(formData.date), "yyyy-MM-dd")
                          : ""
                      }
                      onChange={handleInputChange}
                      className="w-full p-1 border border-gray-800 rounded bg-white" style={{color:"black"}}
                    />
                  </td>
                  <td className="bg-purple-200 font-semibold p-1.5 w-1/4 text-gray-900">
                    Request Date
                  </td>
                  <td className="bg-green-200 p-1.5 w-1/4">
                    <input
                      type="text"
                      value={new Date().toLocaleDateString("en-GB")}
                      className="w-full p-1 border border-gray-800 rounded bg-gray-200" style={{color:"black"}}
                      readOnly
                    />
                  </td>
                </tr>

                <tr>
                  <td className="bg-[#83cee2] font-semibold p-1.5 text-gray-900">
                    Sanction Status
                  </td>
                  <td className="bg-white p-1.5" colSpan={3}>
                    <div className="flex gap-4 justify-center">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="isSanctioned"
                          value="true"
                          checked={formData.isSanctioned === true}
                          onChange={() => {}}
                          disabled
                        />
                        <span className="font-semibold text-gray-900">YES</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="isSanctioned"
                          value="false"
                          checked={formData.isSanctioned === false}
                          onChange={() => {}}
                          disabled
                        />
                        <span className="font-semibold text-gray-900">NO</span>
                      </label>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="bg-purple-200 font-semibold p-1.5 text-gray-900 ">
                    Preferred Slot
                  </td>
                  <td className="bg-green-200 p-1.5" colSpan={3}>
                    <div className="flex items-center gap-2">
                      <select
                        name="demandTimeFromHour"
                        value={formData.demandTimeFrom.split(":")[0] || "00"}
                        onChange={e => {
                          const hour = e.target.value;
                          const minute = formData.demandTimeFrom.split(":")[1] || "00";
                          setFormData(prev => ({
                            ...prev,
                            demandTimeFrom: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
                          }));
                        }}
                        className="p-1 border border-gray-800 rounded bg-white" style={{color:"black"}}
                      >
                        {[...Array(24).keys()].map(h => (
                          <option key={h} value={h.toString().padStart(2, "0")}>{h.toString().padStart(2, "0")}</option>
                        ))}
                      </select>
                      <span className="text-gray-900">:</span>
                      <select
                        name="demandTimeFromMinute"
                        value={formData.demandTimeFrom.split(":")[1] || "00"}
                        onChange={e => {
                          const minute = e.target.value;
                          const hour = formData.demandTimeFrom.split(":")[0] || "00";
                          setFormData(prev => ({
                            ...prev,
                            demandTimeFrom: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
                          }));
                        }}
                        className="p-1 border border-gray-800 rounded bg-white" style={{color:"black"}}
                      >
                        {[...Array(60).keys()].map(m => (
                          <option key={m} value={m.toString().padStart(2, "0")}>{m.toString().padStart(2, "0")}</option>
                        ))}
                      </select>
                      <span className="text-gray-900">to</span>
                      <select
                        name="demandTimeToHour"
                        value={formData.demandTimeTo.split(":")[0] || "00"}
                        onChange={e => {
                          const hour = e.target.value;
                          const minute = formData.demandTimeTo.split(":")[1] || "00";
                          setFormData(prev => ({
                            ...prev,
                            demandTimeTo: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
                          }));
                        }}
                        className="p-1 border border-gray-800 rounded bg-white" style={{color:"black"}}
                      >
                        {[...Array(24).keys()].map(h => (
                          <option key={h} value={h.toString().padStart(2, "0")}>{h.toString().padStart(2, "0")}</option>
                        ))}
                      </select>
                      <span className="text-gray-900">:</span>
                      <select
                        name="demandTimeToMinute"
                        value={formData.demandTimeTo.split(":")[1] || "00"}
                        onChange={e => {
                          const minute = e.target.value;
                          const hour = formData.demandTimeTo.split(":")[0] || "00";
                          setFormData(prev => ({
                            ...prev,
                            demandTimeTo: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
                          }));
                        }}
                        className="p-1 border border-gray-800 rounded bg-white" style={{color:"black"}}
                      >
                        {[...Array(60).keys()].map(m => (
                          <option key={m} value={m.toString().padStart(2, "0")}>{m.toString().padStart(2, "0")}</option>
                        ))}
                      </select>
                      <span className="text-xs text-gray-600 ml-2">(24-hour format)</span>
                    </div>
                  </td>
                </tr>
{formData.processedLineSections.map((section, index) => (
  <tr key={index} className="border-b border-gray-200 align-top">
    {/* Label: Block Section/Yard */}
    <td className="font-semibold text-[20px] text-gray-800 p-2 whitespace-normal break-words w-1/4">
      Block Section/ Yard
    </td>

    {/* Value: Block */}
    <td className="text-[20px] text-gray-900 p-2 whitespace-normal break-words w-1/4">
      {section.block || "-"}
    </td>

    {/* Label: Line(s) or Road(s) */}
    <td className="font-semibold text-[20px] text-gray-800 p-2 whitespace-normal break-words w-1/6">
      {section.type === "line" ? "Line(s)" : "Road(s)"}
    </td>

    {/* Value + X icon, X stays right */}
    <td className="text-[20px] text-gray-900 p-2 w-full align-top">
      <div className="flex justify-between items-start gap-2 flex-wrap">
        <span className="whitespace-normal break-words flex-1">
          {section.type === "line"
            ? [section.lineName, section.otherLines].filter(Boolean).join(", ")
            : [section.road, section.otherRoads].filter(Boolean).join(", ")}
        </span>
        <span
          className="text-red-600 font-bold cursor-pointer hover:text-red-700"
          onClick={() => handleDeleteSection(index)}
          title="Remove"
        >
          ✕
        </span>
      </div>
    </td>
  </tr>
))}


                <tr className="bg-purple-200">
                  <td className="font-semibold p-1.5 text-gray-900">
                    Site Location
                  </td>
                  <td className="p-1.5" colSpan={3}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="workLocationFrom"
                        value={formData.workLocationFrom}
                        onChange={handleInputChange}
                        placeholder="From"
                        className="w-32 p-1 border border-gray-800 rounded bg-white" style={{color:"black"}}
                      />
                      <input
                        type="text"
                        name="workLocationTo"
                        value={formData.workLocationTo}
                        onChange={handleInputChange}
                        placeholder="To"
                        className="w-32 p-1 border border-gray-800 rounded bg-white" style={{color:"black"}}
                      />
                    </div>
                  </td>
                </tr>

                {/* <tr>
                  <td className="font-semibold p-1.5 text-gray-900">
                    Caution Required
                  </td>
                  <td className="bg-white p-1.5" colSpan={3}>
                    <div className="flex flex-wrap gap-2 items-center">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="freshCautionRequired"
                          value="true"
                          checked={formData.freshCautionRequired === true}
                          onChange={handleRadioChange}
                        />
                        <span className="font-semibold text-sm text-gray-900">
                          YES
                        </span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="freshCautionRequired"
                          value="false"
                          checked={formData.freshCautionRequired === false}
                          onChange={handleRadioChange}
                        />
                        <span className="font-semibold text-sm text-gray-900">
                          NO
                        </span>
                      </label>
                      <input
                        type="text"
                        name="freshCautionLocationFrom"
                        value={formData.freshCautionLocationFrom}
                        onChange={handleInputChange}
                        placeholder="From"
                        className="w-14 p-1 border border-gray-800 rounded bg-white"
                      />
                      <input
                        type="text"
                        name="freshCautionLocationTo"
                        value={formData.freshCautionLocationTo}
                        onChange={handleInputChange}
                        placeholder="To"
                        className="w-14 p-1 border border-gray-800 rounded bg-white"
                      />
                      <input
                        type="number"
                        name="freshCautionSpeed"
                        value={formData.freshCautionSpeed}
                        onChange={handleNumberInputChange}
                        placeholder="SB"
                        className="w-10 p-1 border border-gray-800 rounded bg-white"
                      />
                    </div>
                  </td>
                </tr> */}
                <tr>
  <td className="font-semibold p-1.5 text-gray-900 ">
    Caution Required
  </td>
  <td className="bg-white p-1.5" colSpan={3}>
    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
      <label className="flex items-center gap-1 shrink-0">
        <input
          type="radio"
          name="freshCautionRequired"
          value="true"
          checked={formData.freshCautionRequired === true}
          onChange={handleRadioChange}
        />
        <span className="font-semibold text-sm text-gray-900">
          YES
        </span>
      </label>
      <label className="flex items-center gap-1 shrink-0">
        <input
          type="radio"
          name="freshCautionRequired"
          value="false"
          checked={formData.freshCautionRequired === false}
          onChange={handleRadioChange}
        />
        <span className="font-semibold text-sm text-gray-900">
          NO
        </span>
      </label>
      {formData.freshCautionRequired &&  (
        <> <input
        type="text"
        name="freshCautionLocationFrom"
        value={formData.freshCautionLocationFrom}
        onChange={handleInputChange}
        placeholder="From"
        className="w-14 p-1 border border-gray-800 rounded bg-white shrink-0" style={{color:"black"}}
      />
      <input
        type="text"
        name="freshCautionLocationTo"
        value={formData.freshCautionLocationTo}
        onChange={handleInputChange}
        placeholder="To"
        className="w-14 p-1 border border-gray-800 rounded bg-white shrink-0" style={{color:"black"}}
      />
      <input
        type="number"
        name="freshCautionSpeed"
        value={formData.freshCautionSpeed}
        onChange={handleNumberInputChange}
        placeholder="SB"
        className="w-10 p-1 border border-gray-800 rounded bg-white shrink-0" style={{color:"black"}}
      /></>
      )}
     
    </div>
  </td>
</tr>
                <tr className="bg-purple-200">
                  <td className="font-semibold p-1.5 text-gray-900 whitespace-nowrap">
                    Other Lines Affected
                  </td>
                  <td className="p-1.5" colSpan={3}>
                    {/* Only show if caution is required */}
                    {formData.freshCautionRequired ? (
                      formData.missionBlock && formData.selectedSection ? (
                        <Select
                          isMulti
                          options={getOtherRoads().map((road) => ({ value: road, label: road }))}
                          value={formData.otherLinesAffected
                            ? formData.otherLinesAffected.split(",").filter(Boolean).map((road) => ({ value: road, label: road }))
                            : []}
                          onChange={(opts) => {
                            setFormData((prev) => ({
                              ...prev,
                              otherLinesAffected: opts.map((opt) => opt.value).join(","),
                            }));
                          }}
                          classNamePrefix="select"
                          placeholder="Select other affected lines/roads"
                          styles={{
                            option: (base, state) => ({
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
                            multiValue: (base) => ({
                              ...base,
                              backgroundColor: "#f3f4f6",
                              color: "black",
                              border: "1px solid #bdbdbd",
                              borderRadius: "4px",
                            }),
                            multiValueLabel: (base) => ({
                              ...base,
                              color: "black",
                              fontSize: "12px",
                              padding: "2px 6px",
                              fontWeight: "bold",
                            }),
                            multiValueRemove: (base) => ({
                              ...base,
                              color: "#ef4444",
                              paddingLeft: "4px",
                              paddingRight: "4px",
                              ":hover": {
                                backgroundColor: "#fee2e2",
                                color: "#b91c1c",
                              },
                            }),
                          }}
                        />
                      ) : (
                        <span className="text-gray-500 text-sm">Select Block Section/Yard to see affected lines</span>
                      )
                    ) : (
                      <span className="text-gray-500 text-sm">Enable Caution Required to select affected lines</span>
                    )}
                  </td>
                </tr>
                <tr>
  <td className="font-semibold p-1.5 text-gray-900">
    PB Required
  </td>
  <td className="bg-white p-1.5" colSpan={3}>
    <div className="flex gap-4 justify-center">
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name="powerBlockRequired"
          value="true"
          checked={formData.powerBlockRequired === true}
          onChange={handleRadioChange}
        />
        <span className="font-semibold text-gray-900">YES</span>
      </label>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name="powerBlockRequired"
          value="false"
          checked={formData.powerBlockRequired === false}
          onChange={handleRadioChange}
        />
        <span className="font-semibold text-gray-900">NO</span>
      </label>
    </div>
    
    {formData.powerBlockRequired && (
      <div className="w-full mt-2 bg-indigo-200 rounded-2xl">
        <div className="flex flex-col gap-2 mt-2 pb-2 p-2">
          <div className="flex flex-row flex-wrap gap-1 items-center">
            <input
              type="number"
              name="powerBlockKmFrom"
              value={formData.powerBlockKmFrom || ""}
              onChange={handleInputChange}
              placeholder="KM From"
              required
              className="flex-1 border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-20 text-lg"
            />
            <span className="text-black font-bold text-lg">to</span>
            <input
              type="number"
              name="powerBlockKmTo"
              value={formData.powerBlockKmTo || ""}
              onChange={handleInputChange}
              placeholder="KM To"
              required
              className="flex-1 border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-20 text-lg"
            />
            <input
              type="text"
              name="powerBlockRoad"
              value={formData.powerBlockRoad || ""}
              onChange={handleInputChange}
              placeholder="Road No."
              required
              className="flex-1 border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black px-1 w-24 text-lg"
            />
          </div>
          
          {/* <div className="w-full">
            <span className="text-black font-bold text-lg">Assign To</span>
            <select
              name="powerBlockDisconnectionAssignTo"
              value={formData.powerBlockDisconnectionAssignTo || ""}
              onChange={(e) => setFormData({
                ...formData,
                powerBlockDisconnectionAssignTo: e.target.value
              })}
              className="border-2 border-[#b71c1c] bg-[#fffbe9] text-black placeholder-black py-1 px-1 w-full text-lg"
              required
            >
              <option value="" disabled>Select Depo</option>
              {depot[formData.selectedSection]?.["TRD"]?.map((depotOption, index) => (
                <option key={index} value={depotOption}>
                  {depotOption}
                </option>
              ))}
            </select>
          </div> */}
        </div>
      </div>
    )}
  </td>
</tr>

 <tr>
  <td className="bg-purple-200 font-semibold p-1.5 text-gray-900">
    S&T Required
  </td>
  <td className="bg-purple-200 p-1.5" colSpan={3}>
    <div className="flex gap-4 justify-center">
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name="sntDisconnectionRequired"
          value="true"
          checked={formData.sntDisconnectionRequired === true}
          onChange={handleRadioChange}
        />
        <span className="font-semibold text-gray-900">YES</span>
      </label>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name="sntDisconnectionRequired"
          value="false"
          checked={formData.sntDisconnectionRequired === false}
          onChange={handleRadioChange}
        />
        <span className="font-semibold text-gray-900">NO</span>
      </label>
    </div>

    {formData.sntDisconnectionRequired && (
      <div className="mt-4 p-2 rounded bg-white space-y-4">
   
     

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Points Section */}
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <h3 className="text-lg font-bold text-gray-800 mb-3">Points</h3>
    <div className="space-y-2">
      {formData.sntDisconnectionRequirements?.[0]?.split(',')?.map((point, index, arr) => (
        <div key={`point-${index}`} className="flex items-center gap-2">
          <input
            type="text"
            value={point}
            onChange={(e) => {
              const points = formData.sntDisconnectionRequirements[0]?.split(',') || [];
              points[index] = e.target.value;
              const newRequirements = [...formData.sntDisconnectionRequirements];
              newRequirements[0] = points.join(',');
              setFormData(prev => ({
                ...prev,
                sntDisconnectionRequirements: newRequirements
              }));
            }}
            placeholder={`Point ${index + 1}`}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {arr.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const points = formData.sntDisconnectionRequirements[0]?.split(',') || [];
                const newPoints = points.filter((_, i) => i !== index);
                const newRequirements = [...formData.sntDisconnectionRequirements];
                newRequirements[0] = newPoints.join(',');
                setFormData(prev => ({
                  ...prev,
                  sntDisconnectionRequirements: newRequirements
                }));
              }}
              className="text-red-500 hover:text-red-700 font-bold px-2"
            >
              ×
            </button>
          )}
        </div>
      )) || (
        <input
          type="text"
          placeholder="Point 1"
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
      )}
      <button
        type="button"
        onClick={() => {
          const currentPoints = formData.sntDisconnectionRequirements?.[0]?.split(',') || [];
          const newPoints = [...currentPoints, ''];
          const newRequirements = [...formData.sntDisconnectionRequirements];
          newRequirements[0] = newPoints.join(',');
          if (newRequirements.length < 2) {
            newRequirements.push(''); // Ensure signals array exists
          }
          setFormData(prev => ({
            ...prev,
            sntDisconnectionRequirements: newRequirements
          }));
        }}
        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
      >
        <span>+</span> Add Point
      </button>
    </div>
  </div>

  {/* Signals Section */}
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <h3 className="text-lg font-bold text-gray-800 mb-3">Signals</h3>
    <div className="space-y-2">
      {formData.sntDisconnectionRequirements?.[1]?.split(',')?.map((signal, index, arr) => (
        <div key={`signal-${index}`} className="flex items-center gap-2">
          <input
            type="text"
            value={signal}
            onChange={(e) => {
              const signals = formData.sntDisconnectionRequirements[1]?.split(',') || [];
              signals[index] = e.target.value;
              const newRequirements = [...formData.sntDisconnectionRequirements];
              newRequirements[1] = signals.join(',');
              setFormData(prev => ({
                ...prev,
                sntDisconnectionRequirements: newRequirements
              }));
            }}
            placeholder={`Signal ${index + 1}`}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {arr.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const signals = formData.sntDisconnectionRequirements[1]?.split(',') || [];
                const newSignals = signals.filter((_, i) => i !== index);
                const newRequirements = [...formData.sntDisconnectionRequirements];
                newRequirements[1] = newSignals.join(',');
                setFormData(prev => ({
                  ...prev,
                  sntDisconnectionRequirements: newRequirements
                }));
              }}
              className="text-red-500 hover:text-red-700 font-bold px-2"
            >
              ×
            </button>
          )}
        </div>
      )) || (
        <input
          type="text"
          placeholder="Signal 1"
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
      <button
        type="button"
        onClick={() => {
          const currentSignals = formData.sntDisconnectionRequirements?.[1]?.split(',') || [];
          const newSignals = [...currentSignals, ''];
          const newRequirements = [...formData.sntDisconnectionRequirements];
          newRequirements[1] = newSignals.join(',');
          if (newRequirements.length < 1) {
            newRequirements.unshift(''); // Ensure points array exists
          }
          setFormData(prev => ({
            ...prev,
            sntDisconnectionRequirements: newRequirements
          }));
        }}
        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
      >
        <span>+</span> Add Signal
      </button>
    </div>
  </div>
</div>
      </div>
    )}
  </td>
</tr>

              </tbody>
            </table>

  <div className="p-4">
  <div className="flex justify-center">
    <button
      type="submit"
      className="bg-[#8ed973] text-gray-900 font-bold text-[20px] py-1 px-6 rounded border-none shadow-sm hover:bg-green-500 transition-colors"
    >
      Submit Revised Request
    </button>
  </div>
</div>
          </form>

          <div className="flex justify-between gap-2 mt-4">
            <button
              className="flex items-center gap-1 bg-lavender border-2 border-gray-800 rounded-[50%] px-4 py-2 text-lg font-bold text-gray-900"style={{color:"black"}}
              onClick={() => (window.location.href = "/edit-request")}
            >
              Back
            </button>  
          <button
  className="flex items-center gap-1 bg-lime-300 border-2 border-gray-800 rounded-[50%] px-6 py-2 text-lg font-bold text-gray-900 hover:bg-lime-400 transition-colors"
  style={{ color: "black" }}
  onClick={() => (window.location.href = "/dashboard")}
>
  Home
</button>
            <button
              className="flex items-center gap-1 bg-orange-300 border-2 border-gray-800 rounded-[50%] px-4 py-2 text-lg font-bold text-gray-900" style={{color:"black"}}
              onClick={() => (window.location.href = "/auth/logout")}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
