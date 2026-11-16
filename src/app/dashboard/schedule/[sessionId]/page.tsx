import SessionDetailClient from './SessionDetailClient'

export function generateStaticParams() {
  return [{ sessionId: 'default' }]
}

export default function Page() {
  return <SessionDetailClient />
}
