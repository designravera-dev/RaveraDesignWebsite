import { supabase } from '../shared/supabaseClient'
import type { DbProduct, CatalogProduct } from './catalogTypes'

export function mapDbToCatalog(dbProduct: DbProduct): CatalogProduct {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    image: {
      src: dbProduct.image_src,
      alt: dbProduct.image_alt,
      width: dbProduct.image_width,
      height: dbProduct.image_height,
    },
    summary: dbProduct.summary,
    category: dbProduct.category,
    material: dbProduct.material,
    size: dbProduct.size,
    price: dbProduct.price,
  }
}

export function mapCatalogToDb(product: CatalogProduct): DbProduct {
  return {
    id: product.id,
    name: product.name,
    image_src: product.image.src,
    image_alt: product.image.alt,
    image_width: product.image.width,
    image_height: product.image.height,
    summary: product.summary,
    category: product.category,
    material: product.material,
    size: product.size,
    price: product.price,
  }
}

export async function fetchProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return (data || []).map(mapDbToCatalog)
}

export async function fetchAllProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching all products:', error)
    return []
  }

  return (data || []).map(mapDbToCatalog)
}

export async function fetchProductById(id: string): Promise<CatalogProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product by id:', error)
    return null
  }

  return mapDbToCatalog(data)
}

export async function upsertProduct(product: DbProduct): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('products')
    .upsert(product)

  if (error) {
    return { error }
  }
  return { error: null }
}

export async function deleteProduct(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    return { error }
  }
  return { error: null }
}
