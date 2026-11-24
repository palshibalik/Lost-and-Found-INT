import { Link } from "react-router-dom";
import {
  Search,
  PackagePlus,
  ShieldCheck,
  BrainCircuit,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Users,
  RotateCcw,
  LockKeyhole,
} from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">

          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
              🔎
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                CampusFind
              </h1>

              <p className="hidden text-[10px] font-medium uppercase tracking-widest text-slate-500 sm:block">
                Lost & Found
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              How It Works
            </a>

            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#security"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Security
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>

        </div>
      </nav>


      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-white">

        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-blue-100 opacity-50 blur-3xl" />

        <div className="absolute -right-32 top-32 h-80 w-80 rounded-full bg-indigo-100 opacity-50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">

          <div className="mx-auto max-w-4xl text-center">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              <ShieldCheck size={17} />
              Trusted Campus Lost & Found Platform
            </div>

            <h2 className="text-5xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Lost Something?
              <span className="block text-blue-600">
                Let's Bring It Back.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Report lost belongings, register found items, discover
              possible matches and securely return items to their
              rightful owners.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Report an Item
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Sign In
              </Link>

            </div>

          </div>


          {/* Hero preview card */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-2 shadow-2xl">

              <div className="rounded-2xl bg-white p-5 sm:p-8">

                <div className="flex items-center justify-between border-b border-slate-100 pb-5">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Recovery Overview
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                      Campus Recovery Center
                    </h3>
                  </div>

                  <div className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:block">
                    ● System Active
                  </div>

                </div>


                <div className="grid gap-4 pt-6 sm:grid-cols-3">

                  <StatCard
                    icon={<Search size={20} />}
                    label="Lost Reports"
                    value="124"
                  />

                  <StatCard
                    icon={<PackagePlus size={20} />}
                    label="Found Items"
                    value="87"
                  />

                  <StatCard
                    icon={<RotateCcw size={20} />}
                    label="Items Recovered"
                    value="65"
                  />

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>


      {/* ================= QUICK ACTIONS ================= */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Get Started
            </p>

            <h3 className="mt-2 text-3xl font-bold tracking-tight">
              What happened to your item?
            </h3>

            <p className="mt-3 text-slate-600">
              Choose the option that best describes your situation.
            </p>

          </div>


          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">

            <ActionCard
              icon={<Search size={28} />}
              title="I Lost Something"
              description="Report your missing item and help others identify and return it."
              button="Report Lost Item"
              link="/register"
            />

            <ActionCard
              icon={<PackagePlus size={28} />}
              title="I Found Something"
              description="Register an item you found and help its owner get it back."
              button="Register Found Item"
              link="/register"
            />

          </div>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="bg-white py-20">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Simple Process
            </p>

            <h3 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              How CampusFind Works
            </h3>

            <p className="mt-4 text-slate-600">
              From reporting a missing item to a verified handover,
              everything happens in one trusted platform.
            </p>

          </div>


          <div className="mt-14 grid gap-8 md:grid-cols-4">

            <ProcessCard
              number="01"
              icon={<Search size={25} />}
              title="Report Lost"
              text="Tell us what you lost, where you last saw it and provide useful identifying details."
            />

            <ProcessCard
              number="02"
              icon={<PackagePlus size={25} />}
              title="Register Found"
              text="Found something? Register it with its location, description and photo."
            />

            <ProcessCard
              number="03"
              icon={<BrainCircuit size={25} />}
              title="Smart Matching"
              text="Our matching engine compares category, location, time and descriptions."
            />

            <ProcessCard
              number="04"
              icon={<ShieldCheck size={25} />}
              title="Verified Return"
              text="Ownership is verified before a secure OTP or QR-based handover."
            />

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section id="features" className="bg-slate-50 py-20">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="max-w-2xl">

            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Built For Trust
            </p>

            <h3 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              More than just a lost-and-found database.
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              CampusFind focuses on the complete recovery journey,
              making the process convenient, secure and trustworthy.
            </p>

          </div>


          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <FeatureCard
              icon={<BrainCircuit />}
              title="Smart Matching"
              text="Find possible matches using item category, location, time and description."
            />

            <FeatureCard
              icon={<ShieldCheck />}
              title="Ownership Verification"
              text="Claimants answer private verification questions before an item can be returned."
            />

            <FeatureCard
              icon={<LockKeyhole />}
              title="Secure Authentication"
              text="Campus accounts and verified users reduce fake reports and fraudulent claims."
            />

            <FeatureCard
              icon={<MapPin />}
              title="Location Tracking"
              text="Know where an item was lost, found and where it is currently being held."
            />

            <FeatureCard
              icon={<Users />}
              title="Campus Community"
              text="Students, staff and security teams can work together to recover belongings."
            />

            <FeatureCard
              icon={<RotateCcw />}
              title="Recovery Tracking"
              text="Track every step from possible match to verified handover and return."
            />

          </div>

        </div>

      </section>


      {/* ================= SECURITY ================= */}
      <section id="security" className="bg-slate-950 py-20 text-white">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-blue-300">
                <LockKeyhole size={17} />
                Built Around Trust
              </div>

              <h3 className="text-3xl font-bold sm:text-4xl">
                Your belongings deserve more than a public post.
              </h3>

              <p className="mt-5 leading-7 text-slate-300">
                CampusFind keeps the recovery process structured and
                secure. A possible match does not automatically mean
                someone gets the item. Ownership must be verified before
                the final handover.
              </p>

              <div className="mt-8 space-y-4">

                <SecurityPoint text="Verified campus accounts" />
                <SecurityPoint text="Private ownership verification" />
                <SecurityPoint text="Admin and security approval" />
                <SecurityPoint text="OTP / QR based handover" />

              </div>

            </div>


            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">

              <p className="text-sm text-slate-400">
                Recovery Journey
              </p>

              <div className="mt-6 space-y-5">

                {[
                  "Lost / Found Report",
                  "Smart Match Detected",
                  "Owner Claim Submitted",
                  "Ownership Verified",
                  "Admin Approval",
                  "Item Returned",
                ].map((item, index) => (

                  <div
                    key={item}
                    className="flex items-center gap-4"
                  >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
                      {index + 1}
                    </div>

                    <p className="font-medium text-slate-200">
                      {item}
                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="bg-blue-600 py-16">

        <div className="mx-auto max-w-4xl px-6 text-center">

          <h3 className="text-3xl font-bold text-white sm:text-4xl">
            Lost something on campus?
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            Don't rely on scattered WhatsApp groups. Report it,
            find possible matches and recover it securely.
          </p>

          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-blue-600 shadow-lg transition hover:bg-blue-50"
          >
            Join CampusFind
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-950 py-10 text-slate-400">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>

              <div className="flex items-center gap-2 text-white">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                  🔎
                </div>

                <span className="text-lg font-bold">
                  CampusFind
                </span>

              </div>

              <p className="mt-2 text-sm">
                Trusted campus lost & found recovery.
              </p>

            </div>


            <p className="text-sm">
              © 2026 CampusFind. Built for safer campus recovery.
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}


/* ================= COMPONENTS ================= */

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}


function ActionCard({ icon, title, description, button, link }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        {icon}
      </div>

      <h4 className="mt-6 text-xl font-bold">
        {title}
      </h4>

      <p className="mt-2 leading-6 text-slate-600">
        {description}
      </p>

      <Link
        to={link}
        className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-600"
      >
        {button}
        <ArrowRight size={17} />
      </Link>

    </div>
  );
}


function ProcessCard({ number, icon, title, text }) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          {icon}
        </div>

        <span className="text-sm font-bold text-slate-300">
          {number}
        </span>

      </div>

      <h4 className="mt-6 text-lg font-bold">
        {title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>

    </div>
  );
}


function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        {icon}
      </div>

      <h4 className="mt-5 font-bold">
        {title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>

    </div>
  );
}


function SecurityPoint({ text }) {
  return (
    <div className="flex items-center gap-3">

      <CheckCircle2
        size={20}
        className="shrink-0 text-emerald-400"
      />

      <span className="text-slate-200">
        {text}
      </span>

    </div>
  );
}


export default Home;