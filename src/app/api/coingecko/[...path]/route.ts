import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const pathname = path.join('/')
  const search = request.nextUrl.search

  const url = `${COINGECKO_BASE}/${pathname}${search}`

  const headers: HeadersInit = {
    'Accept': 'application/json',
  }
  const apiKey = process.env.COINGECKO_API_KEY
  if (apiKey) {
    headers['x-cg-demo-api-key'] = apiKey
  }

  try {
    const res = await fetch(url, { headers, next: { revalidate: 60 } })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'CoinGecko fetch failed' }, { status: 502 })
  }
}
