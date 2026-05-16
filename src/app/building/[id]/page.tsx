import { getBuildingById } from '@/app/actions/buildings'
import Link from 'next/link'

export default async function BuildingPage({ params }: {
    params: Promise<{ id: string }> }) {
    const { id } = await params
    const buildingId = id

    if (!buildingId) {
        return <p>Invalid building</p>
    }

      
    const building = await getBuildingById(parseInt(buildingId))
    
    if (!building) {
        return <p>Building not found. Please reenter your access code <a href="/">here</a></p>
      } 
    return(
        <div className="buildingPage">
            <div className="buildingDetails">
                <h1>{building.name}</h1>
                <h3>{building.address}</h3>
            </div>
           
            <div className="buildingButtons">
                <div className="residentButton">
                <Link href={`/building/${buildingId}/report`}>Resident</Link>
                <p>Use this if you need assistance</p>
                </div>
                <div className="familyButton">
                <Link href={`/building/${buildingId}/dashboard`}>Family members</Link>
                <p>Use this to check your loved ones are safe.</p>
                </div>
            </div>
        </div>
        
    )
}


  