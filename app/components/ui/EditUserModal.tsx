import React, { useState, useEffect } from "react";
import { depotOnLocation, departmentDepot } from "@/app/lib/store";
import { FaEdit } from "react-icons/fa";

type Department = "TRD" | "S&T" | "ENGG";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData: any;
    users: Array<{ id: string; name: string }>;
    isJE?: boolean;
    department?: Department; // User's department
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSubmit, initialData, users, isJE, department = "ENGG" as Department }) => {
    const [name, setName] = useState(initialData?.name || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [depot, setDepot] = useState(initialData?.depot || "");
    const [managerId, setManagerId] = useState(initialData?.managerId || "");
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
    const [managerChanged, setManagerChanged] = useState(false);
    const [selectedManager, setSelectedManager] = useState<{ id: string; name: string; depot?: string } | null>(null);

    useEffect(() => {
        if(editing) return;
        setName(initialData?.name || "");
        setEmail(initialData?.email || "");
        setPhone(initialData?.phone || "");
        setDepot(initialData?.depot || "");
        setManagerId(initialData?.managerId || "");
        setPhoneChanged(false);
        setEmailChanged(false);
        setNameChanged(false);
        setDepotChanged(false);
        setManagerChanged(false);
        
        // If it's a JE, find the selected manager
        if (isJE && initialData?.managerId) {
            const manager = users.find(u => u.id === initialData.managerId);
            setSelectedManager(manager || null);
        } else {
            setSelectedManager(null);
        }
    }, [initialData, isJE, users]);

    useEffect(() => {
        let cancel: (() => void) | undefined;
        if (phoneChanged && phone && phone.length === 10) {
            setCheckingPhone(true);
            (async () => {
                try {
                    const source = (await import("axios")).default.CancelToken.source();
                    cancel = source.cancel;
                    const axiosInstance = (await import("@/app/service/api/axios")).default;
                    const res = await axiosInstance.get(`/api/dept-controller/check-phone?phone=${phone}`, { cancelToken: source.token });
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
                        const res = await axiosInstance.get(`/api/dept-controller/check-email?email=${encodeURIComponent(email)}`, { cancelToken: source.token });
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



    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 backdrop-blur-sm text-black">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                    <FaEdit /> Edit User
                </h2>
                <form
                    className="space-y-4"
                    onSubmit={async e => {
                        e.preventDefault();
                        setError(null);
                        try {
                            setEditing(true);
                            // If it's a JE, use the selectedManager's depot
                            const submissionDepot = isJE && selectedManager ? selectedManager.depot : depot;
                            
                            await onSubmit({ 
                                name, 
                                email, 
                                phone, 
                                depot: submissionDepot, 
                                managerId: isJE ? managerId : undefined 
                            });
                            setEditing(false);
                        } catch (err: any) {
                            setError(err?.message || "Error submitting form. Please try again.");
                        }
                        setEditing(false);
                    }}
                >
                    {error && (
                        <div className="text-center text-red-600 font-bold text-base mb-2">{error}</div>
                    )}
                    <div>
                        <label className="block font-semibold mb-1">Designation (Name)</label>
                        <input
                            className="w-full border border-black rounded px-2 py-1"
                            value={name}
                            onChange={e => {
                                setName(e.target.value);
                                setNameChanged(e.target.value !== initialData?.name);
                            }}
                            required
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
                        />
                        {checkingEmail && <span className="text-base font-bold text-gray-500 ml-2">Checking...</span>}
                        {emailExists === true && <span className="text-base font-bold text-red-600 ml-2">Email already exists</span>}
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">CUG Number</label>
                        <input
                            className="w-full border border-black rounded px-2 py-1"
                            value={phone}
                            onChange={e => {
                                setPhone(e.target.value);
                                setPhoneChanged(e.target.value !== initialData?.phone);
                            }}
                            required
                            pattern="[0-9]{10}"
                            inputMode="numeric"
                            onInput={e => {
                                const input = e.target as HTMLInputElement;
                                input.value = input.value.replace(/[^0-9]/g, "");
                            }}
                            maxLength={10}
                            title="Phone number must be 10 digits"
                        />
                        {checkingPhone && <span className="text-base font-bold text-gray-500 ml-2">Checking...</span>}
                        {phoneExists === true && <span className="text-base font-bold text-red-600 ml-2">CUG already exists</span>}
                        {phoneExists === false && <span className="text-base font-bold text-green-600 ml-2">CUG available</span>}
                    </div>
                    {!isJE && (
                        <div>
                            <label className="block font-semibold mb-1">Depot</label>
                            <select
                                className="w-full border border-black rounded px-2 py-1"
                                value={depot}
                                onChange={e => {
                                    setDepot(e.target.value);
                                    setDepotChanged(e.target.value !== initialData?.depot);
                                }}
                                required
                            >
                                <option value="">Select Depot</option>
                                {departmentDepot[department] ? 
                                    departmentDepot[department].map((dep: string) => (
                                        <option key={dep} value={dep}>{dep}</option>
                                    ))
                                    :
                                    Object.entries(depotOnLocation).map(([loc, depots]) =>
                                        (depots as string[]).map(dep => (
                                            <option key={dep} value={dep}>{dep}</option>
                                        ))
                                    )
                                }
                            </select>
                        </div>
                    )}
                    {isJE && (
                        <div>
                            <label className="block font-semibold mb-1">Managed by SSE</label>
                            <select
                                className="w-full border border-black rounded px-2 py-1"
                                value={managerId}
                                onChange={e => {
                                    const newManagerId = e.target.value;
                                    setManagerId(newManagerId);
                                    setManagerChanged(newManagerId !== initialData?.managerId);
                                    
                                    // Set the selected manager
                                    const selectedUser = users.find(u => u.id === newManagerId);
                                    setSelectedManager(selectedUser || null);
                                }}
                                required
                            >
                                <option value="">Select SSE</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            {selectedManager && (
                                <div className="mt-2 text-sm font-medium text-blue-600">
                                    Selected manager depot: {selectedManager.depot || "Not available"}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex justify-center gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded transition duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-300 ${
                                editing || 
                                (!phoneChanged && !emailChanged && !nameChanged && (!isJE && !depotChanged) && !(isJE && managerChanged)) || 
                                checkingPhone || 
                                phoneExists === true || 
                                checkingEmail || 
                                emailExists === true || 
                                !name || 
                                !phone || 
                                !email || 
                                (!isJE && !depot) || 
                                (isJE && !managerId) ? 
                                "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={
                                editing || 
                                (!phoneChanged && !emailChanged && !nameChanged && (!isJE && !depotChanged) && !(isJE && managerChanged)) || 
                                checkingPhone || 
                                phoneExists === true || 
                                checkingEmail || 
                                emailExists === true || 
                                !name || 
                                !phone || 
                                !email || 
                                (!isJE && !depot) || 
                                (isJE && !managerId)
                            }
                        >
                            {editing ? "Editing User..." : "Edit User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;

