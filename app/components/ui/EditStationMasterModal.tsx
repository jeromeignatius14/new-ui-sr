import React, { useState, useEffect } from "react";
import { depotOnLocation, departmentDepot } from "@/app/lib/store";
import { FaEdit } from "react-icons/fa";

type Department = "TRD" | "S&T" | "ENGG";

interface EditStationMasterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData: any;
    users: Array<{ id: string; name: string; depot?: string }>;
    department?: Department;
}

const EditStationMasterModal: React.FC<EditStationMasterModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData, 
    users, 
    department = "ENGG" as Department 
}) => {
    const [name, setName] = useState(initialData?.name || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [depot, setDepot] = useState(initialData?.depot || "");
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [phoneExists, setPhoneExists] = useState<null | boolean>(null);
    const [checkingPhone, setCheckingPhone] = useState(false);
    const [emailExists, setEmailExists] = useState<null | boolean>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [phoneChanged, setPhoneChanged] = useState(false);
    const [emailChanged, setEmailChanged] = useState(false);
    const [nameChanged, setNameChanged] = useState(false);
    const [depotChanged, setDepotChanged] = useState(false);

    useEffect(() => {
        if(editing) return;
        setName(initialData?.name || "");
        setEmail(initialData?.email || "");
        setPhone(initialData?.phone || "");
        setDepot(initialData?.depot || "");
        setPhoneChanged(false);
        setEmailChanged(false);
        setNameChanged(false);
        setDepotChanged(false);
    }, [initialData, isOpen]);

    useEffect(() => {
        let cancel: (() => void) | undefined;
        if (phoneChanged && phone && phone.length === 10) {
            setCheckingPhone(true);
            (async () => {
                try {
                    const source = (await import("axios")).default.CancelToken.source();
                    cancel = source.cancel;
                    const axiosInstance = (await import("@/app/service/api/axios")).default;
                    const res = await axiosInstance.get(`/api/traffic-controller/check-phone?phone=${phone}`, { cancelToken: source.token });
                    setPhoneExists(res.data.data.exists);
                } catch (err) {
                    setPhoneExists(null);
                } finally {
                    setCheckingPhone(false);
                }
            })();
        } else {
            setPhoneExists(null);
        }
        return () => {
            if (cancel) cancel();
        };
    }, [phone, phoneChanged]);

    useEffect(() => {
        let cancel: (() => void) | undefined;
        let debounceTimer: NodeJS.Timeout;
        if (emailChanged && email) {
            setEmailExists(null);
            setCheckingEmail(true);
            debounceTimer = setTimeout(() => {
                (async () => {
                    try {
                        const source = (await import("axios")).default.CancelToken.source();
                        cancel = source.cancel;
                        const axiosInstance = (await import("@/app/service/api/axios")).default;
                        const res = await axiosInstance.get(`/api/traffic-controller/check-email?email=${encodeURIComponent(email)}`, { cancelToken: source.token });
                        setEmailExists(res.data.data.exists);
                    } catch (err) {
                        setEmailExists(null);
                    } finally {
                        setCheckingEmail(false);
                    }
                })();
            }, 500); // 500ms debounce
        } else {
            setEmailExists(null);
        }
        return () => {
            if (cancel) cancel();
            if (debounceTimer) clearTimeout(debounceTimer);
        };
    }, [email, emailChanged]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setName("");
            setEmail("");
            setPhone("");
            setDepot("");
            setError(null);
            setPhoneExists(null);
            setEmailExists(null);
            setPhoneChanged(false);
            setEmailChanged(false);
            setNameChanged(false);
            setDepotChanged(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const hasChanges = phoneChanged || emailChanged || nameChanged || depotChanged;
    const canSubmit = hasChanges && 
                     !checkingPhone && 
                     !checkingEmail && 
                     phoneExists !== true && 
                     emailExists !== true && 
                     name && 
                     phone && 
                     email && 
                     depot;

    return (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 backdrop-blur-sm text-black">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                    <FaEdit /> Edit Station Master
                </h2>
                <form
                    className="space-y-4"
                    onSubmit={async e => {
                        e.preventDefault();
                        if (!canSubmit) return;
                        
                        setError(null);
                        try {
                            setEditing(true);
                            await onSubmit({ 
                                name, 
                                email, 
                                phone, 
                                depot,
                                role: "SM" // Always set role as SM
                            });
                            setEditing(false);
                        } catch (err: any) {
                            setError(err?.message || "Error updating station master. Please try again.");
                            setEditing(false);
                        }
                    }}
                >
                    {error && (
                        <div className="text-center text-red-600 font-bold text-base mb-2">{error}</div>
                    )}
                    
                    <div>
                        <label className="block font-semibold mb-1">Name</label>
                        <input
                            className="w-full border border-black rounded px-2 py-1"
                            value={name}
                            onChange={e => {
                                setName(e.target.value);
                                setNameChanged(e.target.value !== initialData?.name);
                            }}
                            required
                            placeholder="Enter station master name"
                        />
                    </div>
                    
                    <div>
                        <label className="block font-semibold mb-1">Email</label>
                        <input
                            className="w-full border border-black rounded px-2 py-1"
                            type="email"
                            value={email}
                            onChange={e => {
                                setEmail(e.target.value);
                                setEmailChanged(e.target.value !== initialData?.email);
                            }}
                            required
                            placeholder="Enter email address"
                        />
                        {checkingEmail && <span className="text-sm text-gray-500 ml-2">Checking...</span>}
                        {emailExists === true && <span className="text-sm text-red-600 ml-2">Email already exists</span>}
                        {emailExists === false && <span className="text-sm text-green-600 ml-2">Email available</span>}
                    </div>
                    
                    <div>
                        <label className="block font-semibold mb-1">CUG Number</label>
                        <input
                            className="w-full border border-black rounded px-2 py-1"
                            value={phone}
                            onChange={e => {
                                const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                                setPhone(value);
                                setPhoneChanged(value !== initialData?.phone);
                            }}
                            required
                            pattern="[0-9]{10}"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="Enter 10-digit CUG number"
                        />
                        {checkingPhone && <span className="text-sm text-gray-500 ml-2">Checking...</span>}
                        {phoneExists === true && <span className="text-sm text-red-600 ml-2">CUG number already exists</span>}
                        {phoneExists === false && <span className="text-sm text-green-600 ml-2">CUG number available</span>}
                    </div>
                    
<div>
  <label className="block font-semibold mb-1">Station Code</label>
  <input
    type="text"
    className="w-full border border-black rounded px-2 py-1"
    value={depot}
    onChange={e => {
      const target = e.target as HTMLInputElement;
      // Allow only alphabets and single spaces
      let filteredValue = target.value.replace(/[^a-zA-Z\s]/g, '');
      // Prevent multiple consecutive spaces
      filteredValue = filteredValue.replace(/\s+/g, ' ');
      setDepot(filteredValue);
      // Track if depot changed from initial data
      const trimmedValue = filteredValue.trim();
      setDepotChanged(trimmedValue !== initialData?.depot);
    }}
    onBlur={e => {
      const target = e.target as HTMLInputElement;
      // Final cleanup on blur - trim whitespace
      const trimmedValue = target.value.trim();
      setDepot(trimmedValue);
      // Update depotChanged after trimming
      setDepotChanged(trimmedValue !== initialData?.depot);
    }}
    onKeyDown={e => {
      const target = e.target as HTMLInputElement;
      // Prevent space at the beginning
      if (e.key === ' ' && (!target.value || target.value.endsWith(' '))) {
        e.preventDefault();
      }
    }}
    placeholder="Enter Station Code"
    required
  />
</div>

                    <div className="flex justify-center gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded transition duration-300 font-medium"
                            disabled={editing}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-300 font-medium ${
                                !canSubmit || editing ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={!canSubmit || editing}
                        >
                            {editing ? "Updating..." : "Update Station Master"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStationMasterModal;