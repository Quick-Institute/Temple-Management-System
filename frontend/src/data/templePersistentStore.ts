
import { useCallback, useEffect, useState } from 'react'
import { useActiveTemple } from '../hooks/useActiveTemple'

export const useTempleStoredState = <T,>(
  name: string,
  initialValue: T
) => {
  const { temple } = useActiveTemple()

  const templeId = temple?.id ?? 'unassigned'
  const storageKey = `tms.${name}.${templeId}`

  const read = useCallback((): T => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw === null) return initialValue
      return JSON.parse(raw) as T
    } catch {
      return initialValue
    }
  }, [initialValue, storageKey])

  const [store, setStore] = useState(() => ({
    storageKey,
    value: read(),
  }))

  // Read the correct value when the active temple changes
  const value =
    store.storageKey === storageKey
      ? store.value
      : read()

  // Save the current temple's data
  useEffect(() => {
    if (store.storageKey !== storageKey) return

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(store.value)
      )
    } catch {
      // Storage unavailable
    }
  }, [store, storageKey])

  const setValue = useCallback(
    (update: T | ((previous: T) => T)) => {
      setStore(current => {
        const previous =
          current.storageKey === storageKey
            ? current.value
            : read()

        const nextValue =
          typeof update === 'function'
            ? (update as (previous: T) => T)(previous)
            : update

        return {
          storageKey,
          value: nextValue,
        }
      })
    },
    [storageKey, read]
  )

  // Listen for changes from other browser tabs
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key === storageKey) {
        setStore({
          storageKey,
          value: read(),
        })
      }
    }

    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener('storage', refresh)
    }
  }, [storageKey, read])

  return [value, setValue] as const
}
