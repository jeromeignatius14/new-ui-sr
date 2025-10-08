import axios from "./axios";

export const deptControllerService = {
  async getUsers() {
    const res = await axios.get("/api/dept-controller/users");
    return res.data;
  },
  async getJEsByUser(userId: string) {
    const res = await axios.get(`/api/dept-controller/users/${userId}/jes`);
    return res.data;
  },
  async addUser(data: { name: string; phone: string; depot: string; role: "SSE" | "JE"; managerId?: string; email: string }) {
    if (data.role === "JE" && data.managerId) {
      return axios.post("/api/dept-controller/jes", {
        name: data.name,
        phone: data.phone,
        depot: data.depot,
        email: data.email,
        managerId: data.managerId,
      });
    }
    return axios.post("/api/dept-controller/users", {
      name: data.name,
      phone: data.phone,
      depot: data.depot,
      email: data.email,
    });
  },
  async editUser(userId: string, data: Partial<{ name: string; phone: string; depot: string; managerId?: string }>) {
    return axios.patch(`/api/dept-controller/users/${userId}`, data);
  },
  async deleteUser(userId: string) {
    return axios.delete(`/api/dept-controller/users/${userId}`);
  },
  async editJE(jeId: string, data: Partial<{ name: string; phone: string; depot: string; managerId?: string }>) {
    return axios.patch(`/api/dept-controller/jes/${jeId}`, data);
  },
  async deleteJE(jeId: string) {
    return axios.delete(`/api/dept-controller/jes/${jeId}`);
  },
};
