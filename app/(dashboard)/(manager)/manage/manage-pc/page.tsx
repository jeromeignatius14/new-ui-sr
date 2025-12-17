"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
  useDeleteStation,
  useAddStation,
} from "@/app/service/mutation/dept-controller";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";
import { useSession } from "next-auth/react";
import { FaUserPlus } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import AddPcModal from "@/app/components/ui/AddPcModal";
import { deptControllerService } from "@/app/service/api/dept-controller";

interface User {
  id: string;
  depot: string;
}

export default function ManagePcTable() {
  const { data: session } = useSession();
  const [refetchLoading, setRefetchLoading] = useState(false);
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalUser, setDeleteModalUser] = useState<{id: string; name: string} | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  
  // Fetch users
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["deptControllerStation"],
    queryFn: deptControllerService.getStation,
  });

  const router = useRouter();

  // Mutations
  const addUserMutation = useAddStation();
  const deleteUserMutation = useDeleteStation();

  // Add user handler
  const handleAddUser = async (formData: any) => {
    await addUserMutation.mutateAsync(formData);
    setAddModalOpen(false);
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

  // Filter users - adjust filter based on your actual data structure
  const users: User[] = Array.isArray(data?.data) 
    ? data.data
    : [];

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center">
      {/* Heading and Add User Button */}
      <div className="w-full flex items-center justify-between bg-[#D6F3FF] py-4 px-8 border-b-2 border-black">
        <h2 className="text-2xl md:text-3xl font-bold text-black">
          Manage Stations
        </h2>
        <div className="flex gap-4">
          <button
            className="flex items-center gap-2 bg-[#FFD180] border-2 border-black px-6 py-1 rounded-full font-bold text-black hover:scale-105 transition"
            onClick={() => setAddModalOpen(true)}
          >
            <FaUserPlus /> Add Station
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
          <div className="p-0 text-sm text-black">Refetching Stations...</div>
        )}
      </div>

      {/* Stations Table */}
      <div className="max-7xl mx-auto mt-8 overflow-x-auto w-[90%] border-2 border-black rounded-xl">
        {isLoading ? (
          <div className="text-center py-8 text-2xl text-black font-bold">
            Loading Stations...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Error loading stations.
          </div>
        ) : (
          <table className="min-w-[700px] w-full text-black text-base border-collapse rounded-xl overflow-hidden border-2 border-black bg-[#F5E7B2]">
            <thead>
              <tr className="bg-[#D6F3FF] text-black font-bold">
                <th className="border-2 border-black px-2 py-1">S. No.</th>
                <th className="border-2 border-black px-2 py-1">Station Code</th>
                <th className="border-2 border-black px-2 py-1">Actions</th>
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
                      {user.depot}
                    </td>
                    <td
                      className="border border-black px-2 py-1 text-center align-middle"
                      style={{ verticalAlign: "middle" }}
                    >
                      <div className="flex gap-2 justify-center">
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded-sm hover:bg-red-700 font-bold flex items-center gap-1 shadow transition duration-200"
                          onClick={() => setDeleteModalUser({ id: user.id, name: user.depot })}
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
                  <td colSpan={3} className="p-4 text-center">
                    No stations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AddPcModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddUser}
      />

  

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteModalUser}
        onClose={() => setDeleteModalUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete Station"
        message={`Are you sure you want to delete station "${deleteModalUser?.name}"? This action cannot be undone.`}
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