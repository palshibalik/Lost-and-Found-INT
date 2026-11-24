
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Clock3,
  FileText,
  PackageSearch,
  PackageCheck,
  ShieldCheck,
  Trash2,
} from "lucide-react";

function safeRead(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function getAdminPreferences() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("campusFindAdminNotifications") || "{}"
    );

    return {
      newClaims: saved.newClaims !== false,
      newReports: saved.newReports !== false,
      recoveryUpdates: saved.recoveryUpdates !== false,
      systemAlerts: saved.systemAlerts !== false,
    };
  } catch {
    return {
      newClaims: true,
      newReports: true,
      recoveryUpdates: true,
      systemAlerts: true,
    };
  }
}

function buildAdminNotifications() {
  const lostReports = safeRead("campusFindLostReports");
  const foundReports = safeRead("campusFindFoundReports");
  const claims = safeRead("campusFindClaims");

  const preferences = getAdminPreferences();

  const notifications = [];

  /* =========================================
     NEW LOST REPORTS
  ========================================= */
  if (preferences.newReports) {
    lostReports.forEach((report) => {
      notifications.push({
        id: `lost-report-${report.id}`,
        type: "report",
        category: "Lost Item",
        title: "New lost item reported",
        message: `${report.itemName || "An item"} has been reported as lost.`,
        itemName: report.itemName || "Lost Item",
        sourceId: report.id,
        createdAt: report.createdAt || new Date().toISOString(),
        icon: "lost",
      });
    });

    /* =========================================
       NEW FOUND REPORTS
    ========================================= */
    foundReports.forEach((report) => {
      notifications.push({
        id: `found-report-${report.id}`,
        type: "report",
        category: "Found Item",
        title: "New found item reported",
        message: `${report.itemName || "An item"} has been registered as found.`,
        itemName: report.itemName || "Found Item",
        sourceId: report.id,
        createdAt: report.createdAt || new Date().toISOString(),
        icon: "found",
      });
    });
  }

  /* =========================================
     CLAIM NOTIFICATIONS
  ========================================= */
  claims.forEach((claim) => {
    const claimName =
      claim.claimantName ||
      claim.studentName ||
      claim.email ||
      "A student";

    const itemName =
      claim.foundItemName ||
      claim.itemName ||
      "a found item";

    const status =
      claim.status || "Pending Verification";

    if (
      preferences.newClaims &&
      (status === "Pending Verification" ||
        status === "Pending")
    ) {
      notifications.push({
        id: `claim-${claim.id}`,
        type: "claim",
        category: "Claim Request",
        title: "New claim request",
        message: `${claimName} submitted a claim for ${itemName}.`,
        itemName,
        claimantName: claimName,
        sourceId: claim.id,
        createdAt: claim.createdAt || new Date().toISOString(),
        icon: "claim",
      });
    }

    /* =========================================
       RECOVERY UPDATES
    ========================================= */
    if (
      preferences.recoveryUpdates &&
      ["Approved", "Rejected", "Recovered", "Completed"].includes(
        status
      )
    ) {
      notifications.push({
        id: `recovery-${claim.id}-${status}`,
        type: "recovery",
        category: "Recovery Update",
        title: `Claim ${status.toLowerCase()}`,
        message: `The claim for ${itemName} is now marked as ${status}.`,
        itemName,
        claimantName: claimName,
        sourceId: claim.id,
        createdAt: claim.updatedAt || claim.createdAt || new Date().toISOString(),
        icon: "recovery",
      });
    }
  });

  /* =========================================
     SORT NEWEST FIRST
  ========================================= */
  return notifications.sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  );
}

function AdminNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState([]);
  const [filter, setFilter] = useState("All");

  const loadNotifications = () => {
    const generated = buildAdminNotifications();

    let savedReadIds = [];

    try {
      const saved = JSON.parse(
        localStorage.getItem("campusFindAdminReadNotifications") ||
          "[]"
      );

      if (Array.isArray(saved)) {
        savedReadIds = saved;
      }
    } catch {
      savedReadIds = [];
    }

    setNotifications(generated);
    setReadIds(savedReadIds);
  };

  useEffect(() => {
    loadNotifications();

    const handleStorage = () => {
      loadNotifications();
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  /* =========================================
     MARK ONE AS READ
  ========================================= */
  const markAsRead = (id) => {
    if (readIds.includes(id)) return;

    const updated = [...readIds, id];

    setReadIds(updated);

    localStorage.setItem(
      "campusFindAdminReadNotifications",
      JSON.stringify(updated)
    );
  };

  /* =========================================
     MARK ALL AS READ
  ========================================= */
  const markAllAsRead = () => {
    const allIds = notifications.map(
      (notification) => notification.id
    );

    setReadIds(allIds);

    localStorage.setItem(
      "campusFindAdminReadNotifications",
      JSON.stringify(allIds)
    );
  };

  /* =========================================
     CLEAR READ NOTIFICATIONS
  ========================================= */
  const clearReadNotifications = () => {
    const unread = notifications.filter(
      (notification) =>
        !readIds.includes(notification.id)
    );

    const unreadIds = unread.map(
      (notification) => notification.id
    );

    setNotifications(unread);
    setReadIds(unreadIds);

    localStorage.setItem(
      "campusFindAdminReadNotifications",
      JSON.stringify(unreadIds)
    );
  };

  const unreadCount = notifications.filter(
    (notification) =>
      !readIds.includes(notification.id)
  ).length;

  const filteredNotifications = useMemo(() => {
    if (filter === "All") {
      return notifications;
    }

    return notifications.filter(
      (notification) =>
        notification.category === filter
    );
  }, [notifications, filter]);

  const getIcon = (notification) => {
    const base =
      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl";

    if (notification.icon === "lost") {
      return (
        <div className={`${base} bg-red-50 text-red-600`}>
          <PackageSearch size={23} />
        </div>
      );
    }

    if (notification.icon === "found") {
      return (
        <div className={`${base} bg-emerald-50 text-emerald-600`}>
          <PackageCheck size={23} />
        </div>
      );
    }

    if (notification.icon === "claim") {
      return (
        <div className={`${base} bg-blue-50 text-blue-600`}>
          <FileText size={23} />
        </div>
      );
    }

    return (
      <div className={`${base} bg-indigo-50 text-indigo-600`}>
        <ShieldCheck size={23} />
      </div>
    );
  };

  const formatTime = (date) => {
    if (!date) return "Recently";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "Recently";
    }

    return value.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =========================================
          HEADER
      ========================================= */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">

          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-3 text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={20} />

            <span className="font-semibold">
              Back to Dashboard
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Bell size={21} />
            </div>

            <div className="hidden sm:block">
              <p className="font-bold text-slate-900">
                Admin Notifications
              </p>

              <p className="text-xs text-slate-500">
                CampusFind alerts
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* =========================================
          MAIN
      ========================================= */}
      <main className="mx-auto max-w-6xl px-6 py-8">

        {/* TITLE */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-semibold text-blue-600">
              CampusFind Admin
            </p>

            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
              Notifications
            </h1>

            <p className="mt-2 text-slate-500">
              Stay updated about reports, claims and recovery activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={17} />
              Mark all read
            </button>

            <button
              onClick={clearReadNotifications}
              disabled={readIds.length === 0}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={17} />
              Clear read
            </button>

          </div>
        </div>

        {/* =========================================
            SUMMARY
        ========================================= */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Notifications
            </p>

            <p className="mt-1 text-3xl font-extrabold text-slate-900">
              {notifications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm font-medium text-blue-600">
              Unread
            </p>

            <p className="mt-1 text-3xl font-extrabold text-blue-700">
              {unreadCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-medium text-emerald-600">
              Status
            </p>

            <p className="mt-1 text-lg font-bold text-emerald-700">
              System Active
            </p>
          </div>

        </div>

        {/* =========================================
            FILTERS
        ========================================= */}
        <div className="mb-5 flex flex-wrap gap-2">

          {[
            "All",
            "Claim Request",
            "Lost Item",
            "Found Item",
            "Recovery Update",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === item
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {item}
            </button>
          ))}

        </div>

        {/* =========================================
            NOTIFICATION LIST
        ========================================= */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {filteredNotifications.length === 0 ? (

            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Bell className="h-8 w-8 text-slate-400" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                No notifications
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                New lost reports, found items, claims and recovery
                updates will appear here.
              </p>

            </div>

          ) : (

            <div>
              {filteredNotifications.map(
                (notification, index) => {
                  const isRead = readIds.includes(
                    notification.id
                  );

                  return (
                    <button
                      key={notification.id}
                      onClick={() =>
                        markAsRead(notification.id)
                      }
                      className={`flex w-full gap-4 border-b border-slate-100 p-5 text-left transition last:border-b-0 hover:bg-slate-50 ${
                        !isRead
                          ? "bg-blue-50/40"
                          : "bg-white"
                      }`}
                    >

                      {getIcon(notification)}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                          <div>
                            <div className="flex items-center gap-2">

                              {!isRead && (
                                <span className="h-2 w-2 rounded-full bg-blue-600" />
                              )}

                              <h3 className="font-bold text-slate-900">
                                {notification.title}
                              </h3>
                            </div>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {notification.message}
                            </p>
                          </div>

                          <span className="shrink-0 text-xs font-medium text-slate-400">
                            {formatTime(
                              notification.createdAt
                            )}
                          </span>

                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {notification.category}
                          </span>

                          {!isRead && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              Unread
                            </span>
                          )}

                        </div>

                      </div>

                    </button>
                  );
                }
              )}
            </div>

          )}

        </div>

        {/* =========================================
            SETTINGS LINK
        ========================================= */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="font-bold text-slate-900">
                Notification Preferences
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Choose which CampusFind administrator alerts you want
                to receive.
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/profile")}
              className="w-fit rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Manage Preferences
            </button>

          </div>

        </div>

      </main>
    </div>
  );
}

export default AdminNotifications;
