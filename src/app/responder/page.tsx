/**
 * responder/page.tsx — First Responder Entry Page
 *
 * Separate access portal for first responders.
 *
 * Uses the same BuildingCodeForm component as the homepage but
 * redirects to the full responder dashboard
 * with ?responder=true after successful code entry.
 */

import BuildingCodeForm from "@/app/components/BuildingCodeForm";

export default function Responder() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 gap-8"
      aria-label="Res-Q responder portal"
    >
      {/* Logo + tagline */}
      <div className="text-center space-y-3">
        <h1 aria-label="Res-Q emergency portal">Res-Q</h1>
        <p className="text-base font-medium text-slate-600 max-w-[550px] mx-auto">
          First responder access portal
        </p>
      </div>

      {/* Divider */}
      <div
        className="w-full max-w-[550px] border-t border-slate-200"
        aria-hidden="true"
      />

      {/* Form section */}
      <div className="w-full max-w-[550px] space-y-3">
        <label className="block text-sm font-bold text-slate-700 text-center">
          Enter your building access code to access the responder dashboard
        </label>
        <BuildingCodeForm redirectTo="responder" />
      </div>
    </main>
  );
}
