
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Search,
    User,
    Mail,
    Phone,
    Package,
    Calendar,
    ShieldCheck,
    RefreshCw,
    Eye,
    ChevronDown,
    Filter,
    TrendingUp,
    AlertCircle,
    MapPin,
    X,
} from "lucide-react";

const ManageClaims = () => {
    const navigate = useNavigate();

    const [claims, setClaims] = useState([]);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadClaims();
    }, []);

    const loadClaims = () => {
        const savedClaims = JSON.parse(
            localStorage.getItem("campusFindClaims") || "[]"
        );

        const sortedClaims = [...savedClaims].sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        );

        setClaims(sortedClaims);
    };

    const handleRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            loadClaims();
            setRefreshing(false);
        }, 500);
    };

    const addNotification = (claim, status) => {
        const notifications = JSON.parse(
            localStorage.getItem("campusFindNotifications") || "[]"
        );

        const message =
            status === "Approved"
                ? `Your claim for "${claim.foundItemName || "the found item"}" has been approved.`
                : `Your claim for "${claim.foundItemName || "the found item"}" has been rejected after review.`;

        const notification = {
            id: `claim-review-${claim.id}-${Date.now()}`,
            title:
                status === "Approved"
                    ? "Claim Approved"
                    : "Claim Rejected",
            message,
            type:
                status === "Approved"
                    ? "success"
                    : "warning",
            read: false,
            createdAt: new Date().toISOString(),
            relatedClaimId: claim.id,
            recipientEmail:
                claim.email ||
                claim.studentEmail ||
                claim.userEmail ||
                null,
        };

        localStorage.setItem(
            "campusFindNotifications",
            JSON.stringify([
                notification,
                ...notifications,
            ])
        );
    };

    const updateClaimStatus = (claimId, newStatus) => {
        const action =
            newStatus === "Approved"
                ? "approve"
                : "reject";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this claim?`
        );

        if (!confirmed) return;

        const savedClaims = JSON.parse(
            localStorage.getItem("campusFindClaims") || "[]"
        );

        const existingClaim = savedClaims.find(
            (claim) => claim.id === claimId
        );

        if (!existingClaim) return;

        const adminEmail =
            localStorage.getItem("campusFindUserEmail") ||
            "admin";

        const updatedClaims = savedClaims.map((claim) =>
            claim.id === claimId
                ? {
                      ...claim,
                      status: newStatus,
                      reviewedAt: new Date().toISOString(),
                      reviewedBy: adminEmail,
                  }
                : claim
        );

        localStorage.setItem(
            "campusFindClaims",
            JSON.stringify(updatedClaims)
        );

        addNotification(existingClaim, newStatus);

        setClaims(
            [...updatedClaims].sort(
                (a, b) =>
                    new Date(b.createdAt || 0) -
                    new Date(a.createdAt || 0)
            )
        );

        if (selectedClaim?.id === claimId) {
            setSelectedClaim({
                ...existingClaim,
                status: newStatus,
                reviewedAt: new Date().toISOString(),
                reviewedBy: adminEmail,
            });
        }
    };

    const totalCount = claims.length;

    const pendingCount = claims.filter(
        (claim) =>
            claim.status === "Pending Verification" ||
            claim.status === "Pending"
    ).length;

    const approvedCount = claims.filter(
        (claim) => claim.status === "Approved"
    ).length;

    const rejectedCount = claims.filter(
        (claim) => claim.status === "Rejected"
    ).length;

    const averageMatch = useMemo(() => {
        const scores = claims
            .map((claim) => Number(claim.matchScore))
            .filter((score) => !Number.isNaN(score));

        if (!scores.length) return 0;

        return Math.round(
            scores.reduce((sum, score) => sum + score, 0) /
                scores.length
        );
    }, [claims]);

    const filteredClaims = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        const result = claims.filter((claim) => {
            const claimStatus =
                claim.status || "Pending Verification";

            const matchesFilter =
                filter === "All" ||
                claimStatus === filter;

            const searchableText = [
                claim.id,
                claim.studentName,
                claim.email,
                claim.studentEmail,
                claim.foundItemName,
                claim.lostItemName,
                claim.category,
                claim.ownershipDetails,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !searchText ||
                searchableText.includes(searchText);

            return matchesFilter && matchesSearch;
        });

        return [...result].sort((a, b) => {
            if (sortBy === "oldest") {
                return (
                    new Date(a.createdAt || 0) -
                    new Date(b.createdAt || 0)
                );
            }

            if (sortBy === "highest") {
                return (
                    Number(b.matchScore || 0) -
                    Number(a.matchScore || 0)
                );
            }

            if (sortBy === "lowest") {
                return (
                    Number(a.matchScore || 0) -
                    Number(b.matchScore || 0)
                );
            }

            return (
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
            );
        });
    }, [claims, filter, search, sortBy]);

    const openDetails = (claim) => {
        setSelectedClaim(claim);
        setShowDetails(true);
    };

    const closeDetails = () => {
        setShowDetails(false);
        setSelectedClaim(null);
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* HEADER */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between gap-4">

                        <button
                            onClick={() => navigate("/admin")}
                            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">
                                Admin Dashboard
                            </span>
                            <span className="sm:hidden">
                                Back
                            </span>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>

                            <div className="hidden sm:block">
                                <p className="text-xs text-slate-400">
                                    CAMPUSFIND
                                </p>
                                <p className="text-sm font-bold text-slate-900">
                                    Admin Panel
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition disabled:opacity-60"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />
                            <span className="hidden sm:inline">
                                Refresh
                            </span>
                        </button>

                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* PAGE TITLE */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                OWNERSHIP REVIEW
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Manage Claims
                        </h1>

                        <p className="text-slate-500 mt-2 max-w-2xl">
                            Review ownership requests, verify student
                            information, and make secure claim decisions.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        Average match confidence:
                        <span className="font-bold text-slate-900">
                            {averageMatch}%
                        </span>
                    </div>

                </div>

                {/* STATISTICS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

                    <StatCard
                        title="Total Claims"
                        value={totalCount}
                        subtitle="All submitted claims"
                        icon={FileText}
                        iconBg="bg-blue-50"
                        iconColor="text-blue-600"
                    />

                    <StatCard
                        title="Pending Review"
                        value={pendingCount}
                        subtitle="Require admin action"
                        icon={Clock}
                        iconBg="bg-orange-50"
                        iconColor="text-orange-600"
                    />

                    <StatCard
                        title="Approved"
                        value={approvedCount}
                        subtitle="Verified ownership"
                        icon={CheckCircle}
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-600"
                    />

                    <StatCard
                        title="Rejected"
                        value={rejectedCount}
                        subtitle="Unverified claims"
                        icon={XCircle}
                        iconBg="bg-red-50"
                        iconColor="text-red-600"
                    />

                </div>

                {/* REVIEW HEALTH */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                Claim Review Overview
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Current distribution of ownership requests.
                            </p>
                        </div>

                        <span className="text-sm font-semibold text-slate-600">
                            {totalCount === 0
                                ? 0
                                : Math.round(
                                      (approvedCount /
                                          totalCount) *
                                          100
                                  )}
                            % approved
                        </span>
                    </div>

                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                        {totalCount > 0 && (
                            <>
                                <div
                                    className="bg-emerald-500 h-full"
                                    style={{
                                        width: `${
                                            (approvedCount /
                                                totalCount) *
                                            100
                                        }%`,
                                    }}
                                />

                                <div
                                    className="bg-orange-500 h-full"
                                    style={{
                                        width: `${
                                            (pendingCount /
                                                totalCount) *
                                            100
                                        }%`,
                                    }}
                                />

                                <div
                                    className="bg-red-500 h-full"
                                    style={{
                                        width: `${
                                            (rejectedCount /
                                                totalCount) *
                                            100
                                        }%`,
                                    }}
                                />
                            </>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-5 mt-3 text-xs text-slate-500">
                        <Legend
                            color="bg-emerald-500"
                            label={`Approved ${approvedCount}`}
                        />
                        <Legend
                            color="bg-orange-500"
                            label={`Pending ${pendingCount}`}
                        />
                        <Legend
                            color="bg-red-500"
                            label={`Rejected ${rejectedCount}`}
                        />
                    </div>

                </div>

                {/* SEARCH + FILTER */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">

                    <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                <Filter className="w-5 h-5 text-slate-600" />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Claim Requests
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    {filteredClaims.length} result
                                    {filteredClaims.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    displayed
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">

                            {/* SEARCH */}
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

                                <input
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search claims..."
                                    className="w-full sm:w-64 pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </div>

                            {/* STATUS */}
                            <div className="relative">
                                <select
                                    value={filter}
                                    onChange={(e) =>
                                        setFilter(e.target.value)
                                    }
                                    className="w-full sm:w-44 appearance-none px-4 pr-9 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="All">
                                        All Claims
                                    </option>
                                    <option value="Pending Verification">
                                        Pending
                                    </option>
                                    <option value="Approved">
                                        Approved
                                    </option>
                                    <option value="Rejected">
                                        Rejected
                                    </option>
                                </select>

                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            {/* SORT */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(e.target.value)
                                    }
                                    className="w-full sm:w-44 appearance-none px-4 pr-9 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="newest">
                                        Newest First
                                    </option>
                                    <option value="oldest">
                                        Oldest First
                                    </option>
                                    <option value="highest">
                                        Highest Match
                                    </option>
                                    <option value="lowest">
                                        Lowest Match
                                    </option>
                                </select>

                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                        </div>
                    </div>

                </div>

                {/* CLAIM LIST */}
                {filteredClaims.length === 0 ? (

                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">

                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>

                        <h3 className="text-xl font-bold text-slate-900">
                            No Claims Found
                        </h3>

                        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                            No claim requests match your current search
                            and filter settings.
                        </p>

                        {(search || filter !== "All") && (
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setFilter("All");
                                }}
                                className="mt-5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                            >
                                Clear Filters
                            </button>
                        )}

                    </div>

                ) : (

                    <div className="space-y-5">

                        {filteredClaims.map((claim) => (
                            <ClaimCard
                                key={claim.id}
                                claim={claim}
                                onView={() =>
                                    openDetails(claim)
                                }
                                onApprove={() =>
                                    updateClaimStatus(
                                        claim.id,
                                        "Approved"
                                    )
                                }
                                onReject={() =>
                                    updateClaimStatus(
                                        claim.id,
                                        "Rejected"
                                    )
                                }
                            />
                        ))}

                    </div>

                )}

            </main>

            {/* DETAILS MODAL */}
            {showDetails && selectedClaim && (
                <ClaimDetailsModal
                    claim={selectedClaim}
                    onClose={closeDetails}
                    onApprove={() => {
                        updateClaimStatus(
                            selectedClaim.id,
                            "Approved"
                        );
                    }}
                    onReject={() => {
                        updateClaimStatus(
                            selectedClaim.id,
                            "Rejected"
                        );
                    }}
                />
            )}

        </div>
    );
};

const ClaimCard = ({
    claim,
    onView,
    onApprove,
    onReject,
}) => {
    const status =
        claim.status || "Pending Verification";

    const isPending =
        status === "Pending Verification" ||
        status === "Pending";

    const statusStyle = {
        "Pending Verification":
            "bg-orange-50 text-orange-700 border-orange-100",
        Pending:
            "bg-orange-50 text-orange-700 border-orange-100",
        Approved:
            "bg-emerald-50 text-emerald-700 border-emerald-100",
        Rejected:
            "bg-red-50 text-red-700 border-red-100",
    };

    const score = Number(claim.matchScore || 0);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition">

            {/* TOP */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                <div className="flex items-start gap-4 min-w-0">

                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">
                                {claim.foundItemName ||
                                    "Found Item"}
                            </h3>

                            <span
                                className={`px-2.5 py-1 rounded-full border text-xs font-bold ${
                                    statusStyle[status] ||
                                    "bg-slate-50 text-slate-600 border-slate-100"
                                }`}
                            >
                                {status}
                            </span>
                        </div>

                        <p className="text-sm text-slate-500 mt-1">
                            Claim ID:{" "}
                            <span className="font-medium">
                                {claim.id}
                            </span>
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                            Lost Item:{" "}
                            <span className="font-semibold text-slate-700">
                                {claim.lostItemName ||
                                    "Not specified"}
                            </span>
                        </p>
                    </div>

                </div>

                {/* MATCH SCORE */}
                <div className="lg:min-w-40">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-500">
                            Match Confidence
                        </span>
                        <span className="text-sm font-extrabold text-blue-600">
                            {score}%
                        </span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${
                                score >= 80
                                    ? "bg-emerald-500"
                                    : score >= 60
                                    ? "bg-blue-500"
                                    : "bg-orange-500"
                            }`}
                            style={{
                                width: `${Math.min(
                                    Math.max(score, 0),
                                    100
                                )}%`,
                            }}
                        />
                    </div>
                </div>

            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">

                <InfoItem
                    icon={<User />}
                    label="Student"
                    value={claim.studentName}
                />

                <InfoItem
                    icon={<Mail />}
                    label="Email"
                    value={
                        claim.email ||
                        claim.studentEmail
                    }
                />

                <InfoItem
                    icon={<Phone />}
                    label="Contact"
                    value={claim.contact}
                />

                <InfoItem
                    icon={<Calendar />}
                    label="Submitted"
                    value={formatDate(
                        claim.createdAt
                    )}
                />

            </div>

            {/* OWNERSHIP PROOF */}
            <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl">

                <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />

                    <div className="min-w-0">
                        <h4 className="font-bold text-sm text-blue-900">
                            Ownership Proof
                        </h4>

                        <p className="text-sm text-blue-800 mt-1.5 leading-relaxed line-clamp-3">
                            {claim.ownershipDetails ||
                                "No identifying details provided."}
                        </p>
                    </div>
                </div>

            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">

                <button
                    onClick={onView}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                >
                    <Eye className="w-4 h-4" />
                    View Full Claim
                </button>

                {isPending ? (

                    <div className="flex flex-col sm:flex-row gap-2">

                        <button
                            onClick={onApprove}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                        </button>

                        <button
                            onClick={onReject}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition"
                        >
                            <XCircle className="w-4 h-4" />
                            Reject
                        </button>

                    </div>

                ) : (

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CheckCircle className="w-4 h-4 text-slate-400" />
                        Already reviewed
                    </div>

                )}

            </div>

        </div>
    );
};

