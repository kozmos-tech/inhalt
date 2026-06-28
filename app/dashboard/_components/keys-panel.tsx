"use client"

import type { ApiKey } from "@/lib/keys/client"
import { formatDate } from "../utils/format"

type KeysPanelProps = {
  keys: ApiKey[]
  loading: boolean
  error: string | null
  onCreate: () => void
  onRevoke: (id: string) => void
}

export function KeysPanel({ keys, loading, error, onCreate, onRevoke }: KeysPanelProps) {
  return (
    <section>
      <div className="section-head">
        <p>
          Each MCP client authenticates with its own key. The secret is shown
          once, right after you create it.
        </p>
        <button type="button" className="primary" onClick={onCreate}>
          Create new key
        </button>
      </div>

      {error && (
        <p role="alert">
          <strong>{error}</strong>
        </p>
      )}

      {loading ? (
        <p>Loading keys...</p>
      ) : keys.length === 0 ? (
        <p className="empty">
          No keys yet. Create your first key to connect an MCP client.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Key</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id}>
                <td>{key.name}</td>
                <td>
                  <code>{key.prefix}••••••••</code>
                </td>
                <td>{formatDate(key.createdAt)}</td>
                <td className="row-action">
                  <button type="button" onClick={() => onRevoke(key.id)}>
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
