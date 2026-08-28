export function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
  ...props
}) {
  return (
    <label className={className}>
      {label && <span>{label}</span>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error && <span id={`${name}-error`} className="error-message">{error}</span>}
    </label>
  );
}

export function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  rows = 4,
  ...props
}) {
  return (
    <label className={className}>
      {label && <span>{label}</span>}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        {...props}
      />
    </label>
  );
}

export function Select({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  placeholder,
  className = '',
  ...props
}) {
  return (
    <label className={className}>
      {label && <span>{label}</span>}
      <select name={name} value={value} onChange={onChange} required={required} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}