import TextField from '@/components/ui/Text'
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form'

type TFormInput = {
  search: string
}

const Search = ({ submitFunction }: { submitFunction: SubmitHandler<TFormInput> }) => {
  const methods = useForm<TFormInput>({
    defaultValues: {
      search: '',
    },
  })

  const onSubmit: SubmitHandler<TFormInput> = (data) => {
    console.log(data)
    submitFunction(data)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="w-full">
          <TextField name="search" placeholder="Enter a Username" customLabel="" type="search" />
        </div>
        {/* <button type="submit">Search</button> */}
      </form>
    </FormProvider>
  )
}

export default Search
