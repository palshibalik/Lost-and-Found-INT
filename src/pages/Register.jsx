
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const studentId = formData.studentId.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // Basic validation
    if (!name) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your university email.");
      return;
    }

    if (!studentId) {
      setError("Please enter your Student / Employee ID.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Get existing users
    let users = [];

    try {
      const savedUsers = JSON.parse(
        localStorage.getItem("campusFindUsers") || "[]"
      );

      if (Array.isArray(savedUsers)) {
        users = savedUsers;
      }

      // Migrate old single-user registration
      const oldRegistration = JSON.parse(
        localStorage.getItem("campusFindRegistration") || "null"
      );

      if (
        oldRegistration?.email &&
        !users.some(
          (user) =>
            user.email?.toLowerCase() ===
            oldRegistration.email.toLowerCase()
        )
      ) {
        users.push({
          ...oldRegistration,
          id: oldRegistration.id || Date.now(),
          status: oldRegistration.status || "Active",
          role: oldRegistration.role || "Student",
          createdAt:
            oldRegistration.createdAt || new Date().toISOString(),
        });
      }
    } catch (error) {
      setError("Unable to read saved registration data.");
      return;
    }

    // Check duplicate email
    const emailExists = users.some(
      (user) => user.email?.toLowerCase() === email
    );

    if (emailExists) {
      setError("This email is already registered. Please login.");
      return;
    }

    // Check duplicate Student ID
    const studentIdExists = users.some(
      (user) =>
        user.studentId?.toLowerCase() === studentId.toLowerCase()
    );

    if (studentIdExists) {
      setError("This Student / Employee ID is already registered.");
      return;
    }

    // Create new user
    const userData = {
      id: Date.now().toString(),
      name,
      email,
      studentId,
      password,
      role: "Student",
      status: "Active",
      isBlocked: false,
      verified: false,
      createdAt: new Date().toISOString(),
    };

    // Save all users
    users.push(userData);

    localStorage.setItem(
      "campusFindUsers",
      JSON.stringify(users)
    );

    // Keep old key for login compatibility
    localStorage.setItem(
      "campusFindRegistration",
      JSON.stringify(userData)
    );

    // Save email for OTP verification
    localStorage.setItem("campusFindPendingEmail", email);

    // Reset previous verification and login states
    localStorage.removeItem("campusFindVerified");
    localStorage.removeItem("campusFindPendingLogin");

    // Go to OTP verification
    navigate("/verify-otp");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-5 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.10)] lg:grid-cols-2">

          {/* Left Panel */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white lg:block">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10" />

            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg backdrop-blur">
                🔎
              </div>

              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
                Trusted Campus Recovery
              </p>

              <h1 className="mt-4 text-4xl font-extrabold leading-tight">
                Join your trusted
                <span className="block text-blue-200">
                  campus community.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-[15px] leading-7 text-blue-100">
                Create your CampusFind account and make lost-and-found
                recovery safer, faster and more convenient for everyone
                on campus.
              </p>

              <div className="mt-10 space-y-5">
                <Info text="Report lost belongings" />
                <Info text="Register found items" />
                <Info text="Find possible matches" />
                <Info text="Securely verify ownership" />
              </div>

              <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={22}
                    className="mt-0.5 shrink-0 text-blue-200"
                  />

                  <div>
                    <p className="font-semibold">
                      Verified Campus Access
                    </p>

                    <p className="mt-1 text-sm leading-6 text-blue-100">
                      Your account will be verified before you
                      can access trusted recovery features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Register Form */}
          <div className="p-6 sm:p-9 lg:p-10">
            <div className="mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserPlus size={24} />
              </div>

              <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">
                Create Account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use your university details to create your
                CampusFind account.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />

              <Input
                label="University Email"
                name="email"
                type="email"
                placeholder="example@university.edu"
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                label="Student / Employee ID"
                name="studentId"
                type="text"
                placeholder="Enter your campus ID"
                value={formData.studentId}
                onChange={handleChange}
              />

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Security Information */}
              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <p className="text-xs leading-5 text-slate-600">
                  Your account will be verified before you
                  can access trusted campus recovery features.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl active:translate-y-0"
              >
                Continue to Verification
                <span>→</span>
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 transition hover:text-blue-700"
              >
                Login
              </Link>
            </p>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
              <CheckCircle2
                size={15}
                className="text-emerald-500"
              />
              Trusted Campus Recovery Platform
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Reusable Input Component */
function Input({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

/* Reusable Info Component */
function Info({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
        <CheckCircle2 size={16} className="text-blue-100" />
      </div>

      <span className="text-sm font-medium text-blue-50">
        {text}
      </span>
    </div>
  );
}

export default Register;
