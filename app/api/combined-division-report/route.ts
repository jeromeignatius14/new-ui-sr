import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

// Server-side env vars (no NEXT_PUBLIC prefix needed here)
const OTHER_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;   // non-MAS (sr-five-divisions.vercel.app)
const MAS_BACKEND   = process.env.MAS_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL; // MAS backend

// Build query string, excluding undefined/null values
function qs(params: Record<string, string | undefined | null>): string {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v != null && v !== "") p.set(k, v);
    }
    return p.toString();
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.accessToken) {
        return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = session.user.accessToken as string;
    const url   = req.nextUrl.searchParams;

    const startDate       = url.get("startDate") ?? undefined;
    const endDate         = url.get("endDate") ?? undefined;
    const divisionsStr    = url.get("divisions") ?? "MAS,MDU,SA,PGT,TPJ,TVC";
    const department      = url.get("department") ?? undefined;
    const blockType       = url.get("blockType") ?? undefined;
    const globalWorkType  = url.get("globalWorkType") ?? "ALL";
    const globalActivity  = url.get("globalActivity") ?? "ALL";
    const durationOperator= url.get("durationOperator") ?? "ALL";
    const durationValue   = url.get("durationValue") ?? "";

    const divisions = divisionsStr.split(",").map((d) => d.trim().toUpperCase()).filter(Boolean);
    const masDivisions   = divisions.filter((d) => d === "MAS");
    const otherDivisions = divisions.filter((d) => d !== "MAS");

    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const results: any[] = [];

    // ── Query non-MAS backend for selected non-MAS divisions ──────────────────
    if (otherDivisions.length > 0) {
        try {
            const q = qs({
                startDate, endDate,
                locations: otherDivisions.join(","),
                department,
                blockType: blockType ?? "All",
                globalWorkType,
                globalActivity,
                durationOperator,
                durationValue,
            });
            const res = await fetch(`${OTHER_BACKEND}/api/hq/division-summary?${q}`, { headers });
            if (res.ok) {
                const json = await res.json();
                if (json?.data?.divisionSummary) results.push(...json.data.divisionSummary);
            }
        } catch (e) {
            console.error("[combined-division-report] non-MAS fetch error:", e);
        }
    }

    // ── Query MAS backend for MAS division ────────────────────────────────────
    if (masDivisions.length > 0) {
        try {
            const q = qs({
                startDate, endDate,
                majorSections: "All",
                department,
                blockType: blockType ?? "All",
                globalWorkType,
                globalActivity,
                durationOperator,
                durationValue,
            });
            const res = await fetch(`${MAS_BACKEND}/api/hq/generate-report?${q}`, { headers });
            if (res.ok) {
                const json = await res.json();
                const sections: any[] = json?.data?.pastBlockSummary ?? [];
                // Aggregate all MAS sections into one "MAS" row
                if (sections.length > 0) {
                    const masRow = sections.reduce(
                        (acc: any, s: any) => {
                            acc.DemandsCount    += Number(s.DemandsCount  ?? s.demandsCount  ?? 0);
                            acc.ApprovedCount   += Number(s.ApprovedCount ?? s.approvedCount ?? 0);
                            acc.AppliedCount    += Number(s.AppliedCount  ?? s.appliedCount  ?? s.Applied ?? 0);
                            acc.GrantedCount    += Number(s.GrantedCount  ?? s.grantedCount  ?? 0);
                            acc.AvailedCount    += Number(s.AvailedCount  ?? s.availedCount  ?? 0);
                            acc.NotSanctionedCount += Number(s.NotSanctionedCount ?? 0);
                            acc.NotGrantedCount += Number(s.NotGrantedCount ?? 0);
                            acc.NotAvailedCount += Number(s.NotAvailedCount ?? 0);
                            acc.Demanded   += Number(s.Demanded  ?? 0);
                            acc.Sanctioned += Number(s.Approved  ?? s.Sanctioned ?? 0);
                            acc.Granted    += Number(s.Granted   ?? 0);
                            acc.Availed    += Number(s.Availed   ?? 0);
                            return acc;
                        },
                        {
                            Division: "MAS", Department: department ?? "",
                            DemandsCount: 0, ApprovedCount: 0, AppliedCount: 0,
                            GrantedCount: 0, AvailedCount: 0, NotSanctionedCount: 0,
                            NotGrantedCount: 0, NotAvailedCount: 0,
                            Demanded: 0, Sanctioned: 0, Granted: 0, Availed: 0,
                        },
                    );
                    const d = masRow.DemandsCount;
                    const a = masRow.AppliedCount;
                    const g = masRow.GrantedCount;
                    masRow.PercentSanctioned = d > 0 ? parseFloat(((masRow.ApprovedCount / d) * 100).toFixed(2)) : 0;
                    masRow.PercentGranted    = a > 0 ? parseFloat(((g / a) * 100).toFixed(2)) : 0;
                    masRow.PercentAvailed    = g > 0 ? parseFloat(((masRow.AvailedCount / g) * 100).toFixed(2)) : 0;
                    results.push(masRow);
                }
            }
        } catch (e) {
            console.error("[combined-division-report] MAS fetch error:", e);
        }
    }

    // Sort to consistent order: MAS first, then others alphabetically
    const ORDER = ["MAS", "MDU", "SA", "PGT", "TPJ", "TVC"];
    results.sort((a, b) => {
        const ia = ORDER.indexOf(a.Division);
        const ib = ORDER.indexOf(b.Division);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    return NextResponse.json({ status: true, message: "Division summary fetched", data: { divisionSummary: results } });
}
