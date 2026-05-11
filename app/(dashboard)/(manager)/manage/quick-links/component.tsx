"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

// Quick action card component with government style
const QuickAction = ({
    title,
    icon,
    link,
}: {
    title: string;
    icon: React.ReactNode;
    link: string;
}) => (
    <Link
        href={link}
        className="border border-black p-3 flex items-center hover:bg-gray-50"
    >
        <div className="mr-3 text-[#13529e]">{icon}</div>
        <div className="text-sm">{title}</div>
    </Link>
);

export default function ManagerQuickLinks() {
    const { data: session } = useSession();
    const isDeptController = session?.user?.role === "DEPT_CONTROLLER";
    const isBranchOfficer = session?.user?.role === "BRANCH_OFFICER";
    const isTrdController = isDeptController && session?.user?.department === "TRD";

    return (
        <div className="w-full flex flex-col items-center gap-5 mt-6 px-2 max-w-md">
            <a href="/manage/request-table" className="w-full rounded-2xl bg-[#eeb8f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">VIEW BLOCK DETAILS</a>
            <a href="/manage/block-summary" className="w-full rounded-2xl bg-[#aee6f7] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">BLOCK SUMMARY REPORT</a>
            {isTrdController && (
                <a href="/manage/permit-block-at-site" className="w-full rounded-2xl bg-[#fde68a] border-2 border-[#d97706] py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">⚡ PERMIT BLOCK AT SITE</a>
            )}
            {(isDeptController || isBranchOfficer) && (
                <a href="/manage/defaulters" className="w-full rounded-2xl bg-[#ffd6d6] border-2 border-[#dc2626] py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">⚠️ DEFAULTERS LIST</a>
            )}
            <a href="/analyst" className="w-full rounded-2xl bg-[#d4edda] border border-black py-6 text-xl font-extrabold text-black text-center shadow hover:scale-105 transition">ANALYSE IN DETAIL</a>
        </div>
    );
}
