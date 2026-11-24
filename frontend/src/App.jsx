
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

// =====================================================
// PUBLIC / STUDENT PAGES
// =====================================================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import Dashboard from "./pages/Dashboard";

import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";

import LostItems from "./pages/LostItems";
import FoundItems from "./pages/FoundItems";
import ItemDetails from "./pages/ItemDetails";

import Matches from "./pages/Matches";
import MyClaims from "./pages/MyClaims";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "./admin/AdminDashboard";
import AdminProfile from "./admin/AdminProfile";
import AdminNotifications from "./admin/AdminNotifications";

import ManageClaims from "./admin/ManageClaims";
import HandoverRecords from "./admin/HandoverRecords";
import ManageItems from "./admin/ManageLostItems";
import ManageFoundItems from "./admin/ManageFoundItems";
import ManageUsers from "./admin/ManageUsers";

function App() {
  return (
    <BrowserRouter>

      {/* Scroll page to top whenever route changes */}
      <ScrollToTop />

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />


        {/* =================================================
            PUBLIC ITEM BROWSING
        ================================================= */}

        <Route
          path="/lost-items"
          element={<LostItems />}
        />

        <Route
          path="/found-items"
          element={<FoundItems />}
        />

        <Route
          path="/item/:type/:id"
          element={<ItemDetails />}
        />


        {/* =================================================
            PROTECTED STUDENT ROUTES
        ================================================= */}

        <Route element={<ProtectedRoute />}>

          {/* Student Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Report Lost Item */}
          <Route
            path="/report-lost"
            element={<ReportLost />}
          />

          {/* Report Found Item */}
          <Route
            path="/report-found"
            element={<ReportFound />}
          />

          {/* Smart Matches */}
          <Route
            path="/matches"
            element={<Matches />}
          />

          {/* My Claims */}
          <Route
            path="/my-claims"
            element={<MyClaims />}
          />

          {/* Student Notifications */}
          <Route
            path="/notifications"
            element={<Notifications />}
          />

          {/* Student Profile */}
          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>


        {/* =================================================
            OLD ROUTE REDIRECT
            /register-found → /report-found
        ================================================= */}

        <Route
          path="/register-found"
          element={
            <Navigate
              to="/report-found"
              replace
            />
          }
        />


        {/* =================================================
            PROTECTED ADMIN ROUTES
        ================================================= */}

        <Route element={<ProtectedRoute />}>

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          {/* Admin Profile */}
          <Route
            path="/admin/profile"
            element={<AdminProfile />}
          />

          {/* Admin Notifications */}
          <Route
            path="/admin/notifications"
            element={<AdminNotifications />}
          />

          {/* Manage Claims */}
          <Route
            path="/admin/claims"
            element={<ManageClaims />}
          />

          {/* Handover Records */}
          <Route
            path="/admin/handover"
            element={<HandoverRecords />}
          />

          {/* Manage Lost Items */}
          <Route
            path="/admin/lost-items"
            element={<ManageItems />}
          />

          {/* Manage Found Items */}
          <Route
            path="/admin/found-items"
            element={<ManageFoundItems />}
          />

          {/* Manage Users */}
          <Route
            path="/admin/users"
            element={<ManageUsers />}
          />

        </Route>


        {/* =================================================
            404 PAGE
        ================================================= */}

        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">

              <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">

                {/* 404 Icon */}
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50">

                  <span className="text-4xl font-extrabold text-blue-600">
                    404
                  </span>

                </div>

                {/* Heading */}
                <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
                  Page Not Found
                </h1>

                {/* Description */}
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  The page you are looking for does not exist
                  or may have been moved.
                </p>

                {/* Home Button */}
                <Link
                  to="/"
                  className="mt-7 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Go to Home
                </Link>

              </div>

            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
