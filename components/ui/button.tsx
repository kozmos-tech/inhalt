import type { ButtonHTMLAttributes } from "react"

// The app's buttons are styled globally (see globals.css): the bare element is
// the secondary look, `.primary` is the filled accent button, and `.linklike`
// reads as an inline link. This component maps those to a `variant` prop so call
// sites express intent instead of repeating class names, while still rendering a
// plain <button> so every native prop (type, disabled, onClick, role…) passes
// straight through.
type ButtonVariant = "default" | "primary" | "link"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: "",
  primary: "primary",
  link: "linklike",
}

export function Button({
  variant = "default",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  const classes = [VARIANT_CLASS[variant], className].filter(Boolean).join(" ")
  return <button type={type} className={classes || undefined} {...props} />
}
