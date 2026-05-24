'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { lookupBuilding } from '@/app/actions/buildings'
import Button from '@/app/components/ui/Button'
import ErrorMessage from '@/app/components/ui/ErrorMessage'

export default function BuildingCodeForm({ 
  redirectTo = 'public' 
}: { 
  redirectTo?: 'public' | 'responder' 
}) {
  const router = useRouter()
  const [code, setCode] = useState('')           
  const [error, setError] = useState('')         
  const [isSubmitting, setIsLoading] = useState(false)  

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()  
    
    setIsLoading(true)
    const result = await lookupBuilding(code)

    if (result.success) {
      if (redirectTo === 'responder') {
        router.push(`/building/${result.building.id}/dashboard?responder=true`)
      } else {
        router.push(`/building/${result.building.id}`)
      }
    } else {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      
  
      {/* input and button always together */}
      <div className="flex gap-2">
        <input 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter building code"
          className="border border-gray-500 rounded-lg p-3 flex-1"
        />
<Button type="submit" disabled={isSubmitting} variant="primary">
{isSubmitting ? 'Finding...' : 'Find Building'}
</Button>
      </div>
        {/* error below the input+button row */}
        <div className="h-6 text-lg mt-2 mb-2">
        {error && <ErrorMessage message={error} />}
      </div>
    </form>
  )
}