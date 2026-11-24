
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  ShieldCheck,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Camera,
  Trash2,
  Building2,
  Clock3,
  CircleCheck,
  Lock,
} from "lucide-react";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    phone: "",
    department: "",
    year: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, [navigate]);

  const loadProfile = () => {
    const loggedInEmail = (
      localStorage.getItem("campusFindUserEmail") || ""
    )
      .trim()
      .toLowerCase();

    const isLoggedIn =
      localStorage.getItem("campusFindLoggedIn") === "true";

    if (!isLoggedIn || !loggedInEmail) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const users = JSON.parse(
        localStorage.getItem("campusFindUsers") || "[]"
      );

      const oldRegistration = JSON.parse(
        localStorage.getItem("campusFindRegistration") || "null"
      );

      let registeredUser = Array.isArray(users)
        ? users.find(
            (item) =>
              item.email?.toLowerCase() === loggedInEmail
          )
        : null;

      if (
        !registeredUser &&
        oldRegistration?.email?.toLowerCase() === loggedInEmail
      ) {
        registeredUser = oldRegistration;
      }

      if (!registeredUser) {
        setError("User profile could not be found.");
        return;
      }

      const savedImage =
        registeredUser.profileImage ||
        localStorage.getItem("campusFindUserProfileImage") ||
        "";

      const loadedUser = {
        ...registeredUser,
        phone: registeredUser.phone || "",
        department: registeredUser.department || "",
        year: registeredUser.year || "",
      };

      setUser(loadedUser);
      setProfileImage(savedImage);

      setFormData({
        name: loadedUser.name || "",
        studentId: loadedUser.studentId || "",
        phone: loadedUser.phone || "",
        department: loadedUser.department || "",
        year: loadedUser.year || "",
      });
    } catch {
      setError("Unable to load profile information.");
    }
  };

  const persistUser = (updatedUser) => {
    const users = JSON.parse(
      localStorage.getItem("campusFindUsers") || "[]"
    );

    if (Array.isArray(users)) {
      const updatedUsers = users.map((item) =>
        item.email?.toLowerCase() === updatedUser.email?.toLowerCase()
          ? updatedUser
          : item
      );

      if (
        !updatedUsers.some(
          (item) =>
            item.email?.toLowerCase() ===
            updatedUser.email?.toLowerCase()
        )
      ) {
        updatedUsers.push(updatedUser);
      }

      localStorage.setItem(
        "campusFindUsers",
        JSON.stringify(updatedUsers)
      );
    }

    const oldRegistration = JSON.parse(
      localStorage.getItem("campusFindRegistration") || "null"
    );

    if (
      oldRegistration?.email?.toLowerCase() ===
      updatedUser.email?.toLowerCase()
    ) {
      localStorage.setItem(
        "campusFindRegistration",
        JSON.stringify(updatedUser)
      );
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const imageData = reader.result;

        const updatedUser = {
          ...user,
          profileImage: imageData,
          updatedAt: new Date().toISOString(),
        };

        persistUser(updatedUser);

        localStorage.setItem(
          "campusFindUserProfileImage",
          imageData
        );

        setUser(updatedUser);
        setProfileImage(imageData);
        setError("");
        setMessage("Profile picture updated successfully!");
      } catch {
        setError(
          "Unable to save image. Try selecting a smaller image."
        );
      }
    };

    reader.onerror = () => {
      setError("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    if (!profileImage || !user) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile picture?"
    );

    if (!confirmed) return;

    const updatedUser = {
      ...user,
      profileImage: "",
      updatedAt: new Date().toISOString(),
    };

    try {
      persistUser(updatedUser);

      localStorage.removeItem("campusFindUserProfileImage");

      setUser(updatedUser);
      setProfileImage("");
      setMessage("Profile picture removed successfully!");
      setError("");
    } catch {
      setError("Unable to remove profile picture.");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setMessage("");
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!user) return;

    const name = formData.name.trim();
    const studentId = formData.studentId.trim();
    const phone = formData.phone.trim();
    const department = formData.department.trim();
    const year = formData.year.trim();

    if (!name) {
      setError("Please enter your full name.");
      return;
    }

    if (name.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (!studentId) {
      setError("Please enter your Student ID.");
      return;
    }

    if (studentId.length < 3) {
      setError("Please enter a valid Student ID.");
      return;
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    try {
      const users = JSON.parse(
        localStorage.getItem("campusFindUsers") || "[]"
      );

      if (!Array.isArray(users)) {
        setError("Unable to update account information.");
        return;
      }

      const duplicateId = users.some(
        (item) =>
          item.email?.toLowerCase() !==
            user.email?.toLowerCase() &&
          item.studentId?.toLowerCase() ===
            studentId.toLowerCase()
      );

      if (duplicateId) {
        setError(
          "This Student ID is already used by another account."
        );
        return;
      }

      const updatedUser = {
        ...user,
        name,
        studentId,
        phone,
        department,
        year,
        profileImage,
        updatedAt: new Date().toISOString(),
      };

      persistUser(updatedUser);

      localStorage.setItem(
        "campusFindUserName",
        name
      );

      setUser(updatedUser);

      setFormData({
        name,
        studentId,
        phone,
        department,
        year,
      });

      setIsEditing(false);
      setError("");
      setMessage("Profile updated successfully!");
    } catch {
      setError(
        "Something went wrong while saving your profile."
      );
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      studentId: user?.studentId || "",
      phone: user?.phone || "",
      department: user?.department || "",
      year: user?.year || "",
    });

    setIsEditing(false);
    setError("");
    setMessage("");
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProfileCompletion = () => {
    if (!user) return 0;

    const fields = [
      user.name,
      user.email,
      user.studentId,
      user.phone,
      user.department,
      user.year,
      profileImage,
    ];

    const completed = fields.filter(
      (field) => String(field || "").trim() !== ""
    ).length;

    return Math.round((completed / fields.length) * 100);
  };

  const completion = getProfileCompletion();

  if (!user && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="font-medium text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <User size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                My Profile
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View and manage your CampusFind account.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <X size={17} />
            {error}
          </div>
        )}

        {user && (
          <>
            {/* Profile Header */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* Cover */}
              <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700" />

              <div className="px-6 pb-6">
                <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                  <div className="flex items-end gap-4">

                    {/* Profile Picture */}
                    <div className="relative">
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-blue-100 text-blue-600 shadow-md">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={42} />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        title="Upload profile picture"
                        className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700"
                      >
                        <Camera size={17} />
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </div>

                    <div className="pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">
                          {user.name || "CampusFind Student"}
                        </h2>

                        {user.verified && (
                          <span
                            title="Verified account"
                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"
                          >
                            <CheckCircle size={13} />
                            Verified
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {user.role || "Student"}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                    <CheckCircle size={16} />
                    {user.status || "Active"}
                  </span>
                </div>

                {/* Photo Actions */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Camera size={17} />
                    Upload Photo
                  </button>

                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                      Remove Photo
                    </button>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  JPG, PNG or other image formats. Maximum size: 2 MB.
                </p>
              </div>
            </div>

            {/* Success Message */}
            {message && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <CheckCircle size={18} />
                {message}
              </div>
            )}

            {/* Profile Completion */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CircleCheck
                      size={21}
                      className="text-blue-600"
                    />

                    <h2 className="font-bold text-slate-900">
                      Profile Completion
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Complete your profile to make item recovery easier.
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {completion}%
                  </p>
                </div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>

              {completion < 100 && (
                <p className="mt-3 text-xs text-slate-500">
                  Add your missing information to reach 100%.
                </p>
              )}
            </div>

            {/* Personal Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage your registered details.
                  </p>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setMessage("");
                      setError("");
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Edit3 size={17} />
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                  <ProfileField
                    label="Full Name"
                    icon={<User size={18} />}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />

                  <ProfileField
                    label="University Email"
                    icon={<Mail size={18} />}
                    value={user.email || ""}
                    disabled
                  />

                  <ProfileField
                    label="Student / Employee ID"
                    icon={<GraduationCap size={19} />}
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />

                  <ProfileField
                    label="Phone Number"
                    icon={<Phone size={18} />}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                  />

                  <ProfileField
                    label="Department / Course"
                    icon={<Building2 size={18} />}
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. Computer Science & Engineering"
                  />

                  <ProfileField
                    label="Year / Semester"
                    icon={<GraduationCap size={18} />}
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. 3rd Year / 5th Semester"
                  />

                  <ProfileField
                    label="Account Role"
                    icon={<ShieldCheck size={18} />}
                    value={user.role || "Student"}
                    disabled
                  />

                  <ProfileField
                    label="Account Created"
                    icon={<Calendar size={18} />}
                    value={formatDate(user.createdAt)}
                    disabled
                  />
                </div>

                {isEditing && (
                  <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <X size={17} />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Save size={17} />
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Account Information */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">

              {/* Verification */}
              <div className="rounded-2xl border border-green-100 bg-green-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-white p-3 text-green-600 shadow-sm">
                    <ShieldCheck size={23} />
                  </div>

                  <div>
                    <h3 className="font-bold text-green-900">
                      Account Verification
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-green-700">
                      Your account verification status is managed through
                      CampusFind authentication.
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700">
                      <CheckCircle size={17} />
                      {user.verified
                        ? "Email Verified"
                        : "Verification Pending"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
                    <Clock3 size={23} />
                  </div>

                  <div>
                    <h3 className="font-bold text-blue-900">
                      Profile Activity
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-blue-700">
                      Your profile information was last updated on:
                    </p>

                    <p className="mt-3 text-sm font-semibold text-blue-800">
                      {formatDateTime(user.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <Lock size={22} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Account Security
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Keep your account details accurate. Never share your
                  password or verification OTP with anyone.
                </p>

                <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CheckCircle size={17} />
                  CampusFind account protected
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProfileField({
  label,
  icon,
  name,
  value,
  onChange,
  disabled,
  type = "text",
  maxLength,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600"
        />
      </div>
    </div>
  );
}

export default Profile;
