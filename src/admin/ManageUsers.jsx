
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Users,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  Mail,
  GraduationCap,
  CalendarDays,
  RefreshCw,
  Eye,
  X,
  User,
  Building2,
  Hash,
  Clock3,
  CheckCircle2,
  Ban,
  ChevronDown,
  SlidersHorizontal,
  Activity,
  ShieldAlert,
} from "lucide-react";

function ManageUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = () => {
    try {
      let savedUsers = JSON.parse(
        localStorage.getItem("campusFindUsers") || "[]"
      );

      if (!Array.isArray(savedUsers)) {
        savedUsers = [];
      }

      // -------------------------------------------------------
      // Legacy registration migration
      // -------------------------------------------------------

      const oldRegistration = JSON.parse(
        localStorage.getItem("campusFindRegistration") || "null"
      );

      if (
        oldRegistration?.email &&
        !savedUsers.some(
          (user) =>
            user.email?.toLowerCase() ===
            oldRegistration.email.toLowerCase()
        )
      ) {
        savedUsers.push({
          ...oldRegistration,
          id: oldRegistration.id || Date.now(),
          status: oldRegistration.status || "Active",
          role: oldRegistration.role || "Student",
          createdAt:
            oldRegistration.createdAt || new Date().toISOString(),
        });

        localStorage.setItem(
          "campusFindUsers",
          JSON.stringify(savedUsers)
        );
      }

      setUsers(savedUsers);
    } catch (error) {
      console.error("Unable to load users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    loadUsers();

    setTimeout(() => {
      setRefreshing(false);
    }, 650);
  };

  // =========================================================
  // FILTER + SEARCH + SORT
  // =========================================================

  const filteredUsers = useMemo(() => {
    const result = users.filter((user) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        user.name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText) ||
        user.studentId?.toLowerCase().includes(searchText) ||
        user.department?.toLowerCase().includes(searchText) ||
        user.role?.toLowerCase().includes(searchText);

      const status = user.status || "Active";

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      }

      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      return 0;
    });
  }, [users, search, statusFilter, sortBy]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => (user.status || "Active") === "Active"
  ).length;

  const blockedUsers = users.filter(
    (user) => user.status === "Blocked"
  ).length;

  const studentUsers = users.filter(
    (user) => (user.role || "Student") === "Student"
  ).length;

  const activePercentage =
    totalUsers > 0
      ? Math.round((activeUsers / totalUsers) * 100)
      : 0;

  // =========================================================
  // HELPERS
  // =========================================================

  const getUserImage = (user) => {
    return (
      user?.profileImage ||
      user?.avatar ||
      user?.photo ||
      user?.photoData ||
      user?.image ||
      user?.imageUrl ||
      null
    );
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return "U";

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
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
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserDetails = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  // =========================================================
  // BLOCK / UNBLOCK
  // =========================================================

  const handleToggleStatus = (selectedUser) => {
    const currentStatus = selectedUser.status || "Active";

    const newStatus =
      currentStatus === "Blocked" ? "Active" : "Blocked";

    const actionText =
      newStatus === "Blocked" ? "block" : "unblock";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${selectedUser.name || "this user"}?`
    );

    if (!confirmed) return;

    const updatedUsers = users.map((user) =>
      String(user.id) === String(selectedUser.id)
        ? {
            ...user,
            status: newStatus,
            isBlocked: newStatus === "Blocked",
          }
        : user
    );

    localStorage.setItem(
      "campusFindUsers",
      JSON.stringify(updatedUsers)
    );

    // Keep legacy registration record synchronized
    try {
      const oldRegistration = JSON.parse(
        localStorage.getItem("campusFindRegistration") || "null"
      );

      if (
        oldRegistration?.email?.toLowerCase() ===
        selectedUser.email?.toLowerCase()
      ) {
        localStorage.setItem(
          "campusFindRegistration",
          JSON.stringify({
            ...oldRegistration,
            status: newStatus,
            isBlocked: newStatus === "Blocked",
          })
        );
      }
    } catch (error) {
      console.error("Unable to sync legacy registration:", error);
    }

    setUsers(updatedUsers);

    if (
      selectedUser?.id &&
      String(selectedUser.id) === String(selectedUser.id)
    ) {
      setSelectedUser({
        ...selectedUser,
        status: newStatus,
        isBlocked: newStatus === "Blocked",
      });
    }
  };

  // =========================================================
  // DELETE USER
  // =========================================================

  const handleDeleteUser = (selectedUser) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${
        selectedUser.name || "this user"
      }? This action cannot be undone.`
    );

    if (!confirmed) return;

    const updatedUsers = users.filter(
      (user) => String(user.id) !== String(selectedUser.id)
    );

    localStorage.setItem(
      "campusFindUsers",
      JSON.stringify(updatedUsers)
    );

    // Keep legacy registration synchronized
    try {
      const oldRegistration = JSON.parse(
        localStorage.getItem("campusFindRegistration") || "null"
      );

      if (
        oldRegistration?.email?.toLowerCase() ===
        selectedUser.email?.toLowerCase()
      ) {
        if (updatedUsers.length > 0) {
          localStorage.setItem(
            "campusFindRegistration",
            JSON.stringify(updatedUsers[0])
          );
        } else {
          localStorage.removeItem("campusFindRegistration");
        }
      }
    } catch (error) {
      console.error("Unable to sync legacy registration:", error);
    }

    setUsers(updatedUsers);
    closeUserDetails();
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const StatusBadge = ({ status }) => {
    const isBlocked = status === "Blocked";

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
          isBlocked
            ? "bg-red-50 text-red-700"
            : "bg-emerald-50 text-emerald-700"
        }`}
      >
        {isBlocked ? (
          <Ban size={12} />
        ) : (
          <CheckCircle2 size={12} />
        )}

        {status || "Active"}
      </span>
    );
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <div className="border-b border-slate-200 bg-white">
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
                Manage Users
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage registered campus accounts, monitor account
                status and maintain platform access.
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
                  className={refreshing ? "animate-spin" : ""}
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
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
        {/* ===================================================
            STATISTICS
        =================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Users size={21} />}
            label="Total Users"
            value={totalUsers}
            helper="Registered accounts"
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={<UserCheck size={21} />}
            label="Active Users"
            value={activeUsers}
            helper={`${activePercentage}% of total users`}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            icon={<UserX size={21} />}
            label="Blocked Users"
            value={blockedUsers}
            helper="Restricted accounts"
            iconClass="bg-red-50 text-red-600"
          />

          <StatCard
            icon={<GraduationCap size={21} />}
            label="Student Accounts"
            value={studentUsers}
            helper="Student role users"
            iconClass="bg-indigo-50 text-indigo-600"
          />
        </div>

        {/* ===================================================
            ACCOUNT HEALTH
        =================================================== */}

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Account Health
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Current active vs restricted account distribution
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Activity size={19} />
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">
                  Active accounts
                </span>

                <span className="text-slate-900">
                  {activePercentage}%
                </span>
              </div>

              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${activePercentage}%`,
                  }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  Active: {activeUsers}
                </span>

                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  Blocked: {blockedUsers}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <ShieldAlert size={19} />
            </div>

            <h3 className="mt-4 font-bold text-blue-950">
              Admin Security
            </h3>

            <p className="mt-2 text-xs leading-5 text-blue-800">
              User access controls are currently managed through
              the development localStorage system. Backend
              authentication and role-based permissions can be
              connected later.
            </p>
          </div>
        </div>

        {/* ===================================================
            USERS PANEL
        =================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* -------------------------------------------------
              FILTER HEADER
          ------------------------------------------------- */}

          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Users size={18} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Registered Users
                    </h2>

                    <p className="text-xs text-slate-500">
                      {filteredUsers.length} matching accounts
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
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
                    onChange={(e) => setSortBy(e.target.value)}
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
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Status filters */}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {["All", "Active", "Blocked"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
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
                    {status === "All"
                      ? totalUsers
                      : status === "Active"
                      ? activeUsers
                      : blockedUsers}
                  </span>
                </button>
              ))}

              {(search || statusFilter !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                  }}
                  className="ml-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* -------------------------------------------------
              RESULT BAR
          ------------------------------------------------- */}

          <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900">
                {totalUsers}
              </span>{" "}
              users
            </p>

            <p className="text-xs text-slate-400">
              Sorted by{" "}
              <span className="font-semibold text-slate-600">
                {sortBy === "newest"
                  ? "Newest"
                  : sortBy === "oldest"
                  ? "Oldest"
                  : "Name"}
              </span>
            </p>
          </div>

          {/* -------------------------------------------------
              EMPTY STATE
          ------------------------------------------------- */}

          {filteredUsers.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <Users size={34} />
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                No users found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                No registered users match your current search or
                filter settings.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
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

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        User
                      </th>

                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Academic
                      </th>

                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Registered
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
                    {filteredUsers.map((user) => {
                      const userImage = getUserImage(user);

                      return (
                        <tr
                          key={user.id}
                          className="transition hover:bg-slate-50/80"
                        >
                          {/* User */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              {userImage ? (
                                <img
                                  src={userImage}
                                  alt={user.name || "User"}
                                  className="h-11 w-11 shrink-0 rounded-full border border-slate-200 object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-extrabold text-blue-700">
                                  {getInitials(user.name)}
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="truncate font-bold text-slate-900">
                                  {user.name || "Unnamed User"}
                                </p>

                                <p className="mt-1 flex max-w-[260px] items-center gap-1 truncate text-xs text-slate-500">
                                  <Mail size={12} />
                                  {user.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Academic */}

                          <td className="px-6 py-5">
                            <div>
                              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                                <Hash
                                  size={13}
                                  className="text-slate-400"
                                />

                                {user.studentId || "—"}
                              </p>

                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <GraduationCap size={12} />

                                {user.department ||
                                  user.role ||
                                  "Student"}
                              </p>
                            </div>
                          </td>

                          {/* Date */}

                          <td className="px-6 py-5">
                            <p className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                              <CalendarDays
                                size={14}
                                className="text-slate-400"
                              />

                              {formatDate(user.createdAt)}
                            </p>
                          </td>

                          {/* Status */}

                          <td className="px-6 py-5">
                            <StatusBadge
                              status={user.status || "Active"}
                            />
                          </td>

                          {/* Actions */}

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  openUserDetails(user)
                                }
                                title="View User"
                                className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                onClick={() =>
                                  handleToggleStatus(user)
                                }
                                title={
                                  user.status === "Blocked"
                                    ? "Unblock User"
                                    : "Block User"
                                }
                                className={`rounded-lg p-2 transition ${
                                  user.status === "Blocked"
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {user.status === "Blocked" ? (
                                  <UserCheck size={17} />
                                ) : (
                                  <UserX size={17} />
                                )}
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteUser(user)
                                }
                                title="Delete User"
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
                  MOBILE CARDS
              ================================================= */}

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredUsers.map((user) => {
                  const userImage = getUserImage(user);

                  return (
                    <div
                      key={user.id}
                      className="p-5 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start gap-3">
                        {userImage ? (
                          <img
                            src={userImage}
                            alt={user.name || "User"}
                            className="h-12 w-12 shrink-0 rounded-full border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 font-extrabold text-blue-700">
                            {getInitials(user.name)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-900">
                                {user.name || "Unnamed User"}
                              </p>

                              <p className="mt-1 break-all text-xs text-slate-500">
                                {user.email || "No email"}
                              </p>
                            </div>

                            <StatusBadge
                              status={user.status || "Active"}
                            />
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <InfoMini
                              icon={<Hash size={13} />}
                              label="Student ID"
                              value={user.studentId || "—"}
                            />

                            <InfoMini
                              icon={<GraduationCap size={13} />}
                              label="Role"
                              value={user.role || "Student"}
                            />

                            <InfoMini
                              icon={<Building2 size={13} />}
                              label="Department"
                              value={user.department || "—"}
                            />

                            <InfoMini
                              icon={<CalendarDays size={13} />}
                              label="Joined"
                              value={formatDate(user.createdAt)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => openUserDetails(user)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          <Eye size={16} />
                          View
                        </button>

                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                            user.status === "Blocked"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {user.status === "Blocked" ? (
                            <>
                              <UserCheck size={16} />
                              Unblock
                            </>
                          ) : (
                            <>
                              <UserX size={16} />
                              Block
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* ===================================================
            DEVELOPMENT NOTICE
        =================================================== */}

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <ShieldCheck size={18} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              Development Mode
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              User management currently uses browser localStorage.
              In the production version, account status, admin
              permissions, authentication and security controls
              should be handled by the CampusFind backend.
            </p>
          </div>
        </div>
      </main>

      {/* =====================================================
          USER DETAILS MODAL
      ===================================================== */}

      {showUserModal && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={closeUserDetails}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  User Profile
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  Account Details
                </h2>
              </div>

              <button
                onClick={closeUserDetails}
                className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Content */}

            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                {getUserImage(selectedUser) ? (
                  <img
                    src={getUserImage(selectedUser)}
                    alt={selectedUser.name || "User"}
                    className="h-24 w-24 rounded-3xl border border-slate-200 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-2xl font-extrabold text-blue-700">
                    {getInitials(selectedUser.name)}
                  </div>
                )}

                <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                  {selectedUser.name || "Unnamed User"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedUser.email || "No email available"}
                </p>

                <div className="mt-3">
                  <StatusBadge
                    status={selectedUser.status || "Active"}
                  />
                </div>
              </div>

              {/* Details */}

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={<Mail size={16} />}
                  label="Email"
                  value={selectedUser.email || "—"}
                />

                <DetailItem
                  icon={<Hash size={16} />}
                  label="Student ID"
                  value={selectedUser.studentId || "—"}
                />

                <DetailItem
                  icon={<GraduationCap size={16} />}
                  label="Role"
                  value={selectedUser.role || "Student"}
                />

                <DetailItem
                  icon={<Building2 size={16} />}
                  label="Department"
                  value={selectedUser.department || "—"}
                />

                <DetailItem
                  icon={<CalendarDays size={16} />}
                  label="Registered"
                  value={formatDate(selectedUser.createdAt)}
                />

                <DetailItem
                  icon={<Clock3 size={16} />}
                  label="Registered At"
                  value={formatDateTime(selectedUser.createdAt)}
                />
              </div>

              {/* Account Status */}

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      selectedUser.status === "Blocked"
                        ? "bg-red-100 text-red-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {selectedUser.status === "Blocked" ? (
                      <Ban size={18} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Account Status
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {selectedUser.status === "Blocked"
                        ? "This account is currently blocked and should not be able to access protected platform features."
                        : "This account is active and currently allowed to access the platform."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() =>
                    handleToggleStatus(selectedUser)
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                    selectedUser.status === "Blocked"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {selectedUser.status === "Blocked" ? (
                    <>
                      <UserCheck size={17} />
                      Unblock Account
                    </>
                  ) : (
                    <>
                      <UserX size={17} />
                      Block Account
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    handleDeleteUser(selectedUser)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 size={17} />
                  Delete Account
                </button>
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

        <div className="text-right">
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
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
// MOBILE INFO
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

export default ManageUsers;
