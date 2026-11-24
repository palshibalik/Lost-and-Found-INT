
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Package,
    MapPin,
    Calendar,
    Clock,
    ShieldCheck,
    User,
    Phone,
    FileText,
    Search,
    PackagePlus,
    Image as ImageIcon,
} from "lucide-react";

const ItemDetails = () => {
    const navigate = useNavigate();
    const { type, id } = useParams();

    const [item, setItem] = useState(null);

    useEffect(() => {
        const storageKey =
            type === "found"
                ? "campusFindFoundReports"
                : "campusFindLostReports";

        try {
            const items = JSON.parse(
                localStorage.getItem(storageKey) || "[]"
            );

            const selectedItem = items.find(
                (currentItem) =>
                    String(currentItem.id) === String(id)
            );

            setItem(selectedItem || null);
        } catch (error) {
            console.error("Unable to load item:", error);
            setItem(null);
        }
    }, [type, id]);

    /* ================= ITEM NOT FOUND ================= */

    if (!item) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <Package className="h-8 w-8 text-slate-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        Item Not Found
                    </h1>

                    <p className="mt-2 text-slate-500">
                        This item may have been removed or the link is invalid.
                    </p>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const isFoundItem = type === "found";

    /* ================= IMAGE ================= */

    const itemImage =
        item.photoData ||
        item.image ||
        item.imageUrl ||
        item.photo ||
        null;

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ================= HEADER ================= */}

            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 font-medium text-slate-600 transition hover:text-blue-600"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back
                    </button>
                </div>
            </header>

            {/* ================= MAIN ================= */}

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 sm:py-10">

                {/* ================= PAGE HEADING ================= */}

                <div className="mb-8">
                    <div className="flex items-center gap-3">

                        <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                                isFoundItem
                                    ? "bg-blue-100"
                                    : "bg-red-100"
                            }`}
                        >
                            {isFoundItem ? (
                                <PackagePlus className="h-6 w-6 text-blue-600" />
                            ) : (
                                <Search className="h-6 w-6 text-red-600" />
                            )}
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                {isFoundItem
                                    ? "Found Item"
                                    : "Lost Item"}
                            </p>

                            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                                {item.itemName}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* ================= DETAILS ================= */}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* ================= LEFT ================= */}

                    <div className="space-y-6 lg:col-span-2">

                        {/* ================= ITEM OVERVIEW ================= */}

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            {/* ================= IMAGE AREA ================= */}

                            <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-slate-100 sm:min-h-[420px]">

                                {itemImage ? (
                                    <img
                                        src={itemImage}
                                        alt={item.itemName || "Item"}
                                        className="h-full max-h-[420px] w-full object-contain"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center px-6 text-center">

                                        <div
                                            className={`mb-4 flex h-24 w-24 items-center justify-center rounded-3xl ${
                                                isFoundItem
                                                    ? "bg-blue-100"
                                                    : "bg-red-100"
                                            }`}
                                        >
                                            {isFoundItem ? (
                                                <PackagePlus className="h-12 w-12 text-blue-400" />
                                            ) : (
                                                <Search className="h-12 w-12 text-red-400" />
                                            )}
                                        </div>

                                        <p className="font-semibold text-slate-600">
                                            No image available
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            No photo was uploaded for this item.
                                        </p>
                                    </div>
                                )}

                                {/* IMAGE LABEL */}

                                {itemImage && (
                                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                                        <ImageIcon className="h-4 w-4" />
                                        Item Photo
                                    </div>
                                )}
                            </div>

                            {/* ================= BASIC DETAILS ================= */}

                            <div className="p-6 sm:p-8">

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">
                                            {item.itemName}
                                        </h2>

                                        <p className="mt-1 font-medium text-blue-600">
                                            {item.category}
                                        </p>
                                    </div>

                                    <span
                                        className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                                            isFoundItem
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {item.status ||
                                            (isFoundItem
                                                ? "Pending Verification"
                                                : "Searching")}
                                    </span>
                                </div>

                                {/* ================= INFORMATION GRID ================= */}

                                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">

                                    <InfoBox
                                        icon={
                                            <MapPin className="h-5 w-5" />
                                        }
                                        title={
                                            isFoundItem
                                                ? "Found Location"
                                                : "Last Seen Location"
                                        }
                                        value={
                                            isFoundItem
                                                ? item.foundLocation
                                                : item.location
                                        }
                                    />

                                    <InfoBox
                                        icon={
                                            <Calendar className="h-5 w-5" />
                                        }
                                        title="Date"
                                        value={
                                            isFoundItem
                                                ? item.foundDate
                                                : item.lostDate
                                        }
                                    />

                                    <InfoBox
                                        icon={
                                            <Clock className="h-5 w-5" />
                                        }
                                        title="Time"
                                        value={
                                            isFoundItem
                                                ? item.foundTime
                                                : item.lostTime
                                        }
                                    />

                                    {isFoundItem && (
                                        <InfoBox
                                            icon={
                                                <MapPin className="h-5 w-5" />
                                            }
                                            title="Current Location"
                                            value={item.currentLocation}
                                        />
                                    )}

                                </div>

                            </div>
                        </div>

                        {/* ================= DESCRIPTION ================= */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                            <div className="mb-5 flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                    <FileText className="h-5 w-5 text-slate-600" />
                                </div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    Description
                                </h2>
                            </div>

                            <p className="leading-relaxed text-slate-600">
                                {item.description ||
                                    "No description provided."}
                            </p>
                        </div>

                        {/* ================= IDENTIFYING DETAILS ================= */}

                        {!isFoundItem && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                                <div className="mb-5 flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                                        <ShieldCheck className="h-5 w-5 text-purple-600" />
                                    </div>

                                    <h2 className="text-xl font-bold text-slate-900">
                                        Identifying Details
                                    </h2>
                                </div>

                                <p className="leading-relaxed text-slate-600">
                                    {item.identifyingDetails ||
                                        "No additional identifying details provided."}
                                </p>
                            </div>
                        )}

                    </div>

                    {/* ================= RIGHT SIDEBAR ================= */}

                    <div className="space-y-6">

                        {/* ================= STATUS ================= */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <h2 className="text-xl font-bold text-slate-900">
                                Recovery Status
                            </h2>

                            <div className="mt-5 rounded-xl bg-slate-50 p-4">

                                <p className="text-sm text-slate-500">
                                    Current Status
                                </p>

                                <p className="mt-1 text-lg font-bold text-slate-900">
                                    {item.status ||
                                        (isFoundItem
                                            ? "Pending Verification"
                                            : "Searching")}
                                </p>
                            </div>
                        </div>

                        {/* ================= FINDER DETAILS ================= */}

                        {isFoundItem && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                                <h2 className="text-xl font-bold text-slate-900">
                                    Finder Details
                                </h2>

                                <div className="mt-5 space-y-4">

                                    <div className="flex items-start gap-3">

                                        <User className="mt-0.5 h-5 w-5 text-slate-400" />

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Finder Name
                                            </p>

                                            <p className="font-medium text-slate-800">
                                                {item.finderName ||
                                                    "Not provided"}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="flex items-start gap-3">

                                        <Phone className="mt-0.5 h-5 w-5 text-slate-400" />

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Contact
                                            </p>

                                            <p className="break-all font-medium text-slate-800">
                                                {item.finderContact ||
                                                    "Not provided"}
                                            </p>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        )}

                        {/* ================= SECURITY ================= */}

                        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">

                            <div className="flex items-start gap-3">

                                <ShieldCheck className="h-6 w-6 shrink-0 text-green-600" />

                                <div>
                                    <h3 className="font-bold text-green-800">
                                        Safe Recovery
                                    </h3>

                                    <p className="mt-2 text-sm leading-relaxed text-green-700">
                                        Ownership verification will be required
                                        before the item can be handed over.
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

/* ================= INFO BOX ================= */

const InfoBox = ({ icon, title, value }) => {
    return (
        <div className="rounded-xl bg-slate-50 p-4">

            <div className="flex items-center gap-2 text-slate-400">
                {icon}

                <span className="text-sm">
                    {title}
                </span>
            </div>

            <p className="mt-2 break-words font-semibold text-slate-800">
                {value || "Not provided"}
            </p>

        </div>
    );
};

export default ItemDetails;
