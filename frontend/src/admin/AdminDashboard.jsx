
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  FolderSearch,
  Handshake,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Users,
  UserCog,
  X,
  Clock3,
  PackageCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LOST_KEY = "campusFindLostReports";
const FOUND_KEY = "campusFindFoundReports";
const CLAIMS_KEY = "campusFindClaims";
const USERS_KEY = "campusFindUsers";

const ADMIN_PROFILE_KEY = "campusFindAdminProfile";
const ADMIN_IMAGE_KEY = "campusFindAdminProfileImage";
const ADMIN_READ_KEY = "campusFindAdminReadNotifications";
const ADMIN_NOTIFICATION_PREF_KEY =
  "campusFindAdminNotifications";

/* =========================================================
   SAFE LOCAL STORAGE
========================================================= */

const readStorage = (key, fallback = []) => {
  try {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return fallback;
  }
};

/* =========================================================
   DATE
========================================================= */

const formatDate = (date) => {
  if (!date) return "Unknown date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatRelativeDate = (date) => {
  if (!date) return "Recently";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  const diff = Date.now() - parsed.getTime();

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return formatDate(date);
};

/* =========================================================
   INITIALS
========================================================= */

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "A";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

/* =========================================================
   PROFILE IMAGE
========================================================= */

const getAdminProfile = () => {
  try {
    const savedProfile =
      localStorage.getItem(ADMIN_PROFILE_KEY);

    const savedImage =
      localStorage.getItem(ADMIN_IMAGE_KEY) || "";

    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);

      const image =
        parsed.profileImage ||
        parsed.avatar ||
        parsed.photo ||
        savedImage ||
        "";

      return {
        ...parsed,
        profileImage: image,
        avatar: image,
      };
    }

    return {
      name: "CampusFind Administrator",
      email: "admin@campusfind.edu",
      role: "System Administrator",
      department: "Student Affairs",
      adminId: "CF-ADMIN-001",
      profileImage: savedImage,
      avatar: savedImage,
    };
  } catch (error) {
    console.error(
      "Failed to load admin profile:",
      error
    );

    return {
      name: "CampusFind Administrator",
      email: "admin@campusfind.edu",
      role: "System Administrator",
      profileImage:
        localStorage.getItem(ADMIN_IMAGE_KEY) || "",
      avatar:
        localStorage.getItem(ADMIN_IMAGE_KEY) || "",
    };
  }
};

/* =========================================================
   ADMIN NOTIFICATION GENERATOR
========================================================= */

const generateNotifications = ({
  lostReports,
  foundReports,
  claims,
}) => {
  const notifications = [];

  lostReports.forEach((item) => {
    notifications.push({
      id: `lost-${item.id || item._id || item.createdAt}`,
      type: "lost",
      title: "New Lost Item Report",
      message: `${
        item.itemName || "An item"
      } has been reported as lost.`,
      date: item.createdAt,
      link: "/admin/lost-items",
    });
  });

  foundReports.forEach((item) => {
    notifications.push({
      id: `found-${item.id || item._id || item.createdAt}`,
      type: "found",
      title: "New Found Item Report",
      message: `${
        item.itemName || "An item"
      } has been registered as found.`,
      date: item.createdAt,
      link: "/admin/found-items",
    });
  });

  claims.forEach((claim) => {
    notifications.push({
      id: `claim-${claim.id || claim._id || claim.createdAt}`,
      type: "claim",
      title: "New Claim Request",
      message: `A new claim request has been submitted for ${
        claim.itemName ||
        claim.foundItemName ||
        "an item"
      }.`,
      date: claim.createdAt,
      link: "/admin/claims",
    });
  });

  return notifications
    .filter((item) => item.date)
    .sort(
      (a, b) =>
        new Date(b.date) - new Date(a.date)
    );
};

