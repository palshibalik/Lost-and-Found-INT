
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  PackageCheck,
  Sparkles,
  RotateCcw,
  LogOut,
  User,
  Bell,
  ArrowRight,
  ShieldCheck,
  Plus,
  FileText,
  Clock3,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserRound,
  Activity,
  RefreshCw,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const [lostCount, setLostCount] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [recoveredCount, setRecoveredCount] = useState(0);
  const [pendingClaims, setPendingClaims] = useState(0);

  const [userName, setUserName] = useState(
    localStorage.getItem("campusFindUserName") || "Student"
  );

  const [profileImage, setProfileImage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --------------------------------------------------
  // LOAD DASHBOARD DATA
  // --------------------------------------------------

  const loadDashboardData = useCallback(() => {
    try {
      // -----------------------------------------------
      // LOST REPORTS
      // -----------------------------------------------

      const lostReports = JSON.parse(
        localStorage.getItem("campusFindLostReports") || "[]"
      );

      // -----------------------------------------------
      // FOUND REPORTS
      // -----------------------------------------------

      const foundReports = JSON.parse(
        localStorage.getItem("campusFindFoundReports") || "[]"
      );

      // -----------------------------------------------
      // CLAIMS
      // -----------------------------------------------

      const claims = JSON.parse(
        localStorage.getItem("campusFindClaims") || "[]"
      );

      // -----------------------------------------------
      // NOTIFICATIONS
      // -----------------------------------------------

      const notifications = JSON.parse(
        localStorage.getItem("campusFindNotifications") || "[]"
      );

      // -----------------------------------------------
      // BASIC COUNTS
      // -----------------------------------------------

      setLostCount(Array.isArray(lostReports) ? lostReports.length : 0);

      setFoundCount(Array.isArray(foundReports) ? foundReports.length : 0);

      // -----------------------------------------------
      // RECOVERED ITEMS
      // -----------------------------------------------

      if (Array.isArray(claims)) {
        const recovered = claims.filter(
          (claim) =>
            String(claim.status || "").toLowerCase() === "recovered"
        ).length;

        const pending = claims.filter((claim) => {
          const status = String(claim.status || "").toLowerCase();

          return (
            status.includes("pending") ||
            status.includes("verification")
          );
        }).length;

        setRecoveredCount(recovered);
        setPendingClaims(pending);
      } else {
        setRecoveredCount(0);
        setPendingClaims(0);
      }

      // -----------------------------------------------
      // MATCH CALCULATION
      // -----------------------------------------------

      let possibleMatches = 0;

      if (Array.isArray(lostReports) && Array.isArray(foundReports)) {
        lostReports.forEach((lostItem) => {
          foundReports.forEach((foundItem) => {
            let score = 0;

            // -----------------------------------------
            // CATEGORY
            // -----------------------------------------

            if (
              lostItem.category &&
              foundItem.category &&
              lostItem.category.toLowerCase().trim() ===
                foundItem.category.toLowerCase().trim()
            ) {
              score += 20;
            }

            // -----------------------------------------
            // LOCATION
            // -----------------------------------------

            if (lostItem.location && foundItem.foundLocation) {
              const lostLocation = lostItem.location
                .toLowerCase()
                .trim();

              const foundLocation = foundItem.foundLocation
                .toLowerCase()
                .trim();

              if (lostLocation === foundLocation) {
                score += 25;
              } else {
                const lostWords = lostLocation.split(/\s+/);
                const foundWords = foundLocation.split(/\s+/);

                const commonWords = lostWords.filter(
                  (word) =>
                    word.length > 2 && foundWords.includes(word)
                );

                if (commonWords.length >= 2) {
                  score += 20;
                } else if (commonWords.length === 1) {
                  score += 12;
                }
              }
            }

            // -----------------------------------------
            // DATE
            // -----------------------------------------

            if (lostItem.lostDate && foundItem.foundDate) {
              if (lostItem.lostDate === foundItem.foundDate) {
                score += 18;
              } else {
                const lostDate = new Date(lostItem.lostDate);
                const foundDate = new Date(foundItem.foundDate);

                const difference =
                  Math.abs(lostDate - foundDate) /
                  (1000 * 60 * 60 * 24);

                if (difference <= 1) {
                  score += 14;
                } else if (difference <= 3) {
                  score += 8;
                }
              }
            }

            // -----------------------------------------
            // DESCRIPTION
            // -----------------------------------------

            if (lostItem.description && foundItem.description) {
              const lostWords = lostItem.description
                .toLowerCase()
                .split(/\s+/)
                .filter((word) => word.length > 2);

              const foundWords = foundItem.description
                .toLowerCase()
                .split(/\s+/)
                .filter((word) => word.length > 2);

              const commonWords = lostWords.filter((word) =>
                foundWords.includes(word)
              );

              if (commonWords.length >= 3) {
                score += 10;
              } else if (commonWords.length > 0) {
                score += 5;
              }
            }

            // -----------------------------------------
            // IMAGE / PHOTO PRESENCE
            // -----------------------------------------

            if (
              lostItem.photoName &&
              foundItem.photoName
            ) {
              score += 5;
            }

            if (score >= 50) {
              possibleMatches++;
            }
          });
        });
      }

      setMatchCount(possibleMatches);

      // -----------------------------------------------
      // UNREAD NOTIFICATIONS
      // -----------------------------------------------

      if (Array.isArray(notifications)) {
        setUnreadCount(
          notifications.filter(
            (notification) => !notification.read
          ).length
        );
      } else {
        setUnreadCount(0);
      }

      // -----------------------------------------------
      // USER INFORMATION
      // -----------------------------------------------

      const loggedInEmail = (
        localStorage.getItem("campusFindUserEmail") || ""
      ).toLowerCase();

      let currentUser = null;

      try {
        const users = JSON.parse(
          localStorage.getItem("campusFindUsers") || "[]"
        );

        if (Array.isArray(users)) {
          currentUser = users.find(
            (user) =>
              user.email?.toLowerCase() === loggedInEmail
          );
        }
      } catch {
        currentUser = null;
      }

      const savedName =
        currentUser?.name ||
        localStorage.getItem("campusFindUserName") ||
        "Student";

      setUserName(savedName);

      // -----------------------------------------------
      // PROFILE IMAGE
      // -----------------------------------------------

      const savedImage =
        currentUser?.profileImage ||
        localStorage.getItem("campusFindUserProfileImage") ||
        "";

      setProfileImage(savedImage);

      // -----------------------------------------------
      // PROFILE COMPLETION
      // -----------------------------------------------

      if (currentUser) {
        const profileFields = [
          currentUser.name,
          currentUser.email,
          currentUser.studentId,
          currentUser.phone,
          currentUser.department,
          currentUser.year,
          currentUser.profileImage,
        ];

        const completedFields = profileFields.filter(
          (field) => String(field || "").trim() !== ""
        ).length;

        setProfileCompletion(
          Math.round(
            (completedFields / profileFields.length) * 100
          )
        );
      } else {
        setProfileCompletion(savedImage ? 40 : 25);
      }

      // -----------------------------------------------
      // RECENT ACTIVITY
      // -----------------------------------------------

      const activities = [];

      // Lost reports
      if (Array.isArray(lostReports)) {
        lostReports.forEach((item) => {
          activities.push({
            id: `lost-${item.id}`,
            type: "lost",
            title: "Lost item reported",
            description:
              item.itemName ||
              item.name ||
              item.category ||
              "Lost item",
            date: item.createdAt || item.lostDate,
            icon: <Search className="h-4 w-4" />,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            action: () =>
              item.id
                ? navigate(`/item/lost/${item.id}`)
                : navigate("/lost-items"),
          });
        });
      }

      // Found reports
      if (Array.isArray(foundReports)) {
        foundReports.forEach((item) => {
          activities.push({
            id: `found-${item.id}`,
            type: "found",
            title: "Found item registered",
            description:
              item.itemName ||
              item.name ||
              item.category ||
              "Found item",
            date: item.createdAt || item.foundDate,
            icon: <PackageCheck className="h-4 w-4" />,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            action: () =>
              item.id
                ? navigate(`/item/found/${item.id}`)
                : navigate("/found-items"),
          });
        });
      }

      // Claims
      if (Array.isArray(claims)) {
        claims.forEach((claim) => {
          const status = String(
            claim.status || "Pending"
          ).toLowerCase();

          let icon = <Clock3 className="h-4 w-4" />;
          let iconBg = "bg-amber-100";
          let iconColor = "text-amber-600";

          if (
            status.includes("approved") ||
            status.includes("recovered")
          ) {
            icon = <CheckCircle2 className="h-4 w-4" />;
            iconBg = "bg-green-100";
            iconColor = "text-green-600";
          }

          if (status.includes("rejected")) {
            icon = <AlertCircle className="h-4 w-4" />;
            iconBg = "bg-red-100";
            iconColor = "text-red-600";
          }

          activities.push({
            id: `claim-${claim.id}`,
            type: "claim",
            title: "Claim request",
            description:
              claim.itemName ||
              claim.lostItemName ||
              `Claim status: ${claim.status || "Pending"}`,
            date: claim.createdAt,
            icon,
            iconBg,
            iconColor,
            action: () => navigate("/my-claims"),
          });
        });
      }

      // Notifications
      if (Array.isArray(notifications)) {
        notifications.forEach((notification) => {
          activities.push({
            id: `notification-${notification.id}`,
            type: "notification",
            title:
              notification.title ||
              "CampusFind notification",
            description:
              notification.message ||
              "You have a new notification.",
            date: notification.createdAt,
            icon: <Bell className="h-4 w-4" />,
            iconBg: notification.read
              ? "bg-slate-100"
              : "bg-purple-100",
            iconColor: notification.read
              ? "text-slate-500"
              : "text-purple-600",
            action: () => navigate("/notifications"),
          });
        });
      }

      // Sort newest first
      activities.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();

        return dateB - dateA;
      });

      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error(
        "CampusFind Dashboard Error:",
        error
      );
    }
  }, [navigate]);

  // --------------------------------------------------
  // INITIAL LOAD + REFRESH
  // --------------------------------------------------

  useEffect(() => {
    loadDashboardData();

    const handleStorageChange = () => {
      loadDashboardData();
    };

    const handleFocus = () => {
      loadDashboardData();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    const interval = setInterval(() => {
      loadDashboardData();
    }, 5000);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );

      clearInterval(interval);
    };
  }, [loadDashboardData]);

  // --------------------------------------------------
  // MANUAL REFRESH
  // --------------------------------------------------

  const handleRefresh = () => {
    setIsRefreshing(true);

    loadDashboardData();

    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("campusFindLoggedIn");
    localStorage.removeItem("campusFindUserEmail");
    localStorage.removeItem("campusFindUserName");

    // Profile image is intentionally preserved.
    navigate("/login");
  };

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatActivityDate = (dateValue) => {
    if (!dateValue) {
      return "Recently";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    const now = new Date();
    const difference =
      now.getTime() - date.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    if (days < 7) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    return date.toLocaleDateString();
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* LOGO */}

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                <Search className="h-5 w-5 text-white" />
              </div>

              <div className="hidden text-left sm:block">
                <h1 className="font-bold text-slate-900">
                  CampusFind
                </h1>

                <p className="text-xs text-slate-500">
                  Trusted Recovery Platform
                </p>
              </div>
            </button>

            {/* HEADER ACTIONS */}

            <div className="flex items-center gap-1 sm:gap-3">

              {/* REFRESH */}

              <button
                onClick={handleRefresh}
                title="Refresh Dashboard"
                aria-label="Refresh Dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
              >
                <RefreshCw
                  className={`h-5 w-5 text-slate-600 ${
                    isRefreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </button>

              {/* NOTIFICATIONS */}

              <button
                onClick={() => navigate("/notifications")}
                title="Notifications"
                aria-label="Open notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
              >
                <Bell className="h-5 w-5 text-slate-600" />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* PROFILE */}

              <button
                onClick={() => navigate("/profile")}
                title="My Profile"
                aria-label="Open my profile"
                className="flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-slate-100 sm:px-3"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-blue-100">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="max-w-32 truncate text-sm font-semibold text-slate-700">
                    {userName}
                  </p>

                  <p className="text-xs text-slate-500">
                    View Profile
                  </p>
                </div>
              </button>

              {/* LOGOUT */}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ==============================================
            WELCOME
        =============================================== */}

        <div className="mb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Student Dashboard
                </span>

                <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Active
                </span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Welcome back, {userName} 👋
              </h2>

              <p className="mt-2 text-slate-600">
                Manage your lost and found items securely.
              </p>
            </div>

            {/* ACCOUNT STATUS */}

            <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-green-700">
                  Campus Verified
                </p>

                <p className="text-xs text-green-600">
                  Secure account
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==============================================
            STATISTICS
        =============================================== */}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Lost Reports"
            value={lostCount}
            subtitle="Reported items"
            icon={<Search className="h-6 w-6" />}
            iconBg="bg-red-100"
            iconColor="text-red-600"
            onClick={() => navigate("/lost-items")}
          />

          <StatCard
            title="Found Items"
            value={foundCount}
            subtitle="Items registered"
            icon={<PackageCheck className="h-6 w-6" />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            onClick={() => navigate("/found-items")}
          />

          <StatCard
            title="Possible Matches"
            value={matchCount}
            subtitle="Potential connections"
            icon={<Sparkles className="h-6 w-6" />}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            onClick={() => navigate("/matches")}
          />

          <StatCard
            title="Recovered Items"
            value={recoveredCount}
            subtitle="Successfully recovered"
            icon={<RotateCcw className="h-6 w-6" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
        </div>

        {/* ==============================================
            SECONDARY SUMMARY
        =============================================== */}

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

          <MiniStat
            icon={<FileText className="h-5 w-5" />}
            title="Pending Claims"
            value={pendingClaims}
            description="Awaiting verification"
            onClick={() => navigate("/my-claims")}
          />

          <MiniStat
            icon={<Bell className="h-5 w-5" />}
            title="Unread Notifications"
            value={unreadCount}
            description="Need your attention"
            onClick={() => navigate("/notifications")}
          />

          <MiniStat
            icon={<TrendingUp className="h-5 w-5" />}
            title="Profile Completion"
            value={`${profileCompletion}%`}
            description="Keep your profile updated"
            onClick={() => navigate("/profile")}
          />
        </div>

        {/* ==============================================
            PROFILE COMPLETION
        =============================================== */}

        {profileCompletion < 100 && (
          <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <UserRound className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Complete your profile
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    A complete profile helps make the recovery process smoother.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/profile")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Complete Profile
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600">
                  Profile completion
                </span>

                <span className="text-blue-700">
                  {profileCompletion}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ==============================================
            QUICK ACTIONS
        =============================================== */}

        <div className="mb-8">

          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Quick Actions
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage your reports and recovery requests.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            <ActionCard
              title="Report Lost Item"
              description="Tell us about an item you have lost on campus."
              icon={<Search className="h-6 w-6" />}
              iconBg="bg-red-100"
              iconColor="text-red-600"
              buttonText="Report Lost"
              onClick={() => navigate("/report-lost")}
            />

            <ActionCard
              title="Register Found Item"
              description="Help another student by registering an item you found."
              icon={<PackageCheck className="h-6 w-6" />}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              buttonText="Register Found"
              onClick={() => navigate("/register-found")}
            />

            <ActionCard
              title="My Claims"
              description="View your submitted claims and track their verification status."
              icon={<FileText className="h-6 w-6" />}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              buttonText="View My Claims"
              onClick={() => navigate("/my-claims")}
            />
          </div>
        </div>

        {/* ==============================================
            RECENT ACTIVITY
        =============================================== */}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6 flex items-center justify-between gap-4">

            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />

                <h3 className="text-xl font-bold text-slate-900">
                  Recent Activity
                </h3>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Your latest CampusFind activity.
              </p>
            </div>

            {recentActivity.length > 0 && (
              <button
                onClick={() => navigate("/notifications")}
                className="hidden items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 sm:flex"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-3">

              {recentActivity.map((activity) => (
                <button
                  key={activity.id}
                  onClick={activity.action}
                  className="flex w-full items-center gap-4 rounded-xl border border-slate-100 p-4 text-left transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.iconBg} ${activity.iconColor}`}
                  >
                    {activity.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {activity.title}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {activity.description}
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs text-slate-400">
                      {formatActivityDate(activity.date)}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Activity className="h-7 w-7 text-slate-400" />
              </div>

              <h4 className="font-semibold text-slate-800">
                No recent activity
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                Your reports and recovery activity will appear here.
              </p>

              <button
                onClick={() => navigate("/report-lost")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create Your First Report
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ==============================================
            SAFE RECOVERY
        =============================================== */}

        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">

              <div className="mb-3 flex items-center gap-3">
                <ShieldCheck className="h-7 w-7" />

                <h3 className="text-xl font-bold">
                  Safe & Verified Recovery
                </h3>
              </div>

              <p className="leading-relaxed text-blue-100">
                CampusFind verifies ownership before handover.
                Never share sensitive personal information publicly.
                Use the official CampusFind recovery process.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold">
                  Campus Only
                </p>

                <p className="text-sm text-blue-100">
                  Trusted student recovery
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

// =====================================================
// STATISTICS CARD
// =====================================================

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 ${
        onClick
          ? "cursor-pointer hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
          : "cursor-default"
      }`}
    >
      <div className="flex items-center justify-between">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>

        {onClick && (
          <ArrowRight className="h-5 w-5 text-slate-400" />
        )}
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>
    </button>
  );
};

// =====================================================
// MINI STAT
// =====================================================

const MiniStat = ({
  icon,
  title,
  value,
  description,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-50 group-hover:text-blue-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">
            {value}
          </span>

          <span className="truncate text-xs text-slate-400">
            {description}
          </span>
        </div>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-blue-500" />
    </button>
  );
};

// =====================================================
// QUICK ACTION CARD
// =====================================================

const ActionCard = ({
  title,
  description,
  icon,
  iconBg,
  iconColor,
  buttonText,
  onClick,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start gap-4">

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>

        <div className="flex-1">

          <h4 className="text-lg font-bold text-slate-900">
            {title}
          </h4>

          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {description}
          </p>

          <button
            onClick={onClick}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {buttonText}

            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
