
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Eye,
    FileText,
    Filter,
    Inbox,
    MapPin,
    Package,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
    UserCheck,
    XCircle,
} from "lucide-react";

const CLAIMS_STORAGE_KEY = "campusFindClaims";
const LOST_STORAGE_KEY = "campusFindLostReports";
const FOUND_STORAGE_KEY = "campusFindFoundReports";

const normalize = (value) =>
    String(value || "").trim().toLowerCase();

const getCurrentUserEmail = () =>
    localStorage.getItem("campusFindUserEmail") || "";

const getItemImage = (item) => {
    return (
        item?.photoData ||
        item?.image ||
        item?.imageUrl ||
        item?.photo ||
        null
    );
};

const formatDate = (dateValue) => {
    if (!dateValue) return "Date not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date not available";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (dateValue) => {
    if (!dateValue) return "Date not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date not available";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getStatusConfig = (status) => {
    const normalizedStatus = normalize(status);

    if (
        normalizedStatus === "approved" ||
        normalizedStatus === "claim approved"
    ) {
        return {
            label: "Approved",
            icon: CheckCircle2,
            badge:
                "bg-emerald-50 text-emerald-700 border-emerald-200",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            accent: "border-l-emerald-500",
            progress: "bg-emerald-500",
            message:
                "Your claim has been approved. Follow the official campus recovery process for handover.",
        };
    }

    if (
        normalizedStatus === "rejected" ||
        normalizedStatus === "claim rejected"
    ) {
        return {
            label: "Rejected",
            icon: XCircle,
            badge:
                "bg-rose-50 text-rose-700 border-rose-200",
            iconBg: "bg-rose-50",
            iconColor: "text-rose-600",
            accent: "border-l-rose-500",
            progress: "bg-rose-500",
            message:
                "This claim was not approved. Please contact campus administration if you need clarification.",
        };
    }

    if (
        normalizedStatus === "pending review" ||
        normalizedStatus === "pending verification" ||
        normalizedStatus === "pending"
    ) {
        return {
            label: "Pending Review",
            icon: Clock3,
            badge:
                "bg-indigo-50 text-indigo-700 border-indigo-200",
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-600",
            accent: "border-l-indigo-500",
            progress: "bg-indigo-600",
            message:
                "Your claim has been submitted and is waiting for ownership verification.",
        };
    }

    return {
        label: status || "Under Review",
        icon: ShieldCheck,
        badge:
            "bg-slate-100 text-slate-700 border-slate-200",
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600",
        accent: "border-l-slate-500",
        progress: "bg-slate-500",
        message:
            "Your claim is currently being processed by the CampusFind team.",
    };
};

const getClaimStatus = (claim) => {
    return (
        claim?.status ||
        claim?.claimStatus ||
        "Pending Review"
    );
};

const getClaimName = (claim, type) => {
    if (type === "found") {
        return (
            claim?.foundItemName ||
            claim?.itemName ||
            "Found Item"
        );
    }

    return (
        claim?.lostItemName ||
        claim?.itemName ||
        "Lost Item"
    );
};

function StatCard({
    icon: Icon,
    label,
    value,
    description,
    iconClass = "text-indigo-600",
    iconBg = "bg-indigo-50",
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {label}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
                >
                    <Icon
                        className={`h-5 w-5 ${iconClass}`}
                    />
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Icon className="h-4 w-4 text-slate-500" />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                    {value || "Not specified"}
                </p>
            </div>
        </div>
    );
}

function ItemImage({ item, fallbackIcon: FallbackIcon }) {
    const image = getItemImage(item);

    return (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-28 sm:w-28">
            {image ? (
                <img
                    src={image}
                    alt={item?.itemName || "Item"}
                    className="h-full w-full object-contain"
                />
            ) : (
                <FallbackIcon className="h-8 w-8 text-slate-400" />
            )}
        </div>
    );
}

export default function MyClaims() {
    const navigate = useNavigate();

    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const loadClaims = () => {
        setLoading(true);

        try {
            const allClaims = JSON.parse(
                localStorage.getItem(
                    CLAIMS_STORAGE_KEY
                ) || "[]"
            );

            const lostReports = JSON.parse(
                localStorage.getItem(
                    LOST_STORAGE_KEY
                ) || "[]"
            );

            const foundReports = JSON.parse(
                localStorage.getItem(
                    FOUND_STORAGE_KEY
                ) || "[]"
            );

            const currentEmail =
                normalize(getCurrentUserEmail());

            const userClaims = allClaims
                .filter((claim) => {
                    const claimEmail = normalize(
                        claim?.claimantEmail ||
                            claim?.email ||
                            claim?.userEmail
                    );

                    return (
                        !currentEmail ||
                        claimEmail === currentEmail
                    );
                })
                .map((claim) => {
                    const lostItem =
                        lostReports.find(
                            (item) =>
                                String(item.id) ===
                                String(
                                    claim.lostItemId
                                )
                        ) || null;

                    const foundItem =
                        foundReports.find(
                            (item) =>
                                String(item.id) ===
                                String(
                                    claim.foundItemId
                                )
                        ) || null;

                    return {
                        ...claim,
                        lostItem,
                        foundItem,

                        displayFoundName:
                            claim.foundItemName ||
                            foundItem?.itemName ||
                            claim.itemName ||
                            "Found Item",

                        displayLostName:
                            claim.lostItemName ||
                            lostItem?.itemName ||
                            "Lost Item",

                        displayUserName:
                            claim.claimantName ||
                            claim.studentName ||
                            "Campus User",

                        displayMessage:
                            claim.message ||
                            claim.ownershipDetails ||
                            "Ownership details were not provided.",

                        displayScore:
                            Number(
                                claim.matchScore
                            ) || 0,
                    };
                });

            userClaims.sort((a, b) => {
                return (
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
                );
            });

            setClaims(userClaims);
        } catch (error) {
            console.error(
                "Error loading claims:",
                error
            );

            setClaims([]);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 250);
        }
    };

    useEffect(() => {
        loadClaims();
    }, []);

    const stats = useMemo(() => {
        const total = claims.length;

        const pending = claims.filter((claim) => {
            const status = normalize(
                getClaimStatus(claim)
            );

            return (
                status === "pending review" ||
                status === "pending verification" ||
                status === "pending"
            );
        }).length;

        const approved = claims.filter((claim) => {
            return (
                normalize(
                    getClaimStatus(claim)
                ) === "approved"
            );
        }).length;

        const rejected = claims.filter((claim) => {
            return (
                normalize(
                    getClaimStatus(claim)
                ) === "rejected"
            );
        }).length;

        const averageScore =
            total > 0
                ? Math.round(
                      claims.reduce(
                          (sum, claim) =>
                              sum +
                              claim.displayScore,
                          0
                      ) / total
                  )
                : 0;

        return {
            total,
            pending,
            approved,
            rejected,
            averageScore,
        };
    }, [claims]);

    const filteredClaims = useMemo(() => {
        let result = [...claims];

        if (search.trim()) {
            const query = normalize(search);

            result = result.filter((claim) => {
                const searchableText =
                    normalize(`
                        ${claim.displayFoundName}
                        ${claim.displayLostName}
                        ${claim.id}
                        ${claim.displayUserName}
                        ${claim.foundItem?.category || ""}
                        ${claim.foundItem?.foundLocation || ""}
                        ${claim.foundItem?.currentLocation || ""}
                    `);

                return searchableText.includes(query);
            });
        }

        if (statusFilter !== "all") {
            result = result.filter((claim) => {
                const status = normalize(
                    getClaimStatus(claim)
                );

                if (statusFilter === "pending") {
                    return (
                        status === "pending review" ||
                        status ===
                            "pending verification" ||
                        status === "pending"
                    );
                }

                if (statusFilter === "approved") {
                    return status === "approved";
                }

                if (statusFilter === "rejected") {
                    return status === "rejected";
                }

                return true;
            });
        }

        result.sort((a, b) => {
            if (sortBy === "newest") {
                return (
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
                );
            }

            if (sortBy === "oldest") {
                return (
                    new Date(
                        a.createdAt || 0
                    ) -
                    new Date(
                        b.createdAt || 0
                    )
                );
            }

            if (sortBy === "confidence") {
                return (
                    b.displayScore -
                    a.displayScore
                );
            }

            return 0;
        });

        return result;
    }, [
        claims,
        search,
        statusFilter,
        sortBy,
    ]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex min-h-16 items-center justify-between gap-4">
                        <button
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                Dashboard
                            </span>
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>

                            <span className="font-bold tracking-tight text-slate-900">
                                CampusFind
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
                {/* Hero */}
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="relative p-6 sm:p-8 lg:p-10">
                        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-50 blur-3xl" />
                        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-50 blur-3xl" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
                                    <FileText className="h-7 w-7 text-white" />
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                            My Claims
                                        </h1>

                                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                                            Recovery Center
                                        </span>
                                    </div>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                        Track your ownership
                                        verification requests,
                                        monitor claim progress,
                                        and follow the recovery
                                        process.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={loadClaims}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                />
                                Refresh
                            </button>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        icon={FileText}
                        label="Total Claims"
                        value={stats.total}
                        description="All submitted claims"
                    />

                    <StatCard
                        icon={Clock3}
                        label="Pending"
                        value={stats.pending}
                        description="Awaiting verification"
                        iconClass="text-indigo-600"
                        iconBg="bg-indigo-50"
                    />

                    <StatCard
                        icon={CheckCircle2}
                        label="Approved"
                        value={stats.approved}
                        description="Successfully verified"
                        iconClass="text-emerald-600"
                        iconBg="bg-emerald-50"
                    />

                    <StatCard
                        icon={XCircle}
                        label="Rejected"
                        value={stats.rejected}
                        description="Not approved"
                        iconClass="text-rose-600"
                        iconBg="bg-rose-50"
                    />

                    <StatCard
                        icon={BarChart3}
                        label="Avg. Confidence"
                        value={`${stats.averageScore}%`}
                        description="Match confidence"
                        iconClass="text-blue-600"
                        iconBg="bg-blue-50"
                    />
                </section>

                {/* Search & Filters */}
                {claims.length > 0 && (
                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search claims, items or claim ID..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                />
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative">
                                    <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <select
                                        value={
                                            statusFilter
                                        }
                                        onChange={(e) =>
                                            setStatusFilter(
                                                e.target.value
                                            )
                                        }
                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 sm:w-48"
                                    >
                                        <option value="all">
                                            All Status
                                        </option>

                                        <option value="pending">
                                            Pending Review
                                        </option>

                                        <option value="approved">
                                            Approved
                                        </option>

                                        <option value="rejected">
                                            Rejected
                                        </option>
                                    </select>

                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                </div>

                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) =>
                                            setSortBy(
                                                e.target.value
                                            )
                                        }
                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 sm:w-48"
                                    >
                                        <option value="newest">
                                            Newest First
                                        </option>

                                        <option value="oldest">
                                            Oldest First
                                        </option>

                                        <option value="confidence">
                                            Highest Confidence
                                        </option>
                                    </select>

                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Results heading */}
                {claims.length > 0 && (
                    <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Your Recovery Requests
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-slate-700">
                                    {
                                        filteredClaims.length
                                    }
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-700">
                                    {claims.length}
                                </span>{" "}
                                claims
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            Claims are reviewed for ownership
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="mt-5 space-y-5">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                            >
                                <div className="flex gap-4">
                                    <div className="h-24 w-24 rounded-xl bg-slate-200" />

                                    <div className="flex-1">
                                        <div className="h-5 w-48 rounded bg-slate-200" />

                                        <div className="mt-3 h-4 w-72 rounded bg-slate-100" />

                                        <div className="mt-5 h-3 w-full rounded bg-slate-100" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No claims */}
                {!loading &&
                    claims.length === 0 && (
                        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50">
                                <Inbox className="h-10 w-10 text-indigo-500" />
                            </div>

                            <h2 className="mt-6 text-2xl font-bold text-slate-900">
                                No Claims Yet
                            </h2>

                            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                                When you find a potential match
                                for one of your lost items, you
                                can submit an ownership claim from
                                the Smart Matches page.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/matches"
                                    )
                                }
                                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                            >
                                <Search className="h-4 w-4" />
                                Explore Smart Matches
                            </button>
                        </div>
                    )}

                {/* No filtered results */}
                {!loading &&
                    claims.length > 0 &&
                    filteredClaims.length === 0 && (
                        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                            <Search className="mx-auto h-10 w-10 text-slate-300" />

                            <h3 className="mt-4 text-lg font-bold text-slate-900">
                                No matching claims
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Try changing your search or
                                status filter.
                            </p>

                            <button
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter(
                                        "all"
                                    );
                                }}
                                className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                {/* Claims */}
                {!loading &&
                    filteredClaims.length > 0 && (
                        <div className="mt-5 space-y-5">
                            {filteredClaims.map(
                                (claim) => {
                                    const status =
                                        getStatusConfig(
                                            getClaimStatus(
                                                claim
                                            )
                                        );

                                    const StatusIcon =
                                        status.icon;

                                    const matchScore =
                                        Math.min(
                                            100,
                                            Math.max(
                                                0,
                                                claim.displayScore
                                            )
                                        );

                                    return (
                                        <article
                                            key={
                                                claim.id
                                            }
                                            className={`overflow-hidden rounded-2xl border border-slate-200 border-l-4 bg-white shadow-sm transition hover:shadow-md ${status.accent}`}
                                        >
                                            {/* Claim top */}
                                            <div className="p-5 sm:p-6">
                                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="flex min-w-0 items-start gap-4">
                                                        <ItemImage
                                                            item={
                                                                claim.foundItem
                                                            }
                                                            fallbackIcon={
                                                                Package
                                                            }
                                                        />

                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span
                                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.badge}`}
                                                                >
                                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                                    {
                                                                        status.label
                                                                    }
                                                                </span>

                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                                                    <ShieldCheck className="h-3.5 w-3.5" />
                                                                    Ownership
                                                                    Claim
                                                                </span>
                                                            </div>

                                                            <h3 className="mt-3 text-xl font-bold text-slate-900">
                                                                {
                                                                    claim.displayFoundName
                                                                }
                                                            </h3>

                                                            <p className="mt-1 text-sm text-slate-500">
                                                                Claim ID:{" "}
                                                                <span className="font-medium text-slate-700">
                                                                    {
                                                                        claim.id
                                                                    }
                                                                </span>
                                                            </p>

                                                            <p className="mt-1 text-sm text-slate-500">
                                                                Related lost
                                                                item:{" "}
                                                                <span className="font-semibold text-slate-700">
                                                                    {
                                                                        claim.displayLostName
                                                                    }
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Score */}
                                                    <div className="shrink-0 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 lg:min-w-40 lg:text-right">
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                                                            Match
                                                            Confidence
                                                        </p>

                                                        <p className="mt-1 text-3xl font-black tracking-tight text-indigo-700">
                                                            {
                                                                matchScore
                                                            }
                                                            %
                                                        </p>

                                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                                                            <div
                                                                className="h-full rounded-full bg-indigo-600"
                                                                style={{
                                                                    width: `${matchScore}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Info grid */}
                                                <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                                                    <InfoItem
                                                        icon={
                                                            UserCheck
                                                        }
                                                        label="Claimant"
                                                        value={
                                                            claim.displayUserName
                                                        }
                                                    />

                                                    <InfoItem
                                                        icon={
                                                            CalendarDays
                                                        }
                                                        label="Submitted"
                                                        value={formatDate(
                                                            claim.createdAt
                                                        )}
                                                    />

                                                    <InfoItem
                                                        icon={
                                                            MapPin
                                                        }
                                                        label="Found Location"
                                                        value={
                                                            claim
                                                                .foundItem
                                                                ?.foundLocation ||
                                                            claim
                                                                .foundItem
                                                                ?.currentLocation ||
                                                            claim
                                                                .foundItem
                                                                ?.location
                                                        }
                                                    />

                                                    <InfoItem
                                                        icon={
                                                            Package
                                                        }
                                                        label="Category"
                                                        value={
                                                            claim
                                                                .foundItem
                                                                ?.category
                                                        }
                                                    />
                                                </div>

                                                {/* Ownership message */}
                                                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                                                            <FileText className="h-4 w-4 text-indigo-500" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-800">
                                                                Ownership
                                                                Details
                                                            </p>

                                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                                {
                                                                    claim.displayMessage
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status message */}
                                                <div
                                                    className={`mt-4 rounded-2xl border p-4 ${
                                                        status.label ===
                                                        "Approved"
                                                            ? "border-emerald-200 bg-emerald-50"
                                                            : status.label ===
                                                              "Rejected"
                                                            ? "border-rose-200 bg-rose-50"
                                                            : "border-indigo-200 bg-indigo-50"
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <StatusIcon
                                                            className={`mt-0.5 h-5 w-5 shrink-0 ${status.iconColor}`}
                                                        />

                                                        <div>
                                                            <p
                                                                className={`text-sm font-bold ${
                                                                    status.label ===
                                                                    "Approved"
                                                                        ? "text-emerald-800"
                                                                        : status.label ===
                                                                          "Rejected"
                                                                        ? "text-rose-800"
                                                                        : "text-indigo-800"
                                                                }`}
                                                            >
                                                                {
                                                                    status.label
                                                                }
                                                            </p>

                                                            <p
                                                                className={`mt-1 text-sm leading-5 ${
                                                                    status.label ===
                                                                    "Approved"
                                                                        ? "text-emerald-700"
                                                                        : status.label ===
                                                                          "Rejected"
                                                                        ? "text-rose-700"
                                                                        : "text-indigo-700"
                                                                }`}
                                                            >
                                                                {
                                                                    status.message
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <Clock3 className="h-3.5 w-3.5" />
                                                        Submitted{" "}
                                                        {formatDateTime(
                                                            claim.createdAt
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col gap-2 sm:flex-row">
                                                        {claim.lostItem?.id && (
                                                            <button
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/item/lost/${claim.lostItem.id}`
                                                                    )
                                                                }
                                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                Lost
                                                                Details
                                                            </button>
                                                        )}

                                                        {claim.foundItem?.id && (
                                                            <button
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/item/found/${claim.foundItem.id}`
                                                                    )
                                                                }
                                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                Found
                                                                Details
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recovery progress */}
                                            <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="h-4 w-4 text-indigo-500" />

                                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                            Recovery
                                                            Process
                                                        </span>
                                                    </div>

                                                    <span className="text-xs font-medium text-slate-400">
                                                        Claim submitted
                                                        → Verification
                                                        → Handover
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex items-center">
                                                    <div className="flex items-center">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </div>

                                                        <div className="h-1 w-10 bg-indigo-200 sm:w-16" />
                                                    </div>

                                                    <div className="flex items-center">
                                                        <div
                                                            className={`flex h-7 w-7 items-center justify-center rounded-full ${
                                                                status.label ===
                                                                    "Approved" ||
                                                                status.label ===
                                                                    "Rejected"
                                                                    ? "bg-indigo-600 text-white"
                                                                    : "border-2 border-indigo-500 bg-white text-indigo-600"
                                                            }`}
                                                        >
                                                            {status.label ===
                                                            "Approved" ? (
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            ) : status.label ===
                                                              "Rejected" ? (
                                                                <XCircle className="h-4 w-4" />
                                                            ) : (
                                                                <Clock3 className="h-4 w-4" />
                                                            )}
                                                        </div>

                                                        <div className="h-1 w-10 bg-slate-200 sm:w-16" />
                                                    </div>

                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-300">
                                                        <Package className="h-3.5 w-3.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    )}
            </main>
        </div>
    );
}