/* =========================================================
   DASHBOARD
========================================================= */

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    pending: 0,
    users: 0,
    claims: 0,
    recovered: 0,
  });

  const [recentClaims, setRecentClaims] =
    useState([]);

  const [notifications, setNotifications] =
    useState([]);

  const [readNotificationIds, setReadNotificationIds] =
    useState([]);

  const [notificationPreferences, setNotificationPreferences] =
    useState({
      newClaims: true,
      newReports: true,
      recoveryUpdates: true,
      systemAlerts: true,
    });

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [profile, setProfile] =
    useState(getAdminProfile);

  const [lastUpdated, setLastUpdated] =
    useState(new Date());

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  const loadAdminProfile = useCallback(() => {
    const loadedProfile = getAdminProfile();

    setProfile(loadedProfile);
  }, []);

  /* =========================================================
     LOAD DASHBOARD DATA
  ========================================================= */

  const loadDashboardData = useCallback(() => {
    const lostReports = readStorage(
      LOST_KEY,
      []
    );

    const foundReports = readStorage(
      FOUND_KEY,
      []
    );

    const claims = readStorage(
      CLAIMS_KEY,
      []
    );

    const users = readStorage(
      USERS_KEY,
      []
    );

    const pendingLost = lostReports.filter(
      (item) =>
        !item.status ||
        [
          "Pending",
          "Pending Verification",
          "Under Review",
        ].includes(item.status)
    ).length;

    const pendingFound = foundReports.filter(
      (item) =>
        !item.status ||
        [
          "Pending",
          "Pending Verification",
          "Under Review",
        ].includes(item.status)
    ).length;

    const recoveredCount = [
      ...lostReports,
      ...foundReports,
    ].filter((item) => {
      const recoveryStatus =
        String(
          item.recoveryStatus || ""
        ).toLowerCase();

      const status =
        String(item.status || "").toLowerCase();

      return (
        recoveryStatus.includes("recovered") ||
        recoveryStatus.includes("completed") ||
        status.includes("recovered") ||
        status.includes("completed")
      );
    }).length;

    setStats({
      lost: lostReports.length,
      found: foundReports.length,
      pending:
        pendingLost +
        pendingFound,
      users: users.length,
      claims: claims.length,
      recovered: recoveredCount,
    });

    const sortedClaims = [...claims]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      )
      .slice(0, 5);

    setRecentClaims(sortedClaims);

    const generatedNotifications =
      generateNotifications({
        lostReports,
        foundReports,
        claims,
      });

    setNotifications(
      generatedNotifications
    );

    setLastUpdated(new Date());
  }, []);

  /* =========================================================
     LOAD READ NOTIFICATIONS
  ========================================================= */

  const loadNotificationData = useCallback(() => {
    try {
      const savedReadIds =
        localStorage.getItem(
          ADMIN_READ_KEY
        );

      if (savedReadIds) {
        setReadNotificationIds(
          JSON.parse(savedReadIds)
        );
      } else {
        setReadNotificationIds([]);
      }
    } catch (error) {
      console.error(
        "Failed to load read notifications:",
        error
      );

      setReadNotificationIds([]);
    }

    try {
      const savedPreferences =
        localStorage.getItem(
          ADMIN_NOTIFICATION_PREF_KEY
        );

      if (savedPreferences) {
        setNotificationPreferences({
          newClaims: true,
          newReports: true,
          recoveryUpdates: true,
          systemAlerts: true,
          ...JSON.parse(savedPreferences),
        });
      }
    } catch (error) {
      console.error(
        "Failed to load notification preferences:",
        error
      );
    }
  }, []);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadDashboardData();
    loadAdminProfile();
    loadNotificationData();
  }, [
    loadDashboardData,
    loadAdminProfile,
    loadNotificationData,
  ]);

  /* =========================================================
     LISTEN FOR PROFILE UPDATE
  ========================================================= */

  useEffect(() => {
    const handleProfileUpdate = () => {
      loadAdminProfile();
    };

    window.addEventListener(
      "campusFindProfileUpdated",
      handleProfileUpdate
    );

    window.addEventListener(
      "storage",
      handleProfileUpdate
    );

    return () => {
      window.removeEventListener(
        "campusFindProfileUpdated",
        handleProfileUpdate
      );

      window.removeEventListener(
        "storage",
        handleProfileUpdate
      );
    };
  }, [loadAdminProfile]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      loadDashboardData();
      loadAdminProfile();
      loadNotificationData();

      await new Promise((resolve) =>
        setTimeout(resolve, 600)
      );
    } catch (error) {
      console.error(
        "Dashboard refresh failed:",
        error
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================================================
     NOTIFICATION FILTER
  ========================================================= */

  const visibleNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (
        notification.type === "claim" &&
        !notificationPreferences.newClaims
      ) {
        return false;
      }

      if (
        (notification.type === "lost" ||
          notification.type === "found") &&
        !notificationPreferences.newReports
      ) {
        return false;
      }

      return true;
    });
  }, [
    notifications,
    notificationPreferences,
  ]);

  const unreadCount =
    visibleNotifications.filter(
      (notification) =>
        !readNotificationIds.includes(
          notification.id
        )
    ).length;

  /* =========================================================
     MARK NOTIFICATION READ
  ========================================================= */

  const markNotificationRead = (id) => {
    const updatedIds = Array.from(
      new Set([
        ...readNotificationIds,
        id,
      ])
    );

    setReadNotificationIds(
      updatedIds
    );

    localStorage.setItem(
      ADMIN_READ_KEY,
      JSON.stringify(updatedIds)
    );
  };

  /* =========================================================
     MARK ALL READ
  ========================================================= */

  const markAllNotificationsRead = () => {
    const allIds =
      visibleNotifications.map(
        (notification) =>
          notification.id
      );

    setReadNotificationIds(allIds);

    localStorage.setItem(
      ADMIN_READ_KEY,
      JSON.stringify(allIds)
    );
  };

  /* =========================================================
     PROFILE IMAGE
  ========================================================= */

  const profileImage =
    profile.profileImage ||
    profile.avatar ||
    profile.photo ||
    localStorage.getItem(
      ADMIN_IMAGE_KEY
    ) ||
    "";

  const profileInitials =
    getInitials(profile.name);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          {/* BRAND */}

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <LayoutDashboard size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                CampusFind Admin
              </h1>

              <div className="mt-0.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-500">
                  System Active
                </span>
              </div>
            </div>

          </div>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-2">

            {/* REFRESH */}

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

            {/* NOTIFICATIONS */}

            <div className="relative">

              <button
                onClick={() =>
                  setShowNotifications(
                    (previous) =>
                      !previous
                  )
                }
                title="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION PANEL */}

              {showNotifications && (
                <>

                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() =>
                      setShowNotifications(
                        false
                      )
                    }
                    aria-label="Close notifications"
                  />

                  <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                    <div className="border-b border-slate-100 px-4 py-4">

                      <div className="flex items-center justify-between">

                        <div>
                          <h3 className="font-bold text-slate-900">
                            Notifications
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {unreadCount} unread
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setShowNotifications(
                              false
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <X size={17} />
                        </button>

                      </div>

                      {unreadCount > 0 && (
                        <button
                          onClick={
                            markAllNotificationsRead
                          }
                          className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          Mark all as read
                        </button>
                      )}

                    </div>

                    <div className="max-h-[420px] overflow-y-auto">

                      {visibleNotifications.length ===
                      0 ? (
                        <div className="px-5 py-10 text-center">

                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <Bell size={20} />
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            No notifications
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            You're all caught up.
                          </p>

                        </div>
                      ) : (
                        visibleNotifications
                          .slice(0, 8)
                          .map(
                            (notification) => {
                              const isRead =
                                readNotificationIds.includes(
                                  notification.id
                                );

                              return (
                                <button
                                  key={
                                    notification.id
                                  }
                                  onClick={() => {
                                    markNotificationRead(
                                      notification.id
                                    );

                                    setShowNotifications(
                                      false
                                    );

                                    navigate(
                                      notification.link
                                    );
                                  }}
                                  className={`flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                                    !isRead
                                      ? "bg-indigo-50/40"
                                      : "bg-white"
                                  }`}
                                >

                                  <NotificationIcon
                                    type={
                                      notification.type
                                    }
                                  />

                                  <div className="min-w-0 flex-1">

                                    <div className="flex items-start justify-between gap-2">

                                      <p className="text-sm font-semibold text-slate-800">
                                        {
                                          notification.title
                                        }
                                      </p>

                                      {!isRead && (
                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                                      )}

                                    </div>

                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                      {
                                        notification.message
                                      }
                                    </p>

                                    <p className="mt-2 text-[11px] font-medium text-slate-400">
                                      {formatRelativeDate(
                                        notification.date
                                      )}
                                    </p>

                                  </div>

                                </button>
                              );
                            }
                          )
                      )}

                    </div>

                    <div className="border-t border-slate-100 p-3">

                      <button
                        onClick={() => {
                          setShowNotifications(
                            false
                          );

                          navigate(
                            "/admin/notifications"
                          );
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        View All Notifications
                        <ChevronRight
                          size={15}
                        />
                      </button>

                    </div>

                  </div>
                </>
              )}

            </div>

            {/* PROFILE */}

            <button
              onClick={() =>
                navigate("/admin/profile")
              }
              className="ml-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
              title="Admin Profile"
            >

              {profileImage ? (
                <img
                  src={profileImage}
                  alt={profile.name}
                  className="h-8 w-8 rounded-lg object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                  {profileInitials}
                </div>
              )}

              <span className="hidden text-sm font-semibold text-slate-700 sm:block">
                Admin
              </span>

            </button>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="rounded-2xl bg-gradient-to-r from-indigo-700 via-blue-700 to-slate-800 p-6 text-white shadow-lg sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <ShieldCheck size={14} />
                Administrator Control Center
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Welcome back,{" "}
                {profile.name?.split(" ")[0] ||
                  "Admin"}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
                Manage lost and found reports, review
                claims, monitor recovery and maintain
                campus trust and security.
              </p>

            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">

              <p className="text-xs font-medium text-indigo-100">
                Last updated
              </p>

              <p className="mt-1 text-sm font-bold">
                {lastUpdated.toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>

            </div>

          </div>

        </section>

        {/* ===================================================
            STATS
        =================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">

          <StatCard
            label="Lost Reports"
            value={stats.lost}
            icon={<FolderSearch size={20} />}
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            label="Found Reports"
            value={stats.found}
            icon={<PackageCheck size={20} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            label="Pending Review"
            value={stats.pending}
            icon={<Clock3 size={20} />}
            iconClass="bg-orange-50 text-orange-600"
          />

          <StatCard
            label="Total Claims"
            value={stats.claims}
            icon={<ClipboardCheck size={20} />}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            label="Recovered"
            value={stats.recovered}
            icon={<Handshake size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            label="Registered Users"
            value={stats.users}
            icon={<Users size={20} />}
            iconClass="bg-slate-100 text-slate-600"
          />

        </section>

        {/* ===================================================
            RECOVERY MANAGEMENT
        =================================================== */}

        <section className="mt-6">

          <div className="mb-4 flex items-end justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Management
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Recovery Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Control and monitor every stage of the
                CampusFind recovery process.
              </p>
            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <ManagementCard
              icon={<FolderSearch size={21} />}
              title="Lost Items"
              description="Review and manage reported lost items."
              onClick={() =>
                navigate("/admin/lost-items")
              }
            />

            <ManagementCard
              icon={<PackageCheck size={21} />}
              title="Found Items"
              description="Verify and manage found item reports."
              onClick={() =>
                navigate("/admin/found-items")
              }
            />

            <ManagementCard
              icon={<ClipboardCheck size={21} />}
              title="Claim Requests"
              description="Review ownership claims and evidence."
              onClick={() =>
                navigate("/admin/claims")
              }
            />

            <ManagementCard
              icon={<Handshake size={21} />}
              title="Handover Records"
              description="Track verified item recovery and handovers."
              onClick={() =>
                navigate("/admin/handover")
              }
            />

            <ManagementCard
              icon={<Users size={21} />}
              title="Users"
              description="Manage registered CampusFind users."
              onClick={() =>
                navigate("/admin/users")
              }
            />

            <ManagementCard
              icon={<UserCog size={21} />}
              title="Admin Profile"
              description="Manage your profile, security and preferences."
              onClick={() =>
                navigate("/admin/profile")
              }
            />

          </div>

        </section>

        {/* ===================================================
            SECURITY INFO
        =================================================== */}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <ShieldCheck size={21} />
              </div>

              <div>

                <h3 className="font-bold text-slate-900">
                  Trust & Security
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  CampusFind uses administrator review,
                  ownership verification and controlled
                  handover workflows to reduce false claims
                  and improve recovery confidence.
                </p>

              </div>

            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              <SecurityCard
                title="Verification"
                value="Enabled"
              />

              <SecurityCard
                title="Claim Review"
                value="Admin Controlled"
              />

              <SecurityCard
                title="Handover"
                value="Tracked"
              />

            </div>

          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  System Status
                </h3>

                <p className="text-sm text-emerald-600">
                  All systems operational
                </p>
              </div>

            </div>

            <div className="mt-5 space-y-3">

              <StatusRow
                label="Frontend"
                value="Online"
              />

              <StatusRow
                label="Local Storage"
                value="Available"
              />

              <StatusRow
                label="Admin Access"
                value="Protected"
              />

            </div>

          </section>

        </section>

        {/* ===================================================
            RECENT ACTIVITY
        =================================================== */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div>

              <div className="flex items-center gap-2">

                <Activity
                  size={19}
                  className="text-indigo-600"
                />

                <h2 className="font-bold text-slate-900">
                  Recent Recovery Activity
                </h2>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Latest claim requests submitted through
                CampusFind.
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/admin/claims")
              }
              className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all
              <ChevronRight size={16} />
            </button>

          </div>

          <div>

            {recentClaims.length === 0 ? (
              <div className="px-6 py-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <ClipboardCheck size={24} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  No claim activity yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  New claim requests will appear here.
                </p>

              </div>
            ) : (
              recentClaims.map((claim, index) => (
                <ClaimActivity
                  key={
                    claim.id ||
                    claim._id ||
                    index
                  }
                  claim={claim}
                />
              ))
            )}

          </div>

        </section>

      </main>

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between gap-3">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <Activity
          size={16}
          className="text-slate-300"
        />

      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

    </div>
  );
}

/* =========================================================
   MANAGEMENT CARD
========================================================= */

function ManagementCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >

      <div className="flex items-start justify-between gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
          {icon}
        </div>

        <ChevronRight
          size={18}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600"
        />

      </div>

      <h3 className="mt-4 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>

    </button>
  );
}

