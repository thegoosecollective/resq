export function getStatusDisplay(
  residentStatus: string | null,
  resourceRequests: string[],
  responderStatus?: string | null,
  isResponder?: boolean
): { colour: string; label: string; textColour: string } {

   // no report yet — check before anything else
   if (!residentStatus) {
    return { colour: '#CBD5E1', label: 'No report yet', textColour: '#1E293B' }
  }

   // responder overrides
   if (isResponder && responderStatus) {
    if (responderStatus === 'in_progress') return { colour: '#F97316', label: '🚒 In progress', textColour: '#ffffff' }
    if (responderStatus === 'evacuated') return { colour: '#16A34A', label: '✅ Resolved', textColour: '#ffffff' }
    if (responderStatus === 'deceased') return { colour: '#374151', label: 'Deceased', textColour: '#ffffff' }
  }

  if (residentStatus === 'evacuated' && resourceRequests.includes('pet')) {
    return { colour: '#2563EB', label: 'Evacuated — Pet rescue required', textColour: '#ffffff' }
  }
  if (residentStatus === 'evacuated') return { colour: '#16A34A', label: 'Evacuated', textColour: '#ffffff' }
  if (residentStatus === 'assistance') return { colour: '#F59E0B', label: 'Needs assistance', textColour: '#1C1917' }  // amber stays, dark text
  return { colour: '#DC2626', label: 'Critical', textColour: '#ffffff' }
}

  const resourceLabels: Record<string, string> = {
    mobility: 'Mobility assistance',
    pet: 'Pet evacuation',
    medical: 'Medical assistance',
  }
  
  export function getResourceLabel(value: string): string {
    return resourceLabels[value] ?? value
  }

  export function getResponderStatusDisplay(
    status: string | null,
    isResponder: boolean
  ): string {
    if (!status) return 'Not yet attended'
    if (status === 'deceased' && !isResponder) return 'In progress'
    if (status === 'in_progress') return 'In progress'
    if (status === 'evacuated') return 'Evacuated'
    if (status === 'deceased') return 'Deceased'
    return status
  }