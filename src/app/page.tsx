import BuildingCodeForm from '@/app/components/BuildingCodeForm'

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 gap-8"
      aria-label="Res-Q homepage"
    >
      {/* Logo + tagline */}
      <div className="text-center space-y-3">
        <h1 aria-label="Res-Q emergency portal">Res-Q</h1>
        <p className="text-base font-medium text-slate-600 max-w-[550px] mx-auto">
          Emergency communication portal for residents and family members
        </p>
      </div>

      {/* Divider */}
      <div className="w-full max-w-[550px] border-t border-slate-200" aria-hidden="true" />

      {/* Form section */}
      <div className="w-full max-w-[550px] space-y-3">
        <label className="block text-sm font-bold text-slate-700 text-center">
          Enter your building access code
        </label>
        <BuildingCodeForm />
      </div>

      {/* Footer note */}
      <p className="text-xs font-medium text-slate-600 text-center ">
        First responder?{' '}
        <a
          href="/responder"
          className="text-blue-600 underline underline-offset-2 hover:text-blue-700 transition-colors"
        >
          Access the responder portal
        </a>
      </p>
    </main>
  )
}