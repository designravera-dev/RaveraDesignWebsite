export const INSTAGRAM_HANDLE = 'ravera.designn'
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`
export const INSTAGRAM_DM_URL = INSTAGRAM_HANDLE.trim() ? `https://ig.me/m/${INSTAGRAM_HANDLE.trim()}` : ''

// Usar somente o número oficial, com código do país, quando for fornecido.
// Sem número configurado, o orçamento reutiliza a conversa do Instagram.
export const WHATSAPP_NUMBER = ''

export function whatsappQuoteUrl(number: string, message: string) {
  const safeMessage = message.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '\uFFFD')
  return `https://wa.me/${number}?text=${encodeURIComponent(safeMessage)}`
}

export function quotationContact(message: string) {
  return WHATSAPP_NUMBER
    ? { channel: 'WhatsApp', href: whatsappQuoteUrl(WHATSAPP_NUMBER, message), prefilled: true }
    : { channel: 'Instagram', href: INSTAGRAM_DM_URL, prefilled: false }
}
