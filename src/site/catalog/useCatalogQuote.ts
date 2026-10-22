import { useEffect, useRef, useState } from 'react'
import { INSTAGRAM_DM_URL } from '../shared/contact'
import { catalogById } from './catalogData'
import { buildQuoteMessage } from './catalogQuote'
import { useCatalogSelection } from './catalogSelectionContext'
import { copyMessageToClipboard } from './copyMessageToClipboard'
import { closeReservedTab, openInstagramDirect, reserveInstagramTab } from './openInstagramDirect'

export const COPY_SUCCESS = 'Sua seleção foi copiada! O Instagram será aberto. Cole no Direct usando Ctrl+V ou ⌘V no computador, ou tocando e segurando para colar no celular.'
export const POPUP_BLOCKED = 'Sua seleção foi copiada, mas o navegador bloqueou a abertura do Instagram.'
export const COPY_FAILURE = 'Não foi possível copiar automaticamente. Copie a mensagem abaixo e depois abra o Direct do Instagram.'
export const MANUAL_COPY_SUCCESS = 'Mensagem copiada! Abra o Direct do Instagram e cole usando Ctrl+V ou ⌘V no computador, ou tocando e segurando para colar no celular.'
export const MANUAL_COPY_FAILURE = 'Não foi possível copiar. Selecione o texto abaixo, copie pelo menu do navegador ou usando Ctrl+C ou ⌘C e depois cole no Direct do Instagram.'

export type CopyFeedback = { message: string; blocked: boolean; version: number }

export default function useCatalogQuote() {
  const { selectedProductIds, story, ready } = useCatalogSelection()
  const products = selectedProductIds.flatMap((id) => {
    const product = catalogById.get(id)
    return product && typeof product.name === 'string' && product.name.trim() ? [product] : []
  })
  const destination = INSTAGRAM_DM_URL
  const enabled = ready && products.length > 0 && Boolean(destination)
  const [processing, setProcessing] = useState(false)
  const [feedback, setFeedback] = useState<CopyFeedback | null>(null)
  const [manualMessage, setManualMessage] = useState<string | null>(null)
  const [manualStatus, setManualStatus] = useState(COPY_FAILURE)
  const running = useRef(false)
  const mounted = useRef(false)
  const operation = useRef(0)
  const reservedTab = useRef<Window | null>(null)

  useEffect(() => {
    mounted.current = true
    if (import.meta.env.DEV && !destination) console.error('RAVERA: configure o Direct oficial em src/site/shared/contact.ts.')
    return () => {
      mounted.current = false
      operation.current += 1
      running.current = false
      closeReservedTab(reservedTab.current)
      reservedTab.current = null
    }
  }, [destination])

  useEffect(() => {
    if (!feedback || feedback.blocked) return
    const timer = window.setTimeout(() => setFeedback(null), 10000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  async function requestQuote() {
    if (!enabled || running.current) return
    const message = buildQuoteMessage(products, story)
    if (!message) return
    running.current = true
    const currentOperation = ++operation.current
    setProcessing(true)
    setFeedback(null)
    // Start copying while this document still has focus, then reserve the tab
    // synchronously in the same click. Neither operation waits for the other.
    const copyAttempt = copyMessageToClipboard(message)
    reservedTab.current = reserveInstagramTab()
    try {
      const copied = await copyAttempt
      if (!mounted.current || currentOperation !== operation.current) return
      if (!copied) {
        closeReservedTab(reservedTab.current)
        reservedTab.current = null
        setManualStatus(COPY_FAILURE)
        setManualMessage(message)
        return
      }
      const opened = openInstagramDirect(reservedTab.current, destination)
      reservedTab.current = null
      setFeedback({ message: opened ? COPY_SUCCESS : POPUP_BLOCKED, blocked: !opened, version: currentOperation })
    } finally {
      if (mounted.current && currentOperation === operation.current) {
        running.current = false
        setProcessing(false)
      }
    }
  }

  async function copyManualMessage() {
    if (!manualMessage || running.current) return
    running.current = true
    const currentOperation = ++operation.current
    setProcessing(true)
    try {
      const copied = await copyMessageToClipboard(manualMessage)
      if (mounted.current && currentOperation === operation.current) setManualStatus(copied ? MANUAL_COPY_SUCCESS : MANUAL_COPY_FAILURE)
    } finally {
      if (mounted.current && currentOperation === operation.current) {
        running.current = false
        setProcessing(false)
      }
    }
  }

  function closeManualDialog() {
    operation.current += 1
    running.current = false
    setProcessing(false)
    setManualMessage(null)
  }

  return { enabled, destination, processing, feedback, dismissFeedback: () => setFeedback(null), requestQuote, manualMessage, manualStatus, copyManualMessage, closeManualDialog }
}
