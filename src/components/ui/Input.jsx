export function Input({ 
  id,
  label,
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  required = false,
  minLength,
  className = "",
  ...props 
}) {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className={`input-field ${className}`}
        {...props}
      />
    </div>
  )
}