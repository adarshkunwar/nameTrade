const Page = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-11/12 md:w-full mx-auto bg-background text-white">
      <div className="sm:max-w-[760px] w-full mx-auto h-full hide-scrollbar">{children}</div>
    </div>
  )
}

export default Page
