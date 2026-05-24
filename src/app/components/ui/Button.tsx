type ButtonProps = {
    children: React.ReactNode
    onClick?: () => void
    type?: 'button' | 'submit'
    disabled?: boolean
    variant?: 'primary' | 'danger' | 'outline'
  }
  
  export default function Button({ 
    children, 
    onClick, 
    type = 'button',
    disabled,
    variant = 'primary'
  }: ButtonProps) {
  
    const variants = {
      primary: 'bg-blue-600 text-white border-2 border-blue-600 hover:bg-transparent hover:text-blue-600',
      danger: 'bg-red-600 text-white border-2 border-red-600 hover:bg-transparent hover:text-red-600',
      outline: 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white',
    }
  
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`cursor-pointer px-6 py-3 rounded-lg font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`}
      >
        {children}
      </button>
    )
  }