"use client";

import { useSession } from "next-auth/react";

export default function ManagerQuickLinks() {
  const { data: session } = useSession();
  const isTrdController = session?.user?.role === "DEPT_CONTROLLER" && session?.user?.department === "TRD";

  return (
    <div className="w-full flex flex-col items-center gap-5 mt-6 px-2 max-w-md">
      <a href="/manage/request-table" className="w-full rounded-2xl bg-[#eeb8f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">VIEW BLOCK DETAILS</a>
      <a href="/manage/block-summary" className="w-full rounded-2xl bg-[#aee6f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">BLOCK SUMMARY REPORT</a>
      {isTrdController && (
        <a href="/manage/permit-block-at-site" className="w-full rounded-2xl bg-[#fde68a] border-2 border-[#d97706] py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">
          ⚡ PERMIT BLOCK AT SITE
        </a>
      )}
    </div>
  );
}
