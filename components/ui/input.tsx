import { useId, type InputHTMLAttributes } from "react"

// A labeled text field: the label (with a red asterisk when the field is
// required), the input itself, and an optional helper or error line beneath it.
// The input is styled globally (see globals.css) so a bare <input> elsewhere
// still matches; this component just adds the label/hint scaffolding and wires
// up the htmlFor / aria-describedby links that keep it accessible.
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
}

export function Input({
  label,
  hint,
  error,
  id,
  required,
  className = "",
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined

  return (
    <div className="field">
      {label && (
        <label htmlFor={inputId}>
          {label}
          {required && (
            <span className="req" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
      )}
      <input
        id={inputId}
        required={required}
        aria-describedby={messageId}
        aria-invalid={error ? true : undefined}
        className={className || undefined}
        {...props}
      />
      {error ? (
        <p id={messageId} className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
