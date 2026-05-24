type Option = {
    value: string | number
    label: string
  }
  
  type SelectProps = {
    value: string | number
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    options: Option[]
    placeholder?: string
    disabled?: boolean
    prefixOptions?: Option[]  
  }
  
  export default function Select({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    disabled = false,
    prefixOptions
  }: SelectProps) {
    return (
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border border-gray-200 rounded-lg p-3 bg-white text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
       <option value="">{placeholder}</option>
{prefixOptions?.map(opt => (
  <option key={opt.value} value={opt.value}>{opt.label}</option>
))}
{options.map(opt => (
  <option key={opt.value} value={opt.value}>{opt.label}</option>
))}
      </select>
    )
  }