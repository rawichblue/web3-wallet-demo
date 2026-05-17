import { NextRequest, NextResponse } from 'next/server'

const ALCHEMY_NETWORKS: Record<number, (key: string) => string> = {
  1:     (key) => `https://eth-mainnet.g.alchemy.com/v2/${key}`,
  56:    ()    => 'https://bsc-dataseed.binance.org',
  137:   (key) => `https://polygon-mainnet.g.alchemy.com/v2/${key}`,
  42161: (key) => `https://arb-mainnet.g.alchemy.com/v2/${key}`,
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { chainId?: number; [key: string]: unknown }
  const chainId: number = typeof body.chainId === 'number' ? body.chainId : 1

  const key = process.env.ALCHEMY_API_KEY ?? ''
  const builder = ALCHEMY_NETWORKS[chainId] ?? ALCHEMY_NETWORKS[1]!
  const url = builder(key)

  // Strip chainId from the JSON-RPC payload before forwarding
  const { chainId: _ignored, ...rpcBody } = body

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcBody),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Alchemy fetch failed' }, { status: 502 })
  }
}
