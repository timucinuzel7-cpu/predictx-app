import { openapi } from '@/lib/openapi'

function toUrlOrigin(url: string): string | null {
  try {
    return new URL(url).origin
  }
  catch {
    return null
  }
}

const allowedOrigins = [
  process.env.CLOB_URL,
  process.env.DATA_URL,
  process.env.RELAYER_URL,
  process.env.CREATE_MARKET_URL,
  process.env.COMMUNITY_URL,
  process.env.PRICE_REFERENCE_URL,
]
  .filter((url): url is string => Boolean(url))
  .map(toUrlOrigin)
  .filter((origin): origin is string => Boolean(origin))

export const { GET, POST, PUT, DELETE, PATCH, HEAD } = openapi.createProxy({
  allowedOrigins,
})
