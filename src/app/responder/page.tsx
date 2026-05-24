import BuildingCodeForm from '@/app/components/BuildingCodeForm'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <h1 className="mb-5">Res-Q</h1>
      <h3 className="mb-[30px] text-center">Emergency portal for first responders</h3>
      <p className="font-bold mb-2">Enter access code:</p>
    <BuildingCodeForm redirectTo="responder" />
    </div>
  );
}
