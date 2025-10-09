import React, { useState, useEffect } from "react";
import { depotOnLocation } from "@/app/lib/store";
import { FaUserPlus } from "react-icons/fa";
import axiosInstance from "@/app/service/api/axios";
import axios from "axios";
import { set } from "date-fns";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    users: Array<{ id: string; name: string }>;
}

export default function AddUserModal({ isOpen, onClose, onSubmit, users }: AddUserModalProps) {

    const [role, setRole] = useState<"SSE" | "JE">("SSE");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [depot, setDepot] = useState("");
    const [managerId, setManagerId] = useState("");
    const [phoneExists, setPhoneExists] = useState<null | boolean>(null);
    const [checkingPhone, setCheckingPhone] = useState(false);
    const [emailExists, setEmailExists] = useState<null | boolean>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const resetForm = () => {
        setRole("SSE");
        setName("");
        setEmail("");
        setPhone("");
        setDepot("");
        setManagerId("");
        setPhoneExists(null);
        setCheckingPhone(false);
        setSubmitting(false);
        setError(null);
    }

    useEffect(() => {
        let cancel: (() => void) | undefined;
        if (phone && phone.length === 10) {
            setCheckingPhone(true);
            (async () => {
                try {
                    const source = axios.CancelToken.source();
                    cancel = source.cancel;
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
    }, [phone]);

        useEffect(() => {
            let cancel: (() => void) | undefined;
            let debounceTimer: NodeJS.Timeout;
            if (email) {
                setEmailExists(null);
                setCheckingEmail(true);
                debounceTimer = setTimeout(() => {
                    (async () => {
                        try {
                            const source = axios.CancelToken.source();
                            cancel = source.cancel;
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
        }, [email]);

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 backdrop-blur-sm text-black">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                    <FaUserPlus /> Add User
                </h2>
                {error && (
                    <div className="text-center text-red-600 font-bold text-base mb-2">{error}</div>
                )}
                <form
                    className="space-y-4"
                    onSubmit={async e => {
                        e.preventDefault();
                        setSubmitting(true);
                        try {
                            await onSubmit({ name, email, phone, depot, role, managerId: role === "JE" ? managerId : undefined });
                            resetForm();
                        } catch (error: any) {
                            console.error(error);
                            setError("Failed to add user");
                        }
                        setSubmitting(false);
                    }}
                >
                    <div>
                        <label className="block font-semibold mb-1">Role</label>
                        <select
                            className="w-full border border-black rounded px-2 py-1"
                            value={role}
                            onChange={e => setRole(e.target.value as "SSE" | "JE")}
                        >
                            <option value="SSE">SSE</option>
                            <option value="JE">JE</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Designation (Name)</label>
                        <input
                            className="w-full border border-black rounded px-2 py-1"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Email</label>
                        <input
                            className="w-full border border-black rounded px-2 py-1"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
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
                            onChange={e => setPhone(e.target.value)}
                            required
                            pattern="[0-9]{10}"
                            maxLength={10}
                            title="Phone number must be 10 digits"
                        />
                        {checkingPhone && <span className="text-base font-bold text-gray-500 ml-2">Checking...</span>}
                        {phoneExists === true && <span className="text-base font-bold text-red-600 ml-2">CUG already exists</span>}
                        {phoneExists === false && <span className="text-base font-bold text-green-600 ml-2">CUG available</span>}
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Depot</label>
                        <select
                            className="w-full border border-black rounded px-2 py-1"
                            value={depot}
                            onChange={e => setDepot(e.target.value)}
                            required
                        >
                            <option value="">Select Depot</option>
                            {Object.entries(depotOnLocation).map(([loc, depots]) =>
                                depots.map(dep => (
                                    <option key={dep} value={dep}>{dep}</option>
                                ))
                            )}
                        </select>
                    </div>
                    {role === "JE" && (
                        <div>
                            <label className="block font-semibold mb-1">Managed by SSE</label>
                            <select
                                className="w-full border border-black rounded px-2 py-1"
                                value={managerId}
                                onChange={e => setManagerId(e.target.value)}
                                required
                            >
                                <option value="">Select SSE</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex justify-center gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded transition duration-300"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-300 ${submitting || checkingPhone || phoneExists === true || checkingEmail || emailExists === true || !name || !phone || !depot || !email || (role === "JE" && !managerId) ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={submitting || checkingPhone || phoneExists === true || checkingEmail || emailExists === true || !name || !phone || !depot || !email || (role === "JE" && !managerId)}
                        >
                            {submitting ? "Adding User..." : "Add User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
