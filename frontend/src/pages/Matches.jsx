
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Eye,
    FileSearch,
    Filter,
    Image as ImageIcon,
    MapPin,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
    Target,
    UserCheck,
    X,
    Zap,
} from "lucide-react";

const LOST_STORAGE_KEY = "campusFindLostReports";
const FOUND_STORAGE_KEY = "campusFindFoundReports";
const CLAIMS_STORAGE_KEY = "campusFindClaims";
const NOTIFICATIONS_STORAGE_KEY = "campusFindNotifications";

const getCurrentUserEmail = () => {
    return localStorage.getItem("campusFindUserEmail") || "";
};

const normalize = (value) => {
    return String(value || "").trim().toLowerCase();
};

const getItemImage = (item) => {
    return (
        item?.photoData ||
        item?.image ||
        item?.imageUrl ||
        item?.photo ||
        null
    );
};

const getDateValue = (item) => {
    const date =
        item?.lostDate ||
        item?.foundDate ||
        item?.date ||
        item?.createdAt;

    if (!date) return null;

    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (item) => {
    const date = getDateValue(item);

    if (!date) return "Date not available";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const calculateMatch = (lost, found) => {
    let score = 0;

    const breakdown = {
        category: 0,
        name: 0,
        location: 0,
        date: 0,
        description: 0,
        image: 0,
    };

    // Category - 25 points
    if (
        normalize(lost.category) &&
        normalize(lost.category) === normalize(found.category)
    ) {
        breakdown.category = 25;
        score += 25;
    }

    // Item name / brand - 20 points
    const lostName = normalize(
        `${lost.itemName || ""} ${lost.brand || ""}`
    );

    const foundName = normalize(
        `${found.itemName || ""} ${found.brand || ""}`
    );

    if (lostName && foundName) {
        const lostWords = lostName.split(/\s+/).filter(Boolean);

        const commonWords = lostWords.filter((word) =>
            foundName.includes(word)
        );

        if (commonWords.length >= 2) {
            breakdown.name = 20;
            score += 20;
        } else if (commonWords.length === 1) {
            breakdown.name = 10;
            score += 10;
        }
    }

    // Location - 20 points
    const lostLocation = normalize(
        `${lost.lostLocation || ""} ${lost.location || ""}`
    );

    const foundLocation = normalize(
        `${found.foundLocation || ""} ${found.currentLocation || ""} ${
            found.location || ""
        }`
    );

    if (
        lostLocation &&
        foundLocation &&
        (foundLocation.includes(lostLocation) ||
            lostLocation.includes(foundLocation))
    ) {
        breakdown.location = 20;
        score += 20;
    } else if (
        lostLocation &&
        foundLocation &&
        lostLocation.split(/\s+/).some((word) => {
            return word.length > 3 && foundLocation.includes(word);
        })
    ) {
        breakdown.location = 10;
        score += 10;
    }

    // Date - 15 points
    const lostDate = getDateValue(lost);
    const foundDate = getDateValue(found);

    if (lostDate && foundDate) {
        const difference = Math.abs(
            lostDate.getTime() - foundDate.getTime()
        );

        const differenceInDays =
            difference / (1000 * 60 * 60 * 24);

        if (differenceInDays <= 1) {
            breakdown.date = 15;
            score += 15;
        } else if (differenceInDays <= 3) {
            breakdown.date = 10;
            score += 10;
        } else if (differenceInDays <= 7) {
            breakdown.date = 5;
            score += 5;
        }
    }

    // Description - 10 points
    const lostDescription = normalize(
        `${lost.description || ""} ${lost.identifyingDetails || ""}`
    );

    const foundDescription = normalize(
        `${found.description || ""} ${found.identifyingDetails || ""}`
    );

    if (lostDescription && foundDescription) {
        const lostWords = lostDescription
            .split(/\s+/)
            .filter((word) => word.length > 3);

        const matchedWords = lostWords.filter((word) =>
            foundDescription.includes(word)
        );

        if (matchedWords.length >= 3) {
            breakdown.description = 10;
            score += 10;
        } else if (matchedWords.length >= 1) {
            breakdown.description = 5;
            score += 5;
        }
    }

    // Image availability - 10 points
    const lostImage = getItemImage(lost);
    const foundImage = getItemImage(found);

    if (lostImage && foundImage) {
        breakdown.image = 10;
        score += 10;
    } else if (lostImage || foundImage) {
        breakdown.image = 5;
        score += 5;
    }

    return {
        score: Math.min(score, 100),
        breakdown,
    };
};

const getConfidence = (score) => {
    if (score >= 75) {
        return {
            label: "Strong Match",
            description: "High probability of being the same item",
            level: "high",
        };
    }

    if (score >= 50) {
        return {
            label: "Possible Match",
            description: "Several details are similar",
            level: "medium",
        };
    }

    return {
        label: "Low Confidence",
        description: "Some details match",
        level: "low",
    };
};

const confidenceStyles = {
    high: {
        badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: "text-indigo-600",
        progress: "bg-indigo-600",
        score: "text-indigo-700",
        soft: "bg-indigo-50",
    },
    medium: {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        icon: "text-blue-600",
        progress: "bg-blue-600",
        score: "text-blue-700",
        soft: "bg-blue-50",
    },
    low: {
        badge: "bg-slate-100 text-slate-600 border-slate-200",
        icon: "text-slate-500",
        progress: "bg-slate-500",
        score: "text-slate-700",
        soft: "bg-slate-50",
    },
};

function StatCard({ icon: Icon, label, value, description }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {label}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                    <Icon className="h-5 w-5 text-indigo-600" />
                </div>
            </div>
        </div>
    );
}

function DetailRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Icon className="h-4 w-4 text-slate-500" />
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {label}
                </p>

                <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
                    {value || "Not specified"}
                </p>
            </div>
        </div>
    );
}

