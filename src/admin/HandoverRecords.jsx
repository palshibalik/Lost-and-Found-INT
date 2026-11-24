
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    PackageCheck,
    Search,
    CheckCircle,
    Clock,
    User,
    Mail,
    Calendar,
    ShieldCheck,
    RefreshCw,
    Eye,
    X,
    Package,
    MapPin,
    Phone,
    FileText,
    Filter,
    ChevronDown,
    AlertCircle,
} from "lucide-react";

function HandoverRecords() {
    const navigate = useNavigate();

    const [claims, setClaims] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
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

    /*
     * Send notification to the student
     */
    const addNotification = (claim) => {
        const notifications = JSON.parse(
            localStorage.getItem("campusFindNotifications") || "[]"
        );

        const notification = {
            id: `handover-${claim.id}-${Date.now()}`,
            title: "Item Recovered Successfully",
            message: `The handover for "${claim.foundItemName || "your claimed item"}" has been completed successfully.`,
            type: "success",
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

    /*
     * Complete Handover
     */
    const completeHandover = (claimId) => {
        const confirmed = window.confirm(
            "Do you confirm that the item has been physically handed over to the correct person?"
        );

        if (!confirmed) return;

        const selectedClaim = claims.find(
            (claim) => claim.id === claimId
        );

        if (
            !selectedClaim ||
            selectedClaim.status !== "Approved"
        ) {
            alert(
                "This claim is not eligible for handover."
            );
            return;
        }

        const handoverDate =
            new Date().toISOString();

        const adminEmail =
            localStorage.getItem("campusFindUserEmail") ||
            "admin";

        /*
         * Update Claim
         */
        const savedClaims = JSON.parse(
            localStorage.getItem("campusFindClaims") || "[]"
        );

        const updatedClaims = savedClaims.map(
            (claim) =>
                claim.id === claimId
                    ? {
                          ...claim,
                          status: "Recovered",
                          handedOverAt: handoverDate,
                          handedOverBy: adminEmail,
                          recoveryStatus: "Recovered",
                      }
                    : claim
        );

        localStorage.setItem(
            "campusFindClaims",
            JSON.stringify(updatedClaims)
        );

        /*
         * Update Found Item
         */
        const foundReports = JSON.parse(
            localStorage.getItem(
                "campusFindFoundReports"
            ) || "[]"
        );

        const updatedFoundReports =
            foundReports.map((item) =>
                item.id === selectedClaim.foundItemId
                    ? {
                          ...item,
                          status: "Recovered",
                          recoveredAt: handoverDate,
                          recoveryStatus: "Recovered",
                          claimStatus: "Claimed",
                      }
                    : item
            );

        localStorage.setItem(
            "campusFindFoundReports",
            JSON.stringify(updatedFoundReports)
        );

        /*
         * Update Lost Item if linked
         */
        const lostReports = JSON.parse(
            localStorage.getItem(
                "campusFindLostReports"
            ) || "[]"
        );

        const updatedLostReports =
            lostReports.map((item) =>
                item.id === selectedClaim.lostItemId
                    ? {
                          ...item,
                          recoveryStatus: "Recovered",
                          claimStatus: "Recovered",
                          recoveredAt: handoverDate,
                      }
                    : item
            );

        localStorage.setItem(
            "campusFindLostReports",
            JSON.stringify(updatedLostReports)
        );

        /*
         * Student notification
         */
        addNotification(selectedClaim);

        const finalClaims = updatedClaims.sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        );

        setClaims(finalClaims);

        if (selectedClaim) {
            setSelectedClaim({
                ...selectedClaim,
                status: "Recovered",
                handedOverAt: handoverDate,
                handedOverBy: adminEmail,
                recoveryStatus: "Recovered",
            });
        }

        alert(
            "Handover completed successfully! The item is now marked as Recovered."
        );
    };

    /*
     * Statistics
     */
    const approvedClaims = claims.filter(
        (claim) => claim.status === "Approved"
    );

    const completedClaims = claims.filter(
        (claim) => claim.status === "Recovered"
    );

    const totalHandoverRecords =
        approvedClaims.length +
        completedClaims.length;

    /*
     * Search + Filter + Sort
     */
    const filteredClaims = useMemo(() => {
        const searchText =
            search.trim().toLowerCase();

        const result = claims.filter((claim) => {
            const isHandoverRecord =
                claim.status === "Approved" ||
                claim.status === "Recovered";

            if (!isHandoverRecord) return false;

            const matchesStatus =
                statusFilter === "All" ||
                claim.status === statusFilter;

            const searchableText = [
                claim.studentName,
                claim.email,
                claim.studentEmail,
                claim.lostItemName,
                claim.foundItemName,
                claim.id,
                claim.contact,
                claim.foundLocation,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !searchText ||
                searchableText.includes(searchText);

            return (
                matchesStatus &&
                matchesSearch
            );
        });

        return [...result].sort((a, b) => {
            if (sortBy === "oldest") {
                return (
                    new Date(a.createdAt || 0) -
                    new Date(b.createdAt || 0)
                );
            }

            if (sortBy === "recent-handover") {
                return (
                    new Date(
                        b.handedOverAt || 0
                    ) -
                    new Date(
                        a.handedOverAt || 0
                    )
                );
            }

            return (
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
            );
        });
    }, [
        claims,
        search,
        statusFilter,
        sortBy,
    ]);

    const openDetails = (claim) => {
        setSelectedClaim(claim);
        setShowDetails(true);
    };

    const closeDetails = () => {
        setSelectedClaim(null);
        setShowDetails(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* HEADER */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="h-16 flex items-center justify-between gap-4">

                        <button
                            onClick={() =>
                                navigate("/admin")
                            }
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
                                    Recovery Management
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

                {/* TITLE */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">

                    <div>

                        <div className="flex items-center gap-2 mb-2">

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                                <PackageCheck className="w-3.5 h-3.5" />
                                RECOVERY CENTER
                            </span>

                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Handover Records
                        </h1>

                        <p className="text-slate-500 mt-2 max-w-2xl">
                            Manage approved ownership claims,
                            complete physical handovers, and
                            maintain recovery records.
                        </p>

                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Secure recovery workflow
                    </div>

                </div>

                {/* STATISTICS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

                    <StatCard
                        title="Total Records"
                        value={totalHandoverRecords}
                        subtitle="Approved + completed"
                        icon={Package}
                        iconBg="bg-blue-50"
                        iconColor="text-blue-600"
                    />

                    <StatCard
                        title="Pending Handover"
                        value={approvedClaims.length}
                        subtitle="Ready for physical handover"
                        icon={Clock}
                        iconBg="bg-orange-50"
                        iconColor="text-orange-600"
                    />

                    <StatCard
                        title="Completed"
                        value={completedClaims.length}
                        subtitle="Successfully recovered"
                        icon={CheckCircle}
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-600"
                    />

                </div>

                {/* RECOVERY PROGRESS */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                        <div>
                            <h2 className="font-bold text-slate-900">
                                Recovery Progress
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Percentage of approved claims that have
                                completed physical handover.
                            </p>
                        </div>

                        <span className="text-lg font-extrabold text-emerald-600">
                            {totalHandoverRecords === 0
                                ? 0
                                : Math.round(
                                      (completedClaims.length /
                                          totalHandoverRecords) *
                                          100
                                  )}
                            %
                        </span>

                    </div>

                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">

                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{
                                width: `${
                                    totalHandoverRecords ===
                                    0
                                        ? 0
                                        : (completedClaims.length /
                                              totalHandoverRecords) *
                                          100
                                }%`,
                            }}
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
                                    Handover Records
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    {filteredClaims.length} result
                                    {filteredClaims.length !==
                                    1
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
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search student, email or item..."
                                    className="w-full sm:w-64 pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />

                            </div>

                            {/* STATUS */}
                            <div className="relative">

                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
                                    className="w-full sm:w-44 appearance-none px-4 pr-9 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="All">
                                        All Records
                                    </option>

                                    <option value="Approved">
                                        Pending Handover
                                    </option>

                                    <option value="Recovered">
                                        Completed
                                    </option>
                                </select>

                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

                            </div>

                            {/* SORT */}
                            <div className="relative">

                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(
                                            e.target.value
                                        )
                                    }
                                    className="w-full sm:w-44 appearance-none px-4 pr-9 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="newest">
                                        Newest Claims
                                    </option>

                                    <option value="oldest">
                                        Oldest Claims
                                    </option>

                                    <option value="recent-handover">
                                        Recent Handovers
                                    </option>
                                </select>

                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

                            </div>

                        </div>

                    </div>

                </div>

                {/* RECORD LIST */}
                {filteredClaims.length === 0 ? (

                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">

                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">

                            <PackageCheck className="w-8 h-8 text-slate-400" />

                        </div>

                        <h3 className="text-xl font-bold text-slate-900">
                            No Handover Records Found
                        </h3>

                        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                            Approved claims will appear here
                            and can be completed after the
                            physical handover.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-5">

                        {filteredClaims.map(
                            (claim) => (
                                <HandoverCard
                                    key={claim.id}
                                    claim={claim}
                                    onView={() =>
                                        openDetails(
                                            claim
                                        )
                                    }
                                    onComplete={() =>
                                        completeHandover(
                                            claim.id
                                        )
                                    }
                                />
                            )
                        )}

                    </div>

                )}

            </main>

            {/* DETAILS MODAL */}
            {showDetails &&
                selectedClaim && (
                    <HandoverDetailsModal
                        claim={selectedClaim}
                        onClose={closeDetails}
                        onComplete={() =>
                            completeHandover(
                                selectedClaim.id
                            )
                        }
                    />
                )}

        </div>
    );
}

/* =========================================================
   HANDOVER CARD
========================================================= */

const HandoverCard = ({
    claim,
    onView,
    onComplete,
}) => {
    const isRecovered =
        claim.status === "Recovered";

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition">

            {/* TOP */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                <div className="flex items-start gap-4 min-w-0">

                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            isRecovered
                                ? "bg-emerald-50"
                                : "bg-orange-50"
                        }`}
                    >
                        {isRecovered ? (
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        ) : (
                            <Clock className="w-6 h-6 text-orange-600" />
                        )}
                    </div>

                    <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-lg font-bold text-slate-900">
                                {claim.foundItemName ||
                                    claim.lostItemName ||
                                    "Recovered Item"}
                            </h3>

                            <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                    isRecovered
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                        : "bg-orange-50 text-orange-700 border-orange-100"
                                }`}
                            >
                                {isRecovered
                                    ? "Handover Completed"
                                    : "Pending Handover"}
                            </span>

                        </div>

                        <p className="text-sm text-slate-500 mt-1">
                            Claim ID:{" "}
                            <span className="font-medium text-slate-700">
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

                {/* ACTION */}
                <div className="flex flex-col sm:flex-row gap-2">

                    <button
                        onClick={onView}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                    >
                        <Eye className="w-4 h-4" />
                        View Details
                    </button>

                    {!isRecovered && (
                        <button
                            onClick={onComplete}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Complete Handover
                        </button>
                    )}

                </div>

            </div>

            {/* DETAILS */}
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
                    label="Claim Date"
                    value={formatDate(
                        claim.createdAt
                    )}
                />

            </div>

            {/* OWNERSHIP */}
            {claim.ownershipDetails && (
                <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100">

                    <div className="flex items-start gap-3">

                        <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />

                        <div>
                            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                                Ownership Verification
                            </p>

                            <p className="text-sm text-blue-900 mt-1.5 leading-relaxed">
                                {claim.ownershipDetails}
                            </p>
                        </div>

                    </div>

                </div>
            )}

            {/* COMPLETION INFO */}
            {isRecovered &&
                claim.handedOverAt && (
                    <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-100">

                        <div className="flex items-start gap-3">

                            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />

                            <div>

                                <p className="text-sm font-bold text-emerald-800">
                                    Handover Completed Successfully
                                </p>

                                <p className="text-xs text-emerald-700 mt-1">
                                    Completed on{" "}
                                    {formatDate(
                                        claim.handedOverAt,
                                        true
                                    )}

                                    {claim.handedOverBy &&
                                        ` by ${claim.handedOverBy}`}
                                </p>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};

/* =========================================================
   DETAILS MODAL
========================================================= */

const HandoverDetailsModal = ({
    claim,
    onClose,
    onComplete,
}) => {
    const isRecovered =
        claim.status === "Recovered";

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">

                {/* HEADER */}
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 sm:px-6 py-4 flex items-center justify-between">

                    <div>

                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            Handover Review
                        </p>

                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                            {claim.foundItemName ||
                                claim.lostItemName ||
                                "Recovered Item"}
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

                    {/* STATUS */}
                    <div
                        className={`p-4 rounded-2xl border ${
                            isRecovered
                                ? "bg-emerald-50 border-emerald-100"
                                : "bg-orange-50 border-orange-100"
                        }`}
                    >

                        <div className="flex items-start gap-3">

                            {isRecovered ? (
                                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                            )}

                            <div>

                                <p
                                    className={`font-bold ${
                                        isRecovered
                                            ? "text-emerald-800"
                                            : "text-orange-800"
                                    }`}
                                >
                                    {isRecovered
                                        ? "Handover Completed"
                                        : "Ready for Handover"}
                                </p>

                                <p
                                    className={`text-sm mt-1 ${
                                        isRecovered
                                            ? "text-emerald-700"
                                            : "text-orange-700"
                                    }`}
                                >
                                    {isRecovered
                                        ? "This item has been successfully recovered by the approved claimant."
                                        : "This claim has been approved and is waiting for physical handover."}
                                </p>

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
                                value={
                                    claim.studentName
                                }
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
                                value={
                                    claim.contact
                                }
                            />

                            <DetailBox
                                icon={<Calendar />}
                                label="Claim Submitted"
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
                                label="Found Location"
                                value={
                                    claim.foundLocation ||
                                    claim.location
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

                        <SectionTitle title="Ownership Verification" />

                        <div className="mt-3 p-5 rounded-2xl bg-blue-50 border border-blue-100">

                            <p className="text-sm leading-7 text-blue-900">
                                {claim.ownershipDetails ||
                                    "No ownership details provided."}
                            </p>

                        </div>

                    </section>

                    {/* HANDOVER */}
                    {isRecovered &&
                        claim.handedOverAt && (
                            <section>

                                <SectionTitle title="Handover Completion" />

                                <div className="mt-3 p-5 rounded-2xl bg-emerald-50 border border-emerald-100">

                                    <div className="flex items-start gap-3">

                                        <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />

                                        <div>

                                            <p className="font-bold text-emerald-900">
                                                Recovery Completed
                                            </p>

                                            <p className="text-sm text-emerald-800 mt-1">
                                                Handed over on{" "}
                                                {formatDate(
                                                    claim.handedOverAt,
                                                    true
                                                )}
                                            </p>

                                            {claim.handedOverBy && (
                                                <p className="text-sm text-emerald-800 mt-1">
                                                    Processed by:{" "}
                                                    <span className="font-semibold">
                                                        {
                                                            claim.handedOverBy
                                                        }
                                                    </span>
                                                </p>
                                            )}

                                        </div>

                                    </div>

                                </div>

                            </section>
                        )}

                </div>

                {/* FOOTER ACTION */}
                {!isRecovered && (
                    <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 sm:px-6 py-4">

                        <button
                            onClick={onComplete}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Confirm & Complete Handover
                        </button>

                    </div>
                )}

            </div>
        </div>
    );
};

/* =========================================================
   COMPONENTS
========================================================= */

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
                <Icon
                    className={`w-5 h-5 ${iconColor}`}
                />
            </div>

        </div>

    </div>
);

const InfoItem = ({
    icon,
    label,
    value,
}) => (
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

const DetailBox = ({
    icon,
    label,
    value,
}) => (
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

const SectionTitle = ({
    title,
}) => (
    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
        {title}
    </h3>
);

const formatDate = (
    date,
    includeTime = false
) => {
    if (!date) return "Not provided";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "Not provided";
    }

    return parsed.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            ...(includeTime
                ? {
                      hour: "2-digit",
                      minute: "2-digit",
                  }
                : {}),
        }
    );
};

export default HandoverRecords;