const ClaimDetailsModal = ({
    claim,
    onClose,
    onApprove,
    onReject,
}) => {
    const status =
        claim.status || "Pending Verification";

    const isPending =
        status === "Pending Verification" ||
        status === "Pending";

    const score = Number(claim.matchScore || 0);

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">

                {/* MODAL HEADER */}
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 sm:px-6 py-4 flex items-center justify-between">

                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            Claim Review
                        </p>

                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                            {claim.foundItemName ||
                                "Found Item Claim"}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
                    >
                        <X className="w-5 h-5" />
                    </button>

                </div>

                <div className="p-5 sm:p-6 space-y-6">

                    {/* STATUS + SCORE */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            <p className="text-xs text-slate-500">
                                Current Status
                            </p>

                            <p className="font-bold text-slate-900 mt-1">
                                {status}
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                            <div className="flex justify-between">
                                <p className="text-xs text-blue-700">
                                    Match Confidence
                                </p>

                                <p className="font-extrabold text-blue-700">
                                    {score}%
                                </p>
                            </div>

                            <div className="h-2 bg-white rounded-full overflow-hidden mt-3">
                                <div
                                    className="h-full bg-blue-600 rounded-full"
                                    style={{
                                        width: `${Math.min(
                                            Math.max(score, 0),
                                            100
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>

                    </div>

                    {/* STUDENT */}
                    <section>
                        <SectionTitle title="Student Information" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">

                            <DetailBox
                                icon={<User />}
                                label="Student Name"
                                value={claim.studentName}
                            />

                            <DetailBox
                                icon={<Mail />}
                                label="Email"
                                value={
                                    claim.email ||
                                    claim.studentEmail
                                }
                            />

                            <DetailBox
                                icon={<Phone />}
                                label="Contact"
                                value={claim.contact}
                            />

                            <DetailBox
                                icon={<Calendar />}
                                label="Submitted On"
                                value={formatDate(
                                    claim.createdAt,
                                    true
                                )}
                            />

                        </div>
                    </section>

                    {/* ITEM */}
                    <section>
                        <SectionTitle title="Item Information" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">

                            <DetailBox
                                icon={<Package />}
                                label="Found Item"
                                value={
                                    claim.foundItemName
                                }
                            />

                            <DetailBox
                                icon={<Package />}
                                label="Lost Item"
                                value={
                                    claim.lostItemName
                                }
                            />

                            <DetailBox
                                icon={<MapPin />}
                                label="Location"
                                value={
                                    claim.foundLocation ||
                                    claim.location ||
                                    "Not provided"
                                }
                            />

                            <DetailBox
                                icon={<FileText />}
                                label="Claim ID"
                                value={claim.id}
                            />

                        </div>
                    </section>

                    {/* OWNERSHIP */}
                    <section>
                        <SectionTitle title="Ownership Proof / Identifying Details" />

                        <div className="mt-3 p-5 rounded-2xl bg-blue-50 border border-blue-100">
                            <p className="text-sm leading-7 text-blue-900">
                                {claim.ownershipDetails ||
                                    "No ownership details were provided."}
                            </p>
                        </div>
                    </section>

                    {/* REVIEW INFO */}
                    {claim.reviewedAt && (
                        <section>
                            <SectionTitle title="Review Information" />

                            <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
                                Reviewed on{" "}
                                <span className="font-semibold text-slate-900">
                                    {formatDate(
                                        claim.reviewedAt,
                                        true
                                    )}
                                </span>

                                {claim.reviewedBy && (
                                    <>
                                        {" "}
                                        by{" "}
                                        <span className="font-semibold text-slate-900">
                                            {claim.reviewedBy}
                                        </span>
                                    </>
                                )}
                            </div>
                        </section>
                    )}

                </div>

                {/* MODAL ACTIONS */}
                {isPending && (
                    <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 sm:px-6 py-4">

                        <div className="flex flex-col sm:flex-row gap-3">

                            <button
                                onClick={() => {
                                    onApprove();
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Approve Claim
                            </button>

                            <button
                                onClick={() => {
                                    onReject();
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
                            >
                                <XCircle className="w-5 h-5" />
                                Reject Claim
                            </button>

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    iconBg,
    iconColor,
}) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">

        <div className="flex items-start justify-between gap-3">

            <div>
                <p className="text-sm text-slate-500">
                    {title}
                </p>

                <p className="text-3xl font-extrabold text-slate-900 mt-1">
                    {value}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                    {subtitle}
                </p>
            </div>

            <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}
            >
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>

        </div>
    </div>
);

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 min-w-0">

        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            {icon}
        </div>

        <div className="min-w-0">
            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="text-sm font-semibold text-slate-800 mt-0.5 break-words">
                {value || "Not provided"}
            </p>
        </div>

    </div>
);

const DetailBox = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-white">

        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            {icon}
        </div>

        <div className="min-w-0">
            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="text-sm font-bold text-slate-900 mt-1 break-words">
                {value || "Not provided"}
            </p>
        </div>

    </div>
);

const SectionTitle = ({ title }) => (
    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
        {title}
    </h3>
);

const Legend = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <span
            className={`w-2.5 h-2.5 rounded-full ${color}`}
        />
        {label}
    </div>
);

const formatDate = (date, includeTime = false) => {
    if (!date) return "Not provided";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "Not provided";
    }

    return parsed.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(includeTime
            ? {
                  hour: "2-digit",
                  minute: "2-digit",
              }
            : {}),
    });
};

export default ManageClaims;
