export function Input({ 
  id, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  required = false,
  minLength,
  ariaDescribedBy,
  label
}) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className="form-input"
        aria-describedby={ariaDescribedBy}
      />
      {ariaDescribedBy && (
        <div id={ariaDescribedBy} className="sr-only">
          {type === 'email' 
            ? 'Enter your email address to sign in or create an account'
            : required && minLength 
            ? `Create a secure password with at least ${minLength} characters`
            : 'Enter your password'
          }
        </div>
      )}
    </div>
  )
}