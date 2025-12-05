export function Button({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  size = "default",
  disabled = false, 
  className = "",
  ...props 
}) {
  const baseClasses = "btn"
  const variantClasses = {
    primary: "btn-primary",
    danger: "btn-danger"
  }
  const sizeClasses = {
    default: "",
    large: "btn-large"
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  )
}