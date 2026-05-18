import { NextRequest, NextResponse } from 'next/server'

const ALCHEMY_NETWORKS: Record<number, (key: string) => string> = {
  1:     (key) => `https://eth-mainnet.g.alchemy.com/v2/${key}`,     // Ethereum
  56:    (key) => `https://bnb-mainnet.g.alchemy.com/v2/${key}`,     // BNB Chain
  137:   (key) => `https://polygon-mainnet.g.alchemy.com/v2/${key}`, // Polygon
  42161: (key) => `https://arb-mainnet.g.alchemy.com/v2/${key}`,     // Arbitrum
  8453:  (key) => `https://base-mainnet.g.alchemy.com/v2/${key}`,    // Base
  43114: (key) => `https://avax-mainnet.g.alchemy.com/v2/${key}`,    // Avalanche
  324:   (key) => `https://zksync-mainnet.g.alchemy.com/v2/${key}`,  // zkSync Era
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { chainId?: number; [key: string]: unknown }
  const chainId: number = typeof body.chainId === 'number' ? body.chainId : 1

  const key = process.env.ALCHEMY_API_KEY ?? ''
  const builder = ALCHEMY_NETWORKS[chainId] ?? ALCHEMY_NETWORKS[1]!
  const url = builder(key)

  // Strip chainId from the JSON-RPC payload before forwarding
  const rpcBody = Object.fromEntries(
    Object.entries(body).filter(([k]) => k !== 'chainId')
  )

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
