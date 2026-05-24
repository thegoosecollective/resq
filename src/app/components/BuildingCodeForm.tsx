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
  const [error, setError] = useState<string | null>(null)         
  const [isSubmitting, setIsLoading] = useState(false)  

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()  
    setIsLoading(true)
    setError(null)
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
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Building access code form"
      className="w-full space-y-3"
    >
      {/* Error — announced to screen readers */}
      <div aria-live="polite" aria-atomic="true">
        <ErrorMessage message={error} />
      </div>

      {/* Input + Button row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="building-code" className="sr-only">
          Building access code
        </label>
        <input
          id="building-code"
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Enter building code"
          autoComplete="off"
          autoCapitalize="characters"
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? 'code-error' : undefined}
          className="flex-1 border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          aria-label={isSubmitting ? 'Searching for building...' : 'Find building'}
        >
          {isSubmitting ? 'Finding...' : 'Find Building'}
        </Button>
      </div>
    </form>
  )
}