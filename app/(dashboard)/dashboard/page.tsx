"use client";

import { type ReactNode } from "react";
import { Loader } from "@/app/components/ui/Loader";
import ManagerQuickLinks from "@/app/(dashboard)/(manager)/manage/quick-links/component";
import AdminQuickLinks from "@/app/(dashboard)/(admin)/admin/quick-links/component";
import UserQuickLinks from "@/app/(dashboard)/(user)/quick-links/component";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { useGetMyAvailBlocks, useGetPendingAvailConcurrences } from "@/app/service/query/avail";
import { RequestItem } from "@/app/service/query/user-request";

// ── Avail badge count ──────────────────────────────────────────────────────────
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function nowIST() { return Date.now() + IST_OFFSET_MS; }

function getAvailTimes(block: RequestItem) {
  const fromStr = (block as any).smApprovedTimeFrom ?? block.grantedFromTime ?? block.sanctionedTimeFrom ?? block.demandTimeFrom;
  const toStr = (block as any).smApprovedTimeTo ?? block.grantedToTime ?? block.sanctionedTimeTo ?? block.demandTimeTo;
  return {
    fromMs: fromStr ? new Date(fromStr as string).getTime() : null,
    toMs: toStr ? new Date(toStr as string).getTime() : null,
  };
}

function useAvailBadgeCount() {
  const { data: session } = useSession();
  const { data: myData } = useGetMyAvailBlocks();
  const { data: otherData } = useGetPendingAvailConcurrences();

  const myBlocks: RequestItem[] = myData?.data?.blocks ?? [];
  const otherBlocks: RequestItem[] = otherData?.data?.pendingConcurrences ?? [];
  const now = nowIST();
  const H12 = 12 * 60 * 60 * 1000;
  const H24 = 24 * 60 * 60 * 1000;

  let count = 0;
  for (const b of myBlocks) {
    const bb = b as any;
    const { fromMs, toMs } = getAvailTimes(b);
    // In-progress urgent: SM approved waiting acknowledge
    if (bb.availAppliedAt && !bb.closureSubmittedAt) {
      if (bb.smApprovedAt && !bb.availingStartedAt) count++;
      else if (bb.availingStartedAt && toMs && (toMs - now) < 5 * 60 * 1000) count++;
    }
    // Upcoming in next 12 hrs, not yet applied
    if (!bb.availAppliedAt && !b.userResponse && fromMs && fromMs > now && (fromMs - now) < H12) count++;
    // Past unapplied (0-24 hrs)
    if (!bb.availAppliedAt && !b.userResponse && toMs && toMs < now && (now - toMs) < H24) count++;
  }
  // All concurrences count
  count += otherBlocks.filter(b => {
    const { toMs } = getAvailTimes(b);
    return !toMs || (now - toMs) < H24;
  }).length;

  return count;
}

