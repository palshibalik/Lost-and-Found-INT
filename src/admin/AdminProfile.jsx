
import { useEffect, useMemo, useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Lock,
  Bell,
  Camera,
  Edit3,
  Save,
  X,
  CheckCircle2,
  CalendarDays,
  KeyRound,
  LogOut,
  Settings,
  Activity,
  Eye,
  EyeOff,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ADMIN_STORAGE_KEY = "campusFindAdminProfile";
const ADMIN_IMAGE_KEY = "campusFindAdminProfileImage";
const USER_STORAGE_KEY = "campusFindUsers";
const CURRENT_EMAIL_KEY = "campusFindUserEmail";

const defaultAdmin = {
  name: "CampusFind Administrator",
  email: "admin@campusfind.edu",
  role: "System Administrator",
  department: "Student Affairs",
  adminId: "CF-ADMIN-001",
  phone: "",
  joinedDate: "2026-01-01",
  avatar: "",
  profileImage: "",
};

const defaultNotifications = {
  newClaims: true,
  newReports: true,
  recoveryUpdates: true,
  systemAlerts: true,
};

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "A";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/* =========================================================
   LOAD ADMIN PROFILE
========================================================= */

const loadAdminProfile = () => {
  try {
    const savedProfile = localStorage.getItem(ADMIN_STORAGE_KEY);

    const savedImage =
      localStorage.getItem(ADMIN_IMAGE_KEY) || "";

    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);

      const image =
        parsedProfile.profileImage ||
        parsedProfile.avatar ||
        parsedProfile.photo ||
        savedImage ||
        "";

      return {
        ...defaultAdmin,
        ...parsedProfile,
        avatar: image,
        profileImage: image,
      };
    }

    const currentEmail =
      localStorage.getItem(CURRENT_EMAIL_KEY) ||
      defaultAdmin.email;

    const users = JSON.parse(
      localStorage.getItem(USER_STORAGE_KEY) || "[]"
    );

    const matchedUser = users.find(
      (user) =>
        (user.email || "").toLowerCase() ===
        currentEmail.toLowerCase()
    );

    const userImage =
      matchedUser?.profileImage ||
      matchedUser?.avatar ||
      matchedUser?.photo ||
      savedImage ||
      "";

    return {
      ...defaultAdmin,
      ...(matchedUser || {}),
      email: matchedUser?.email || currentEmail,
      role:
        matchedUser?.role ||
        matchedUser?.userRole ||
        defaultAdmin.role,
      avatar: userImage,
      profileImage: userImage,
    };
  } catch (error) {
    console.error("Failed to load admin profile:", error);

    const savedImage =
      localStorage.getItem(ADMIN_IMAGE_KEY) || "";

    return {
      ...defaultAdmin,
      avatar: savedImage,
      profileImage: savedImage,
    };
  }
};

/* =========================================================
   SAVE ADMIN PROFILE
========================================================= */

const saveAdminProfile = (profile) => {
  const image =
    profile.profileImage ||
    profile.avatar ||
    profile.photo ||
    "";

  const finalProfile = {
    ...profile,
    avatar: image,
    profileImage: image,
  };

  localStorage.setItem(
    ADMIN_STORAGE_KEY,
    JSON.stringify(finalProfile)
  );

  if (image) {
    localStorage.setItem(ADMIN_IMAGE_KEY, image);
  } else {
    localStorage.removeItem(ADMIN_IMAGE_KEY);
  }

  try {
    const users = JSON.parse(
      localStorage.getItem(USER_STORAGE_KEY) || "[]"
    );

    const updatedUsers = users.map((user) => {
      if (
        user.email &&
        finalProfile.email &&
        user.email.toLowerCase() ===
          finalProfile.email.toLowerCase()
      ) {
        return {
          ...user,
          name: finalProfile.name,
          phone: finalProfile.phone,
          role: finalProfile.role,
          department: finalProfile.department,
          adminId: finalProfile.adminId,
          avatar: image,
          profileImage: image,
        };
      }

      return user;
    });

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(updatedUsers)
    );
  } catch (error) {
    console.error(
      "Failed to sync admin profile:",
      error
    );
  }
};