/* =========================================================
   SECURITY CARD
========================================================= */

function SecurityCard({
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <p className="text-xs font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   STATUS ROW
========================================================= */

function StatusRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">

      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   CLAIM ACTIVITY
========================================================= */

function ClaimActivity({ claim }) {
  const status =
    claim.status ||
    claim.claimStatus ||
    "Pending";

  const itemName =
    claim.itemName ||
    claim.foundItemName ||
    claim.item?.itemName ||
    "Unknown Item";

  const claimant =
    claim.claimantName ||
    claim.userName ||
    claim.studentName ||
    claim.claimedBy ||
    claim.email ||
    "CampusFind User";

  const createdAt =
    claim.createdAt ||
    claim.date ||
    claim.submittedAt;

  const normalizedStatus =
    String(status).toLowerCase();

  let statusClass =
    "bg-orange-50 text-orange-700 border-orange-100";

  if (
    normalizedStatus.includes("approved") ||
    normalizedStatus.includes("verified") ||
    normalizedStatus.includes("completed")
  ) {
    statusClass =
      "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (
    normalizedStatus.includes("rejected") ||
    normalizedStatus.includes("denied")
  ) {
    statusClass =
      "bg-red-50 text-red-700 border-red-100";
  }

  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:px-6">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <ClipboardCheck size={18} />
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex flex-wrap items-center gap-2">

          <h3 className="text-sm font-bold text-slate-800">
            {itemName}
          </h3>

          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass}`}
          >
            {status}
          </span>

        </div>

        <p className="mt-1 text-sm text-slate-500">
          Claim submitted by{" "}
          <span className="font-semibold text-slate-700">
            {claimant}
          </span>
        </p>

      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Clock3 size={14} />
        {formatRelativeDate(createdAt)}
      </div>

    </div>
  );
}

/* =========================================================
   NOTIFICATION ICON
========================================================= */

function NotificationIcon({ type }) {
  if (type === "claim") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        <ClipboardCheck size={17} />
      </div>
    );
  }

  if (type === "found") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <PackageCheck size={17} />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
      <FileSearch size={17} />
    </div>
  );
}
