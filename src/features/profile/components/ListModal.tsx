import Button, { type ButtonSize } from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import TextField from '@/components/ui/Text'
import Heading from '@/components/ui/Typography'
import { FormProvider, useForm } from 'react-hook-form'
import { MODAL_CONSTANTS } from '../constant/modal.const'
type Props = {
  onSubmit: (data: { price: number }) => void
  loading?: boolean
  disabled?: boolean
  error?: string | null
  triggerSize?: ButtonSize
}

const ListModal = ({
  onSubmit: onSubmitProps,
  loading = false,
  disabled = false,
  error = null,
  triggerSize = 'sm',
}: Props) => {
  const methods = useForm<{ price: number }>({
    defaultValues: {
      price: 0,
    },
  })

  const onSubmit = (data: { price: number }) => {
    onSubmitProps(data)
  }

  return (
    <Modal
      trigger={
        <Button variant="secondary" size={triggerSize} fullWidth disabled={disabled} loading={loading}>
          {MODAL_CONSTANTS.LIST.TRIGGER_TITLE}
        </Button>
      }
    >
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-1 items-center justify-center">
          <Heading variant="h2" title={MODAL_CONSTANTS.LIST.TITLE} fontWeight={700} color="white" />
          <Heading variant="body-xs" title={MODAL_CONSTANTS.LIST.SUBTITLE} color="white" />
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-2">
            <TextField
              name="price"
              type="number"
              step="any"
              min={0}
              placeholder={MODAL_CONSTANTS.LIST.PLACEHOLDER}
              customLabel={MODAL_CONSTANTS.LIST.LABEL}
            />
            {error && <span className="text-sm text-red-400">{error}</span>}
            <Button variant="secondary" type="submit" fullWidth disabled={loading} loading={loading}>
              {MODAL_CONSTANTS.LIST.CONFIRM_BUTTON_TEXT}
            </Button>
          </form>
        </FormProvider>
      </div>
    </Modal>
  )
}

export default ListModal
