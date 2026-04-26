import "./globals.css"
export const header = <div className="flex items-center p-4 border-b">

  <button
    onClick={() => setOpenSidebar(true)}
    className="text-2xl"
  >
    ☰
  </button>

  <h2 className="ml-4 font-semibold">
    Dashboard
  </h2>

</div>
export const metadata = {
  title: "eLab",
  description: "Virtual Lab System"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}