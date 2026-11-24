import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    MapPin,
    CalendarDays,
    Clock3,
    Plus,
    ArrowRight,
    SlidersHorizontal,
    X,
    PackageSearch,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Tag,
} from "lucide-react";

const LostItems = () => {
    const navigate = useNavigate();

    const [lostItems, setLostItems] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");
    const [status, setStatus] = useState("All Status");
    const [showFilters, setShowFilters] = useState(false);

    // =========================================================
    // LOAD LOST ITEMS
    // =========================================================

    const loadLostItems = () => {
        try {
            const savedItems =
                JSON.parse(
                    localStorage.getItem("campusFindLostReports")
                ) || [];

            setLostItems(savedItems);
        } catch (error) {
            console.error(
                "Unable to load lost items:",
                error
            );

            setLostItems([]);
        }
    };

    useEffect(() => {
        loadLostItems();
    }, []);

    // =========================================================
    // CATEGORIES
    // =========================================================

    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(
                lostItems
                    .map((item) => item.category)
                    .filter(Boolean)
            ),
        ];

        return [
            "All Categories",
            ...uniqueCategories,
        ];
    }, [lostItems]);

    // =========================================================
    // STATUSES
    // =========================================================

    const statuses = useMemo(() => {
        const uniqueStatuses = [
            ...new Set(
                lostItems
                    .map(
                        (item) =>
                            item.status ||
                            "Searching"
                    )
                    .filter(Boolean)
            ),
        ];

        return [
            "All Status",
            ...uniqueStatuses,
        ];
    }, [lostItems]);

    // =========================================================
    // FILTER ITEMS
    // =========================================================

    const filteredItems = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase();

        return lostItems.filter((item) => {
            const itemName =
                item.itemName?.toLowerCase() || "";

            const itemCategory =
                item.category?.toLowerCase() || "";

            const itemDescription =
                item.description?.toLowerCase() || "";

            const itemLocation =
                (
                    item.location ||
                    item.lastSeenLocation ||
                    ""
                ).toLowerCase();

            const itemStatus =
                (
                    item.status ||
                    "Searching"
                ).toLowerCase();

            const matchesSearch =
                !normalizedSearch ||
                itemName.includes(
                    normalizedSearch
                ) ||
                itemCategory.includes(
                    normalizedSearch
                ) ||
                itemDescription.includes(
                    normalizedSearch
                ) ||
                itemLocation.includes(
                    normalizedSearch
                );

            const matchesCategory =
                category === "All Categories" ||
                item.category === category;

            const matchesStatus =
                status === "All Status" ||
                (
                    item.status ||
                    "Searching"
                ) === status;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );
        });
    }, [
        lostItems,
        search,
        category,
        status,
    ]);

    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const clearFilters = () => {
        setSearch("");
        setCategory("All Categories");
        setStatus("All Status");
    };

    const hasActiveFilters =
        search.trim() !== "" ||
        category !== "All Categories" ||
        status !== "All Status";

    // =========================================================
    // STATUS STYLE
    // =========================================================

    const getStatusStyle = (itemStatus) => {
        const normalized =
            (itemStatus || "Searching")
                .toLowerCase();

        if (
            normalized.includes("found") ||
            normalized.includes("resolved") ||
            normalized.includes("recovered")
        ) {
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        }

        if (
            normalized.includes("pending") ||
            normalized.includes("review")
        ) {
            return "bg-amber-100 text-amber-700 border-amber-200";
        }

        return "bg-red-100 text-red-700 border-red-200";
    };

    // =========================================================
    // IMAGE
    // =========================================================

    const getItemImage = (item) => {
        return (
            item.photoData ||
            item.image ||
            item.imageUrl ||
            item.photo ||
            null
        );
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "Date not provided";
        }

        try {
            const parsedDate = new Date(date);

            if (Number.isNaN(parsedDate.getTime())) {
                return date;
            }

            return parsedDate.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );
        } catch {
            return date;
        }
    };

    // =========================================================
    // MAIN UI
    // =========================================================

    return (
        <div className="min-h-screen bg-slate-50">

            {/* =================================================
                HEADER
            ================================================== */}

            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">

                            <PackageSearch size={22} />

                        </div>

                        <div>

                            <p className="text-lg font-bold text-slate-900">
                                Lost Items
                            </p>

                            <p className="hidden text-xs text-slate-500 sm:block">
                                CampusFind Recovery
                            </p>

                        </div>

                    </div>


                    <button
                        onClick={() =>
                            navigate("/report-lost")
                        }
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                    >

                        <Plus size={18} />

                        <span className="hidden sm:inline">
                            Report Lost Item
                        </span>

                        <span className="sm:hidden">
                            Report
                        </span>

                    </button>

                </div>

            </header>


            {/* =================================================
                MAIN
            ================================================== */}

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">


                {/* =================================================
                    HERO
                ================================================== */}

                <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_300px]">

                    <div>

                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">

                            <Sparkles size={14} />

                            Lost Item Recovery

                        </div>


                        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">

                            Find Your Lost Item

                        </h1>


                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">

                            Browse reported lost items and check whether
                            someone has found something similar to what
                            you lost on campus.

                        </p>

                    </div>


                    {/* Statistics */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Total Reports
                                </p>

                                <p className="mt-1 text-3xl font-black text-slate-900">
                                    {lostItems.length}
                                </p>

                            </div>


                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">

                                <Search size={21} />

                            </div>

                        </div>


                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">

                            <CheckCircle2
                                size={14}
                                className="text-emerald-500"
                            />

                            Showing {filteredItems.length} matching reports

                        </div>

                    </div>

                </div>


                {/* =================================================
                    SEARCH + FILTERS
                ================================================== */}

                <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

                    <div className="flex flex-col gap-4 lg:flex-row">

                        {/* Search */}

                        <div className="relative flex-1">

                            <Search
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search item, category, location..."
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            />

                            {search && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >

                                    <X size={17} />

                                </button>

                            )}

                        </div>


                        {/* Mobile filter button */}

                        <button
                            type="button"
                            onClick={() =>
                                setShowFilters(
                                    !showFilters
                                )
                            }
                            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 lg:hidden"
                        >

                            <SlidersHorizontal
                                size={18}
                            />

                            Filters

                        </button>


                        {/* Desktop filters */}

                        <div className="hidden gap-3 lg:flex">

                            <select
                                value={category}
                                onChange={(e) =>
                                    setCategory(
                                        e.target.value
                                    )
                                }
                                className="h-12 min-w-[180px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >

                                {categories.map(
                                    (itemCategory) => (

                                        <option
                                            key={itemCategory}
                                            value={
                                                itemCategory
                                            }
                                        >
                                            {itemCategory}
                                        </option>

                                    )
                                )}

                            </select>


                            <select
                                value={status}
                                onChange={(e) =>
                                    setStatus(
                                        e.target.value
                                    )
                                }
                                className="h-12 min-w-[160px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >

                                {statuses.map(
                                    (itemStatus) => (

                                        <option
                                            key={itemStatus}
                                            value={itemStatus}
                                        >
                                            {itemStatus}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    {/* Mobile Filters */}

                    {showFilters && (

                        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 lg:hidden">

                            <select
                                value={category}
                                onChange={(e) =>
                                    setCategory(
                                        e.target.value
                                    )
                                }
                                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >

                                {categories.map(
                                    (itemCategory) => (

                                        <option
                                            key={itemCategory}
                                            value={
                                                itemCategory
                                            }
                                        >
                                            {itemCategory}
                                        </option>

                                    )
                                )}

                            </select>


                            <select
                                value={status}
                                onChange={(e) =>
                                    setStatus(
                                        e.target.value
                                    )
                                }
                                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >

                                {statuses.map(
                                    (itemStatus) => (

                                        <option
                                            key={itemStatus}
                                            value={itemStatus}
                                        >
                                            {itemStatus}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    )}


                    {/* Active filters */}

                    {hasActiveFilters && (

                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">

                            <span className="text-xs font-semibold text-slate-500">
                                Active filters:
                            </span>


                            {search && (

                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    Search: {search}
                                </span>

                            )}


                            {category !==
                                "All Categories" && (

                                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                                    {category}
                                </span>

                            )}


                            {status !== "All Status" && (

                                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                    {status}
                                </span>

                            )}


                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                                className="ml-auto text-xs font-bold text-red-600 hover:text-red-700"
                            >
                                Clear All
                            </button>

                        </div>

                    )}

                </div>


                {/* =================================================
                    EMPTY DATABASE
                ================================================== */}

                {lostItems.length === 0 ? (

                    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">

                            <PackageSearch size={38} />

                        </div>


                        <h2 className="mt-6 text-2xl font-black text-slate-900">
                            No Lost Items Reported Yet
                        </h2>


                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                            There are currently no lost-item reports
                            in CampusFind. If you lost something,
                            create a report so the recovery process
                            can begin.
                        </p>


                        <button
                            onClick={() =>
                                navigate(
                                    "/report-lost"
                                )
                            }
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
                        >

                            <Plus size={19} />

                            Report Lost Item

                        </button>

                    </div>

                ) : filteredItems.length === 0 ? (

                    /* =================================================
                       NO SEARCH RESULTS
                    ================================================== */

                    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                            <Search size={36} />

                        </div>


                        <h2 className="mt-6 text-2xl font-black text-slate-900">
                            No Matching Items
                        </h2>


                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                            We couldn't find a lost-item report
                            matching your search or filters.
                        </p>


                        <button
                            onClick={clearFilters}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >

                            <RefreshCw size={17} />

                            Clear Filters

                        </button>

                    </div>

                ) : (

                    /* =================================================
                       ITEMS
                    ================================================== */

                    <>

                        <div className="mb-5 flex items-center justify-between">

                            <div>

                                <p className="text-sm font-bold text-slate-900">
                                    {filteredItems.length}{" "}
                                    {filteredItems.length === 1
                                        ? "Report"
                                        : "Reports"}{" "}
                                    Found
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Click an item to view complete details.
                                </p>

                            </div>


                            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">

                                <Tag size={14} />

                                Lost Item Reports

                            </div>

                        </div>


                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

                            {filteredItems.map(
                                (item) => {

                                    const itemImage =
                                        getItemImage(
                                            item
                                        );

                                    const itemStatus =
                                        item.status ||
                                        "Searching";

                                    const location =
                                        item.location ||
                                        item.lastSeenLocation ||
                                        "Location not provided";

                                    const lostDate =
                                        item.lostDate ||
                                        item.date;

                                    const lostTime =
                                        item.lostTime ||
                                        item.time;

                                    return (

                                        <article
                                            key={item.id}
                                            onClick={() =>
                                                navigate(
                                                    `/item/lost/${item.id}`
                                                )
                                            }
                                            className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                        >

                                            {/* =================================================
                                                IMAGE
                                            ================================================== */}

                                            <div className="relative h-52 overflow-hidden bg-gradient-to-br from-red-50 to-slate-100">

                                                {itemImage ? (

                                                    <img
                                                        src={
                                                            itemImage
                                                        }
                                                        alt={
                                                            item.itemName ||
                                                            "Lost item"
                                                        }
                                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                    />

                                                ) : (

                                                    <div className="flex h-full w-full items-center justify-center">

                                                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 text-red-400 shadow-sm backdrop-blur">

                                                            <PackageSearch
                                                                size={
                                                                    38
                                                                }
                                                            />

                                                        </div>

                                                    </div>

                                                )}


                                                {/* Status */}

                                                <div className="absolute left-4 top-4">

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold shadow-sm backdrop-blur ${getStatusStyle(
                                                            itemStatus
                                                        )}`}
                                                    >

                                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                                        {itemStatus}

                                                    </span>

                                                </div>


                                                {/* Category */}

                                                {item.category && (

                                                    <div className="absolute bottom-4 left-4">

                                                        <span className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">

                                                            {
                                                                item.category
                                                            }

                                                        </span>

                                                    </div>

                                                )}

                                            </div>


                                            {/* =================================================
                                                CONTENT
                                            ================================================== */}

                                            <div className="p-5">


                                                {/* Title */}

                                                <div className="flex items-start justify-between gap-3">

                                                    <div className="min-w-0">

                                                        <h2 className="truncate text-lg font-black text-slate-900">

                                                            {
                                                                item.itemName ||
                                                                "Unnamed Item"
                                                            }

                                                        </h2>


                                                        {item.brand && (

                                                            <p className="mt-1 text-xs font-semibold text-slate-400">

                                                                {
                                                                    item.brand
                                                                }

                                                            </p>

                                                        )}

                                                    </div>


                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">

                                                        <ArrowRight
                                                            size={
                                                                17
                                                            }
                                                        />

                                                    </div>

                                                </div>


                                                {/* Location */}

                                                <div className="mt-5 flex items-start gap-2.5">

                                                    <MapPin
                                                        size={
                                                            17
                                                        }
                                                        className="mt-0.5 shrink-0 text-slate-400"
                                                    />

                                                    <div className="min-w-0">

                                                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                            Last Seen
                                                        </p>

                                                        <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-700">
                                                            {
                                                                location
                                                            }
                                                        </p>

                                                    </div>

                                                </div>


                                                {/* Date + Time */}

                                                <div className="mt-4 grid grid-cols-2 gap-3">

                                                    <div className="rounded-xl bg-slate-50 p-3">

                                                        <div className="flex items-center gap-1.5 text-slate-400">

                                                            <CalendarDays
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            <span className="text-[10px] font-bold uppercase tracking-wide">
                                                                Date
                                                            </span>

                                                        </div>

                                                        <p className="mt-1 text-xs font-bold text-slate-700">
                                                            {formatDate(
                                                                lostDate
                                                            )}
                                                        </p>

                                                    </div>


                                                    <div className="rounded-xl bg-slate-50 p-3">

                                                        <div className="flex items-center gap-1.5 text-slate-400">

                                                            <Clock3
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            <span className="text-[10px] font-bold uppercase tracking-wide">
                                                                Time
                                                            </span>

                                                        </div>

                                                        <p className="mt-1 text-xs font-bold text-slate-700">
                                                            {lostTime ||
                                                                "Not provided"}
                                                        </p>

                                                    </div>

                                                </div>


                                                {/* Description */}

                                                {item.description && (

                                                    <div className="mt-4 border-t border-slate-100 pt-4">

                                                        <p className="line-clamp-2 text-xs leading-5 text-slate-500">

                                                            {
                                                                item.description
                                                            }

                                                        </p>

                                                    </div>

                                                )}


                                                {/* Bottom */}

                                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                                                    <span className="text-sm font-bold text-blue-600">
                                                        View Details
                                                    </span>


                                                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 transition group-hover:text-blue-500">

                                                        Open

                                                        <ArrowRight
                                                            size={
                                                                14
                                                            }
                                                            className="transition-transform group-hover:translate-x-1"
                                                        />

                                                    </span>

                                                </div>

                                            </div>

                                        </article>

                                    );
                                }
                            )}

                        </div>

                    </>

                )}

            </main>

        </div>
    );
};

export default LostItems;