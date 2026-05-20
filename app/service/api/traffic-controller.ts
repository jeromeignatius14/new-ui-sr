import axios from "./axios";

export const trafficControllerService = {
  async getUsers() {
    const res = await axios.get("/api/traffic-controller/users");
    return res.data;
  },

  async addUser(data: { name: string; phone: string; depot: string; role: "SM"; email: string; division?: string }) {
    return axios.post("/api/traffic-controller/users", {
      name: data.name,
      phone: data.phone,
      depot: data.depot,
      email: data.email,
      role: "SM",
    });
  },

  async editUser(userId: string, data: Partial<{ name: string; phone: string; depot: string; email: string; managerId?: string; division?: string }>) {
    const { division: _division, ...ownData } = data;
    return axios.patch(`/api/traffic-controller/users/${userId}`, ownData);
  },
  async deleteUser(userId: string) {
    return axios.delete(`/api/traffic-controller/users/${userId}`);
  },
};
