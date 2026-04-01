import axios from "./axios";
import rawAxios from "axios";

export const trafficControllerService = {
  async getUsers() {
    const res = await axios.get("/api/traffic-controller/users");
    return res.data;
  },

async addUser(data: { name: string; phone: string; depot: string; role: "SM"; email: string; division?: string }) {
  return Promise.all([
    axios.post("/api/traffic-controller/users", {
      name: data.name,
      phone: data.phone,
      depot: data.depot,
      email: data.email,
      role: "SM",
    }),
    rawAxios.post(`https://bms-backend-prod.plattorian.tech/v0/api/user/saveUser/${data.phone}`, {
      name: data.name,
      division: data.division,
      cugNumber: data.phone,
      email: data.email,
      designation: data.role,
    }),
  ]);
},
  async editUser(userId: string, data: Partial<{ name: string; phone: string; depot: string; email: string; managerId?: string; division?: string }>) {
    const { division, ...ownData } = data;
    return Promise.all([
      axios.patch(`/api/traffic-controller/users/${userId}`, ownData),
      ...(data.phone ? [rawAxios.post(`https://bms-backend-prod.plattorian.tech/v0/api/user/saveUser/${data.phone}`, {
        name: data.name,
        division,
        cugNumber: data.phone,
        email: data.email,
        designation: "SM",
      })] : []),
    ]);
  },
  async deleteUser(userId: string) {
    return axios.delete(`/api/traffic-controller/users/${userId}`);
  },
};
