import type { ReactNode } from 'react'
import { cache } from 'react'
import { loadRuntimeThemeState } from '@/lib/theme-settings'

const loadSiteDiscordLink = cache(async () => {
  const runtimeTheme = await loadRuntimeThemeState()
  const value = runtimeTheme.site.discordLink?.trim()
  return value && value.length > 0 ? value : null
})

interface IfDiscordLinkProps {
  children: ReactNode
}

interface DiscordLinkProps {
  children?: ReactNode
  className?: string
}

export async function IfDiscordLink({ children }: IfDiscordLinkProps) {
  const discordLink = await loadSiteDiscordLink()

  if (!discordLink) {
    return null
  }

  return <>{children}</>
}

export async function DiscordLink({ children = 'Discord', className }: DiscordLinkProps) {
  const discordLink = await loadSiteDiscordLink()

  if (!discordLink) {
    return null
  }

  return (
    <a href={discordLink} rel="noopener noreferrer" target="_blank" className={className}>
      {children}
    </a>
  )
}
