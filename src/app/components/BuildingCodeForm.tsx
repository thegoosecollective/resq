'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { lookupBuilding } from '@/app/actions/buildings'

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
      <input 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter building code"
      />
      {error && <p>{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Finding building...' : 'Find Building'}
      </button>
    </form>
  )
}