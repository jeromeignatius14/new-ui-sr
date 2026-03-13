
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
    window.location.href = "/sm/pending-avails";
  }
  else if (user.role === "BOARD_CONTROLLER") {
    window.location.href = "/tpc";
  }
   else if (user.role === "HQ") {
        window.location.href="/hq/generate-report";
      }
  else if (user.role === "ADMIN") {
    window.location.href = "/admin/request-table";
  } else {
    window.location.href = "/dashboard";
  }
};