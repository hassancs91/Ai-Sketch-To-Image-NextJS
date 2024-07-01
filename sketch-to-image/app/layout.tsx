import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sketch to Realistic Image Converter',
  description: 'Convert sketches to realistic images',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}