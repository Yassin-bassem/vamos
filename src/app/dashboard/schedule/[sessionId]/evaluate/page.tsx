import SessionEvaluateClient from './SessionEvaluateClient'

export function generateStaticParams() {
  return [{ sessionId: 'default' }]
}

export default function Page() {
  return <SessionEvaluateClient />
}
