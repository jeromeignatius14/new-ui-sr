"use client";

import Link from "next/link";

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

export default function AdminQuickLinks() {

    {/* Quick actions */ }
    return (
        <div className="mb-4">
            <h2 className="text-sm font-bold text-[#13529e] mb-2 border-b border-gray-300 pb-1">
                Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">


                <QuickAction
                    title="Manage Users"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    }
                    link="/admin/manage-users"
                />
                <QuickAction
                    title="View Requests"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    }
                    link="/admin/request-table"
                />

                 <QuickAction
                    title="View Optimised Requests"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    }
                    link="/admin/optimised-table-data"
                />

                <QuickAction
                    title="Manage Master Data"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 7h16M4 12h16M4 17h7"
                            />
                        </svg>
                    }
                    link="/admin/master-data"
                />


            </div>
        </div>
    )


}
