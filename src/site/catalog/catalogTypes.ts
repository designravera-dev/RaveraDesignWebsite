export type DbProduct = {
  id: string
  name: string
  image_src: string
  image_alt: string
  image_width: number
  image_height: number
  summary?: string
  category?: string
  material?: string
  size?: string
  price: number
}

export type CatalogProduct = {
  id: string
  name: string
  image: { src: string; alt: string; width: number; height: number }
  summary?: string
  category?: string
  material?: string
  size?: string
  price: number
}

export type CatalogSelectionDraft = { selectedProductIds: string[]; story: string }
