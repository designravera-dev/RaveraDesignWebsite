import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { CatalogSelectionContext } from './catalogSelectionContext'
import { selectionReducer, type SelectionAction } from './catalogSelectionReducer'
import { emptySelection, readSelection, writeSelection } from './catalogStorage'
import { fetchProducts } from './catalogService'
import type { CatalogSelectionDraft } from './catalogTypes'

type SelectionState = { selection: CatalogSelectionDraft; ready: boolean; storageAvailable: boolean }
type Action = SelectionAction | { type: 'restore'; selection: CatalogSelectionDraft; available: boolean } | { type: 'storage-status'; available: boolean }

function reducer(state: SelectionState, action: Action): SelectionState {
  if (action.type === 'restore') return { selection: action.selection, ready: true, storageAvailable: action.available }
  if (action.type === 'storage-status') return state.storageAvailable === action.available ? state : { ...state, storageAvailable: action.available }
  return { ...state, selection: selectionReducer(state.selection, action) }
}

export default function CatalogSelectionProvider({ children }: { children: ReactNode }) {
  const [{ selection, ready, storageAvailable }, dispatch] = useReducer(reducer, { selection: emptySelection(), ready: false, storageAvailable: true })
  const { selectedProductIds, story } = selection
  const [announcement, setAnnouncement] = useState({ message: '', version: 0 })

  useEffect(() => {
    const init = async () => {
      // We no longer use a static validIds set.
      // We read the stored selection and restore it.
      const stored = readSelection(new Set()) // passing empty set as we don't filter by static list anymore
      dispatch({ type: 'restore', selection: stored.selection, available: stored.available })
    }
    init()
  }, [])

  useEffect(() => {
    if (ready) dispatch({ type: 'storage-status', available: writeSelection(selection) })
  }, [selection, ready])

  const announce = useCallback((message: string) => {
    setAnnouncement((previous) => ({ message, version: previous.version + 1 }))
  }, [])

  const add = useCallback((productId: string) => {
    if (selectedProductIds.includes(productId)) return
    dispatch({ type: 'add', productId })
    announce('Produto adicionado à seleção.')
  }, [announce, selectedProductIds])

  const setStory = useCallback((text: string) => dispatch({ type: 'story', story: text }), [])

  const remove = useCallback((productId: string) => {
    dispatch({ type: 'remove', productId })
    announce('Produto removido da seleção.')
  }, [announce])

  const clear = useCallback(() => {
    dispatch({ type: 'clear' })
    announce('Seleção limpa.')
  }, [announce])

  const value = useMemo(() => ({
    selectedProductIds, story, ready, storageAvailable, announcement, add, setStory, remove, clear,
    selectedCount: selectedProductIds.length,
  }), [selectedProductIds, story, ready, storageAvailable, announcement, add, setStory, remove, clear])

  return (
    <CatalogSelectionContext.Provider value={value}>
      {children}
      <div className="ts-sr-only" role="status" aria-live="polite" aria-atomic="true">
        <span key={announcement.version}>{announcement.message}</span>
      </div>
    </CatalogSelectionContext.Provider>
  )
}
