import { market } from './market'
import { pools } from './pools'
import { portfolio } from './portfolio'

const reducer = { ...market, ...pools, ...portfolio }
export default reducer
