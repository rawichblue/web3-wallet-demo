import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Pool, ChainFilter } from '@/types/pool'
import { getPools } from '@/lib/api/dexscreener'
import { sliceName } from './types'

export const fetchPoolsService = createAsyncThunk(
  `${sliceName}/fetchPoolsService`,
  async (chain: ChainFilter): Promise<Pool[]> => {
    const result = await getPools(chain)
    console.log(`[DexScreener] fetchPoolsService (${chain}) → ${result.length} pools, sample:`, result[0])
    return result
  }
)
