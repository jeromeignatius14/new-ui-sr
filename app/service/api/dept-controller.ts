import axios from "./axios";
import rawAxios from "axios";

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
   async addStation(data: {  depots: string[] }) {
    return axios.post("/api/dept-controller/stations", {
      depots: data.depots,
    });
  },
  async addUser(data: { name: string; phone: string; depot: string; role: "SSE" | "JE"; managerId?: string; managerPhone?: string; email: string; department?: string; division?: string }) {
    const thirdPartyCall = rawAxios.post(`https://bms-backend-prod.plattorian.tech/v0/api/user/saveUser/${data.phone}`, {
      name: data.name,
      division: data.division,
      department: data.department,
      cugNumber: data.phone,
      supervisor: data.role === "JE" ? data.managerPhone : undefined,
      email: data.email,
      designation: data.role,
    });

    if (data.role === "JE" && data.managerId) {
      return Promise.all([
        axios.post("/api/dept-controller/jes", {
          name: data.name,
          phone: data.phone,
          depot: data.depot,
          email: data.email,
          managerId: data.managerId,
        }),
        thirdPartyCall,
      ]);
    }
    return Promise.all([
      axios.post("/api/dept-controller/users", {
        name: data.name,
        phone: data.phone,
        depot: data.depot,
        email: data.email,
      }),
      thirdPartyCall,
    ]);
  },
  async editUser(userId: string, data: Partial<{ name: string; phone: string; depot: string; email: string; managerId?: string; division?: string; department?: string }>) {
    const { division, department, ...ownData } = data;
    return Promise.all([
      axios.patch(`/api/dept-controller/users/${userId}`, ownData),
      ...(data.phone ? [rawAxios.post(`https://bms-backend-prod.plattorian.tech/v0/api/user/saveUser/${data.phone}`, {
        name: data.name,
        division,
        department,
        cugNumber: data.phone,
        email: data.email,
        designation: "SSE",
      })] : []),
    ]);
  },
  async deleteUser(userId: string) {
    return axios.delete(`/api/dept-controller/users/${userId}`);
  },
   async deleteStation(stationId: string) {
    return axios.delete(`/api/dept-controller/stations/${stationId}`);
  },
  async editJE(jeId: string, data: Partial<{ name: string; phone: string; depot: string; email: string; managerId?: string; managerPhone?: string; division?: string; department?: string }>) {
    const { division, department, managerPhone, ...ownData } = data;
    return Promise.all([
      axios.patch(`/api/dept-controller/jes/${jeId}`, ownData),
      ...(data.phone ? [rawAxios.post(`https://bms-backend-prod.plattorian.tech/v0/api/user/saveUser/${data.phone}`, {
        name: data.name,
        division,
        department,
        cugNumber: data.phone,
        supervisor: managerPhone,
        email: data.email,
        designation: "JE",
      })] : []),
    ]);
  },
  async deleteJE(jeId: string) {
    return axios.delete(`/api/dept-controller/jes/${jeId}`);
  },
};
