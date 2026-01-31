import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { type, name, price, image_url, description, duration_months, stars_amount } = body

  if (!type || !name || !price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .insert({
      type,
      name,
      price,
      image_url,
      description,
      duration_months,
      stars_amount,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { id, name, price, image_url, is_active } = body

  if (!id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
  }

  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (name !== undefined) updateData.name = name
  if (price !== undefined) updateData.price = price
  if (image_url !== undefined) updateData.image_url = image_url
  if (is_active !== undefined) updateData.is_active = is_active

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
