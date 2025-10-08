"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader } from "@/app/components/ui/Loader";
import { depotOnLocation } from "@/app/lib/store";

// Queries to list existing officers (paginated) based on current role
import {
  useBranchOfficers,
  useSeniorOfficers,
  useJuniorOfficers,
  useAvailableSeniorOfficers,
  useAvailableJuniorOfficers,
} from "@/app/service/query/officer";

// Mutations to create or delete officers/users
import {
  useCreateOfficer,
  useDeleteOfficer,
} from "@/app/service/mutation/officer";

import { useQueryClient } from "@tanstack/react-query";

// Helper function to determine default role based on creator's role
function getDefaultRoleForCreator(creatorRole?: string): string {
  switch (creatorRole) {
    case "BRANCH_OFFICER":
      return "SENIOR_OFFICER";
    case "SENIOR_OFFICER":
      return "JUNIOR_OFFICER";
    case "JUNIOR_OFFICER":
      return "USER";
    default:
      return "USER";
  }
}

// Helper function to get available roles based on creator's role
function getAvailableRolesForCreator(creatorRole?: string): string[] {
  switch (creatorRole) {
    case "BRANCH_OFFICER":
      return ["SENIOR_OFFICER", "JUNIOR_OFFICER", "USER"];
    case "SENIOR_OFFICER":
      return ["JUNIOR_OFFICER", "USER"];
    case "JUNIOR_OFFICER":
      return ["USER"];
    default:
      return ["USER"];
  }
}

// Helper function to get role display name
function getRoleDisplayName(role: string): string {
  switch (role) {
    case "SENIOR_OFFICER":
      return "Senior Officer";
    case "JUNIOR_OFFICER":
      return "Junior Officer";
    case "USER":
      return "User";
    default:
      return role;
  }
}

// Helper function to get the appropriate title based on user role
function getPageTitle(userRole?: string): string {
  switch (userRole) {
    case "BRANCH_OFFICER":
      return "Manage Officers & Users";
    case "SENIOR_OFFICER":
      return "Manage Junior Officers & Users";
    case "JUNIOR_OFFICER":
      return "Manage Users";
    default:
      return "Manage Users";
  }
}

// Helper function to get the appropriate button text based on user role
function getCreateButtonText(userRole?: string): string {
  switch (userRole) {
    case "BRANCH_OFFICER":
      return "Add Officer/User";
    case "SENIOR_OFFICER":
      return "Add Junior Officer/User";
    case "JUNIOR_OFFICER":
      return "Add User";
    default:
      return "Add User";
  }
}

// Types for user and officers
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  location: string;
  depot?: string;
  managerId?: string;
  manager?: {
    id: string;
    name: string;
    role: string;
  };
}

interface Officer {
  id: string;
  name: string;
  email: string;
  role?: string;
  department: string;
  phone: string;
  location: string;
  depot?: string;
  managerId?: string;
  manager?: {
    id: string;
    name: string;
    role: string;
  };
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  userRole: string;
}

const CreateUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  userRole,
}: CreateUserModalProps) => {
  const { data: session } = useSession();

  // Initialize form state with role from prop
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: session?.user.department || "",
    phone: "",
    location: session?.user.location || "",
    depot: session?.user.role === "USER" ? session?.user.depot : "OVERALL",
    role: "",
    seniorOfficerId: "",
    juniorOfficerId: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Get available senior officers if creating as a branch officer
  const { data: seniorOfficersData } = useAvailableSeniorOfficers();

  // Get available junior officers based on selected senior officer
  const { data: juniorOfficersData } = useAvailableJuniorOfficers(
    formData.seniorOfficerId
  );

  // For Senior Officer creating Juniors
  const { data: juniorOfficersForSenior } = useAvailableJuniorOfficers(
    session?.user.role === "SENIOR_OFFICER" ? session?.user.id : undefined
  );

  // Get dropdown options
  const seniorOfficers = seniorOfficersData?.data || [];
  const juniorOfficers = juniorOfficersData?.data || [];
  const juniorOfficersUnderSenior = juniorOfficersForSenior?.data || [];

  // Get depot options based on location
  const depotOptions = formData.location
    ? depotOnLocation[formData.location as keyof typeof depotOnLocation] || []
    : [];

  // Using the global helper functions for role management

  // Initialize based on incoming userRole prop
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        role: userRole || getDefaultRoleForCreator(session?.user?.role),
        seniorOfficerId: "",
        juniorOfficerId: "",
      }));
    }
  }, [isOpen, userRole, session?.user?.role]);

  // Handle role change and reset dependent fields
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setFormData({
      ...formData,
      role: newRole,
      // Reset dependent fields when role changes
      seniorOfficerId: "",
      juniorOfficerId: "",
    });
  };

  // Handle senior officer change
  const handleSeniorOfficerChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedSeniorOfficerId = e.target.value;
    setFormData({
      ...formData,
      seniorOfficerId: selectedSeniorOfficerId,
      juniorOfficerId: "", // Reset junior officer when senior changes
    });
  };

  // Reset form data when closed
  const resetFormData = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      department: session?.user.department || "",
      phone: "",
      location: session?.user.location || "",
      depot: session?.user.role === "USER" ? session?.user.depot : "OVERALL",
      role: userRole || getDefaultRoleForCreator(session?.user?.role),
      seniorOfficerId: "",
      juniorOfficerId: "",
    });
    setShowPassword(false);
    setError("");
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    // Validate based on role hierarchy
    if (formData.role === "USER") {
      // For regular users
      if (session?.user.role === "BRANCH_OFFICER") {
        // Branch officer creating a user needs to select both senior and junior
        if (!formData.seniorOfficerId) {
          setError("Please select a Senior Officer");
          return;
        }
      } else if (session?.user.role === "SENIOR_OFFICER") {
        // Senior officer creating a user needs to select junior
        if (!formData.juniorOfficerId) {
          setError("Please select a Junior Officer");
          return;
        }
      }
    } else if (formData.role === "JUNIOR_OFFICER") {
      // If creating a junior officer as a branch officer
      if (
        session?.user.role === "BRANCH_OFFICER" &&
        !formData.seniorOfficerId
      ) {
        setError("Please select a Senior Officer");
        return;
      }
    }

    // Set depot value based on officer type
    const userData = {
      ...formData,
      depot: formData.role === "USER" ? formData.depot : "OVERALL",
      seniorOfficerId:
        formData.role === "USER"
          ? formData.juniorOfficerId
          : formData.role === "SENIOR_OFFICER"
          ? session?.user.id
          : formData.role === "JUNIOR_OFFICER" || formData.role === "USER"
          ? formData.seniorOfficerId ||
            (session?.user.role === "SENIOR_OFFICER"
              ? session?.user.id
              : undefined)
          : undefined,
      juniorOfficerId:
        formData.role === "USER"
          ? formData.juniorOfficerId ||
            (session?.user.role === "JUNIOR_OFFICER"
              ? session?.user.id
              : undefined)
          : undefined,
    };

    try {
      await onSubmit(userData);
      resetFormData();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    }
  };

  // Determine available roles based on creator's role
  const availableRoles = getAvailableRolesForCreator(session?.user?.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
      <div className="bg-white p-4 border border-black max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b-2 border-[#13529e] pb-2 mb-4 flex justify-between items-center">
          <h2 className="text-base font-bold text-[#13529e]">
            {formData.role === "USER"
              ? "Add New User"
              : formData.role === "JUNIOR_OFFICER"
              ? "Add Junior Officer"
              : formData.role === "SENIOR_OFFICER"
              ? "Add Senior Officer"
              : "Add Officer/User"}
          </h2>
          <button onClick={onClose} className="text-black font-bold">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Role Selection - Only show if role isn't fixed by creator */}
          <div className="mb-3">
            <label className="block text-black text-sm mb-1">Role</label>
            <select
              value={formData.role}
              onChange={handleRoleChange}
              className="w-full p-1 border border-black text-sm"
              required
              disabled={availableRoles.length === 1}
            >
              <option value="">Select Role</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role === "SENIOR_OFFICER"
                    ? "Senior Officer"
                    : role === "JUNIOR_OFFICER"
                    ? "Junior Officer"
                    : "User"}
                </option>
              ))}
            </select>
          </div>

          {/* Basic Information */}
          <div className="mb-3">
            <label className="block text-black text-sm mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-1 border border-black text-sm"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-black text-sm mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-1 border border-black text-sm"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-black text-sm mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-1 border border-black text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-black text-sm mb-1">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="w-full p-1 border border-black text-sm"
              required
              disabled
            />
          </div>

          <div className="mb-3">
            <label className="block text-black text-sm mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full p-1 border border-black text-sm"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-black text-sm mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full p-1 border border-black text-sm"
              required
              disabled
            />
          </div>

          {/* Only show depot field for regular users */}
          {formData.role === "USER" && (
            <div className="mb-3">
              <label className="block text-black text-sm mb-1">
                Depot <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.depot}
                onChange={(e) =>
                  setFormData({ ...formData, depot: e.target.value })
                }
                className="w-full p-1 border border-black text-sm"
                required
              >
                <option value="">Select Depot</option>
                {depotOptions.map((depot) => (
                  <option key={depot} value={depot}>
                    {depot}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Senior Officer Selection - for Branch Officer creating Junior Officers or Users */}
          {session?.user.role === "BRANCH_OFFICER" &&
            (formData.role === "JUNIOR_OFFICER" ||
              formData.role === "USER") && (
              <div className="mb-3">
                <label className="block text-black text-sm mb-1">
                  Select Senior Officer
                </label>
                <select
                  value={formData.seniorOfficerId}
                  onChange={handleSeniorOfficerChange}
                  className="w-full p-1 border border-black text-sm"
                  required
                >
                  <option value="">Select Senior Officer</option>
                  {seniorOfficers.map((officer: any) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

          {/* Junior Officer Selection - for Branch/Senior Officers creating Users */}
          {formData.role === "USER" &&
            (session?.user.role === "BRANCH_OFFICER" ||
              session?.user.role === "SENIOR_OFFICER") && (
              <div className="mb-3">
                <label className="block text-black text-sm mb-1">
                  Select Junior Officer
                </label>
                <select
                  value={formData.juniorOfficerId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      juniorOfficerId: e.target.value,
                    })
                  }
                  className="w-full p-1 border border-black text-sm"
                  required
                  disabled={
                    session?.user.role === "BRANCH_OFFICER" &&
                    !formData.seniorOfficerId
                  }
                >
                  <option value="">Select Junior Officer</option>
                  {session?.user.role === "BRANCH_OFFICER"
                    ? juniorOfficers.map((officer: any) => (
                        <option key={officer.id} value={officer.id}>
                          {officer.name}
                        </option>
                      ))
                    : juniorOfficersUnderSenior.map((officer: any) => (
                        <option key={officer.id} value={officer.id}>
                          {officer.name}
                        </option>
                      ))}
                </select>
              </div>
            )}

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-1 border border-black text-sm mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#13529e] text-white px-4 py-1 border border-black text-sm"
              disabled={false}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ManageUsersPage() {
  const [isCreateOfficerModalOpen, setIsCreateOfficerModalOpen] =
    useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Call all hooks unconditionally
  const branchOfficersData = useBranchOfficers(page, limit);
  const seniorOfficersData = useSeniorOfficers(page, limit);
  const juniorOfficersData = useJuniorOfficers(page, limit);
  const createOfficer = useCreateOfficer();
  const deleteOfficer = useDeleteOfficer();

  // Check if user is authorized (must be one of the officer roles)
  useEffect(() => {
    if (
      !session?.user?.role ||
      !["BRANCH_OFFICER", "SENIOR_OFFICER", "JUNIOR_OFFICER"].includes(
        session.user.role
      )
    ) {
      router.push("/unauthorized");
    }
  }, [session, router]);

  // If not authorized, show unauthorized message
  if (
    !session?.user?.role ||
    !["BRANCH_OFFICER", "SENIOR_OFFICER", "JUNIOR_OFFICER"].includes(
      session.user.role
    )
  ) {
    return (
      <div className="bg-white p-3 border border-black mb-3">
        <div className="text-center py-5">
          <h1 className="text-lg font-bold text-red-600 mb-2">
            Unauthorized Access
          </h1>
          <p className="text-black">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Select the appropriate data based on role
  const officersData =
    session?.user?.role === "BRANCH_OFFICER"
      ? branchOfficersData
      : session?.user?.role === "SENIOR_OFFICER"
      ? seniorOfficersData
      : juniorOfficersData;

  const isLoading = officersData.isLoading;
  const error = officersData.error;

  // Extract data with proper typing
  const officers = officersData.data?.data?.officers || [];
  const users = officersData.data?.data?.users || [];
  const totalPages = officersData.data?.data?.totalPages || 0;

  const handleCreateOfficer = async (userData: any) => {
    try {
      const response = await createOfficer.mutateAsync(userData);
      if (!response.status) {
        throw new Error(response.message);
      }
      setIsCreateOfficerModalOpen(false);

      // Invalidate relevant queries based on role
      if (session?.user?.role === "BRANCH_OFFICER") {
        queryClient.invalidateQueries({ queryKey: ["branchOfficers"] });
      } else if (session?.user?.role === "SENIOR_OFFICER") {
        queryClient.invalidateQueries({ queryKey: ["seniorOfficers"] });
      } else if (session?.user?.role === "JUNIOR_OFFICER") {
        queryClient.invalidateQueries({ queryKey: ["juniorOfficers"] });
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteOfficer.mutateAsync(id);

        // Invalidate relevant queries based on role
        if (session?.user?.role === "BRANCH_OFFICER") {
          queryClient.invalidateQueries({ queryKey: ["branchOfficers"] });
        } else if (session?.user?.role === "SENIOR_OFFICER") {
          queryClient.invalidateQueries({ queryKey: ["seniorOfficers"] });
        } else if (session?.user?.role === "JUNIOR_OFFICER") {
          queryClient.invalidateQueries({ queryKey: ["juniorOfficers"] });
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  if (isLoading) return <Loader name="users" />;
  if (error) return <div>Error loading users</div>;

  // Filter data based on role
  const seniorOfficers =
    session?.user?.role === "BRANCH_OFFICER"
      ? officers.filter((officer: any) => officer.role === "SENIOR_OFFICER")
      : [];

  const juniorOfficers =
    session?.user?.role === "BRANCH_OFFICER"
      ? officers.filter((officer: any) => officer.role === "JUNIOR_OFFICER")
      : session?.user?.role === "SENIOR_OFFICER"
      ? officers.filter((officer: any) => officer.role === "JUNIOR_OFFICER")
      : [];

  const regularUsers =
    session?.user?.role === "BRANCH_OFFICER"
      ? officers.filter((officer: any) => officer.role === "USER")
      : session?.user?.role === "SENIOR_OFFICER"
      ? officers.filter((officer: any) => officer.role === "USER")
      : users;

  return (
    <div className="bg-white p-3 border border-black mb-3">
      <div className="border-b-2 border-[#13529e] pb-3 mb-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-[#13529e]">{getPageTitle()}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedRole(getDefaultRoleForCreator(session?.user?.role));
              setIsCreateOfficerModalOpen(true);
            }}
            className="bg-[#13529e] text-white px-4 py-1 border border-black text-sm"
          >
            {getCreateButtonText()}
          </button>
        </div>
      </div>

      {/* Senior Officers Section - Only visible to Branch Officers */}
      {session?.user?.role === "BRANCH_OFFICER" &&
        seniorOfficers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-black mb-4 border-b border-gray-300 pb-1">
              Senior Officers
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-black">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-black p-1 text-left text-sm font-medium">
                      Name
                    </th>
                    <th className="border border-black p-1 text-left text-sm font-medium">
                      Email
                    </th>
                    <th className="border border-black p-1 text-left text-sm font-medium">
                      Department
                    </th>
                    <th className="border border-black p-1 text-left text-sm font-medium">
                      Phone
                    </th>
                    <th className="border border-black p-1 text-left text-sm font-medium">
                      Location
                    </th>
                    <th className="border border-black p-1 text-left text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {seniorOfficers.map((officer: any) => (
                    <tr key={officer.id} className="hover:bg-gray-50">
                      <td className="border border-black p-1 text-sm">
                        {officer.name}
                      </td>
                      <td className="border border-black p-1 text-sm">
                        {officer.email}
                      </td>
                      <td className="border border-black p-1 text-sm">
                        {officer.department}
                      </td>
                      <td className="border border-black p-1 text-sm">
                        {officer.phone}
                      </td>
                      <td className="border border-black p-1 text-sm">
                        {officer.location}
                      </td>
                      <td className="border border-black p-1 text-sm">
                        <button
                          onClick={() => handleDeleteUser(officer.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Junior Officers Section - Visible to Branch and Senior Officers */}
      {(session?.user?.role === "BRANCH_OFFICER" ||
        session?.user?.role === "SENIOR_OFFICER") &&
        juniorOfficers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-black mb-4 border-b border-gray-300 pb-1">
              Junior Officers
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-black">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-black p-1 text-left text-sm font-medium">
                      Name
                    </th>
                    <th className="border border-black p-1 text-left text-sm font-medium">
                      Email
                    </th>
                    <th className="border border-black p-1 text-left text-sm font-medium">
                      Department
                    </th>
                    <th className="border border-black p-1 text-left text-sm font-medium">
                      Phone
                    </th>
                    <th className="border border-black p-1 text-left text-sm font-medium">
                      Location
                    </th>

                    <th className="border border-black p-1 text-left text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {juniorOfficers.map((officer: any) => (
                    <tr key={officer.id} className="hover:bg-gray-50">
                      <td className="border border-black p-1 text-sm">
                        {officer.name}
                      </td>
                      <td className="border border-black p-1 text-sm">
                        {officer.email}
                      </td>
                      <td className="border border-black p-1 text-sm">
                        {officer.department}
                      </td>
                      <td className="border border-black p-1 text-sm">
                        {officer.phone}
                      </td>
                      <td className="border border-black p-1 text-sm">
                        {officer.location}
                      </td>

                      <td className="border border-black p-1 text-sm">
                        <button
                          onClick={() => handleDeleteUser(officer.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Regular Users Section - Visible to all officer types */}
      {regularUsers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-black mb-4 border-b border-gray-300 pb-1">
            Users
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-black">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-black p-1 text-left text-sm font-medium">
                    Name
                  </th>
                  <th className="border border-black p-1 text-left text-sm font-medium">
                    Email
                  </th>
                  <th className="border border-black p-1 text-left text-sm font-medium">
                    Department
                  </th>
                  <th className="border border-black p-1 text-left text-sm font-medium">
                    Phone
                  </th>
                  <th className="border border-black p-1 text-left text-sm font-medium">
                    Location
                  </th>
                  <th className="border border-black p-1 text-left text-sm font-medium">
                    Depot
                  </th>

                  <th className="border border-black p-1 text-left text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {regularUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="border border-black p-1 text-sm">
                      {user.name}
                    </td>
                    <td className="border border-black p-1 text-sm">
                      {user.email}
                    </td>
                    <td className="border border-black p-1 text-sm">
                      {user.department}
                    </td>
                    <td className="border border-black p-1 text-sm">
                      {user.phone}
                    </td>
                    <td className="border border-black p-1 text-sm">
                      {user.location}
                    </td>
                    <td className="border border-black p-1 text-sm">
                      {user.depot || "N/A"}
                    </td>

                    <td className="border border-black p-1 text-sm">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm bg-white text-[#13529e] border border-black disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm bg-white text-[#13529e] border border-black disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <CreateUserModal
        isOpen={isCreateOfficerModalOpen}
        onClose={() => setIsCreateOfficerModalOpen(false)}
        onSubmit={handleCreateOfficer}
        userRole={selectedRole}
      />

      <div className="text-[10px] text-gray-600 mt-2 border-t border-black pt-1 text-right">
        © {new Date().getFullYear()} Indian Railways
      </div>
    </div>
  );
}
