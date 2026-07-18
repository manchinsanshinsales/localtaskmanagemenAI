import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Smart AI Data Analyst',
  description: 'Secure, local-first analytics dashboard utilizing SQLite, DuckDB, and Ollama.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