function ItemPreview({ item, type }) {
    const image = getItemImage(item);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <div className="relative flex h-52 items-center justify-center overflow-hidden bg-slate-100">
                {image ? (
                    <img
                        src={image}
                        alt={item?.itemName || "Item"}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="h-10 w-10" />
                        <p className="mt-2 text-sm">
                            No photo available
                        </p>
                    </div>
                )}

                <div className="absolute left-4 top-4">
                    <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${
                            type === "lost"
                                ? "bg-white text-rose-600"
                                : "bg-white text-blue-600"
                        }`}
                    >
                        {type === "lost" ? (
                            <FileSearch className="h-3.5 w-3.5" />
                        ) : (
                            <ShieldCheck className="h-3.5 w-3.5" />
                        )}

                        {type === "lost"
                            ? "Lost Report"
                            : "Found Report"}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="truncate text-base font-bold text-slate-900">
                    {item?.itemName || "Unnamed Item"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    {item?.category || "Category not specified"}
                </p>
            </div>
        </div>
    );
}

export default function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [confidenceFilter, setConfidenceFilter] = useState("all");
    const [sortBy, setSortBy] = useState("score");
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [claimMessage, setClaimMessage] = useState("");
    const [claimLoading, setClaimLoading] = useState(false);

    const loadMatches = () => {
        setLoading(true);

        try {
            const lostReports = JSON.parse(
                localStorage.getItem(LOST_STORAGE_KEY) || "[]"
            );

            const foundReports = JSON.parse(
                localStorage.getItem(FOUND_STORAGE_KEY) || "[]"
            );

            const currentEmail = getCurrentUserEmail();

            const userLostReports = currentEmail
                ? lostReports.filter(
                      (item) =>
                          normalize(item.reportedByEmail) ===
                          normalize(currentEmail)
                  )
                : lostReports;

            const calculatedMatches = [];

            userLostReports.forEach((lostItem) => {
                foundReports.forEach((foundItem) => {
                    const result = calculateMatch(
                        lostItem,
                        foundItem
                    );

                    if (result.score >= 30) {
                        const confidence = getConfidence(
                            result.score
                        );

                        calculatedMatches.push({
                            id: `${lostItem.id}-${foundItem.id}`,
                            lostItem,
                            foundItem,
                            score: result.score,
                            breakdown: result.breakdown,
                            confidence,
                        });
                    }
                });
            });

            setMatches(calculatedMatches);
        } catch (error) {
            console.error(
                "Error loading matches:",
                error
            );

            setMatches([]);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 300);
        }
    };

    useEffect(() => {
        loadMatches();
    }, []);

    const filteredMatches = useMemo(() => {
        let result = [...matches];

        if (search.trim()) {
            const query = normalize(search);

            result = result.filter((match) => {
                const searchableText = normalize(
                    `${match.lostItem?.itemName || ""} ${
                        match.lostItem?.category || ""
                    } ${match.lostItem?.lostLocation || ""} ${
                        match.foundItem?.itemName || ""
                    } ${match.foundItem?.category || ""} ${
                        match.foundItem?.foundLocation || ""
                    } ${match.foundItem?.currentLocation || ""}`
                );

                return searchableText.includes(query);
            });
        }

        if (confidenceFilter !== "all") {
            result = result.filter(
                (match) =>
                    match.confidence.level ===
                    confidenceFilter
            );
        }

        result.sort((a, b) => {
            if (sortBy === "score") {
                return b.score - a.score;
            }

            if (sortBy === "newest") {
                const aDate =
                    getDateValue(a.foundItem)?.getTime() || 0;

                const bDate =
                    getDateValue(b.foundItem)?.getTime() || 0;

                return bDate - aDate;
            }

            if (sortBy === "oldest") {
                const aDate =
                    getDateValue(a.foundItem)?.getTime() || 0;

                const bDate =
                    getDateValue(b.foundItem)?.getTime() || 0;

                return aDate - bDate;
            }

            return 0;
        });

        return result;
    }, [
        matches,
        search,
        confidenceFilter,
        sortBy,
    ]);

    const stats = useMemo(() => {
        const total = matches.length;

        const high = matches.filter(
            (match) => match.confidence.level === "high"
        ).length;

        const medium = matches.filter(
            (match) => match.confidence.level === "medium"
        ).length;

        const average =
            total > 0
                ? Math.round(
                      matches.reduce(
                          (sum, match) =>
                              sum + match.score,
                          0
                      ) / total
                  )
                : 0;

        return {
            total,
            high,
            medium,
            average,
        };
    }, [matches]);

    const submitClaim = () => {
        if (!selectedMatch) return;

        setClaimLoading(true);

        try {
            const currentEmail =
                getCurrentUserEmail();

            const existingClaims = JSON.parse(
                localStorage.getItem(
                    CLAIMS_STORAGE_KEY
                ) || "[]"
            );

            const alreadyClaimed = existingClaims.some(
                (claim) =>
                    claim.foundItemId ===
                        selectedMatch.foundItem.id &&
                    normalize(claim.claimantEmail) ===
                        normalize(currentEmail)
            );

            if (alreadyClaimed) {
                setClaimMessage(
                    "You have already submitted a claim for this item."
                );

                setClaimLoading(false);
                return;
            }

            const newClaim = {
                id: `claim-${Date.now()}`,
                lostItemId:
                    selectedMatch.lostItem.id,
                foundItemId:
                    selectedMatch.foundItem.id,
                claimantEmail: currentEmail,
                claimantName:
                    localStorage.getItem(
                        "campusFindUserName"
                    ) || "Campus User",
                message:
                    claimMessage.trim() ||
                    "I believe this found item belongs to me.",
                matchScore:
                    selectedMatch.score,
                status: "Pending Review",
                createdAt:
                    new Date().toISOString(),
            };

            localStorage.setItem(
                CLAIMS_STORAGE_KEY,
                JSON.stringify([
                    ...existingClaims,
                    newClaim,
                ])
            );

            // Update found item claim status
            const foundReports = JSON.parse(
                localStorage.getItem(
                    FOUND_STORAGE_KEY
                ) || "[]"
            );

            const updatedFoundReports =
                foundReports.map((item) =>
                    item.id ===
                    selectedMatch.foundItem.id
                        ? {
                              ...item,
                              claimStatus:
                                  "Claim Submitted",
                              recoveryStatus:
                                  "Claim Under Review",
                          }
                        : item
                );

            localStorage.setItem(
                FOUND_STORAGE_KEY,
                JSON.stringify(
                    updatedFoundReports
                )
            );

            // Add notification
            const notifications =
                JSON.parse(
                    localStorage.getItem(
                        NOTIFICATIONS_STORAGE_KEY
                    ) || "[]"
                );

            const notification = {
                id: `notification-${Date.now()}`,
                type: "claim",
                title: "Claim Submitted",
                message: `Your claim for "${
                    selectedMatch.foundItem.itemName ||
                    "the found item"
                }" has been submitted for review.`,
                read: false,
                createdAt:
                    new Date().toISOString(),
                userEmail: currentEmail,
            };

            localStorage.setItem(
                NOTIFICATIONS_STORAGE_KEY,
                JSON.stringify([
                    notification,
                    ...notifications,
                ])
            );

            setSelectedMatch(null);
            setClaimMessage("");
            loadMatches();
        } catch (error) {
            console.error(
                "Error submitting claim:",
                error
            );
        } finally {
            setClaimLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                        Smart Matches
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Potential matches between
                                        your lost report and
                                        found items.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Matches ranked by confidence
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Target}
                        label="Total Matches"
                        value={stats.total}
                        description="Potential matches found"
                    />

                    <StatCard
                        icon={Zap}
                        label="Strong Matches"
                        value={stats.high}
                        description="High confidence results"
                    />

                    <StatCard
                        icon={BarChart3}
                        label="Possible Matches"
                        value={stats.medium}
                        description="Need further verification"
                    />

                    <StatCard
                        icon={Sparkles}
                        label="Average Confidence"
                        value={`${stats.average}%`}
                        description="Across all detected matches"
                    />
                </div>

                {/* Matching Engine */}
                <div className="mt-6 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-blue-50">
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-indigo-100">
                                <Sparkles className="h-5 w-5 text-indigo-600" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-bold text-slate-900">
                                        Smart Matching Engine
                                    </h2>

                                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                                        AI Ready
                                    </span>
                                </div>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                                    Matches are calculated using
                                    category, item details,
                                    location, date, description
                                    and photo availability.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={loadMatches}
                            disabled={loading}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />
                            Refresh Matches
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        {/* Search */}
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
                                placeholder="Search item, category or location..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                            />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            {/* Confidence */}
                            <div className="relative">
                                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <select
                                    value={
                                        confidenceFilter
                                    }
                                    onChange={(e) =>
                                        setConfidenceFilter(
                                            e.target.value
                                        )
                                    }
                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 sm:w-48"
                                >
                                    <option value="all">
                                        All Confidence
                                    </option>
                                    <option value="high">
                                        Strong Matches
                                    </option>
                                    <option value="medium">
                                        Possible Matches
                                    </option>
                                    <option value="low">
                                        Low Confidence
                                    </option>
                                </select>

                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>

                            {/* Sort */}
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
                                    <option value="score">
                                        Highest Confidence
                                    </option>
                                    <option value="newest">
                                        Newest First
                                    </option>
                                    <option value="oldest">
                                        Oldest First
                                    </option>
                                </select>

                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Header */}
                <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Matching Results
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-700">
                                {filteredMatches.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-700">
                                {matches.length}
                            </span>{" "}
                            matches
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Ranked by confidence score
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="mt-5 space-y-5">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                            >
                                <div className="h-5 w-32 rounded bg-slate-200" />

                                <div className="mt-5 h-3 w-full rounded bg-slate-200" />

                                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                                    <div className="h-72 rounded-xl bg-slate-100" />
                                    <div className="h-72 rounded-xl bg-slate-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    filteredMatches.length === 0 && (
                        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                                <Target className="h-8 w-8 text-indigo-500" />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-slate-900">
                                No matches found
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                We couldn't find a matching found
                                item based on your current
                                reports and filters.
                            </p>

                            {(search ||
                                confidenceFilter !==
                                    "all") && (
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setConfidenceFilter(
                                            "all"
                                        );
                                    }}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                >
                                    Clear Filters
                                </button>
                            )}

                            {!search &&
                                confidenceFilter ===
                                    "all" && (
                                    <Link
                                        to="/report-lost"
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                    >
                                        Report Lost Item
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                )}
                        </div>
                    )}

                {/* Match Cards */}
                {!loading &&
                    filteredMatches.length > 0 && (
                        <div className="mt-5 space-y-6">
                            {filteredMatches.map(
                                (match) => {
                                    const styles =
                                        confidenceStyles[
                                            match.confidence
                                                .level
                                        ];

                                    return (
                                        <div
                                            key={
                                                match.id
                                            }
                                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                                        >
                                            {/* Match Header */}
                                            <div className="border-b border-slate-100 p-5 sm:p-6">
                                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold ${styles.badge}`}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            {
                                                                match
                                                                    .confidence
                                                                    .label
                                                            }
                                                        </span>

                                                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-700">
                                                            <Sparkles className="h-4 w-4 text-indigo-500" />
                                                            Smart Match
                                                        </span>
                                                    </div>

                                                    <div className="lg:text-right">
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                            Match
                                                            Confidence
                                                        </p>

                                                        <div
                                                            className={`mt-1 text-4xl font-black tracking-tight ${styles.score}`}
                                                        >
                                                            {
                                                                match.score
                                                            }
                                                            %
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Confidence Bar */}
                                                <div className="mt-6">
                                                    <div className="mb-2 flex items-center justify-between text-sm">
                                                        <span className="font-semibold text-slate-600">
                                                            Match
                                                            Strength
                                                        </span>

                                                        <span className="font-semibold text-slate-500">
                                                            {
                                                                match.score
                                                            }
                                                            /100
                                                        </span>
                                                    </div>

                                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-700 ${styles.progress}`}
                                                            style={{
                                                                width: `${match.score}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    <p className="mt-2 text-xs text-slate-400">
                                                        {
                                                            match
                                                                .confidence
                                                                .description
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Items */}
                                            <div className="grid lg:grid-cols-2">
                                                {/* Lost */}
                                                <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
                                                    <div className="mb-4 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wider text-rose-500">
                                                                Lost
                                                                Report
                                                            </p>

                                                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                                                                Your Lost
                                                                Item
                                                            </h3>
                                                        </div>

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
                                                            <FileSearch className="h-5 w-5 text-rose-500" />
                                                        </div>
                                                    </div>

                                                    <ItemPreview
                                                        item={
                                                            match.lostItem
                                                        }
                                                        type="lost"
                                                    />

                                                    <div className="mt-5 space-y-4">
                                                        <DetailRow
                                                            icon={
                                                                MapPin
                                                            }
                                                            label="Lost Location"
                                                            value={
                                                                match
                                                                    .lostItem
                                                                    .lostLocation ||
                                                                match
                                                                    .lostItem
                                                                    .location
                                                            }
                                                        />

                                                        <DetailRow
                                                            icon={
                                                                Clock3
                                                            }
                                                            label="Lost Date"
                                                            value={formatDate(
                                                                match.lostItem
                                                            )}
                                                        />
                                                    </div>

                                                    <Link
                                                        to={`/item/lost/${match.lostItem.id}`}
                                                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View Lost
                                                        Details
                                                    </Link>
                                                </div>

                                                {/* Found */}
                                                <div className="p-5 sm:p-6">
                                                    <div className="mb-4 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                                                Found
                                                                Report
                                                            </p>

                                                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                                                                Potentially
                                                                Found
                                                                Item
                                                            </h3>
                                                        </div>

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                    </div>

                                                    <ItemPreview
                                                        item={
                                                            match.foundItem
                                                        }
                                                        type="found"
                                                    />

                                                    <div className="mt-5 space-y-4">
                                                        <DetailRow
                                                            icon={
                                                                MapPin
                                                            }
                                                            label="Found Location"
                                                            value={
                                                                match
                                                                    .foundItem
                                                                    .foundLocation ||
                                                                match
                                                                    .foundItem
                                                                    .currentLocation ||
                                                                match
                                                                    .foundItem
                                                                    .location
                                                            }
                                                        />

                                                        <DetailRow
                                                            icon={
                                                                Clock3
                                                            }
                                                            label="Found Date"
                                                            value={formatDate(
                                                                match.foundItem
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                                                        <Link
                                                            to={`/item/found/${match.foundItem.id}`}
                                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View Details
                                                        </Link>

                                                        <button
                                                            onClick={() => {
                                                                setSelectedMatch(
                                                                    match
                                                                );
                                                                setClaimMessage(
                                                                    ""
                                                                );
                                                            }}
                                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                                        >
                                                            <UserCheck className="h-4 w-4" />
                                                            Claim Item
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Score Breakdown */}
                                            <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">
                                                            Match Analysis
                                                        </h4>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Factors used
                                                            to calculate
                                                            confidence
                                                        </p>
                                                    </div>

                                                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                                        <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
                                                        {match.score}
                                                        /100
                                                    </span>
                                                </div>

                                                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                                                    {[
                                                        [
                                                            "Category",
                                                            match
                                                                .breakdown
                                                                .category,
                                                        ],
                                                        [
                                                            "Item Details",
                                                            match
                                                                .breakdown
                                                                .name,
                                                        ],
                                                        [
                                                            "Location",
                                                            match
                                                                .breakdown
                                                                .location,
                                                        ],
                                                        [
                                                            "Date",
                                                            match
                                                                .breakdown
                                                                .date,
                                                        ],
                                                        [
                                                            "Description",
                                                            match
                                                                .breakdown
                                                                .description,
                                                        ],
                                                        [
                                                            "Photo",
                                                            match
                                                                .breakdown
                                                                .image,
                                                        ],
                                                    ].map(
                                                        ([
                                                            label,
                                                            value,
                                                        ]) => (
                                                            <div
                                                                key={
                                                                    label
                                                                }
                                                                className="rounded-xl border border-slate-200 bg-white p-3"
                                                            >
                                                                <p className="text-[11px] font-medium text-slate-400">
                                                                    {
                                                                        label
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                                    +
                                                                    {
                                                                        value
                                                                    }
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
            </main>

            {/* Claim Modal */}
            {selectedMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-slate-200 p-5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                                        <UserCheck className="h-5 w-5 text-indigo-600" />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-900">
                                            Claim This Item
                                        </h2>

                                        <p className="text-xs text-slate-500">
                                            Ownership verification
                                            required
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedMatch(null)
                                }
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

                                    <div>
                                        <p className="text-sm font-bold text-indigo-900">
                                            Match Confidence:{" "}
                                            {
                                                selectedMatch.score
                                            }
                                            %
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-indigo-700">
                                            Your claim will be
                                            reviewed before the
                                            item is handed over.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="text-sm font-semibold text-slate-700">
                                    Why do you believe this
                                    item belongs to you?
                                </label>

                                <textarea
                                    value={
                                        claimMessage
                                    }
                                    onChange={(e) =>
                                        setClaimMessage(
                                            e.target.value
                                        )
                                    }
                                    rows={5}
                                    placeholder="Mention unique identifying details, marks, stickers, serial number, contents, or anything else that can help verify ownership..."
                                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                />

                                <p className="mt-2 text-xs text-slate-400">
                                    Avoid sharing passwords or
                                    other sensitive information.
                                </p>
                            </div>

                            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    onClick={() =>
                                        setSelectedMatch(
                                            null
                                        )
                                    }
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={submitClaim}
                                    disabled={
                                        claimLoading
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {claimLoading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="h-4 w-4" />
                                            Submit Claim
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
