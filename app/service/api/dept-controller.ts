import axios from "./axios";

export const deptControllerService = {
  async getUsers() {
    const res = await axios.get("/api/dept-controller/users");
    return res.data;
  },
  async getStation() {
    const res = await axios.get("/api/dept-controller/stations");
    return res.data;
  },
  async getJEsByUser(userId: string) {
    const res = await axios.get(`/api/dept-controller/users/${userId}/jes`);
    return res.data;
  },
  async addStation(data: { depots: string[] }) {
    return axios.post("/api/dept-controller/stations", { depots: data.depots });
  },
  async addUser(data: { name: string; phone: string; depot: string; role: "SSE" | "JE"; managerId?: string; managerPhone?: string; email: string; department?: string; division?: string }) {
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
  async editUser(userId: string, data: Partial<{ name: string; phone: string; depot: string; email: string; managerId?: string; division?: string; department?: string }>) {
    const { division: _division, department: _department, ...ownData } = data;
    return axios.patch(`/api/dept-controller/users/${userId}`, ownData);
  },
  async deleteUser(userId: string) {
    return axios.delete(`/api/dept-controller/users/${userId}`);
  },
  async deleteStation(stationId: string) {
    return axios.delete(`/api/dept-controller/stations/${stationId}`);
  },
  async editJE(jeId: string, data: Partial<{ name: string; phone: string; depot: string; email: string; managerId?: string; managerPhone?: string; division?: string; department?: string }>) {
    const { division: _division, department: _department, managerPhone: _managerPhone, ...ownData } = data;
    return axios.patch(`/api/dept-controller/jes/${jeId}`, ownData);
  },
  async deleteJE(jeId: string) {
    return axios.delete(`/api/dept-controller/jes/${jeId}`);
  },
};
