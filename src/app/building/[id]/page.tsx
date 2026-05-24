import { getBuildingById } from '@/app/actions/buildings'
import Link from 'next/link'

export default async function BuildingPage({ params }: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const building = await getBuildingById(parseInt(id))
  
  const roleOptions = [
    {
      href: (id: string) => `/building/${id}/report`,
      label: 'I\'m a Resident',
      description: 'Submit your safety status',
      className: 'w-full text-center px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-transparent hover:text-blue-600 border-2 border-blue-600 transition-colors'
    },
    {
      href: (id: string) => `/building/${id}/dashboard`,
      label: 'Family Member',
      description: 'Check on your loved ones',
      className: 'w-full text-center px-8 py-4 bg-slate-700 text-white rounded-lg font-bold hover:bg-transparent hover:text-slate-700 border-2 border-slate-700 transition-colors'
    }
  ]

  if (!building) {
    return (
      <p>Building not found. Please re-enter your access code <a href="/" className="underline text-blue-600">here</a></p>
    )
  } 

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      
      <div className="text-center">
        <h1>{building.name}</h1>
        <h3 className="text-slate-500">{building.address}</h3>
      </div>
     
      <div className="flex flex-col gap-6 w-full max-w-sm">
  {roleOptions.map(option => (
    <div key={option.label} className="flex flex-col items-center gap-2">
      <p className="text-sm font-bold text-slate-500">{option.description}</p>
      <Link href={option.href(id)} className={option.className}>
        {option.label}
      </Link>
    </div>
  ))}
</div>
    </div>
  )
}