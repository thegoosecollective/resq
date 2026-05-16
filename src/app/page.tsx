import BuildingCodeForm from '@/components/BuildingCodeForm'


export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <h2>Enter access code:</h2>
<BuildingCodeForm></BuildingCodeForm>
    </div>
  );
}
