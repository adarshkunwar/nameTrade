import type { InputHTMLAttributes } from 'react'
import type { FC } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { CiAt, CiSearch } from 'react-icons/ci'
import { GoBriefcase } from 'react-icons/go'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  name: string
  required?: boolean
  customLabel?: string
  placeholder?: string
  size?: 'small' | 'medium'
  type?: 'text' | 'email' | 'password' | 'search'
}

export const TextField: FC<TextFieldProps> = ({
  name,
  customLabel,
  required = false,
  size = 'small',
  placeholder = '',
  type = 'text',
  ...rest
}) => {
  const { control } = useFormContext()

  const Icon = () => {
    switch (type) {
      case 'search':
        return <CiSearch className="text-white" />
      case 'email':
        return <CiAt className="text-white" />
      case 'password':
        return <GoBriefcase className="text-white" />
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
            <label className="mb-6 block font-bold text-white">
              {customLabel} {required ? <span style={{ color: '#FF1943' }}>*</span> : ''}
            </label>
          ) : null}
          <div className="flex items-center w-full bg-primary p-4 rounded-md gap-8">
            <Icon />
            <input
              {...field}
              className={`${size === 'small' ? 'text-sm' : 'text-base'}  text-white w-full outline-none `}
              title={field?.value}
              {...rest}
              placeholder={placeholder}
            />
          </div>
          {error?.message && <p className="text-red-500 text-sm">{error?.message}</p>}
        </>
      )}
    />
  )
}

export default TextField
