export { XSearchLaneClient } from './client.js'
export { XSearchLaneError } from './errors.js'
export {
  getCapabilities,
  getPricing,
  health,
  resolveProvider,
  runXResearch,
  runXSearch,
} from './engine.js'
export { loadConfig, SERVICE, VERSION } from './config.js'
export type {
  XSearchCitation,
  XSearchLaneConfig,
  XSearchOptions,
  XSearchProviderName,
  XSearchResult,
} from './types.js'