function AvailBadge({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const count = useAvailBadgeCount();
  return (
    <a href={href} className={className} style={{ position: "relative", display: "block" }}>
      {children}
      {count > 0 && (
        <span style={{
          position: "absolute",
          top: "8px",
          right: "12px",
          background: "#dc2626",
          color: "#fff",
          borderRadius: "12px",
          minWidth: "22px",
          height: "22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 900,
          padding: "0 5px",
          border: "2px solid #fff",
          zIndex: 10,
          boxShadow: "0 2px 6px rgba(220,38,38,0.5)",
        }}>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </a>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/auth/login";
    },
  });



  if (status === "loading") {
    return <Loader name="dashboard" />;
  }

  // Current date formatting for government style
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Custom user dashboard UI - same for USER and JE roles
  if (session?.user?.role === "USER" || session?.user?.role === "JE") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
        {/* Header */}
        <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
          </span>
          <span className="text-2xl font-bold text-black" >Home</span>
        </div>
        {/* RBMS badge */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-[#8ed974] px-8 py-2">
            <span className="text-[9vw] min-[430px]:text-4xl text-nowrap font-extrabold text-[#b07be0] tracking-wide">RBMS-TVC-DIVN</span>
          </div>
        </div>
        {/* Designation bar */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-[#ffeaea] px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
            <span className="text-2xl font-semibold text-gray-700 tracking-wide">DESGN:<span className="text-2xl font-bold text-black">{session?.user?.name || ''}</span></span>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="w-full flex flex-col items-center gap-5 mt-6 px-2 max-w-md">
          <a href="/create-block-request" className="w-full rounded-full bg-[#eeb8f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">ENTER NEW BLOCK REQUEST</a>
          <a href="/edit-request" className="w-full rounded-full bg-[#aee6f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">EDIT/CANCEL PREVIOUS BLOCK REQUESTS</a>
          <a href="/request-table" className="w-full rounded-full bg-[#c7c7f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">SUMMARY OF MY BLOCK REQUESTS</a>
          <AvailBadge href="/avail-block" className="w-full rounded-full bg-[#a6f7a6] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">AVAIL BLOCK AT SITE</AvailBadge>


          <a href="/generate-reports" className="w-full rounded-full bg-[#ffd180] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">GENERATE REPORTS</a>
        </div>

        {/* Logout button */}
        <div className="w-full flex justify-center mt-10 mb-4">
          <form action="/auth/login" method="get" onSubmit={async (e) => { e.preventDefault(); await import('next-auth/react').then(mod => mod.signOut({ redirect: true, callbackUrl: '/auth/login' })); }}>
            <button type="submit" className="flex items-center gap-2 bg-[#dbe6fd] border border-black rounded-[50%] px-6 py-2 text-lg font-bold text-black shadow hover:bg-[#c7d7f7] transition">
              <span className=" w-7 h-7 bg-white rounded-[50%] border border-black flex items-center justify-center">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black' strokeWidth={2} className='w-5 h-5'><path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' /></svg>
              </span>
              Logout
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Custom manager dashboard UI
  // if (session?.user?.role === "SENIOR_OFFICER" || session?.user?.role === "JUNIOR_OFFICER") {
  //   return (
  //     <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
  //       {/* Header */}
  //       <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
  //         <span className="absolute left-4 top-1/2 -translate-y-1/2">
  //           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
  //         </span>
  //         <span className="text-2xl font-bold text-black">Home</span>
  //       </div>
  //       {/* RBMS badge */}
  //       <div className="w-full flex justify-center mt-4">
  //         <div className="bg-green-200 rounded-2xl px-8 py-2">
  //           <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">RBMS-{session?.user?.location}-DIVN</span>
  //         </div>
  //       </div>
  //       {/* Designation bar */}
  //       <div className="w-full flex justify-center mt-4">
  //         <div className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
  //           <span className="text-xs font-semibold text-gray-700 tracking-wide">MANAGER DESIGNATION:<span className="text-sm font-bold text-black">{session?.user?.name || ''}</span></span>
  //         </div>
  //       </div>
  //       {/* Navigation buttons */}
  //       <ManagerQuickLinks />
  //       {/* Logout button */}
  //       <div className="w-full flex justify-center mt-10 mb-4">
  //         <form action="/auth/login" method="get" onSubmit={async (e) => { e.preventDefault(); await import('next-auth/react').then(mod => mod.signOut({ redirect: true, callbackUrl: '/auth/login' })); }}>
  //           <button type="submit" className="flex items-center gap-2 bg-[#dbe6fd] border border-black rounded px-6 py-2 text-lg font-bold text-black shadow hover:bg-[#c7d7f7] transition">
  //             <span className="inline-block w-7 h-7 bg-white rounded-full border border-black flex items-center justify-center">
  //               <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black' strokeWidth={2} className='w-5 h-5'><path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' /></svg>
  //             </span>
  //             Logout
  //           </button>
  //         </form>
  //       </div>
  //     </div>
  //   );
  // }


  // if (session?.user?.role === "BRANCH_OFFICER" && session?.user.email === "b@mail.com") {
  //   return (
  //     <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
  //       {/* Header */}
  //       <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
  //         <span className="absolute left-4 top-1/2 -translate-y-1/2">
  //           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
  //         </span>
  //         <span className="text-2xl font-bold text-black">Home</span>
  //       </div>
  //       {/* RBMS badge */}
  //       <div className="w-full flex justify-center mt-4">
  //         <div className="bg-green-200 rounded-2xl px-8 py-2">
  //           <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">RBMS</span>
  //         </div>
  //       </div>
  //       {/* Designation bar */}
  //       <div className="w-full flex justify-center mt-4">
  //         <div className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
  //           {/* <span className="text-xs font-semibold text-gray-700 tracking-wide">MANAGER DESIGNATION:<span className="text-sm font-bold text-black">{session?.user?.name || ''}</span></span> */}
  //           <span className="text-xs font-semibold text-gray-700 tracking-wide">ENGG CONTROLLER</span>

  //         </div>
  //       </div>
  //       {/* Navigation buttons */}
  //       <ManagerQuickLinks />
  //       {/* Logout button */}
  //       <div className="w-full flex justify-center mt-10 mb-4">
  //         <form action="/auth/login" method="get" onSubmit={async (e) => { e.preventDefault(); await import('next-auth/react').then(mod => mod.signOut({ redirect: true, callbackUrl: '/auth/login' })); }}>
  //           <button type="submit" className="flex items-center gap-2 bg-[#dbe6fd] border border-black rounded px-6 py-2 text-lg font-bold text-black shadow hover:bg-[#c7d7f7] transition">
  //             <span className="inline-block w-7 h-7 bg-white rounded-full border border-black flex items-center justify-center">
  //               <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black' strokeWidth={2} className='w-5 h-5'><path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' /></svg>
  //             </span>
  //             Logout
  //           </button>
  //         </form>
  //       </div>
  //     </div>
  //   );
  // }
if (session?.user?.role === "DEPT_CONTROLLER") {
    window.location.href = "/manage/request-table";
}

if (session?.user?.role === "BOARD_CONTROLLER") {
    window.location.href = "/tpc";
}

if (session?.user?.role === "SM") {
    window.location.href = "/sm/pending-avails";
}
  // Custom admin dashboard UI (match manager dashboard style)
  if (session?.user?.role === "ADMIN") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
        {/* Header */}
        <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
          </span>
          <span className="text-2xl font-bold text-black">Home</span>
        </div>
        {/* RBMS badge */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-green-200 rounded-2xl px-8 py-2">
            <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">RBMS</span>
          </div>
        </div>
        {/* Designation bar */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
            <span className="text-lg font-bold text-black tracking-wide">DESGN:Traffic Controller</span>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md mb-2">
          <Link href="/admin/request-table" className="w-full">
            <button className="w-full rounded-2xl bg-[#eeb8f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              VIEW BLOCK DETAILS
            </button>
          </Link>
          <Link href="/admin/revise-block" className="w-full">
            <button className="w-full rounded-2xl bg-[#ffd180] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              REVISE THE BLOCK FOR THE DAY
            </button>
          </Link>
          <Link href="/admin/sanction-table-data" className="w-full">
            <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              BLOCK SUMMARY REPORT
            </button>
          </Link>
        </div>
        {/* Logout button */}
        <button
          onClick={async () => {
            const { signOut } = await import("next-auth/react");
            await signOut({ redirect: true, callbackUrl: "/auth/login" });
          }}
          className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
        >
          Logout
        </button>
      </div>
    );
  }
  if (session?.user?.role === "JE") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
        {/* Header */}
        <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" stroke="black" strokeWidth={2} className="w-9 h-9"><rect x="6" y="12" width="20" height="12" rx="2" fill="#fffbe9" stroke="black" strokeWidth="2" /><path d="M4 14L16 4L28 14" stroke="black" strokeWidth="2" fill="none" /></svg>
          </span>
          <span className="text-2xl font-bold text-black">Home</span>
        </div>
        {/* RBMS badge */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-green-200 rounded-2xl px-8 py-2">
            <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">RBMS</span>
          </div>
        </div>
        {/* Designation bar */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center" style={{ maxWidth: '90vw' }}>
            <span className="text-xs font-semibold text-gray-700 tracking-wide">DESIGNATION:<span className="text-sm font-bold text-black">{session?.user?.name || ''}</span></span>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="flex flex-col gap-8 mt-8 w-full max-w-md items-center">
          <AvailBadge href="/avail-block" className="w-72 bg-[#E6E6FA] py-6 rounded-2xl border-4 border-black text-2xl font-bold text-[#13529e] shadow-lg hover:bg-[#B57CF6] hover:text-white transition-colors text-center">
            AVAIL BLOCK AT SITE
          </AvailBadge>
        </div>
        {/* Logout button */}
        <div className="w-full flex justify-center mt-10 mb-4">
          <form action="/auth/login" method="get" onSubmit={async (e) => { e.preventDefault(); await import('next-auth/react').then(mod => mod.signOut({ redirect: true, callbackUrl: '/auth/login' })); }}>
            <button type="submit" className="flex items-center gap-2 bg-[#dbe6fd] border border-black rounded px-6 py-2 text-lg font-bold text-black shadow hover:bg-[#c7d7f7] transition">
              <span className="inline-block w-7 h-7 bg-white rounded-full border border-black flex items-center justify-center">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black' strokeWidth={2} className='w-5 h-5'><path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' /></svg>
              </span>
              Logout
            </button>
          </form>
        </div>
      </div>
    );
  }



  if (session?.user?.role === "DRM") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
        {/* Header */}
        <div
          className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2"
          style={{ minHeight: 60 }}
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <FaHome className="w-9 h-9 text-black" />
          </span>
          <span className="text-2xl font-bold text-black">Home</span>
        </div>
        {/* RBMS badge */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-green-200 rounded-2xl px-8 py-2">
            <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">
              RBMS
            </span>
          </div>
        </div>
        {/* Designation bar */}
        <div className="w-full flex justify-center mt-4">
          <div
            className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center"
            style={{ maxWidth: "90vw" }}
          >
            <span className="text-lg font-bold text-black tracking-wide">
              DRM
            </span>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md mb-2">
          <Link href="/drm/generate-report" className="w-full">
            <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              BLOCK SUMMARY REPORT
            </button>
          </Link>
        </div>

        <button
          onClick={async () => {
            const { signOut } = await import("next-auth/react");
            await signOut({ redirect: true, callbackUrl: "/auth/login" });
          }}
          className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
        >
          Logout
        </button>
      </div>
    );
  }

  if (session?.user?.role === "BRANCH_OFFICER"||session?.user?.role === "SENIOR_OFFICER" || session?.user?.role === "JUNIOR_OFFICER") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
        {/* Header */}
        <div
          className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2"
          style={{ minHeight: 60 }}
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <FaHome className="w-9 h-9 text-black" />
          </span>
          <span className="text-2xl font-bold text-black">Home</span>
        </div>
        {/* RBMS badge */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-green-200 rounded-2xl px-8 py-2">
            <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">
              RBMS
            </span>
          </div>
        </div>
        {/* Designation bar */}
        <div className="w-full flex justify-center mt-4">
          <div
            className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center"
            style={{ maxWidth: "90vw" }}
          >
            <span className="text-lg font-bold text-black tracking-wide">
              {session?.user?.name || ''}
            </span>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md mb-2">
          <Link href="/bo/generate-report" className="w-full">
            <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
              BLOCK SUMMARY REPORT
            </button>
          </Link>
        </div>

        <button
          onClick={async () => {
            const { signOut } = await import("next-auth/react");
            await signOut({ redirect: true, callbackUrl: "/auth/login" });
          }}
          className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
        >
          Logout
        </button>
      </div>
    );
  }

  // Default dashboard UI for other roles
  return (
    <div className="max-w-full overflow-hidden text-black">
      <div className="bg-white p-3 border border-black mb-3">
        <div className="border-b-2 border-[#13529e] pb-3 mb-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-[#13529e]">Dashboard</h1>
          <div className="text-sm text-gray-600">{formattedDate}</div>
        </div>

        {/* User information */}
        <div className="mb-4">
          <p className="font-medium">
            Welcome, {session?.user?.name || "User"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-sm">
            <div className="border border-gray-300 bg-gray-50 p-2">
              <span className="text-gray-600 text-xs">Employee ID:</span>
              <p className="font-medium">{session?.user?.id || "N/A"}</p>
            </div>
            <div className="border border-gray-300 bg-gray-50 p-2">
              <span className="text-gray-600 text-xs">Role :</span>
              <p className="font-medium">{session?.user?.role || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        {
          session?.user?.role === "ADMIN" ? (
            <div className="flex flex-col gap-8 mt-8 w-full max-w-md items-center">
              <a href="/admin/request-table">
                <button className="w-72 bg-[#E6E6FA] py-6 rounded-2xl border-4 border-black text-2xl font-bold text-[#13529e] shadow-lg hover:bg-[#B57CF6] hover:text-white transition-colors">
                  VIEW BLOCK DETAILS
                </button>
              </a>
              <a href="/dashboard/(admin)/admin/sanction-table-data">
                <button className="w-72 bg-[#E6E6FA] py-6 rounded-2xl border-4 border-black text-2xl font-bold text-[#13529e] shadow-lg hover:bg-[#B57CF6] hover:text-white transition-colors">
                  BLOCK SUMMARY REPORT
                </button>
              </a>
            </div>
          ) : null
        }

      </div>
    </div>
  );
}
