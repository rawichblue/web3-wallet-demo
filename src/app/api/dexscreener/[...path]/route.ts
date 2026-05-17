import { NextRequest, NextResponse } from 'next/server'

const DEXSCREENER_BASE = 'https://api.dexscreener.com'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const pathname = path.join('/')
  const search = request.nextUrl.search

  const url = `${DEXSCREENER_BASE}/${pathname}${search}`

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 30 },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'DexScreener fetch failed' }, { status: 502 })
  }
}
