
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Image as ImageIcon,
  MapPin,
  PackageCheck,
  Palette,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";

function ReportFound() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    brand: "",
    color: "",
    foundDate: "",
    foundTime: "",
    foundLocation: "",
    currentLocation: "",
    description: "",
    identifyingDetails: "",
    finderName: "",
    finderContact: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [similarReports, setSimilarReports] = useState([]);

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = [
    "ID Card",
    "Laptop",
    "Mobile Phone",
    "Documents",
    "Wallet",
    "Bag",
    "Bottle",
    "Keys",
    "Books",
    "Electronics",
    "Clothing",
    "Jewelry",
    "Accessories",
    "Other",
  ];

  // =========================================================
  // COLORS
  // =========================================================

  const colors = [
    "Black",
    "White",
    "Blue",
    "Red",
    "Green",
    "Yellow",
    "Grey",
    "Brown",
    "Silver",
    "Gold",
    "Multi-color",
    "Other",
  ];

  // =========================================================
  // CURRENT USER
  // =========================================================

  const currentUser = useMemo(() => {
    const email = localStorage.getItem("campusFindUserEmail");

    if (!email) {
      return null;
    }

    try {
      const users = JSON.parse(
        localStorage.getItem("campusFindUsers") || "[]"
      );

      return (
        users.find(
          (user) =>
            user.email?.toLowerCase() === email.toLowerCase()
        ) || null
      );
    } catch {
      return null;
    }
  }, []);

  const userName =
    currentUser?.name ||
    currentUser?.fullName ||
    localStorage.getItem("campusFindUserName") ||
    "Campus User";

  const userEmail =
    currentUser?.email ||
    localStorage.getItem("campusFindUserEmail") ||
    "";

  // =========================================================
  // FORM COMPLETION
  // =========================================================

  const completionFields = [
    formData.itemName,
    formData.category,
    formData.foundDate,
    formData.foundTime,
    formData.foundLocation,
    formData.currentLocation,
    formData.description,
    formData.identifyingDetails,
    formData.finderName,
    formData.finderContact,
    photo,
  ];

  const completedFields =
    completionFields.filter(Boolean).length;

  const progress = Math.round(
    (completedFields / completionFields.length) * 100
  );

  // =========================================================
  // AUTO FILL FINDER
  // =========================================================

  useEffect(() => {
    setFormData((previous) => ({
      ...previous,
      finderName:
        previous.finderName || userName,
      finderContact:
        previous.finderContact || userEmail,
    }));
  }, [userName, userEmail]);

  // =========================================================
  // INPUT CLASS
  // SAME STYLE AS REPORT LOST
  // =========================================================

  const inputBase =
    "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  const getInputClass = (field) => {
    return `${inputBase} ${
      fieldErrors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200"
    }`;
  };

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    if (
      name === "itemName" ||
      name === "category"
    ) {
      findSimilarReports({
        ...formData,
        [name]: value,
      });
    }
  };

  // =========================================================
  // PHOTO
  // =========================================================

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size must be less than 5MB.");
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(file);

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    setFieldErrors((previous) => ({
      ...previous,
      photo: "",
    }));
  };

  // =========================================================
  // REMOVE PHOTO
  // =========================================================

  const removePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(null);
    setPhotoPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // CLEANUP PHOTO
  // =========================================================

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // =========================================================
  // SIMILAR LOST REPORTS
  // =========================================================

  const findSimilarReports = (data = formData) => {
    try {
      const reports = JSON.parse(
        localStorage.getItem("campusFindLostReports") ||
          "[]"
      );

      if (!data.itemName && !data.category) {
        setSimilarReports([]);
        return;
      }

      const itemName =
        data.itemName?.toLowerCase().trim() || "";

      const matches = reports
        .filter((report) => {
          const sameCategory =
            data.category &&
            report.category?.toLowerCase() ===
              data.category.toLowerCase();

          const similarName =
            itemName &&
            report.itemName
              ?.toLowerCase()
              .includes(itemName);

          return sameCategory || similarName;
        })
        .slice(0, 3);

      setSimilarReports(matches);
    } catch {
      setSimilarReports([]);
    }
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    const errors = {};

    if (!formData.itemName.trim()) {
      errors.itemName =
        "Item name is required.";
    } else if (
      formData.itemName.trim().length < 2
    ) {
      errors.itemName =
        "Item name must contain at least 2 characters.";
    }

    if (!formData.category) {
      errors.category =
        "Please select a category.";
    }

    if (!formData.foundDate) {
      errors.foundDate =
        "Please select the found date.";
    }

    if (
      formData.foundDate &&
      formData.foundDate > today
    ) {
      errors.foundDate =
        "Found date cannot be in the future.";
    }

    if (!formData.foundTime) {
      errors.foundTime =
        "Please select the approximate time.";
    }

    if (!formData.foundLocation.trim()) {
      errors.foundLocation =
        "Found location is required.";
    } else if (
      formData.foundLocation.trim().length < 3
    ) {
      errors.foundLocation =
        "Please provide a more specific location.";
    }

    if (!formData.currentLocation.trim()) {
      errors.currentLocation =
        "Current item location is required.";
    } else if (
      formData.currentLocation.trim().length < 3
    ) {
      errors.currentLocation =
        "Please provide a more specific current location.";
    }

    if (!formData.description.trim()) {
      errors.description =
        "Please describe the found item.";
    } else if (
      formData.description.trim().length < 15
    ) {
      errors.description =
        "Description should contain at least 15 characters.";
    }

    if (
      formData.identifyingDetails.trim().length > 0 &&
      formData.identifyingDetails.trim().length < 5
    ) {
      errors.identifyingDetails =
        "Please provide more useful identifying details.";
    }

    if (!formData.finderName.trim()) {
      errors.finderName =
        "Your name is required.";
    }

    if (!formData.finderContact.trim()) {
      errors.finderContact =
        "Contact information is required.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =========================================================
  // IMAGE TO DATA URL
  // =========================================================

  const convertImageToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();

      reader.onload = () =>
        resolve(reader.result);

      reader.onerror = () =>
        reject(
          new Error("Unable to process image.")
        );

      reader.readAsDataURL(file);
    });
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    const isValid = validateForm();

    if (!isValid) {
      setError(
        "Please fix the highlighted fields before submitting."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const existingReports = JSON.parse(
        localStorage.getItem(
          "campusFindFoundReports"
        ) || "[]"
      );

      // -----------------------------------------------------
      // DUPLICATE CHECK
      // -----------------------------------------------------

      const duplicate = existingReports.find(
        (report) =>
          report.itemName
            ?.toLowerCase()
            .trim() ===
            formData.itemName
              .toLowerCase()
              .trim() &&
          report.foundLocation
            ?.toLowerCase()
            .trim() ===
            formData.foundLocation
              .toLowerCase()
              .trim() &&
          report.foundDate ===
            formData.foundDate &&
          report.finderContact
            ?.toLowerCase()
            .trim() ===
            formData.finderContact
              .toLowerCase()
              .trim()
      );

      if (duplicate) {
        setError(
          "A similar found-item report already exists. Please check your existing reports before submitting again."
        );

        setIsSubmitting(false);
        return;
      }

      // -----------------------------------------------------
      // IMAGE
      // -----------------------------------------------------

      let photoData = null;

      if (photo) {
        try {
          photoData =
            await convertImageToDataUrl(photo);
        } catch {
          setError(
            "The selected image could not be processed. Please try another image."
          );

          setIsSubmitting(false);
          return;
        }
      }

      // -----------------------------------------------------
      // NEW REPORT
      // -----------------------------------------------------

      const newReport = {
        id: `found-${Date.now()}`,

        // Item
        itemName:
          formData.itemName.trim(),

        category:
          formData.category,

        brand:
          formData.brand.trim(),

        color:
          formData.color,

        // Found information
        foundDate:
          formData.foundDate,

        foundTime:
          formData.foundTime,

        foundLocation:
          formData.foundLocation.trim(),

        currentLocation:
          formData.currentLocation.trim(),

        // Description
        description:
          formData.description.trim(),

        identifyingDetails:
          formData.identifyingDetails.trim(),

        // Finder
        finderName:
          formData.finderName.trim(),

        finderContact:
          formData.finderContact.trim(),

        // Photo
        photoName:
          photo ? photo.name : null,

        photoData,

        // User
        reportedBy:
          userName,

        reportedByEmail:
          userEmail,

        // Status
        status:
          "Pending Verification",

        verificationStatus:
          "Pending",

        claimStatus:
          "Not Claimed",

        recoveryStatus:
          "Awaiting Match",

        // Matching
        matchStatus:
          "Searching for matches",

        matchScore: 0,

        adminReviewed: false,

        // Metadata
        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      };

      existingReports.unshift(newReport);

      localStorage.setItem(
        "campusFindFoundReports",
        JSON.stringify(existingReports)
      );

      // -----------------------------------------------------
      // NOTIFICATION
      // -----------------------------------------------------

      const existingNotifications =
        JSON.parse(
          localStorage.getItem(
            "campusFindNotifications"
          ) || "[]"
        );

      const notification = {
        id: `notification-${Date.now()}`,

        type: "report",

        category: "Found Item",

        title:
          "Found item report submitted",

        message: `Your found-item report for "${newReport.itemName}" has been submitted successfully.`,

        itemId:
          newReport.id,

        itemName:
          newReport.itemName,

        email:
          userEmail,

        read: false,

        createdAt:
          new Date().toISOString(),
      };

      existingNotifications.unshift(
        notification
      );

      localStorage.setItem(
        "campusFindNotifications",
        JSON.stringify(
          existingNotifications
        )
      );

      // Small delay
      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      setSuccess(true);

      setTimeout(() => {
        navigate("/found-items");
      }, 1200);
    } catch (submitError) {
      console.error(
        "Found report submission error:",
        submitError
      );

      setError(
        "Something went wrong while submitting the report. Please try again."
      );

      setIsSubmitting(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
          >

            <ArrowLeft
              size={18}
              className="transition group-hover:-translate-x-1"
            />

            <span className="hidden sm:inline">
              Back to Dashboard
            </span>

            <span className="sm:hidden">
              Back
            </span>

          </button>


          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">

              <PackageCheck size={21} />

            </div>

            <div>

              <p className="text-lg font-bold tracking-tight text-slate-900">
                CampusFind
              </p>

              <p className="hidden text-[11px] font-medium text-slate-500 sm:block">
                Lost & Found Recovery
              </p>

            </div>

          </div>


          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">

            <ShieldCheck
              size={16}
              className="text-emerald-600"
            />

            <span className="text-xs font-semibold text-slate-600">
              Secure Reporting
            </span>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">

        {/* ===================================================
            HERO
        ==================================================== */}

        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_300px]">

          <div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">

              <Sparkles size={14} />

              Smart Found Item Recovery

            </div>


            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Report a Found Item
            </h1>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Provide accurate details about something you
              found on campus. CampusFind will use this
              information to identify the rightful owner.
            </p>

          </div>


          {/* Progress */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Report Progress
                </p>

                <p className="mt-1 text-2xl font-black text-slate-900">
                  {progress}%
                </p>

              </div>


              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">

                {progress === 100 ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <FileText size={21} />
                )}

              </div>

            </div>


            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>


            <p className="mt-2 text-xs text-slate-500">
              Complete the details to improve the chances of
              finding the rightful owner.
            </p>

          </div>

        </div>


        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">

              <p className="font-bold">
                Please check your report
              </p>

              <p className="mt-1 leading-5">
                {error}
              </p>

            </div>


            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 transition hover:bg-red-100"
            >
              <X size={17} />
            </button>

          </div>

        )}


        {/* ===================================================
            SUCCESS
        ==================================================== */}

        {success && (

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">

              <Check size={19} />

            </div>


            <div>

              <p className="font-bold">
                Report submitted successfully
              </p>

              <p className="mt-0.5">
                Redirecting you to found items...
              </p>

            </div>

          </div>

        )}


        {/* ===================================================
            MAIN GRID
        ==================================================== */}

        <div className="grid gap-8 lg:grid-cols-[1fr_310px]">


          {/* =================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >

            {/* Form Header */}

            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:px-8">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">

                  <PackageCheck size={22} />

                </div>


                <div>

                  <h2 className="font-bold text-slate-900">
                    Found Item Report Details
                  </h2>

                  <p className="text-xs text-slate-500">
                    Fields marked with * are required.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 sm:p-8">


              {/* =================================================
                  ITEM INFORMATION
              ================================================== */}

              <section className="border-b border-slate-100 pb-8">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                    <Tag size={18} />

                  </div>


                  <div>

                    <h3 className="font-bold text-slate-900">
                      Item Information
                    </h3>

                    <p className="text-xs text-slate-500">
                      Tell us what you found.
                    </p>

                  </div>

                </div>


                <div className="grid gap-5 md:grid-cols-2">


                  {/* Item Name */}

                  <div>

                    <label className="text-sm font-bold text-slate-700">
                      Item Name *
                    </label>

                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      placeholder="e.g. Black Leather Wallet"
                      className={getInputClass("itemName")}
                      maxLength={80}
                    />

                    {fieldErrors.itemName && (

                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {fieldErrors.itemName}
                      </p>

                    )}

                  </div>


                  {/* Category */}

                  <div>

                    <label className="text-sm font-bold text-slate-700">
                      Category *
                    </label>

                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={getInputClass("category")}
                    >

                      <option value="">
                        Select category
                      </option>

                      {categories.map(
                        (category) => (

                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>

                        )
                      )}

                    </select>


                    {fieldErrors.category && (

                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {fieldErrors.category}
                      </p>

                    )}

                  </div>


                  {/* Brand */}

                  <div>

                    <label className="text-sm font-bold text-slate-700">
                      Brand
                    </label>

                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="e.g. Samsung, Nike, HP"
                      className={getInputClass("brand")}
                      maxLength={60}
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Optional but useful for matching.
                    </p>

                  </div>


                  {/* Color */}

                  <div>

                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">

                      <Palette size={15} />

                      Primary Color

                    </label>


                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className={getInputClass("color")}
                    >

                      <option value="">
                        Select color
                      </option>

                      {colors.map(
                        (color) => (

                          <option
                            key={color}
                            value={color}
                          >
                            {color}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                </div>

              </section>


              {/* =================================================
                  WHEN & WHERE
              ================================================== */}

              <section className="border-b border-slate-100 py-8">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

                    <MapPin size={18} />

                  </div>


                  <div>

                    <h3 className="font-bold text-slate-900">
                      When & Where Was It Found?
                    </h3>

                    <p className="text-xs text-slate-500">
                      Help us identify where the item was found.
                    </p>

                  </div>

                </div>


                <div className="grid gap-5 md:grid-cols-2">


                  {/* Date */}

                  <div>

                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">

                      <CalendarDays size={15} />

                      Found Date *

                    </label>


                    <input
                      type="date"
                      name="foundDate"
                      value={formData.foundDate}
                      max={today}
                      onChange={handleChange}
                      className={getInputClass("foundDate")}
                    />


                    {fieldErrors.foundDate && (

                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {fieldErrors.foundDate}
                      </p>

                    )}

                  </div>


                  {/* Time */}

                  <div>

                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">

                      <Clock3 size={15} />

                      Approximate Time *

                    </label>


                    <input
                      type="time"
                      name="foundTime"
                      value={formData.foundTime}
                      onChange={handleChange}
                      className={getInputClass("foundTime")}
                    />


                    {fieldErrors.foundTime && (

                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {fieldErrors.foundTime}
                      </p>

                    )}

                  </div>


                  {/* Found Location */}

                  <div className="md:col-span-2">

                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">

                      <MapPin size={15} />

                      Found Location *

                    </label>


                    <input
                      type="text"
                      name="foundLocation"
                      value={formData.foundLocation}
                      onChange={handleChange}
                      placeholder="e.g. University Library, Block 34, Cafeteria"
                      className={getInputClass(
                        "foundLocation"
                      )}
                      maxLength={120}
                    />


                    {fieldErrors.foundLocation && (

                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {fieldErrors.foundLocation}
                      </p>

                    )}


                    <p className="mt-1.5 text-xs text-slate-400">
                      Be as specific as possible. Building,
                      block, floor or nearby landmark can help.
                    </p>

                  </div>


                  {/* Current Location */}

                  <div className="md:col-span-2">

                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">

                      <MapPin size={15} />

                      Current Location of Item *

                    </label>


                    <input
                      type="text"
                      name="currentLocation"
                      value={formData.currentLocation}
                      onChange={handleChange}
                      placeholder="e.g. Security Office, Hostel Reception"
                      className={getInputClass(
                        "currentLocation"
                      )}
                      maxLength={120}
                    />


                    {fieldErrors.currentLocation && (

                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {fieldErrors.currentLocation}
                      </p>

                    )}


                    <p className="mt-1.5 text-xs text-slate-400">
                      Tell us where the item is currently being kept.
                    </p>

                  </div>

                </div>

              </section>


              {/* =================================================
                  DESCRIPTION
              ================================================== */}

              <section className="border-b border-slate-100 py-8">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">

                    <FileText size={18} />

                  </div>


                  <div>

                    <h3 className="font-bold text-slate-900">
                      Item Description
                    </h3>

                    <p className="text-xs text-slate-500">
                      More details make owner matching easier.
                    </p>

                  </div>

                </div>


                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  maxLength={500}
                  placeholder="Describe the item — material, model, size, condition, stickers, marks, accessories, etc."
                  className={`${getInputClass(
                    "description"
                  )} resize-none`}
                />


                <div className="mt-2 flex items-center justify-between">

                  {fieldErrors.description ? (

                    <p className="text-xs font-medium text-red-600">
                      {fieldErrors.description}
                    </p>

                  ) : (

                    <p className="text-xs text-slate-400">
                      Avoid sharing sensitive information.
                    </p>

                  )}


                  <span className="text-xs text-slate-400">
                    {formData.description.length}/500
                  </span>

                </div>

              </section>


              {/* =================================================
                  IDENTIFYING DETAILS
              ================================================== */}

              <section className="border-b border-slate-100 py-8">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">

                    <ShieldCheck size={18} />

                  </div>


                  <div>

                    <h3 className="font-bold text-slate-900">
                      Ownership Verification
                    </h3>

                    <p className="text-xs text-slate-500">
                      Private details that can help verify the owner.
                    </p>

                  </div>

                </div>


                <textarea
                  name="identifyingDetails"
                  value={formData.identifyingDetails}
                  onChange={handleChange}
                  rows={4}
                  maxLength={400}
                  placeholder="Example: unique scratch, sticker, initials, special mark, hidden detail..."
                  className={`${getInputClass(
                    "identifyingDetails"
                  )} resize-none`}
                />


                <div className="mt-2 flex items-center justify-between">

                  {fieldErrors.identifyingDetails ? (

                    <p className="text-xs font-medium text-red-600">
                      {fieldErrors.identifyingDetails}
                    </p>

                  ) : (

                    <p className="max-w-lg text-xs leading-5 text-slate-400">
                      These details can be used during ownership
                      verification. Do not enter passwords or private
                      credentials.
                    </p>

                  )}


                  <span className="text-xs text-slate-400">
                    {formData.identifyingDetails.length}/400
                  </span>

                </div>

              </section>


              {/* =================================================
                  PHOTO
              ================================================== */}

              <section className="border-b border-slate-100 py-8">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">

                    <Camera size={18} />

                  </div>


                  <div>

                    <h3 className="font-bold text-slate-900">
                      Item Photo
                    </h3>

                    <p className="text-xs text-slate-500">
                      A clear photo can improve matching accuracy.
                    </p>

                  </div>

                </div>


                {!photo ? (

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50"
                  >

                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm transition group-hover:text-blue-600">

                      <Upload size={25} />

                    </div>


                    <p className="font-bold text-slate-700">
                      Upload item photo
                    </p>


                    <p className="mt-1 text-sm text-slate-500">
                      Click to browse from your device
                    </p>


                    <p className="mt-3 text-xs text-slate-400">
                      PNG, JPG or JPEG • Maximum 5MB
                    </p>


                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />

                  </button>

                ) : (

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                    <div className="relative aspect-video overflow-hidden bg-slate-100">

                      <img
                        src={photoPreview}
                        alt="Found item preview"
                        className="h-full w-full object-contain"
                      />


                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-lg transition hover:bg-red-50"
                        title="Remove photo"
                      >

                        <Trash2 size={17} />

                      </button>

                    </div>


                    <div className="flex items-center justify-between gap-3 p-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">

                          <ImageIcon size={18} />

                        </div>


                        <div className="min-w-0">

                          <p className="truncate text-sm font-bold text-slate-800">
                            {photo.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {(photo.size / 1024 / 1024).toFixed(2)} MB
                          </p>

                        </div>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                      >
                        Change
                      </button>


                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />

                    </div>

                  </div>

                )}

              </section>


              {/* =================================================
                  FINDER INFORMATION
              ================================================== */}

              <section className="border-b border-slate-100 py-8">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">

                    <User size={18} />

                  </div>


                  <div>

                    <h3 className="font-bold text-slate-900">
                      Finder Information
                    </h3>

                    <p className="text-xs text-slate-500">
                      Used for verification and recovery coordination.
                    </p>

                  </div>

                </div>


                <div className="grid gap-5 md:grid-cols-2">


                  {/* Finder Name */}

                  <div>

                    <label className="text-sm font-bold text-slate-700">
                      Your Name *
                    </label>

                    <input
                      type="text"
                      name="finderName"
                      value={formData.finderName}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className={getInputClass(
                        "finderName"
                      )}
                    />

                    {fieldErrors.finderName && (

                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {fieldErrors.finderName}
                      </p>

                    )}

                  </div>


                  {/* Contact */}

                  <div>

                    <label className="text-sm font-bold text-slate-700">
                      Contact Information *
                    </label>

                    <input
                      type="text"
                      name="finderContact"
                      value={formData.finderContact}
                      onChange={handleChange}
                      placeholder="University email or phone"
                      className={getInputClass(
                        "finderContact"
                      )}
                    />

                    {fieldErrors.finderContact && (

                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {fieldErrors.finderContact}
                      </p>

                    )}

                  </div>

                </div>


                <p className="mt-3 text-xs text-slate-400">
                  Your contact information is used only for
                  recovery coordination.
                </p>

              </section>


              {/* =================================================
                  REPORTER ACCOUNT
              ================================================== */}

              <section className="py-8">

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">

                    <User size={18} />

                  </div>


                  <div>

                    <h3 className="font-bold text-slate-900">
                      Reported By
                    </h3>

                    <p className="text-xs text-slate-500">
                      Your CampusFind account is linked to this report.
                    </p>

                  </div>

                </div>


                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Student
                    </p>

                    <p className="mt-1 truncate text-sm font-bold text-slate-800">
                      {userName}
                    </p>

                  </div>


                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 truncate text-sm font-bold text-slate-800">
                      {userEmail || "Account email"}
                    </p>

                  </div>

                </div>

              </section>


              {/* =================================================
                  SUBMIT AREA
              ================================================== */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={23}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>

                    <h3 className="font-bold text-blue-900">
                      Safe Recovery Process
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      Your report will be compared with lost-item
                      reports. The item should only be handed over
                      after the claimant's ownership is verified.
                    </p>

                  </div>

                </div>

              </div>


              <button
                type="submit"
                disabled={isSubmitting || success}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
              >

                {isSubmitting ? (

                  <>

                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                    Submitting Report...

                  </>

                ) : success ? (

                  <>

                    <CheckCircle2 size={19} />

                    Report Submitted

                  </>

                ) : (

                  <>

                    Submit Found Item Report

                    <ChevronRight size={18} />

                  </>

                )}

              </button>


              <p className="mt-3 text-center text-xs text-slate-400">
                By submitting, you confirm that the information
                provided is accurate to the best of your knowledge.
              </p>

            </div>

          </form>


          {/* =================================================
              SIDEBAR
          ================================================== */}

          <aside className="space-y-5">


            {/* Reporting Tips */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">

                  <AlertCircle size={19} />

                </div>


                <div>

                  <h3 className="font-bold text-slate-900">
                    Reporting Tips
                  </h3>

                  <p className="text-xs text-slate-500">
                    Help us find the owner
                  </p>

                </div>

              </div>


              <div className="space-y-3">

                {[
                  "Use a specific item name.",
                  "Mention the exact place where you found it.",
                  "Add brand and color when possible.",
                  "Mention unique marks or scratches.",
                  "Upload a clear photo if available.",
                  "Never share passwords or sensitive credentials.",
                ].map((tip) => (

                  <div
                    key={tip}
                    className="flex items-start gap-3"
                  >

                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

                      <Check
                        size={12}
                        strokeWidth={3}
                      />

                    </div>

                    <p className="text-xs leading-5 text-slate-600">
                      {tip}
                    </p>

                  </div>

                ))}

              </div>

            </div>


            {/* Smart Matching */}

            <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                  <Sparkles size={19} />

                </div>


                <div>

                  <h3 className="font-bold text-blue-900">
                    Smart Matching
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-blue-800">
                    CampusFind compares item name, category,
                    location, date and description with lost-item
                    reports.
                  </p>

                </div>

              </div>

            </div>


            {/* Similar Lost Reports */}

            {similarReports.length > 0 && (

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">

                <div className="flex items-start gap-3">

                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <div>

                    <h3 className="font-bold text-amber-900">
                      Possible Lost Matches
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-amber-800">
                      We found lost-item reports that may match
                      what you found.
                    </p>

                  </div>

                </div>


                <div className="mt-4 space-y-2">

                  {similarReports.map(
                    (report) => (

                      <button
                        key={report.id}
                        type="button"
                        onClick={() =>
                          navigate("/lost-items")
                        }
                        className="flex w-full items-center justify-between rounded-xl border border-amber-200 bg-white p-3 text-left transition hover:border-amber-300"
                      >

                        <div className="min-w-0">

                          <p className="truncate text-sm font-bold text-slate-800">
                            {report.itemName}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {report.location ||
                              "Campus location"}
                          </p>

                        </div>


                        <ChevronRight
                          size={16}
                          className="shrink-0 text-slate-400"
                        />

                      </button>

                    )
                  )}

                </div>

              </div>

            )}


            {/* What Happens Next */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

              <h3 className="font-bold text-slate-900">
                What happens next?
              </h3>


              <div className="mt-5 space-y-4">

                {[
                  {
                    number: "01",
                    title: "Report submitted",
                    text: "Your found item is added to CampusFind.",
                  },
                  {
                    number: "02",
                    title: "Smart matching",
                    text: "Potential lost-item matches are identified.",
                  },
                  {
                    number: "03",
                    title: "Ownership verification",
                    text: "The claimant's details are verified.",
                  },
                  {
                    number: "04",
                    title: "Safe recovery",
                    text: "The item is handed over securely.",
                  },
                ].map((step) => (

                  <div
                    key={step.number}
                    className="flex gap-3"
                  >

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-500">

                      {step.number}

                    </div>


                    <div>

                      <p className="text-sm font-bold text-slate-800">
                        {step.title}
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        {step.text}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>


            {/* Security */}

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">

              <div className="flex items-start gap-3">

                <ShieldCheck
                  size={21}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>

                  <h3 className="font-bold text-emerald-900">
                    Secure Recovery
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-emerald-800">
                    Never hand over a found item directly.
                    Ownership should be verified first.
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}

export default ReportFound;
