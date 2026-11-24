
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Inbox,
  Info,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Search,
  PackageCheck,
  FileText,
  Sparkles,
  RotateCcw,
  User,
  Filter,
  ExternalLink,
  Clock,
} from "lucide-react";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    setLoading(true);

    try {
      const savedNotifications = JSON.parse(
        localStorage.getItem("campusFindNotifications") || "[]"
      );

      if (Array.isArray(savedNotifications)) {
        const normalizedNotifications = savedNotifications
          .map((notification, index) => ({
            id:
              notification.id ||
              `notification_${Date.now()}_${index}`,

            type: notification.type || "info",

            title:
              notification.title || "CampusFind Update",

            message:
              notification.message ||
              "You have a new CampusFind update.",

            read: notification.read === true,

            createdAt:
              notification.createdAt ||
              new Date().toISOString(),

            category:
              notification.category ||
              getCategoryFromType(notification.type),

            relatedId:
              notification.relatedId || null,

            relatedType:
              notification.relatedType || null,

            actionUrl:
              notification.actionUrl || null,

            priority:
              notification.priority || "normal",

            userEmail:
              notification.userEmail || null,
          }))
          .sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          );

        setNotifications(normalizedNotifications);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const saveNotifications = (updatedNotifications) => {
    setNotifications(updatedNotifications);

    localStorage.setItem(
      "campusFindNotifications",
      JSON.stringify(updatedNotifications)
    );
  };

  const markAsRead = (id) => {
    const updated = notifications.map((notification) =>
      notification.id === id
        ? {
            ...notification,
            read: true,
          }
        : notification
    );

    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    if (unreadCount === 0) return;

    const updated = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));

    saveNotifications(updated);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(
      (notification) => notification.id !== id
    );

    saveNotifications(updated);
  };

  const clearAll = () => {
    if (notifications.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all notifications?"
    );

    if (!confirmed) return;

    saveNotifications([]);
  };

  const clearReadNotifications = () => {
    const readNotifications = notifications.filter(
      (notification) => notification.read
    );

    if (readNotifications.length === 0) return;

    const confirmed = window.confirm(
      "Remove all read notifications?"
    );

    if (!confirmed) return;

    const updated = notifications.filter(
      (notification) => !notification.read
    );

    saveNotifications(updated);
  };

  const handleNotificationClick = (notification) => {
    // Mark notification as read first
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Custom action URL has highest priority
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      return;
    }

    // Match related notification
    if (
      notification.relatedType === "match" ||
      notification.type === "match"
    ) {
      navigate("/matches");
      return;
    }

    // Claim related notification
    if (
      notification.relatedType === "claim" ||
      notification.type === "claim"
    ) {
      navigate("/my-claims");
      return;
    }

    // Lost item related notification
    if (
      notification.relatedType === "lost" ||
      notification.type === "lost"
    ) {
      if (notification.relatedId) {
        navigate(
          `/item/lost/${notification.relatedId}`
        );
      } else {
        navigate("/lost-items");
      }

      return;
    }

    // Found item related notification
    if (
      notification.relatedType === "found" ||
      notification.type === "found"
    ) {
      if (notification.relatedId) {
        navigate(
          `/item/found/${notification.relatedId}`
        );
      } else {
        navigate("/found-items");
      }

      return;
    }

    // Recovery / handover
    if (
      notification.relatedType === "recovery" ||
      notification.type === "recovery"
    ) {
      navigate("/my-claims");
      return;
    }

    // Account / security
    if (
      notification.relatedType === "account" ||
      notification.type === "security"
    ) {
      navigate("/profile");
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const readCount = notifications.filter(
    (notification) => notification.read
  ).length;

  const importantCount = notifications.filter(
    (notification) =>
      notification.priority === "high" ||
      notification.priority === "important"
  ).length;

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case "unread":
        return notifications.filter(
          (notification) => !notification.read
        );

      case "claims":
        return notifications.filter(
          (notification) =>
            notification.category === "claims" ||
            notification.type === "claim"
        );

      case "matches":
        return notifications.filter(
          (notification) =>
            notification.category === "matches" ||
            notification.type === "match"
        );

      case "recovery":
        return notifications.filter(
          (notification) =>
            notification.category === "recovery" ||
            notification.type === "recovery"
        );

      case "account":
        return notifications.filter(
          (notification) =>
            notification.category === "account" ||
            notification.type === "security"
        );

      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  const getIcon = (notification) => {
    const type = String(
      notification.type || ""
    ).toLowerCase();

    const category = String(
      notification.category || ""
    ).toLowerCase();

    if (
      type === "success" ||
      type === "approved" ||
      type === "claim_approved"
    ) {
      return (
        <CheckCircle className="h-5 w-5 text-green-600" />
      );
    }

    if (
      type === "warning" ||
      type === "rejected" ||
      type === "claim_rejected"
    ) {
      return (
        <AlertCircle className="h-5 w-5 text-amber-600" />
      );
    }

    if (
      type === "security" ||
      category === "account"
    ) {
      return (
        <ShieldCheck className="h-5 w-5 text-blue-600" />
      );
    }

    if (
      type === "match" ||
      category === "matches"
    ) {
      return (
        <Sparkles className="h-5 w-5 text-purple-600" />
      );
    }

    if (
      type === "claim" ||
      category === "claims"
    ) {
      return (
        <FileText className="h-5 w-5 text-indigo-600" />
      );
    }

    if (
      type === "recovery" ||
      category === "recovery"
    ) {
      return (
        <RotateCcw className="h-5 w-5 text-emerald-600" />
      );
    }

    if (
      type === "lost" ||
      category === "lost"
    ) {
      return (
        <Search className="h-5 w-5 text-red-600" />
      );
    }

    if (
      type === "found" ||
      category === "found"
    ) {
      return (
        <PackageCheck className="h-5 w-5 text-blue-600" />
      );
    }

    if (category === "profile") {
      return (
        <User className="h-5 w-5 text-cyan-600" />
      );
    }

    return (
      <Info className="h-5 w-5 text-indigo-600" />
    );
  };

  const getIconBackground = (notification) => {
    const type = String(
      notification.type || ""
    ).toLowerCase();

    const category = String(
      notification.category || ""
    ).toLowerCase();

    if (
      type === "success" ||
      type === "approved" ||
      type === "claim_approved"
    ) {
      return "bg-green-50";
    }

    if (
      type === "warning" ||
      type === "rejected" ||
      type === "claim_rejected"
    ) {
      return "bg-amber-50";
    }

    if (
      type === "security" ||
      category === "account"
    ) {
      return "bg-blue-50";
    }

    if (
      type === "match" ||
      category === "matches"
    ) {
      return "bg-purple-50";
    }

    if (
      type === "claim" ||
      category === "claims"
    ) {
      return "bg-indigo-50";
    }

    if (
      type === "recovery" ||
      category === "recovery"
    ) {
      return "bg-emerald-50";
    }

    if (
      type === "lost" ||
      category === "lost"
    ) {
      return "bg-red-50";
    }

    return "bg-slate-100";
  };

  const getPriorityLabel = (priority) => {
    if (
      priority === "high" ||
      priority === "important"
    ) {
      return (
        <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
          Important
        </span>
      );
    }

    if (priority === "action") {
      return (
        <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
          Action Required
        </span>
      );
    }

    return null;
  };

  const formatRelativeTime = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    const now = new Date();
    const difference =
      now.getTime() - parsedDate.getTime();

    if (difference < 0) {
      return parsedDate.toLocaleDateString();
    }

    const seconds = Math.floor(
      difference / 1000
    );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes < 60) {
      return `${minutes} min${
        minutes === 1 ? "" : "s"
      } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? "" : "s"
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} day${
        days === 1 ? "" : "s"
      } ago`;
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatFullDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString();
  };

  const filters = [
    {
      id: "all",
      label: "All",
      count: notifications.length,
    },
    {
      id: "unread",
      label: "Unread",
      count: unreadCount,
    },
    {
      id: "claims",
      label: "Claims",
      count: notifications.filter(
        (notification) =>
          notification.category === "claims" ||
          notification.type === "claim"
      ).length,
    },
    {
      id: "matches",
      label: "Matches",
      count: notifications.filter(
        (notification) =>
          notification.category === "matches" ||
          notification.type === "match"
      ).length,
    },
    {
      id: "recovery",
      label: "Recovery",
      count: notifications.filter(
        (notification) =>
          notification.category === "recovery" ||
          notification.type === "recovery"
      ).length,
    },
    {
      id: "account",
      label: "Account",
      count: notifications.filter(
        (notification) =>
          notification.category === "account" ||
          notification.type === "security"
      ).length,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>

            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Bell size={25} />

                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Notifications
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Stay updated with your CampusFind activity.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={17} />
              Mark all read
            </button>

            <button
              onClick={clearReadNotifications}
              disabled={readCount === 0}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={17} />
              Clear read
            </button>

            <button
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={17} />
              Clear all
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <SummaryCard
            title="Total Notifications"
            value={notifications.length}
            icon={<Bell size={20} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="Unread"
            value={unreadCount}
            icon={<Inbox size={20} />}
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <SummaryCard
            title="Important"
            value={importantCount}
            icon={<AlertCircle size={20} />}
            iconClass="bg-red-50 text-red-600"
          />

        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-2 px-2">
            <Filter size={17} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Filter notifications
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() =>
                  setActiveFilter(filter.id)
                }
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeFilter === filter.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.label}

                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    activeFilter === filter.id
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notification List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                {activeFilter === "all"
                  ? "Recent Activity"
                  : `${filters.find(
                      (filter) =>
                        filter.id === activeFilter
                    )?.label || "Notifications"} Activity`}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {filteredNotifications.length} notification
                {filteredNotifications.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <button
              onClick={loadNotifications}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-slate-100">
                <Bell
                  size={22}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading notifications...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <Inbox
                  size={36}
                  className="text-slate-400"
                />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                {activeFilter === "all"
                  ? "You're all caught up"
                  : `No ${
                      filters.find(
                        (filter) =>
                          filter.id === activeFilter
                      )?.label.toLowerCase() ||
                      ""
                    } notifications`}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {activeFilter === "all"
                  ? "When there is an update about your lost reports, found items, matches or claims, it will appear here."
                  : "There are no notifications matching this filter right now."}
              </p>

              {activeFilter !== "all" ? (
                <button
                  onClick={() =>
                    setActiveFilter("all")
                  }
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View All Notifications
                </button>
              ) : (
                <button
                  onClick={() =>
                    navigate("/dashboard")
                  }
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {filteredNotifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className={`group relative flex gap-4 p-5 transition ${
                      notification.read
                        ? "bg-white hover:bg-slate-50"
                        : "bg-blue-50/60 hover:bg-blue-50"
                    }`}
                  >

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="absolute bottom-0 left-0 top-0 w-1 bg-blue-600" />
                    )}

                    {/* Icon */}
                    <button
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getIconBackground(
                        notification
                      )}`}
                    >
                      {getIcon(notification)}
                    </button>

                    {/* Content */}
                    <div className="min-w-0 flex-1">

                      <button
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        className="block w-full text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-slate-900">
                            {notification.title}
                          </h3>

                          {!notification.read && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              New
                            </span>
                          )}

                          {getPriorityLabel(
                            notification.priority
                          )}
                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {notification.message}
                        </p>
                      </button>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">

                        <span
                          title={formatFullDate(
                            notification.createdAt
                          )}
                          className="flex items-center gap-1.5 text-xs text-slate-400"
                        >
                          <Clock size={13} />
                          {formatRelativeTime(
                            notification.createdAt
                          )}
                        </span>

                        {notification.relatedType && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-500">
                            {notification.relatedType}
                          </span>
                        )}

                        {notification.actionUrl && (
                          <button
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                          >
                            View details
                            <ExternalLink size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-start gap-1">

                      {!notification.read && (
                        <button
                          onClick={() =>
                            markAsRead(
                              notification.id
                            )
                          }
                          title="Mark as read"
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-100"
                        >
                          <CheckCheck size={19} />
                        </button>
                      )}

                      <button
                        onClick={() =>
                          deleteNotification(
                            notification.id
                          )
                        }
                        title="Delete notification"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer information */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <div>
            <p className="text-sm font-semibold text-blue-900">
              CampusFind Notifications
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              Notifications help you track matches, claims,
              recovery updates and account activity. Never
              share your OTP or password through a notification.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ---------------------------------------
   Summary Card
--------------------------------------- */

function SummaryCard({
  title,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

/* ---------------------------------------
   Notification Category Helper
--------------------------------------- */

function getCategoryFromType(type) {
  const normalizedType = String(
    type || ""
  ).toLowerCase();

  if (
    normalizedType.includes("claim")
  ) {
    return "claims";
  }

  if (
    normalizedType.includes("match")
  ) {
    return "matches";
  }

  if (
    normalizedType.includes("recover") ||
    normalizedType.includes("handover")
  ) {
    return "recovery";
  }

  if (
    normalizedType.includes("security") ||
    normalizedType.includes("account")
  ) {
    return "account";
  }

  if (
    normalizedType.includes("lost")
  ) {
    return "lost";
  }

  if (
    normalizedType.includes("found")
  ) {
    return "found";
  }

  return "general";
}

export default Notifications;
