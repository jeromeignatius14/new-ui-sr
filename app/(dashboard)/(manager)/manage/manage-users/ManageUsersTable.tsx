"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { deptControllerService } from "@/app/service/api/dept-controller";
import {
  useAddUser,
  useEditUser,
  useDeleteUser,
  useEditJE,
  useDeleteJE,
} from "@/app/service/mutation/dept-controller";
import AddUserModal from "@/app/components/ui/AddUserModal";
import EditUserModal from "@/app/components/ui/EditUserModal";
import { FaChevronDown, FaChevronUp, FaUserPlus } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { set } from "date-fns";

interface User {
  id: string;
  name: string;
  phone: string;
  depot: string;
  role: "SSE" | "JE";
  jes?: JE[];
}

interface JE {
  id: string;
  name: string;
  phone: string;
  depot: string;
  managerId: string;
}

// API data integration

export default function ManageUsersTable() {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [refetchLoading, setRefetchLoading] = useState(false);
  const [jesLoading, setJEsLoading] = useState<string | null>(null);
  const [jesData, setJEsData] = useState<Record<string, JE[]>>({});
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editJEId, setEditJEId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(
    null
  );
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmDeleteJEId, setConfirmDeleteJEId] = useState<string | null>(
    null
  );
  const [deletingJEId, setDeletingJEId] = useState<string | null>(null);

  // Fetch users
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["deptControllerUsers"],
    queryFn: deptControllerService.getUsers,
  });

  const router = useRouter();

  // Mutations
  const addUserMutation = useAddUser();
  const editUserMutation = useEditUser();
  const deleteUserMutation = useDeleteUser();
  const editJEMutation = useEditJE();
  const deleteJEMutation = useDeleteJE();

  // Add user handler
  const handleAddUser = async (formData: any) => {
    await addUserMutation.mutateAsync(formData);
    setAddModalOpen(false);
    setRefetchLoading(true);
    await refetch();
    setRefetchLoading(false);;
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
  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    await deleteUserMutation.mutateAsync(userId);
    setDeletingUserId(null);
    setConfirmDeleteUserId(null);
    setRefetchLoading(true);
    await refetch();
    setRefetchLoading(false);;
  };

  // Edit JE handler
  const handleEditJE = async (formData: any) => {
    if (!editJEId) return;
    await editJEMutation.mutateAsync({ jeId: editJEId, data: formData });
    setEditJEId(null);
    setEditData(null);
    setRefetchLoading(true);
    await refetch();
    setRefetchLoading(false);;
  };

  // Delete JE handler
  const handleDeleteJE = async (jeId: string) => {
    setDeletingJEId(jeId);
    await deleteJEMutation.mutateAsync(jeId);
    setDeletingJEId(null);
    setConfirmDeleteJEId(null);
    setRefetchLoading(true);
    await refetch();
    setRefetchLoading(false);;
  };

  // Get users
  const users: User[] = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center">
      {/* Heading and Add User Button */}
      <div className="w-full flex items-center justify-between bg-[#D6F3FF] py-4 px-8 border-b-2 border-black">
        <h2 className="text-2xl md:text-3xl font-bold text-black">
          Manage Users
        </h2>
        <div className="flex gap-4">
          <button
            className="flex items-center gap-2 bg-[#FFD180] border-2 border-black px-6 py-2 rounded-full font-bold text-black hover:scale-105 transition"
            onClick={() => setAddModalOpen(true)}
          >
            <FaUserPlus /> Add User
          </button>
          <button
            className="flex items-center gap-2 bg-[#FFD180] border-2 border-black px-6 py-2 rounded-full font-bold text-black hover:scale-105 transition"
            onClick={() => router.push('/')}
          >Back</button>
        </div>
      </div>
      {/* Table */}
      <div className="min-h-2 max-h-2">
        {refetchLoading && (
          <div className="p-0 text-sm text-black">Refetching User...</div>
        )}
      </div>

      <div className="w-full mt-8 overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8 text-2xl text-black font-bold">
            Loading SSE...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Error loading users.
          </div>
        ) : (
          <table className="min-w-[700px] w-full text-black text-base border-collapse rounded-xl overflow-hidden border-2 border-black bg-[#F5E7B2]">
            <thead>
              <tr className="bg-[#D6F3FF] text-black font-bold">
                <th className="border-2 border-black px-2 py-2">Sn. no.</th>
                <th className="border-2 border-black px-2 py-2">Designation</th>
                <th className="border-2 border-black px-2 py-2">CUG</th>
                <th className="border-2 border-black px-2 py-2">Depot</th>
                <th className="border-2 border-black px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users && users.length ? (
                users.map((user, idx) => (
                  <React.Fragment key={user.id}>
                    <tr className="hover:bg-[#FFF86B] align-middle">
                      <td
                        className="border border-black px-2 py-3 text-center align-middle"
                        style={{ verticalAlign: "middle" }}
                      >
                        <button
                          className="bg-transparent border-none text-lg flex items-center justify-center mx-auto"
                          style={{ minWidth: 32 }}
                          onClick={async () => {
                            if (expandedUserId === user.id) {
                              setExpandedUserId(null);
                            } else {
                              setExpandedUserId(user.id);
                              if (!jesData[user.id]) {
                                setJEsLoading(user.id);
                                try {
                                  const res =
                                    await deptControllerService.getJEsByUser(
                                      user.id
                                    );
                                  setJEsData((prev) => ({
                                    ...prev,
                                    [user.id]: Array.isArray(res.data)
                                      ? res.data
                                      : [],
                                  }));
                                } finally {
                                  setJEsLoading(null);
                                }
                              }
                            }
                          }}
                        >
                          {expandedUserId === user.id ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                          <span className="ml-1">{idx + 1}</span>
                        </button>
                      </td>
                      <td
                        className="border border-black px-2 py-3 text-center align-middle"
                        style={{ verticalAlign: "middle" }}
                      >
                        {user.name}
                      </td>
                      <td
                        className="border border-black px-2 py-3 text-center align-middle"
                        style={{ verticalAlign: "middle" }}
                      >
                        {user.phone}
                      </td>
                      <td
                        className="border border-black px-2 py-3 text-center align-middle"
                        style={{ verticalAlign: "middle" }}
                      >
                        {user.depot}
                      </td>
                      <td
                        className="border border-black px-2 py-3 text-center align-middle"
                        style={{ verticalAlign: "middle" }}
                      >
                        <div className="flex gap-2 justify-center">
                          <button
                            className="px-3 py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700 font-bold flex items-center gap-1 shadow transition duration-200"
                            onClick={() => {
                              setEditUserId(user.id);
                              setEditData(user);
                            }}
                          >
                            <span className="hidden sm:inline">Edit SSE</span>
                          </button>
                          {confirmDeleteUserId === user.id ? (
                            <button
                              className="px-3 py-3 bg-red-600 text-white rounded-sm hover:bg-red-700 font-bold flex items-center gap-1 shadow transition duration-200"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deletingUserId === user.id}
                            >
                              {deletingUserId === user.id
                                ? "Deleting User..."
                                : "Confirm Delete"}
                            </button>
                          ) : (
                            <button
                              className="px-3 py-3 bg-red-600 text-white rounded-sm hover:bg-red-700 font-bold flex items-center gap-1 shadow transition duration-200"
                              onClick={() => setConfirmDeleteUserId(user.id)}
                            >
                              <span className="hidden sm:inline">
                                Delete SSE
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Accordian for JE */}
                    {expandedUserId === user.id && (
                      <tr className="bg-[#FFFDF5]">
                        <td colSpan={5} className="p-0">
                          <div className="w-full">
                            {jesLoading === user.id ? (
                              <div className="text-center py-4 text-lg text-black">
                                Fetching Junior Engineers...
                              </div>
                            ) : jesData[user.id] &&
                              jesData[user.id].length > 0 ? (
                              <table className="w-full text-black text-base border-collapse">
                                <tbody>
                                  {jesData[user.id].map((je, jeIdx) => (
                                    <tr
                                      key={je.id}
                                      className="border-t border-black align-middle"
                                    >
                                      <td
                                        className="border border-black px-2 py-3 text-center align-middle"
                                        style={{ verticalAlign: "middle" }}
                                      >{`${idx + 1}.${jeIdx + 1}`}</td>
                                      <td
                                        className="border border-black px-2 py-3 text-center align-middle"
                                        style={{ verticalAlign: "middle" }}
                                      >
                                        {je.name}
                                      </td>
                                      <td
                                        className="border border-black px-2 py-3 text-center align-middle"
                                        style={{ verticalAlign: "middle" }}
                                      >
                                        {je.phone}
                                      </td>
                                      <td
                                        className="border border-black px-2 py-3 text-center align-middle"
                                        style={{ verticalAlign: "middle" }}
                                      >
                                        {je.depot}
                                      </td>
                                      <td
                                        className="border border-black px-2 py-3 text-center align-middle"
                                        style={{ verticalAlign: "middle" }}
                                      >
                                        <div className="flex gap-2 justify-center">
                                          <button
                                            className="px-3 py-1 bg-blue-600 text-white rounded-sm hover:bg-blue-700 font-bold flex items-center gap-1 shadow transition duration-200"
                                            onClick={() => {
                                              setEditJEId(je.id);
                                              setEditData(je);
                                            }}
                                          >
                                            <span className="hidden sm:inline">
                                              Edit JE
                                            </span>
                                          </button>
                                          {confirmDeleteJEId === je.id ? (
                                            <button
                                              className="px-3 py-1 bg-red-600 text-white rounded-sm hover:bg-red-700 font-bold flex items-center gap-1 shadow transition duration-200"
                                              onClick={() =>
                                                handleDeleteJE(je.id)
                                              }
                                              disabled={deletingJEId === je.id}
                                            >
                                              {deletingJEId === je.id
                                                ? "Deleting JE..."
                                                : "Confirm Delete"}
                                            </button>
                                          ) : (
                                            <button
                                              className="px-3 py-1 bg-red-600 text-white rounded-sm hover:bg-red-700 font-bold flex items-center gap-1 shadow transition duration-200"
                                              onClick={() =>
                                                setConfirmDeleteJEId(je.id)
                                              }
                                            >
                                              <span className="hidden sm:inline">
                                                Delete JE
                                              </span>
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="text-center py-4 text-lg text-black">
                                No Junior Engineer found.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr className="bg-[#D6F3FF] text-black font-bold">
                  <td colSpan={5} className="p-2 text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Add User Modal */}
      <AddUserModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddUser}
        users={users.map((u) => ({ id: u.id, name: u.name }))}
      />
      {/* Edit User Modal */}
      {editUserId && (
        <EditUserModal
          isOpen={true}
          onClose={() => {
            setEditUserId(null);
            setEditData(null);
          }}
          onSubmit={handleEditUser}
          users={users.map((u) => ({ id: u.id, name: u.name }))}
          initialData={editData}
        />
      )}
      {/* Edit JE Modal */}
      {editJEId && (
        <EditUserModal
          isOpen={true}
          onClose={() => {
            setEditJEId(null);
            setEditData(null);
          }}
          onSubmit={handleEditJE}
          users={users.map((u) => ({ id: u.id, name: u.name }))}
          initialData={editData}
          isJE={true}
        />
      )}
      <div className="text-[20px] text-gray-600 mt-2 border-t border-black pt-1">
        © {new Date().getFullYear()} Indian Railways. All Rights Reserved.
      </div>
    </div>
  );
}
