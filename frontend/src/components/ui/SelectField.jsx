function SelectField({
  id,
  label,
  value,
  onChange,
  loading = false,
  loadingMessage = 'Loading options…',
  placeholder = 'Select an option',
  disabled = false,
  required,
  title,
  hint,
  className = '',
  children,
  ...selectProps
}) {
  const isDisabled = disabled || loading

  return (
    <div className={`form-field ${className}`.trim()}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className={`select-field${loading ? ' select-field--loading' : ''}`}>
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          required={required}
          title={title}
          aria-busy={loading}
          {...selectProps}
        >
          <option value="">{loading ? loadingMessage : placeholder}</option>
          {!loading && children}
        </select>
        {loading && (
          <>
            <span className="select-field__shimmer" aria-hidden="true" />
            <span className="select-field__spinner" aria-hidden="true" />
          </>
        )}
      </div>
      {hint && <p className="form-field__hint">{hint}</p>}
    </div>
  )
}

export default SelectField
