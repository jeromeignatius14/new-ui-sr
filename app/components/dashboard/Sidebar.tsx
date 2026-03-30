"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

// Sidebar navigation item component
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
}

const NavItem = ({ icon, label, path, active = false }: NavItemProps) => (
  <li>
    <Link 
      href={path}
      className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer ${
        active 
          ? 'bg-[#D65A00] text-white' 
          : 'text-black hover:bg-orange-100'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  </li>
);

interface SidebarProps {
  user?: {
    name?: string;
    role?: string;
    email?: string;
    department?: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-white shadow-md hidden md:block">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Railways Logo" className="h-10 w-10" />
          <h1 className="text-lg font-bold text-[#F37A1F]">Southern Railway</h1>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#F37A1F] flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-black">{user?.name || 'User'}</p>
            <p className="text-xs text-black">{user?.role || 'Employee'}</p>
          </div>
        </div>
        
        <nav>
          <ul className="space-y-1">
            <NavItem 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              } 
              label="Dashboard" 
              path="/dashboard"
              active={pathname === "/dashboard"} 
            />
            <NavItem 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              } 
              label="Profile" 
              path="/dashboard/profile"
              active={pathname === "/dashboard/profile"}
            />
            <NavItem 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              } 
              label="Attendance" 
              path="/dashboard/attendance"
              active={pathname === "/dashboard/attendance"}
            />
            <NavItem 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              } 
              label="Documents" 
              path="/dashboard/documents"
              active={pathname === "/dashboard/documents"}
            />
            <NavItem 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              } 
              label="Payslips" 
              path="/dashboard/payslips"
              active={pathname === "/dashboard/payslips"}
            />
            <NavItem 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } 
              label="Leave Management" 
              path="/dashboard/leave"
              active={pathname === "/dashboard/leave"}
            />
            <NavItem 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              } 
              label="Settings" 
              path="/dashboard/settings"
              active={pathname === "/dashboard/settings"}
            />
            {/* SM role — availing management links */}
            {user?.role === "SM" && (
              <>
                <NavItem
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                  label="Pending Avails"
                  path="/sm/pending-avails"
                  active={pathname === "/sm/pending-avails"}
                />
                <NavItem
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  label="Active Blocks"
                  path="/sm/active-blocks"
                  active={pathname === "/sm/active-blocks"}
                />
              </>
            )}
            {/* USER/JE role — avail block link */}
            {(user?.role === "USER" || user?.role === "JE") && (
              <NavItem
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                label="Avail Block"
                path="/avail-block"
                active={pathname?.startsWith("/avail-block")}
              />
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
