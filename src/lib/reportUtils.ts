export function getStatusDisplay(
    residentStatus: string,
    resourceRequests: string[]
  ): { colour: string; label: string } {
  
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