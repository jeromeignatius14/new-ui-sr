
type User = {
  role: string;
  email: string;
  phone?:any;
  depot?: string;
};

// Changed from useUserRedirect hook to a regular function
export const handleUserRedirect = (user: User | undefined) => {
  if (!user) return;

  if (user.role === "DEPT_CONTROLLER") {
    window.location.href = "/manage/request-table";
  }
  else if (user.role === "SM") {
    // window.location.href = `https://smr-dashboard.plattorian.tech/?cugNumber=${user.phone ?? ""}&section=MAS-GDR`;
     window.location.href=`https://smr-dashboard.plattorian.tech/?cugNumber=${user?.phone}&stationCode=${user?.depot}&user=SM&token=W1IU66ZFEBFBF6C1dGmouN6PVyHARQJg`
  }
  else if (user.role === "ADMIN") {
    window.location.href = "/admin/request-table";
  } else {
    window.location.href = "/dashboard";
  }
};