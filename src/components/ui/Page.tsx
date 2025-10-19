const Page = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background text-white flex-1 overflow-y-auto">
      <div className="max-w-[760px] mx-auto h-full hide-scrollbar">{children}</div>
    </div>
  )
}

export default Page
