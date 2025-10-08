import React, { useState, useEffect } from "react";
import { depotOnLocation } from "@/app/lib/store";
import { FaEdit } from "react-icons/fa";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData: any;
    users: Array<{ id: string; name: string }>;
    isJE?: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSubmit, initialData, users, isJE }) => {
    const [name, setName] = useState(initialData?.name || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [depot, setDepot] = useState(initialData?.depot || "");
    const [managerId, setManagerId] = useState(initialData?.managerId || "");
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        setName(initialData?.name || "");
        setEmail(initialData?.email || "");
        setPhone(initialData?.phone || "");
        setDepot(initialData?.depot || "");
        setManagerId(initialData?.managerId || "");
    }, [initialData]);

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
                            await onSubmit({ name, email, phone, depot, managerId: isJE ? managerId : undefined });
                            setEditing(false);
                        } catch (err: any) {
                            setError(err?.message || "Error submitting form. Please try again.");
                        }
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
                            disabled={true}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">CUG Number</label>
                        <input
                            className="w-full border border-black rounded px-2 py-1"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            required
                            pattern="[0-9]{10}"
                            title="Phone number must be 10 digits"
                            disabled={true}
                        />
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
                                (depots as string[]).map(dep => (
                                    <option key={dep} value={dep}>{dep}</option>
                                ))
                            )}
                        </select>
                    </div>
                    {isJE && (
                        <div>
                            <label className="block font-semibold mb-1">Manager</label>
                            <select
                                className="w-full border border-black rounded px-2 py-1"
                                value={managerId}
                                onChange={e => setManagerId(e.target.value)}
                                required
                            >
                                <option value="">Select Manager</option>
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
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-300"
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

