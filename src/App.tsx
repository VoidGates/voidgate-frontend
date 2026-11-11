import { useEffect, useState } from 'react'

export default function App() {
  const [status, setStatus] = useState('verificando...')

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus('backend offline'))
  }, [])

  return (
    <main style={{ padding: 32 }}>
      <h1>VoidGate</h1>
      <p>Backend: {status}</p>
    </main>
  )
}
