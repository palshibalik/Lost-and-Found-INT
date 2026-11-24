
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  PackageCheck,
  MapPin,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock3,
  RefreshCw,
  Eye,
  X,
  ShieldCheck,
  SlidersHorizontal,
  ChevronDown,
  User,
  Mail,
  Tag,
  Image as ImageIcon,
  FileText,
  Activity,
  RotateCcw,
  CircleCheck,
} from "lucide-react";

function ManageFoundItems() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [refreshing, setRefreshing] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // =========================================================
  // LOAD ITEMS
  // =========================================================

  const loadItems = () => {
    try {
      const savedItems = JSON.parse(
        localStorage.getItem("campusFindFoundReports") || "[]"
      );

      setItems(Array.isArray(savedItems) ? savedItems : []);
    } catch (error) {
      console.error("Unable to load found reports:", error);
      setItems([]);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    setRefreshing(true);

    loadItems();

    setTimeout(() => {
      setRefreshing(false);
    }, 650);
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getItemImage = (item) => {
    return (
      item?.photoData ||
      item?.image ||
      item?.imageUrl ||
      item?.photo ||
      null
    );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        items
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ];

    return uniqueCategories.sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [items]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalReports = items.length;

  const pendingReports = items.filter(
    (item) =>
      !item.status ||
      item.status === "Pending Verification"
  ).length;

  const verifiedReports = items.filter(
    (item) => item.status === "Verified"
  ).length;

  const rejectedReports = items.filter(
    (item) => item.status === "Rejected"
  ).length;

  const reportsWithImages = items.filter(
    (item) => Boolean(getItemImage(item))
  ).length;

  const verificationRate =
    totalReports > 0
      ? Math.round(
          (verifiedReports / totalReports) * 100
        )
      : 0;

  // =========================================================
  // FILTER + SEARCH + SORT
  // =========================================================

  const filteredItems = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const result = items.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.itemName?.toLowerCase().includes(searchText) ||
        item.category?.toLowerCase().includes(searchText) ||
        item.foundLocation?.toLowerCase().includes(searchText) ||
        item.currentLocation?.toLowerCase().includes(searchText) ||
        item.description?.toLowerCase().includes(searchText) ||
        item.finderName?.toLowerCase().includes(searchText) ||
        item.finderContact?.toLowerCase().includes(searchText) ||
        item.reportedByEmail?.toLowerCase().includes(searchText) ||
        item.email?.toLowerCase().includes(searchText);

      const currentStatus =
        item.status || "Pending Verification";

      const matchesStatus =
        statusFilter === "All" ||
        currentStatus === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(
            b.createdAt || b.foundDate || 0
          ).getTime() -
          new Date(
            a.createdAt || a.foundDate || 0
          ).getTime()
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(
            a.createdAt || a.foundDate || 0
          ).getTime() -
          new Date(
            b.createdAt || b.foundDate || 0
          ).getTime()
        );
      }

      if (sortBy === "name") {
        return (a.itemName || "").localeCompare(
          b.itemName || ""
        );
      }

      if (sortBy === "category") {
        return (a.category || "").localeCompare(
          b.category || ""
        );
      }

      return 0;
    });
  }, [
    items,
    search,
    statusFilter,
    categoryFilter,
    sortBy,
  ]);

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = (id, status) => {
    const updatedItems = items.map((item) =>
      String(item.id) === String(id)
        ? {
            ...item,
            status,
            verificationStatus:
              status === "Verified"
                ? "Verified"
                : status === "Rejected"
                ? "Rejected"
                : item.verificationStatus || "Pending",
            updatedAt: new Date().toISOString(),
          }
        : item
    );

    localStorage.setItem(
      "campusFindFoundReports",
      JSON.stringify(updatedItems)
    );

    setItems(updatedItems);

    if (
      selectedItem &&
      String(selectedItem.id) === String(id)
    ) {
      setSelectedItem({
        ...selectedItem,
        status,
        verificationStatus:
          status === "Verified"
            ? "Verified"
            : status === "Rejected"
            ? "Rejected"
            : selectedItem.verificationStatus ||
              "Pending",
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const deleteItem = (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the found item report for "${
        item.itemName || "this item"
      }"?`
    );

    if (!confirmed) return;

    const updatedItems = items.filter(
      (currentItem) =>
        String(currentItem.id) !== String(item.id)
    );

    localStorage.setItem(
      "campusFindFoundReports",
      JSON.stringify(updatedItems)
    );

    setItems(updatedItems);

    if (
      selectedItem &&
      String(selectedItem.id) === String(item.id)
    ) {
      closeDetails();
    }
  };

  // =========================================================
  // MODAL
  // =========================================================

  const openDetails = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedItem(null);
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const StatusBadge = ({ status }) => {
    const currentStatus =
      status || "Pending Verification";

    if (currentStatus === "Verified") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <CheckCircle2 size={12} />
          Verified
        </span>
      );
    }

    if (currentStatus === "Rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
          <XCircle size={12} />
          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
        <Clock3 size={12} />
        Pending Verification
      </span>
    );
  };

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                onClick={() => navigate("/admin")}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
              >
                <ArrowLeft size={17} />
                Back to Admin Dashboard
              </button>

              <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                <ShieldCheck size={18} />
                CampusFind Admin
              </div>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                Manage Found Items
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review, verify and manage all found item
                reports submitted through CampusFind.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />

                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <button
                onClick={() => navigate("/admin")}
                className="hidden rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 sm:inline-flex"
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={<PackageCheck size={21} />}
            label="Total Reports"
            value={totalReports}
            helper="All found reports"
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={<Clock3 size={21} />}
            label="Pending"
            value={pendingReports}
            helper="Awaiting verification"
            iconClass="bg-orange-50 text-orange-600"
          />

          <StatCard
            icon={<CheckCircle2 size={21} />}
            label="Verified"
            value={verifiedReports}
            helper={`${verificationRate}% verified`}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            icon={<XCircle size={21} />}
            label="Rejected"
            value={rejectedReports}
            helper="Rejected reports"
            iconClass="bg-red-50 text-red-600"
          />

          <StatCard
            icon={<ImageIcon size={21} />}
            label="With Photos"
            value={reportsWithImages}
            helper="Visual evidence"
            iconClass="bg-violet-50 text-violet-600"
          />
        </div>

        {/* =================================================
            VERIFICATION OVERVIEW
        ================================================= */}

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Verification Overview
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Current verification status of found item
                  reports
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CircleCheck size={19} />
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Verification rate
                </span>

                <span className="text-sm font-extrabold text-slate-900">
                  {verificationRate}%
                </span>
              </div>

              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${verificationRate}%`,
                  }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  Pending: {pendingReports}
                </span>

                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Verified: {verifiedReports}
                </span>

                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  Rejected: {rejectedReports}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <ShieldCheck size={19} />
            </div>

            <h3 className="mt-4 font-bold text-blue-950">
              Verification Control
            </h3>

            <p className="mt-2 text-xs leading-5 text-blue-800">
              Administrators can inspect evidence, verify
              legitimate found reports, reject invalid reports
              and review finder information.
            </p>
          </div>
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <PackageCheck size={18} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Found Item Reports
                    </h2>

                    <p className="text-xs text-slate-500">
                      {filteredItems.length} matching reports
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Search */}

                <div className="relative min-w-0 sm:w-80">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search found reports..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                {/* Sort */}

                <div className="relative">
                  <SlidersHorizontal
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value)
                    }
                    className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="newest">
                      Newest First
                    </option>

                    <option value="oldest">
                      Oldest First
                    </option>

                    <option value="name">
                      Name A-Z
                    </option>

                    <option value="category">
                      Category A-Z
                    </option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Status filters */}

            <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  "All",
                  "Pending Verification",
                  "Verified",
                  "Rejected",
                ].map((status) => {
                  const count =
                    status === "All"
                      ? totalReports
                      : status ===
                        "Pending Verification"
                      ? pendingReports
                      : items.filter(
                          (item) =>
                            item.status === status
                        ).length;

                  return (
                    <button
                      key={status}
                      onClick={() =>
                        setStatusFilter(status)
                      }
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                        statusFilter === status
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {status}

                      <span
                        className={`ml-1.5 ${
                          statusFilter === status
                            ? "text-blue-100"
                            : "text-slate-400"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Category */}

              <div className="relative w-full lg:w-52">
                <Tag
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="All">
                    All Categories
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {(search ||
              statusFilter !== "All" ||
              categoryFilter !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setCategoryFilter("All");
                }}
                className="mt-4 text-xs font-bold text-blue-600 transition hover:text-blue-800"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Result Bar */}

          <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredItems.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900">
                {totalReports}
              </span>{" "}
              reports
            </p>

            <p className="text-xs text-slate-400">
              {categoryFilter !== "All" &&
                `Category: ${categoryFilter}`}
            </p>
          </div>

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {filteredItems.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <PackageCheck size={35} />
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                No Found Items Available
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                No found item reports match your current
                search or filter settings.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setCategoryFilter("All");
                }}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Found Item
                      </th>

                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Found Location
                      </th>

                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Found Date
                      </th>

                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map((item) => {
                      const itemImage = getItemImage(item);

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-slate-50/80"
                        >
                          {/* Item */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              {itemImage ? (
                                <img
                                  src={itemImage}
                                  alt={
                                    item.itemName ||
                                    "Found item"
                                  }
                                  className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                  <PackageCheck size={20} />
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="max-w-[220px] truncate font-bold text-slate-900">
                                  {item.itemName ||
                                    "Unnamed Item"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {item.category ||
                                    "Uncategorized"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Location */}

                          <td className="px-6 py-5">
                            <p className="flex max-w-[180px] items-center gap-1.5 text-sm font-medium text-slate-600">
                              <MapPin
                                size={14}
                                className="shrink-0 text-slate-400"
                              />

                              <span className="truncate">
                                {item.foundLocation ||
                                  "Location unavailable"}
                              </span>
                            </p>
                          </td>

                          {/* Date */}

                          <td className="px-6 py-5">
                            <p className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                              <CalendarDays
                                size={14}
                                className="text-slate-400"
                              />

                              {formatDate(
                                item.foundDate ||
                                  item.date ||
                                  item.createdAt
                              )}
                            </p>
                          </td>

                          {/* Status */}

                          <td className="px-6 py-5">
                            <StatusBadge
                              status={
                                item.status ||
                                "Pending Verification"
                              }
                            />
                          </td>

                          {/* Actions */}

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  openDetails(item)
                                }
                                title="View Details"
                                className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                              >
                                <Eye size={17} />
                              </button>

                              {item.status !==
                                "Verified" && (
                                <button
                                  onClick={() =>
                                    updateStatus(
                                      item.id,
                                      "Verified"
                                    )
                                  }
                                  title="Verify Item"
                                  className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
                                >
                                  <CheckCircle2
                                    size={17}
                                  />
                                </button>
                              )}

                              {item.status !==
                                "Rejected" && (
                                <button
                                  onClick={() =>
                                    updateStatus(
                                      item.id,
                                      "Rejected"
                                    )
                                  }
                                  title="Reject Report"
                                  className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                >
                                  <XCircle size={17} />
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  deleteItem(item)
                                }
                                title="Delete Report"
                                className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE / TABLET CARDS
              ================================================= */}

              <div className="divide-y divide-slate-100 lg:hidden">
                {filteredItems.map((item) => {
                  const itemImage = getItemImage(item);

                  return (
                    <div
                      key={item.id}
                      className="p-5 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start gap-4">
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={
                              item.itemName ||
                              "Found item"
                            }
                            className="h-16 w-16 shrink-0 rounded-2xl border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <PackageCheck size={24} />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3 className="font-extrabold text-slate-900">
                                {item.itemName ||
                                  "Unnamed Item"}
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                {item.category ||
                                  "Uncategorized"}
                              </p>
                            </div>

                            <StatusBadge
                              status={
                                item.status ||
                                "Pending Verification"
                              }
                            />
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <InfoMini
                              icon={<MapPin size={13} />}
                              label="Found Location"
                              value={
                                item.foundLocation ||
                                "—"
                              }
                            />

                            <InfoMini
                              icon={
                                <CalendarDays size={13} />
                              }
                              label="Found Date"
                              value={formatDate(
                                item.foundDate ||
                                  item.date ||
                                  item.createdAt
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      {item.description && (
                        <p className="mt-4 line-clamp-2 text-sm leading-5 text-slate-500">
                          {item.description}
                        </p>
                      )}

                      {item.currentLocation && (
                        <div className="mt-3 rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Current Location
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-700">
                            {item.currentLocation}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          onClick={() =>
                            openDetails(item)
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          <Eye size={16} />
                          View Details
                        </button>

                        {item.status === "Verified" ? (
                          <button
                            onClick={() =>
                              updateStatus(
                                item.id,
                                "Pending Verification"
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 py-2.5 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
                          >
                            <RotateCcw size={16} />
                            Reopen
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              updateStatus(
                                item.id,
                                "Verified"
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <CheckCircle2 size={16} />
                            Verify
                          </button>
                        )}
                      </div>

                      {item.status !== "Rejected" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              item.id,
                              "Rejected"
                            )
                          }
                          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                        >
                          <XCircle size={16} />
                          Reject Report
                        </button>
                      )}

                      <button
                        onClick={() => deleteItem(item)}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                      >
                        <Trash2 size={16} />
                        Delete Report
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* =================================================
            DEVELOPMENT NOTICE
        ================================================= */}

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <ShieldCheck size={18} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              Development Mode
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Found item management currently uses browser
              localStorage. In the production version, verification,
              moderation, claims and status updates should be
              handled securely by the backend.
            </p>
          </div>
        </div>
      </main>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {showDetails && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={closeDetails}
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Found Item Report
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  Report Details
                </h2>
              </div>

              <button
                onClick={closeDetails}
                className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6">
              {/* Image */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {getItemImage(selectedItem) ? (
                  <img
                    src={getItemImage(selectedItem)}
                    alt={
                      selectedItem.itemName ||
                      "Found item"
                    }
                    className="max-h-80 w-full object-contain"
                  />
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center text-slate-400">
                    <ImageIcon size={40} />

                    <p className="mt-3 text-sm font-semibold">
                      No image available
                    </p>
                  </div>
                )}
              </div>

              {/* Title */}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {selectedItem.itemName ||
                      "Unnamed Item"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedItem.category ||
                      "Uncategorized"}
                  </p>
                </div>

                <StatusBadge
                  status={
                    selectedItem.status ||
                    "Pending Verification"
                  }
                />
              </div>

              {/* Information */}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={<Tag size={16} />}
                  label="Category"
                  value={
                    selectedItem.category || "—"
                  }
                />

                <DetailItem
                  icon={<MapPin size={16} />}
                  label="Found Location"
                  value={
                    selectedItem.foundLocation || "—"
                  }
                />

                <DetailItem
                  icon={<MapPin size={16} />}
                  label="Current Location"
                  value={
                    selectedItem.currentLocation || "—"
                  }
                />

                <DetailItem
                  icon={<CalendarDays size={16} />}
                  label="Found Date"
                  value={formatDate(
                    selectedItem.foundDate ||
                      selectedItem.date ||
                      selectedItem.createdAt
                  )}
                />

                <DetailItem
                  icon={<Clock3 size={16} />}
                  label="Created"
                  value={formatDateTime(
                    selectedItem.createdAt
                  )}
                />

                <DetailItem
                  icon={<User size={16} />}
                  label="Finder"
                  value={
                    selectedItem.finderName ||
                    selectedItem.reportedByName ||
                    selectedItem.name ||
                    "—"
                  }
                />

                <DetailItem
                  icon={<Mail size={16} />}
                  label="Finder Contact"
                  value={
                    selectedItem.finderContact ||
                    selectedItem.reportedByEmail ||
                    selectedItem.email ||
                    "—"
                  }
                />

                <DetailItem
                  icon={<ShieldCheck size={16} />}
                  label="Verification"
                  value={
                    selectedItem.verificationStatus ||
                    selectedItem.status ||
                    "Pending"
                  }
                />
              </div>

              {/* Description */}

              {selectedItem.description && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <FileText size={15} />
                    Description
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {selectedItem.description}
                  </p>
                </div>
              )}

              {/* Identifying Details */}

              {selectedItem.identifyingDetails && (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                    Identifying Details
                  </p>

                  <p className="mt-2 text-sm leading-6 text-blue-950">
                    {selectedItem.identifyingDetails}
                  </p>
                </div>
              )}

              {/* Additional Details */}

              {(selectedItem.brand ||
                selectedItem.color ||
                selectedItem.claimStatus ||
                selectedItem.recoveryStatus) && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {selectedItem.brand && (
                    <DetailItem
                      icon={<Tag size={16} />}
                      label="Brand"
                      value={selectedItem.brand}
                    />
                  )}

                  {selectedItem.color && (
                    <DetailItem
                      icon={<Activity size={16} />}
                      label="Color"
                      value={selectedItem.color}
                    />
                  )}

                  {selectedItem.claimStatus && (
                    <DetailItem
                      icon={<ShieldCheck size={16} />}
                      label="Claim Status"
                      value={selectedItem.claimStatus}
                    />
                  )}

                  {selectedItem.recoveryStatus && (
                    <DetailItem
                      icon={<PackageCheck size={16} />}
                      label="Recovery Status"
                      value={selectedItem.recoveryStatus}
                    />
                  )}
                </div>
              )}

              {/* Actions */}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {selectedItem.status ===
                "Verified" ? (
                  <button
                    onClick={() =>
                      updateStatus(
                        selectedItem.id,
                        "Pending Verification"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    <RotateCcw size={17} />
                    Reopen Verification
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      updateStatus(
                        selectedItem.id,
                        "Verified"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    <CheckCircle2 size={17} />
                    Verify Item
                  </button>
                )}

                {selectedItem.status !==
                  "Rejected" && (
                  <button
                    onClick={() =>
                      updateStatus(
                        selectedItem.id,
                        "Rejected"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                  >
                    <XCircle size={17} />
                    Reject Report
                  </button>
                )}

                <button
                  onClick={() =>
                    deleteItem(selectedItem)
                  }
                  className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={17} />
                  Delete Report
                </button>
              </div>

              {/* Report ID */}

              <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-xs font-semibold text-slate-400">
                  Report ID
                </span>

                <span className="max-w-[220px] truncate text-xs font-bold text-slate-600">
                  {String(selectedItem.id || "N/A")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon,
  label,
  value,
  helper,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <p className="text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </p>
      </div>

      <p className="mt-4 text-sm font-bold text-slate-700">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {helper}
      </p>
    </div>
  );
}

// =========================================================
// INFO MINI
// =========================================================

function InfoMini({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

// =========================================================
// DETAIL ITEM
// =========================================================

function DetailItem({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default ManageFoundItems;
