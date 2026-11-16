import PlayerDetailClient from './PlayerDetailClient'

export function generateStaticParams() {
  return [{ id: 'default' }]
}

export default function Page() {
  return <PlayerDetailClient />
}
