'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { lookupBuilding } from '@/app/actions/buildings'

export default function BuildingCodeForm() {
  const router = useRouter()
  const [code, setCode] = useState('')           
  const [error, setError] = useState('')         
  const [isLoading, setIsLoading] = useState(false)  

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()  
    
    setIsLoading(true)
    const result = await lookupBuilding(code)
    
    if (result.success) {
      router.push(`/building/${result.building.id}`)
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
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Finding building...' : 'Find Building'}
      </button>
    </form>
  )
}