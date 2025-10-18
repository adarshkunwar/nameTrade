const Page = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background text-white h-screen">
      <div className="max-w-[760px] mx-auto">{children}</div>
    </div>
  )
}

export default Page
