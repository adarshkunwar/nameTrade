import Heading from '@/components/ui/Typography'

const Title = ({ mainheading, subHeading }: { mainheading: string; subHeading: string }) => {
  return (
    <div className="flex flex-col gap-4 items-center w-full text-center py-10">
      <Heading variant="h1" title={mainheading} color="white" fontWeight={700} />
      <Heading variant="body-s" title={subHeading} color="white" />
    </div>
  )
}

export default Title
