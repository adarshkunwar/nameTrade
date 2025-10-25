import Button, { type ButtonSize } from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import TextField from '@/components/ui/Text'
import Heading from '@/components/ui/Typography'
import { FormProvider, useForm } from 'react-hook-form'
import { MODAL_CONSTANTS } from '../constant/modal.const'
type Props = {
  onSubmit: (data: { reservePrice: number; duration: number }) => void
  loading?: boolean
  disabled?: boolean
  error?: string | null
  triggerSize?: ButtonSize
}

const AuctionModal = ({
  onSubmit: onSubmitProps,
  loading = false,
  disabled = false,
  error = null,
  triggerSize = 'sm',
}: Props) => {
  const methods = useForm<{ reservePrice: number; duration: number }>({
    defaultValues: {
      reservePrice: 0,
      duration: 0,
    },
  })

  const onSubmit = (data: { reservePrice: number; duration: number }) => {
    onSubmitProps(data)
  }

  return (
    <Modal
      trigger={
        <Button variant="secondary" size={triggerSize} fullWidth disabled={disabled} loading={loading}>
          {MODAL_CONSTANTS.AUCTION.TITLE}
        </Button>
      }
    >
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-1 items-center justify-center">
          <Heading variant="h2" title={MODAL_CONSTANTS.AUCTION.TITLE} fontWeight={700} color="white" />
          <Heading variant="body-xs" title={MODAL_CONSTANTS.AUCTION.SUBTITLE} color="white" />
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-2">
            <TextField
              name="reservePrice"
              type="number"
              step="any"
              min={0}
              placeholder={MODAL_CONSTANTS.AUCTION.PLACEHOLDER}
              customLabel={MODAL_CONSTANTS.AUCTION.LABEL}
            />
            <TextField
              name="duration"
              type="number"
              min={0}
              placeholder={MODAL_CONSTANTS.AUCTION.DURATION_PLACEHOLDER}
              customLabel={MODAL_CONSTANTS.AUCTION.DURATION_LABEL}
            />
            {error && <span className="text-sm text-red-400">{error}</span>}
            <Button variant="secondary" type="submit" fullWidth disabled={loading} loading={loading}>
              {MODAL_CONSTANTS.AUCTION.CONFIRM_BUTTON_TEXT}
            </Button>
          </form>
        </FormProvider>
      </div>
    </Modal>
  )
}

export default AuctionModal
