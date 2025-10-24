import { type ReactNode, type ButtonHTMLAttributes, type JSX } from 'react'

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonType extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  children: ReactNode
  disabled?: boolean
  fullWidth?: boolean
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-primary text-white hover:bg-primary/80 active:bg-primary/90',
  secondary: 'bg-secondary text-white hover:bg-secondary/80 active:bg-secondary/90',
  outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  danger: 'bg-red text-white hover:bg-red/80 active:bg-red/90',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm leading-4 px-3 py-1.5 gap-1.5',
  md: 'text-base leading-[22px] px-4 py-2 gap-2',
  lg: 'text-lg leading-6 px-6 py-3 gap-2.5',
}

const Button = ({
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  disabled = false,
  fullWidth = false,
  loading = false,
  className = '',
  ...rest
}: ButtonType): JSX.Element => {
  const baseStyles = 'inline-flex justify-center items-center font-medium rounded-md transition-colors duration-200'
  const variantStyle = variantStyles[variant]
  const sizeStyle = sizeStyles[size]
  const widthStyle = fullWidth ? 'w-full' : ''
  const disabledStyle = disabled || loading ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer'

  const combinedClassName =
    `${baseStyles} ${variantStyle} ${sizeStyle} ${widthStyle} ${disabledStyle} ${className}`.trim()

  const renderIcon = () => {
    if (loading) {
      return (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )
    }
    return icon
  }

  return (
    <button className={combinedClassName} disabled={disabled || loading} {...rest}>
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && !loading && icon}
    </button>
  )
}

export default Button
