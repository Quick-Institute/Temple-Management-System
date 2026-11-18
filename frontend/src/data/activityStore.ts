
import { useCallback, useEffect, useState } from 'react'
import { useActiveTemple } from '../hooks/useActiveTemple'

const keyFor = (templeId: string) => `tms.activities.${templeId}`

export const useTempleActivities = <T,>(initialItems: T[]) => {
  const { temple } = useActiveTemple()
  const templeId = temple?.id ?? 'unassigned'

  const read = useCallback((): T[] => {
    try {
      const value = window.localStorage.getItem(keyFor(templeId))

      if (value === null) {
        return initialItems.map(item => ({ ...item }))
      }

      const parsed: unknown = JSON.parse(value)

      return Array.isArray(parsed)
        ? parsed as T[]
        : initialItems.map(item => ({ ...item }))
    } catch {
      return initialItems.map(item => ({ ...item }))
    }
  }, [initialItems, templeId])

  const [store, setStore] = useState(() => ({
    templeId,
    items: read(),
  }))

  // Get the correct data when the active temple changes
  const items =
    store.templeId === templeId
      ? store.items
      : read()

  // Persist activities for the active temple
  useEffect(() => {
    if (store.templeId !== templeId) return

    try {
      window.localStorage.setItem(
        keyFor(templeId),
        JSON.stringify(store.items)
      )
    } catch {
      // Storage unavailable
    }
  }, [store, templeId])

  const setActivities = useCallback(
    (update: T[] | ((previous: T[]) => T[])) => {
      setStore(current => {
        const previous =
          current.templeId === templeId
            ? current.items
            : read()

        const nextItems =
          typeof update === 'function'
            ? update(previous)
            : update

        return {
          templeId,
          items: nextItems,
        }
      })
    },
    [templeId, read]
  )

  // Listen for changes from other browser tabs
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key === keyFor(templeId)) {
        setStore({
          templeId,
          items: read(),
        })
      }
    }

    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener('storage', refresh)
    }
  }, [templeId, read])

  return [items, setActivities] as const
}
