import CoachDetailClient from './CoachDetailClient'

export function generateStaticParams() {
  return [{ id: 'default' }]
}

export default function Page() {
  return <CoachDetailClient />
}
