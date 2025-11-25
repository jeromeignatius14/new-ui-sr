"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { trafficControllerService } from "@/app/service/api/traffic-controller";

import {
  useDeleteUser,
  useAddUser,
  useEditUser,
 
} from "@/app/service/mutation/traffic-controller";
import AddSmModal from "@/app/components/ui/AddSmModal";
import EditStationMasterModal from "@/app/components/ui/EditStationMasterModal";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";
import { useSession } from "next-auth/react";
import { FaUserPlus } from "react-icons/fa";
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  phone: string;
  depot: string;
  role: "SM";
}

export default function ManageUsersTable() {
  const { data: session } = useSession();
  const [refetchLoading, setRefetchLoading] = useState(false);
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<{id: string; name: string} | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  
  // Fetch users
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trafficControllerUsers"],
    queryFn: trafficControllerService.getUsers,
  });

  const router = useRouter();

  // Mutations
  const addUserMutation = useAddUser();
  const editUserMutation = useEditUser();
  const deleteUserMutation = useDeleteUser();

  // Add user handler
  const handleAddUser = async (formData: any) => {
    await addUserMutation.mutateAsync(formData);
    setAddModalOpen(false);
    setRefetchLoading(true);
    await refetch();
    setRefetchLoading(false);
  };

  // Edit user handler
  const handleEditUser = async (formData: any) => {
    if (!editUserId) return;
    await editUserMutation.mutateAsync({ userId: editUserId, data: formData });
    setEditUserId(null);
    setEditData(null);
    setRefetchLoading(true);
    await refetch();
    setRefetchLoading(false);
  };

  // Delete user handler
  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;
    setDeletingUserId(deleteModalUser.id);
    
    try {
      await deleteUserMutation.mutateAsync(deleteModalUser.id);
      
      // Update local state instead of refetching
      if (data?.data) {
        const updatedUsers = data.data.filter((user: User) => user.id !== deleteModalUser.id);
        queryClient.setQueryData(["trafficControllerUsers"], { ...data, data: updatedUsers });
      }
    } finally {
      setDeletingUserId(null);
      setDeleteModalUser(null);
    }
  };

  // Filter users to only show those with role "SM"
  const users: User[] = Array.isArray(data?.data) 
    ? data.data.filter((user: User) => user.role === "SM")
    : [];

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center">
      {/* Heading and Add User Button */}
      <div className="w-full flex items-center justify-between bg-[#D6F3FF] py-4 px-8 border-b-2 border-black">
        <h2 className="text-2xl md:text-3xl font-bold text-black">
          Manage Station Masters
        </h2>
        <div className="flex gap-4">
          <button
            className="flex items-center gap-2 bg-[#FFD180] border-2 border-black px-6 py-1 rounded-full font-bold text-black hover:scale-105 transition"
            onClick={() => setAddModalOpen(true)}
          >
            <FaUserPlus /> Add Station Master
          </button>
          <button
            className="flex items-center gap-2 bg-[#FFD180] border-2 border-black px-6 py-1 rounded-full font-bold text-black hover:scale-105 transition"
            onClick={() => router.push('/')}
          >
            Back
          </button>
        </div>
      </div>
      
      {/* Loading Indicator */}
      <div className="min-h-2 max-h-2">
        {refetchLoading && (
          <div className="p-0 text-sm text-black">Refetching Users...</div>
        )}
      </div>

      {/* Users Table */}
      <div className="max-7xl mx-auto mt-8 overflow-x-auto w-[90%] border-2 border-black rounded-xl">
        {isLoading ? (
          <div className="text-center py-8 text-2xl text-black font-bold">
            Loading Station Masters...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Error loading station masters.
          </div>
        ) : (
          <table className="min-w-[700px] w-full text-black text-base border-collapse rounded-xl overflow-hidden border-2 border-black bg-[#F5E7B2]">
            <thead>
              <tr className="bg-[#D6F3FF] text-black font-bold">
                <th className="border-2 border-black px-2 py-1">Sr. no.</th>
                <th className="border-2 border-black px-2 py-1">Name</th>
                <th className="border-2 border-black px-2 py-1">CUG</th>
                <th className="border-2 border-black px-2 py-1">Depot</th>
                <th className="border-2 border-black px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {users && users.length ? (
                users.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-[#FFF86B] align-middle">
                    <td
                      className="border border-black px-2 py-1 text-center align-middle"
                      style={{ verticalAlign: "middle" }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      className="border border-black px-2 py-1 text-center align-middle"
                      style={{ verticalAlign: "middle" }}
                    >
                      {user.name}
                    </td>
                    <td
                      className="border border-black px-2 py-1 text-center align-middle"
                      style={{ verticalAlign: "middle" }}
                    >
                      {user.phone}
                    </td>
                    <td
                      className="border border-black px-2 py-1 text-center align-middle"
                      style={{ verticalAlign: "middle" }}
                    >
                      {user.depot}
                    </td>
                    <td
                      className="border border-black px-2 py-1 text-center align-middle"
                      style={{ verticalAlign: "middle" }}
                    >
                      <div className="flex gap-2 justify-center">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded-sm hover:bg-blue-700 font-bold flex items-center gap-1 shadow transition duration-200"
                          onClick={() => {
                            setEditUserId(user.id);
                            setEditData(user);
                          }}
                        >
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded-sm hover:bg-red-700 font-bold flex items-center gap-1 shadow transition duration-200"
                          onClick={() => setDeleteModalUser({ id: user.id, name: user.name })}
                        >
                          <span className="hidden sm:inline">
                            Delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center">
                    No station masters found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
{/* <AddSmModal
  isOpen={addModalOpen}
  onClose={() => setAddModalOpen(false)}
  onSubmit={handleAddUser}
  users={users.map((u) => ({ id: u.id, name: u.name, depot: u.depot }))}
  department={session?.user?.department as "TRD" | "S&T" | "ENGG"}
  // defaultRole="SM"
/> */}
<AddSmModal
  isOpen={addModalOpen}
  onClose={() => setAddModalOpen(false)}
  onSubmit={handleAddUser}
  department={session?.user?.department as "TRD" | "S&T" | "ENGG"}
/>

      {/* Edit User Modal */}
   {editUserId && (
  <EditStationMasterModal
    isOpen={true}
    onClose={() => {
      setEditUserId(null);
      setEditData(null);
    }}
    onSubmit={handleEditUser}
    users={users.map((u) => ({ id: u.id, name: u.name, depot: u.depot }))}
    initialData={editData}
    department={session?.user?.department as "TRD" | "S&T" | "ENGG"}
  />
)}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteModalUser}
        onClose={() => setDeleteModalUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete Station Master"
        message={`Are you sure you want to delete ${deleteModalUser?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={!!deletingUserId}
      />
      
      <div className="text-[15px] text-gray-600 mt-2 border-t border-black pt-1 max-w-5xl w-[90%] mx-auto text-center">
        © {new Date().getFullYear()} Indian Railways. All Rights Reserved.
      </div>
    </div>
  );
}