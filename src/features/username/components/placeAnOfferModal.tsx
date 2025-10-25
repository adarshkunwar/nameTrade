import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import TextField from '@/components/ui/Text'
import Heading from '@/components/ui/Typography'
import { FormProvider, useForm } from 'react-hook-form'
import DATA from '../constant/field.const'
// Presentational only: logic handled by parent

type Props = {
  username: string
  onSubmit: (data: { offer: number }) => Promise<void> | void
  loading?: boolean
  disabled?: boolean
  triggerLabel?: string
}

const PlaceAnOfferModal = ({ username, onSubmit, loading, disabled, triggerLabel }: Props) => {
  const methods = useForm<{ offer: number }>({
    defaultValues: {
      offer: 0,
    },
  })
  const submitHandler = (data: { offer: number }) => {
    if (typeof onSubmit === 'function') {
      return onSubmit(data)
    }
  }

  return (
    <Modal
      trigger={
        <Button variant="secondary" fullWidth>
          {triggerLabel ?? DATA.OFFER.TRIGGER_BUTTON_TEXT}
        </Button>
      }
    >
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-1 items-center justify-center">
          <Heading variant="h2" title={username} fontWeight={700} color="white" />
          <Heading variant="body-xs" title={DATA.OFFER.SUBHEADING} color="white" />
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(submitHandler)} className="flex flex-col gap-2">
            <TextField name="offer" placeholder={DATA.OFFER.PLACEHOLDER} customLabel={DATA.OFFER.CUSTOM_LABEL} />
            <Button
              variant="secondary"
              type="submit"
              fullWidth
              loading={Boolean(loading)}
              disabled={Boolean(loading || disabled)}
            >
              {DATA.OFFER.SUBMIT_BUTTON_TEXT}
            </Button>
          </form>
        </FormProvider>
      </div>
    </Modal>
  )
}

export default PlaceAnOfferModal
