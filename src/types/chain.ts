export interface Chain {
  id: number
  name: string
  shortName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrl: string
  blockExplorer: string
  iconUrl: string
  color: string
}
