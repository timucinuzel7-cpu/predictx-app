import { configDefault } from 'fumadocs-core/highlight'
import { createAPIPage } from 'fumadocs-openapi/ui'
import client from '@/components/docs/APIPage.client'
import { openapi } from '@/lib/openapi'

export const APIPage = createAPIPage(openapi, {
  client,
  shiki: configDefault,
})
