export function getStatusDisplay(
  residentStatus: string | null,
  resourceRequests: string[],
  responderStatus?: string | null,
  isResponder?: boolean
): { colour: string; label: string } {

  // responder overrides first
  if (isResponder && responderStatus) {
    if (responderStatus === 'in_progress') return { colour: '#F97316', label: '🚒 In progress' }
    if (responderStatus === 'evacuated') return { colour: '#008000', label: '✅ Resolved' }
    if (responderStatus === 'deceased') return { colour: '#374151', label: 'Deceased' }
  }

  // no report yet — check before anything else
  if (!residentStatus) {
    return { colour: '#D1D5DB', label: 'No report yet' }
  }

  // resident status colours
  let colour = ''
  let label = ''

  if (residentStatus === 'evacuated' && resourceRequests.includes('pet')) {
    colour = '#0000FF'
    label = 'Evacuated — Pet rescue required'
  } else if (residentStatus === 'evacuated') {
    colour = '#008000'
    label = 'Evacuated'
  } else if (residentStatus === 'assistance') {
    colour = '#FFCE18'
    label = 'Needs assistance'
  } else {
    colour = '#780606'
    label = 'Critical'
  }

  return { colour, label }
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