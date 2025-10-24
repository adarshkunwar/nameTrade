import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import TextField from '@/components/ui/Text'
import Heading from '@/components/ui/Typography'
import { FormProvider, useForm } from 'react-hook-form'
import DATA from '../constant/field.const'

type Props = {
  username: string;
  onSubmit: (data: { bid: number }) => void;
  loading: boolean;
  disabled: boolean;
};

const PlaceABidModal = ({ username, onSubmit, loading, disabled }: Props) => {
  const methods = useForm<{ bid: number }>({
    defaultValues: {
      bid: 0,
    },
  })


  return (
    <Modal
      trigger={
        <Button variant="secondary" fullWidth>
          {DATA.BID.TRIGGER_BUTTON_TEXT}
        </Button>
      }
    >
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-1 items-center justify-center">
          <Heading variant="h2" title={username} fontWeight={700} color="white" />
          <Heading variant="body-xs" title={DATA.BID.SUBHEADING} color="white" />
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-2">
            <TextField name="bid" placeholder={DATA.BID.PLACEHOLDER} customLabel={DATA.BID.CUSTOM_LABEL} />
            <Button variant="secondary" type="submit" fullWidth loading={loading} disabled={disabled}>
              {DATA.BID.SUBMIT_BUTTON_TEXT}
            </Button>
          </form>
        </FormProvider>
      </div>
    </Modal>
  )
}

export default PlaceABidModal
