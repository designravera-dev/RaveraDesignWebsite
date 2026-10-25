import type { CatalogSelectionDraft } from './catalogTypes'

export const SELECTION_STORAGE_KEY = 'ravera:catalog-selection:v2'
export const LEGACY_SELECTION_STORAGE_KEY = 'ravera:catalog-selection:v1'

export const emptySelection = (): CatalogSelectionDraft => ({ selectedProductIds: [], story: '' })

function validProductIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((id): id is string => typeof id === 'string'))]
}

export function validateSelection(value: unknown): CatalogSelectionDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return emptySelection()
  const draft = value as Record<string, unknown>
  return {
    selectedProductIds: validProductIds(draft.selectedProductIds),
    story: typeof draft.story === 'string' ? draft.story : '',
  }
}

export function migrateLegacySelection(value: unknown): CatalogSelectionDraft {
  if (!Array.isArray(value)) return emptySelection()
  const ids = value.flatMap((entry) => entry && typeof entry === 'object' ? [entry.productId] : [])
  return { selectedProductIds: validProductIds(ids), story: '' }
}

export function writeSelection(selection: CatalogSelectionDraft): boolean {
  if (typeof window === 'undefined') return false
  try {
    const storage = window.sessionStorage
    if (selection.selectedProductIds.length || selection.story.length) storage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(selection))
    else storage.removeItem(SELECTION_STORAGE_KEY)
    // Só retirar o formato antigo depois de salvar ou limpar o formato atual.
    storage.removeItem(LEGACY_SELECTION_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export function readSelection(): { selection: CatalogSelectionDraft; available: boolean } {
  if (typeof window === 'undefined') return { selection: emptySelection(), available: false }
  try {
    const storage = window.sessionStorage
    const raw = storage.getItem(SELECTION_STORAGE_KEY)
    if (raw !== null) {
      try {
        const parsed: unknown = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return { selection: validateSelection(parsed), available: true }
      } catch {
        // Tentar a migração antiga se o conteúdo atual não puder ser lido.
      }
      storage.removeItem(SELECTION_STORAGE_KEY)
    }
    const legacy = storage.getItem(LEGACY_SELECTION_STORAGE_KEY)
    if (legacy === null) return { selection: emptySelection(), available: true }
    let parsed: unknown
    try {
      parsed = JSON.parse(legacy)
    } catch {
      storage.removeItem(LEGACY_SELECTION_STORAGE_KEY)
      return { selection: emptySelection(), available: true }
    }
    const selection = migrateLegacySelection(parsed)
    return { selection, available: writeSelection(selection) }
  } catch {
    return { selection: emptySelection(), available: false }
  }
}
