type ErrorMessageProps = {
    message: string | null
  }
  
  export default function ErrorMessage({ message }: ErrorMessageProps) {
    if (!message) return null
  
    return (
      <p className="text-lg font-bold text-red-500 mt-2.5">
        {message}
      </p>
    )
  }