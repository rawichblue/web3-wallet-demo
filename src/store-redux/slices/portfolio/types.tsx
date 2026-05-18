import type { Holding, Transaction, PortfolioSummary } from '@/types/portfolio'

export const sliceName = 'portfolio'

export interface StateProps {
  holdings: Holding[]
  transactions: Transaction[]
  summary: PortfolioSummary | null
  loading: boolean
  loadingTx: boolean
  error: string | null    // fetchPortfolio
  errorTx: string | null  // fetchTransactions
}

export const initialState: StateProps = {
  holdings: [],
  transactions: [],
  summary: null,
  loading: false,
  loadingTx: false,
  error: null,
  errorTx: null,
}
