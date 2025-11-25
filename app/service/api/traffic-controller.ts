import axios from "./axios";

export const trafficControllerService = {
  async getUsers() {
    const res = await axios.get("/api/traffic-controller/users");
    return res.data;
  },

async addUser(data: { name: string; phone: string; depot: string; role: "SM"; email: string }) {
  return axios.post("/api/traffic-controller/users", {
    name: data.name,
    phone: data.phone,
    depot: data.depot,
    email: data.email,
    role: "SM",
  });
},
  async editUser(userId: string, data: Partial<{ name: string; phone: string; depot: string; managerId?: string }>) {
    return axios.patch(`/api/traffic-controller/users/${userId}`, data);
  },
  async deleteUser(userId: string) {
    return axios.delete(`/api/traffic-controller/users/${userId}`);
  },
};
