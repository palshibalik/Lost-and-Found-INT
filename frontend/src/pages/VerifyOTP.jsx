import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const email = (
    location.state?.email ||
    localStorage.getItem("campusFindPendingEmail") ||
    ""
  ).trim().toLowerCase();

  const DEMO_OTP = "123456";

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleVerify = (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError("Verification email not found. Please try again.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    if (otp !== DEMO_OTP) {
      setError("Invalid OTP. For testing, use 123456.");
      return;
    }

    let users = [];

    try {
      const savedUsers = JSON.parse(
        localStorage.getItem("campusFindUsers") || "[]"
      );

      if (Array.isArray(savedUsers)) {
        users = savedUsers;
      }

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
      setError("Unable to access account information. Please try again.");
      return;
    }

    const registeredUser = users.find(
      (user) => user.email?.toLowerCase() === email
    );

    if (!registeredUser) {
      setError("Registered account not found. Please register first.");
      return;
    }

    if (
      registeredUser.status?.toLowerCase() === "blocked" ||
      registeredUser.isBlocked === true
    ) {
      setError("Your account is blocked. Please contact the administrator.");
      return;
    }

    const verificationTime = new Date().toISOString();

    const updatedUsers = users.map((user) =>
      user.email?.toLowerCase() === email
        ? {
            ...user,
            verified: true,
            verifiedAt: verificationTime,
          }
        : user
    );

    localStorage.setItem(
      "campusFindUsers",
      JSON.stringify(updatedUsers)
    );

    const oldRegistration = JSON.parse(
      localStorage.getItem("campusFindRegistration") || "null"
    );

    if (oldRegistration?.email?.toLowerCase() === email) {
      localStorage.setItem(
        "campusFindRegistration",
        JSON.stringify({
          ...oldRegistration,
          verified: true,
          verifiedAt: verificationTime,
        })
      );
    }

    localStorage.setItem("campusFindVerified", "true");

    // Check whether OTP verification was started during login
    const isPendingLogin =
      localStorage.getItem("campusFindPendingLogin") === "true";

    setMessage("Account verified successfully!");

    // Complete login automatically if this was a login verification
    if (isPendingLogin) {
      localStorage.setItem("campusFindLoggedIn", "true");
      localStorage.setItem("campusFindUserEmail", email);
      localStorage.setItem(
        "campusFindUserName",
        registeredUser.name || ""
      );

      localStorage.removeItem("campusFindPendingLogin");
      localStorage.removeItem("campusFindPendingEmail");

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);

      return;
    }

    // Normal registration verification
    localStorage.removeItem("campusFindPendingEmail");

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1000);
  };

  const handleResend = () => {
    setOtp("");
    setError("");
    setMessage("");
    setTimeLeft(30);

    alert("Demo OTP sent again. Use 123456.");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link
            to="/register"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to Registration
          </Link>
        </div>
      </nav>

      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-10">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ShieldCheck size={32} />
            </div>

            <div className="mt-6 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Verify Your Account
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter the 6-digit verification code sent to
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-blue-600">
                {email || "your university email"}
              </p>
            </div>

            <form onSubmit={handleVerify} className="mt-8">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Verification Code
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setError("");
                  setMessage("");
                }}
                className={`w-full rounded-xl border bg-white px-4 py-4 text-center text-2xl font-extrabold tracking-[0.45em] text-slate-900 outline-none transition ${
                  error
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                }`}
              />

              {error && (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              {message && (
                <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-600">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="mt-5 w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99]"
              >
                Verify Account
              </button>
            </form>

            <div className="mt-7 text-center">
              <p className="text-sm text-slate-500">
                Didn't receive the code?
              </p>

              {timeLeft > 0 ? (
                <p className="mt-2 text-sm font-semibold text-slate-400">
                  Resend available in {timeLeft}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
                >
                  <RefreshCw size={16} />
                  Resend OTP
                </button>
              )}
            </div>

            <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Development Mode
              </p>

              <p className="mt-1 text-sm text-blue-700">
                Demo OTP:
                <span className="ml-2 font-extrabold">123456</span>
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default VerifyOTP;