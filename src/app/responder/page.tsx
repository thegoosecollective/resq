import BuildingCodeForm from '@/app/components/BuildingCodeForm'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
       <h1 className="text-3xl font-bold mb-5">Res-Q</h1>
      <p className="text-lg mb-10">Emergency portal for first responders</p>
      <h2 className="text-lg font-medium mb-4">Enter access code:</h2>
    <BuildingCodeForm redirectTo="responder" />
    </div>
  );
}
