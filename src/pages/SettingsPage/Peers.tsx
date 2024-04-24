import { useEffect, useState } from 'react'
import { useSqlite } from 'src/hooks/useSqlite.js'

export default function Peers() {
  const ctx = useSqlite()
  const [peerId, setPeerId] = useState<string>('')
  const [pending, setPending] = useState<string[]>([])
  const [established, setEstablished] = useState<string[]>([])

  useEffect(() => {
    const cleanup = ctx.rtc.onConnectionsChanged((pending, established) => {
      setPending(pending)
      setEstablished(established)
    })
    return () => {
      cleanup()
    }
  }, [ctx.rtc])
  return (
    <div className="peers">
      <input
        type="text"
        onChange={(e) => setPeerId(e.target.value)}
        value={peerId}
      ></input>
      <a
        href="#"
        onClick={() => {
          ctx.rtc.connectTo(peerId)
        }}
      >
        Connect
      </a>
      Pending
      <ul className="pending">
        {pending.map((p) => (
          <li key={p} id={p}>
            {p.substring(0, 8)}
          </li>
        ))}
      </ul>
      Established
      <ul className="established">
        {established.map((p) => (
          <li key={p} id={p}>
            {p.substring(0, 8)}
          </li>
        ))}
      </ul>
    </div>
  )
}
