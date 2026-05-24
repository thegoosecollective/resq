import { getBuildingById } from '@/app/actions/buildings'
import Link from 'next/link'

const roleOptions = [
  {
    href: (id: string) => `/building/${id}/report`,
    label: "I'm a Resident",
    description: 'Submit your safety status',
    icon: '🏠',
    className: 'block w-full text-center px-8 py-4 bg-blue-600 text-white rounded-lg font-bold border-2 border-blue-600 hover:bg-transparent hover:text-blue-600 transition-colors cursor-pointer'
  },
  {
    href: (id: string) => `/building/${id}/dashboard`,
    label: 'Family Member',
    description: 'Check on your loved ones',
    icon: '👨‍👩‍👧',
    className: 'block w-full text-center px-8 py-4 bg-slate-700 text-white rounded-lg font-bold border-2 border-slate-700 hover:bg-transparent hover:text-slate-700 transition-colors cursor-pointer'
  }
]

export default async function BuildingPage({ params }: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const building = await getBuildingById(parseInt(id))

  if (!building) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-600">
          Building not found. Please re-enter your access code{' '}
          <a href="/" className="underline text-blue-600 font-medium">here</a>.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Link href="/" className="underline font-bold text-lg">← Back</Link>
      
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-10">
        
        <div className="text-center space-y-1">
          <h1>Res-Q</h1>
          <p className="font-bold text-slate-800 text-lg">{building.name}</p>
          <p className="text-sm font-medium text-slate-500">{building.address}</p>
        </div>
  
        <div className="w-full max-w-sm border-t border-slate-200" />
  
        <div className="w-full max-w-sm space-y-4">
          <p className="text-sm font-bold text-slate-600 text-center uppercase tracking-widest">
            Who are you?
          </p>
          {roleOptions.map(option => (
            <div key={option.label} className="space-y-2">
              <Link href={option.href(id)} className={option.className}>
                {option.icon} {option.label}
              </Link>
              <p className="text-xs font-medium text-slate-500 text-center">
                {option.description}
              </p>
            </div>
          ))}
        </div>
  
      </div>
    </div>
  )
}