/* =========================================================
   ADMIN PROFILE COMPONENT
========================================================= */

export default function AdminProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(defaultAdmin);
  const [editForm, setEditForm] = useState(defaultAdmin);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [saveMessage, setSaveMessage] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [notifications, setNotifications] = useState(
    defaultNotifications
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    const loadedProfile = loadAdminProfile();

    setProfile(loadedProfile);
    setEditForm(loadedProfile);

    try {
      const savedNotifications = localStorage.getItem(
        "campusFindAdminNotifications"
      );

      if (savedNotifications) {
        setNotifications({
          ...defaultNotifications,
          ...JSON.parse(savedNotifications),
        });
      }
    } catch (error) {
      console.error(
        "Failed to load notification preferences:",
        error
      );
    }
  }, []);

  const initials = useMemo(
    () => getInitials(profile.name),
    [profile.name]
  );

  const profileImage =
    profile.profileImage ||
    profile.avatar ||
    profile.photo ||
    localStorage.getItem(ADMIN_IMAGE_KEY) ||
    "";

  /* =========================================================
     FORM HANDLERS
  ========================================================= */

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSaveProfile = () => {
    if (!editForm.name.trim()) {
      setSaveMessage("Please enter your name.");
      return;
    }

    if (!editForm.email.trim()) {
      setSaveMessage(
        "Please enter your email address."
      );
      return;
    }

    const image =
      editForm.profileImage ||
      editForm.avatar ||
      profileImage ||
      "";

    const updatedProfile = {
      ...profile,
      ...editForm,
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      department: editForm.department.trim(),
      profileImage: image,
      avatar: image,
    };

    saveAdminProfile(updatedProfile);

    setProfile(updatedProfile);
    setEditForm(updatedProfile);

    setIsEditing(false);

    setSaveMessage(
      "Profile updated successfully."
    );

    window.dispatchEvent(
      new Event("campusFindProfileUpdated")
    );

    setTimeout(() => {
      setSaveMessage("");
    }, 3000);
  };

  /* =========================================================
     CANCEL EDIT
  ========================================================= */

  const handleCancelEdit = () => {
    setEditForm(profile);
    setIsEditing(false);
    setSaveMessage("");
  };

  /* =========================================================
     PROFILE IMAGE UPLOAD
  ========================================================= */

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveMessage(
        "Please select a valid image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSaveMessage(
        "Profile image must be smaller than 2MB."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      /*
       * Save immediately so dashboard can access
       * the image even before clicking Save Changes.
       */

      localStorage.setItem(
        ADMIN_IMAGE_KEY,
        imageData
      );

      const updatedProfile = {
        ...profile,
        avatar: imageData,
        profileImage: imageData,
      };

      const updatedEditForm = {
        ...editForm,
        avatar: imageData,
        profileImage: imageData,
      };

      setProfile(updatedProfile);
      setEditForm(updatedEditForm);

      localStorage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );

      window.dispatchEvent(
        new Event("campusFindProfileUpdated")
      );

      setSaveMessage(
        "Profile photo updated successfully."
      );
    };

    reader.onerror = () => {
      setSaveMessage(
        "Failed to read the selected image."
      );
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  /* =========================================================
     REMOVE PROFILE IMAGE
  ========================================================= */

  const handleRemoveAvatar = () => {
    const updatedProfile = {
      ...profile,
      avatar: "",
      profileImage: "",
    };

    const updatedEditForm = {
      ...editForm,
      avatar: "",
      profileImage: "",
    };

    setProfile(updatedProfile);
    setEditForm(updatedEditForm);

    localStorage.removeItem(ADMIN_IMAGE_KEY);

    localStorage.setItem(
      ADMIN_STORAGE_KEY,
      JSON.stringify(updatedProfile)
    );

    window.dispatchEvent(
      new Event("campusFindProfileUpdated")
    );

    setSaveMessage(
      "Profile photo removed."
    );
  };

  /* =========================================================
     PASSWORD
  ========================================================= */

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");
  };

  const handlePasswordUpdate = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordMessage(
        "Please fill all password fields."
      );
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordMessage(
        "New password and confirm password do not match."
      );
      return;
    }

    /*
     * Frontend demo only.
     *
     * Real password verification will be handled by:
     * Backend + bcrypt + JWT authentication.
     */

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordMessage(
      "Password updated successfully."
    );

    setTimeout(() => {
      setPasswordMessage("");
    }, 3000);
  };

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const handleNotificationChange = (key) => {
    const updatedNotifications = {
      ...notifications,
      [key]: !notifications[key],
    };

    setNotifications(updatedNotifications);

    localStorage.setItem(
      "campusFindAdminNotifications",
      JSON.stringify(updatedNotifications)
    );
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem(
      CURRENT_EMAIL_KEY
    );

    localStorage.removeItem(
      "campusFindToken"
    );

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
                <ShieldCheck size={17} />
                Administration
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Admin Profile
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your administrator account,
                security and preferences.
              </p>
            </div>

            <button
              onClick={() => navigate("/admin")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Activity size={17} />
              Back to Dashboard
            </button>

          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ===================================================
            PROFILE HERO
        =================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="h-28 bg-gradient-to-r from-indigo-700 via-blue-700 to-slate-800 sm:h-36" />

          <div className="px-5 pb-6 sm:px-8">

            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">

                {/* PROFILE IMAGE */}

                <div className="relative">

                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={profile.name}
                      className="h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-lg"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-indigo-600 text-3xl font-bold text-white shadow-lg">
                      {initials}
                    </div>
                  )}

                  {isEditing && (
                    <div className="absolute bottom-1 right-1 flex gap-1">

                      <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 border-white bg-slate-900 text-white shadow-lg transition hover:bg-indigo-600">
                        <Camera size={16} />

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={
                            handleAvatarChange
                          }
                        />
                      </label>

                      {profileImage && (
                        <button
                          type="button"
                          onClick={
                            handleRemoveAvatar
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-red-600 text-white shadow-lg transition hover:bg-red-700"
                          title="Remove photo"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}

                    </div>
                  )}

                </div>

                <div className="pb-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-xl font-bold text-slate-900">
                      {profile.name}
                    </h2>

                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      <ShieldCheck size={13} />
                      Admin
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {profile.email}
                  </p>

                </div>

              </div>

              {!isEditing ? (
                <button
                  onClick={() => {
                    setEditForm(profile);
                    setIsEditing(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Edit3 size={17} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">

                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <X size={17} />
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveProfile}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    <Save size={17} />
                    Save Changes
                  </button>

                </div>
              )}

            </div>

            {saveMessage && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
                <CheckCircle2 size={17} />
                {saveMessage}
              </div>
            )}

          </div>
        </section>

        {/* ===================================================
            TABS
        =================================================== */}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

          <div className="flex min-w-max gap-1">

            <TabButton
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              icon={<User size={17} />}
              label="Profile"
            />

            <TabButton
              active={activeTab === "security"}
              onClick={() => setActiveTab("security")}
              icon={<Lock size={17} />}
              label="Security"
            />

            <TabButton
              active={activeTab === "notifications"}
              onClick={() =>
                setActiveTab("notifications")
              }
              icon={<Bell size={17} />}
              label="Notifications"
            />

          </div>
        </div>

        {/* ===================================================
            PROFILE TAB
        =================================================== */}

        {activeTab === "profile" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Personal Information
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your administrator account information.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <ProfileField
                  label="Full Name"
                  name="name"
                  value={
                    isEditing
                      ? editForm.name
                      : profile.name
                  }
                  icon={<User size={17} />}
                  editable={isEditing}
                  onChange={handleEditChange}
                />

                <ProfileField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={
                    isEditing
                      ? editForm.email
                      : profile.email
                  }
                  icon={<Mail size={17} />}
                  editable={isEditing}
                  onChange={handleEditChange}
                />

                <ProfileField
                  label="Role"
                  name="role"
                  value={
                    isEditing
                      ? editForm.role
                      : profile.role
                  }
                  icon={<ShieldCheck size={17} />}
                  editable={false}
                />

                <ProfileField
                  label="Department"
                  name="department"
                  value={
                    isEditing
                      ? editForm.department
                      : profile.department
                  }
                  icon={<Settings size={17} />}
                  editable={isEditing}
                  onChange={handleEditChange}
                />

                <ProfileField
                  label="Admin ID"
                  name="adminId"
                  value={profile.adminId}
                  icon={<KeyRound size={17} />}
                  editable={false}
                />

                <ProfileField
                  label="Phone Number"
                  name="phone"
                  value={
                    isEditing
                      ? editForm.phone
                      : profile.phone
                  }
                  icon={<Activity size={17} />}
                  editable={isEditing}
                  onChange={handleEditChange}
                  placeholder="Add phone number"
                />

              </div>

            </section>

            <aside className="space-y-6">

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Account Status
                    </h3>

                    <p className="text-sm text-emerald-600">
                      Active & Protected
                    </p>
                  </div>

                </div>

                <div className="mt-5 space-y-4">

                  <InfoRow
                    icon={<CalendarDays size={16} />}
                    label="Joined"
                    value={formatDate(
                      profile.joinedDate
                    )}
                  />

                  <InfoRow
                    icon={<ShieldCheck size={16} />}
                    label="Access Level"
                    value="Administrator"
                  />

                  <InfoRow
                    icon={<Lock size={16} />}
                    label="Security"
                    value="Protected"
                  />

                </div>

              </section>

              <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={21}
                    className="mt-0.5 shrink-0 text-indigo-600"
                  />

                  <div>
                    <h3 className="font-bold text-indigo-900">
                      Administrator Security
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-indigo-700">
                      Keep your administrator credentials
                      private. In the production version,
                      authentication will be protected using
                      JWT, bcrypt and university email
                      verification.
                    </p>
                  </div>

                </div>

              </section>

            </aside>

          </div>
        )}

        {/* ===================================================
            SECURITY TAB
        =================================================== */}

        {activeTab === "security" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Change Password
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update your administrator password regularly.
                </p>
              </div>

              <div className="max-w-2xl space-y-5">

                <PasswordField
                  label="Current Password"
                  name="currentPassword"
                  value={
                    passwordForm.currentPassword
                  }
                  show={showCurrentPassword}
                  onToggle={() =>
                    setShowCurrentPassword(
                      (previous) => !previous
                    )
                  }
                  onChange={handlePasswordChange}
                />

                <PasswordField
                  label="New Password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  show={showNewPassword}
                  onToggle={() =>
                    setShowNewPassword(
                      (previous) => !previous
                    )
                  }
                  onChange={handlePasswordChange}
                />

                <PasswordField
                  label="Confirm New Password"
                  name="confirmPassword"
                  value={
                    passwordForm.confirmPassword
                  }
                  show={showConfirmPassword}
                  onToggle={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  onChange={handlePasswordChange}
                />

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-sm font-semibold text-slate-700">
                    Password requirements
                  </p>

                  <ul className="mt-3 space-y-2 text-sm text-slate-500">
                    <li>• At least 8 characters</li>
                    <li>
                      • Use a combination of letters and
                      numbers
                    </li>
                    <li>
                      • Avoid using easily guessed
                      information
                    </li>
                  </ul>

                </div>

                {passwordMessage && (
                  <div
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                      passwordMessage.includes(
                        "successfully"
                      )
                        ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border border-red-100 bg-red-50 text-red-700"
                    }`}
                  >
                    {passwordMessage.includes(
                      "successfully"
                    ) ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <AlertCircle size={17} />
                    )}

                    {passwordMessage}
                  </div>
                )}

                <button
                  onClick={handlePasswordUpdate}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Lock size={17} />
                  Update Password
                </button>

              </div>

            </section>

            <aside className="space-y-6">

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck size={21} />
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  Security Status
                </h3>

                <div className="mt-4 space-y-3">

                  <SecurityItem
                    label="Administrator Access"
                    status="Enabled"
                  />

                  <SecurityItem
                    label="Account Protection"
                    status="Active"
                  />

                  <SecurityItem
                    label="Email Verification"
                    status="Ready"
                  />

                </div>

              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start gap-3">

                  <AlertCircle
                    size={19}
                    className="mt-0.5 text-slate-500"
                  />

                  <p className="text-sm leading-6 text-slate-500">
                    Password authentication shown here is
                    currently a frontend demonstration.
                    Backend authentication will securely
                    handle password hashing and verification.
                  </p>

                </div>

              </section>

            </aside>

          </div>
        )}

        {/* ===================================================
            NOTIFICATION TAB
        =================================================== */}

        {activeTab === "notifications" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Notification Preferences
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Choose which CampusFind administrator
                  notifications you want to receive.
                </p>
              </div>

              <div className="divide-y divide-slate-100">

                <NotificationToggle
                  title="New Claim Requests"
                  description="Receive alerts when a student submits a claim."
                  enabled={notifications.newClaims}
                  onChange={() =>
                    handleNotificationChange(
                      "newClaims"
                    )
                  }
                />

                <NotificationToggle
                  title="New Lost / Found Reports"
                  description="Get notified when new items are reported."
                  enabled={notifications.newReports}
                  onChange={() =>
                    handleNotificationChange(
                      "newReports"
                    )
                  }
                />

                <NotificationToggle
                  title="Recovery Updates"
                  description="Receive updates when an item moves toward recovery."
                  enabled={
                    notifications.recoveryUpdates
                  }
                  onChange={() =>
                    handleNotificationChange(
                      "recoveryUpdates"
                    )
                  }
                />

                <NotificationToggle
                  title="System Alerts"
                  description="Important security and platform notifications."
                  enabled={
                    notifications.systemAlerts
                  }
                  onChange={() =>
                    handleNotificationChange(
                      "systemAlerts"
                    )
                  }
                />

              </div>

            </section>

            <aside>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Bell size={21} />
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  Stay Updated
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Administrator notifications help you
                  respond quickly to claims, reports and
                  recovery requests.
                </p>

              </section>

            </aside>

          </div>
        )}

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="font-bold text-slate-900">
                Administrator Session
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Sign out from this administrator account.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <LogOut size={17} />
              Logout
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

/* =========================================================
   TAB BUTTON
========================================================= */

function TabButton({
  active,
  onClick,
  icon,
  label,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   PROFILE FIELD
========================================================= */

function ProfileField({
  label,
  name,
  type = "text",
  value,
  icon,
  editable,
  onChange,
  placeholder = "",
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div
        className={`relative flex items-center rounded-xl border transition ${
          editable
            ? "border-slate-300 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100"
            : "border-slate-200 bg-slate-50"
        }`}
      >

        <span className="ml-3 text-slate-400">
          {icon}
        </span>

        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={!editable}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:text-slate-500"
        />

      </div>

    </div>
  );
}

/* =========================================================
   PASSWORD FIELD
========================================================= */

function PasswordField({
  label,
  name,
  value,
  show,
  onToggle,
  onChange,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">

        <Lock
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="Enter password"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-600"
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">

      <div className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </div>

      <span className="text-right text-sm font-semibold text-slate-700">
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   SECURITY ITEM
========================================================= */

function SecurityItem({ label, status }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">

      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <CheckCircle2 size={14} />
        {status}
      </span>

    </div>
  );
}

/* =========================================================
   NOTIFICATION TOGGLE
========================================================= */

function NotificationToggle({
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">

      <div>
        <h4 className="text-sm font-bold text-slate-900">
          {title}
        </h4>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-label={`Toggle ${title}`}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-indigo-600"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>

    </div>
  );
}
