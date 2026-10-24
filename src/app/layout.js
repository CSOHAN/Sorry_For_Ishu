import "./globals.css"

export const metadata = {
  title: "I'm Sorry",
  description: "A heartfelt apology website",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
