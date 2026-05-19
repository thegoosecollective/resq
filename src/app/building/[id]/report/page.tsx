import { getBuildingWithUnits } from '@/app/actions/buildings'
import { BuildingReportForm } from '@/app/components/'

export default async function ReportPage({ params }: {

    return(
        <div>
        <h1 className="text-2xl font-bold text-gray-900">{building.name}</h1>
        <p className="text-sm text-gray-500">{building.address}</p>
      </div>
        <BuildingReportForm building={building} units={units} /> 
        
    )
}
