import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  LogIn,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid university email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Get registered users
    let users = [];

    try {
      const savedUsers = JSON.parse(
        localStorage.getItem("campusFindUsers") || "[]"
      );

      if (Array.isArray(savedUsers)) {
        users = savedUsers;
      }

      // Legacy single-user compatibility
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
        users.push(oldRegistration);
      }
    } catch (err) {
      setError("Unable to read account information. Please try again.");
      return;
    }

    // Find account
    const registeredUser = users.find(
      (user) => user.email?.toLowerCase() === email
    );

    if (!registeredUser) {
      setError("No account found with this email. Please register first.");
      return;
    }

    // Check password
    if (registeredUser.password !== password) {
      setError("Incorrect password. Please try again.");
      return;
    }

    // Check blocked account first
    if (
      registeredUser.status?.toLowerCase() === "blocked" ||
      registeredUser.isBlocked === true
    ) {
      setError(
        "Your account has been blocked by the administrator. Please contact the admin."
      );
      return;
    }

    // Send existing unverified account to OTP page
    if (registeredUser.verified !== true) {
      localStorage.setItem("campusFindPendingEmail", email);
      localStorage.removeItem("campusFindVerified");

      navigate("/verify-otp");
      return;
    }

    // Successful login
    localStorage.setItem("campusFindLoggedIn", "true");
    localStorage.setItem("campusFindUserEmail", email);
    localStorage.setItem(
      "campusFindUserName",
      registeredUser.name || ""
    );

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="grid md:grid-cols-2">

          {/* Left Section */}
          <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 flex-col justify-between">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-10"
              >
                <ArrowLeft size={18} />
                Back to Home
              </Link>

              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={30} />
              </div>

              <h2 className="text-4xl font-bold leading-tight">
                Welcome back to
                <span className="block text-blue-100">CampusFind</span>
              </h2>

              <p className="mt-5 text-blue-100 leading-relaxed">
                Sign in to report lost items, find your belongings,
                manage claims and complete secure campus recovery.
              </p>
            </div>

            <div className="space-y-4">
              <Feature text="Secure campus-only platform" />
              <Feature text="Verified recovery process" />
              <Feature text="Smart lost & found matching" />
            </div>
          </div>

          {/* Right Section */}
          <div className="p-7 sm:p-10">
            <div className="md:hidden mb-7">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft size={18} />
                Back to Home
              </Link>
            </div>

            <div className="mb-8">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5">
                <LogIn size={24} />
              </div>

              <h1 className="text-3xl font-bold text-gray-900">
                Welcome Back
              </h1>

              <p className="mt-2 text-gray-500">
                Login to your CampusFind account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm leading-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  University Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourname@university.edu"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    onClick={() =>
                      setError(
                        "Password reset will be available after backend integration."
                      )
                    }
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Login */}
              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                <LogIn size={19} />
                Login
              </button>
            </form>

            {/* Security Info */}
            <div className="mt-7 p-4 rounded-xl bg-green-50 border border-green-100">
              <div className="flex gap-3">
                <ShieldCheck size={20} className="text-green-600 mt-0.5 shrink-0" />

                <div>
                  <p className="font-semibold text-green-800 text-sm">
                    Secure Campus Access
                  </p>

                  <p className="text-xs text-green-700 mt-1 leading-relaxed">
                    Your account is protected and designed for
                    trusted campus lost-and-found recovery.
                  </p>
                </div>
              </div>
            </div>

            {/* Register */}
            <p className="text-center text-gray-500 text-sm mt-7">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 size={19} className="text-blue-200" />
      <span className="text-sm text-blue-50">{text}</span>
    </div>
  );
}

export default Login;