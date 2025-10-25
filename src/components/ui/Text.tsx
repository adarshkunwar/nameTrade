import type { InputHTMLAttributes } from 'react'
import type { FC } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { ICONS } from '@/assets/icons/icon'
import { Spinner } from './Spinner'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  name: string
  required?: boolean
  customLabel?: string
  placeholder?: string
  size?: 'small' | 'medium'
  type?: 'text' | 'email' | 'password' | 'search' | 'number'
  isLoading?: boolean
}

export const TextField: FC<TextFieldProps> = ({
  name,
  customLabel,
  required = false,
  size = 'small',
  placeholder = '',
  type = 'text',
  isLoading = false,
  ...rest
}) => {
  const { control } = useFormContext()

  const Icon = () => {
    switch (type) {
      case 'search':
        return ICONS.search
      case 'email':
        return ICONS.email
      case 'password':
        return ICONS.password
      default:
        return null
    }
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          {customLabel ? (
            <label className="mb-1 block font-bold text-white">
              {customLabel} {required ? <span style={{ color: '#FF1943' }}>*</span> : ''}
            </label>
          ) : null}
          <div className="flex items-center w-full bg-primary p-4 rounded-md gap-8">
            <Icon />
            <input
              {...field}
              type={type}
              className={`${size === 'small' ? 'text-sm' : 'text-base'}  text-white w-full outline-none `}
              title={field?.value}
              value={field?.value ?? ''}
              onChange={(e) =>
                field.onChange(
                  type === 'number'
                    ? (e.target as HTMLInputElement).value === ''
                      ? ''
                      : Number((e.target as HTMLInputElement).value)
                    : (e.target as HTMLInputElement).value
                )
              }
              {...rest}
              placeholder={placeholder}
            />

            {isLoading && (
              <div className="text-secondary">
                <Spinner size="sm" />
              </div>
            )}
          </div>
          {error?.message && <p className="text-red-500 text-sm">{error?.message}</p>}
        </>
      )}
    />
  )
}

export default TextField
