export function Button({ 
  children, 
  onClick, 
  type = "button", 
  disabled = false, 
  variant = "primary", 
  ariaDescribedBy,
  ...props 
}) {
  const baseClasses = "btn"
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary", 
    danger: "btn-danger"
  }

  const className = `${baseClasses} ${variantClasses[variant]}`

  return (
    <>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
        aria-describedby={ariaDescribedBy}
        {...props}
      >
        {children}
      </button>
      {ariaDescribedBy && (
        <div id={ariaDescribedBy} className="sr-only" aria-live="polite">
          {disabled ? 'Processing your request' : ''}
        </div>
      )}
    </>
  )
}