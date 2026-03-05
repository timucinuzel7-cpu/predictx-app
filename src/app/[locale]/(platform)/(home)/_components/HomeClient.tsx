'use client'

import type { Route } from 'next'
import type { Event } from '@/types'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import CategorySidebar from '@/app/[locale]/(platform)/(home)/_components/CategorySidebar'
import { OpenCardProvider } from '@/app/[locale]/(platform)/(home)/_components/EventOpenCardProvider'
import EventsGrid from '@/app/[locale]/(platform)/(home)/_components/EventsGrid'
import FilterToolbar from '@/app/[locale]/(platform)/(home)/_components/FilterToolbar'
import HomeSecondaryNavigation from '@/app/[locale]/(platform)/(home)/_components/HomeSecondaryNavigation'
import { useFilters } from '@/app/[locale]/(platform)/_providers/FilterProvider'
import { usePlatformNavigationData } from '@/app/[locale]/(platform)/_providers/PlatformNavigationProvider'
import { usePathname, useRouter } from '@/i18n/navigation'
import { isCategoryPathSidebarSlug, isCategoryPathSlug } from '@/lib/constants'
import { resolvePlatformNavigationSelection } from '@/lib/platform-navigation'

interface HomeClientProps {
  initialEvents: Event[]
  initialTag?: string
  initialMainTag?: string
}

export default function HomeClient({
  initialEvents,
  initialTag,
  initialMainTag,
}: HomeClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { filters, updateFilters } = useFilters()
  const { tags, childParentMap } = usePlatformNavigationData()
  const lastAppliedInitialFiltersRef = useRef<string | null>(null)

  useEffect(() => {
    const targetTag = initialTag ?? 'trending'
    const targetMainTag = initialMainTag ?? targetTag
    const nextKey = `${targetMainTag}:${targetTag}`

    if (lastAppliedInitialFiltersRef.current === nextKey) {
      return
    }

    lastAppliedInitialFiltersRef.current = nextKey
    updateFilters({ tag: targetTag, mainTag: targetMainTag })
  }, [initialMainTag, initialTag, updateFilters])

  const navigationSelection = useMemo(() => resolvePlatformNavigationSelection({
    pathname,
    filters: {
      tag: filters.tag,
      mainTag: filters.mainTag,
      bookmarked: filters.bookmarked,
    },
    childParentMap,
  }), [childParentMap, filters.bookmarked, filters.mainTag, filters.tag, pathname])

  const activeNavigationTag = useMemo(
    () => tags.find(tag => tag.slug === navigationSelection.activeMainTagSlug) ?? null,
    [navigationSelection.activeMainTagSlug, tags],
  )

  const showCategoryPathTitle = useMemo(() => (
    activeNavigationTag !== null
    && navigationSelection.pathState.isMainTagPathPage
    && navigationSelection.pathState.selectedMainTagPathSlug === activeNavigationTag.slug
    && isCategoryPathSlug(activeNavigationTag.slug)
  ), [activeNavigationTag, navigationSelection.pathState.isMainTagPathPage, navigationSelection.pathState.selectedMainTagPathSlug])

  const categorySidebar = useMemo(() => {
    if (!activeNavigationTag || !showCategoryPathTitle || !isCategoryPathSidebarSlug(activeNavigationTag.slug)) {
      return null
    }

    return {
      slug: activeNavigationTag.slug,
      title: activeNavigationTag.name,
      childs: activeNavigationTag.childs,
    }
  }, [activeNavigationTag, showCategoryPathTitle])

  const hasCategorySidebar = categorySidebar !== null
  const shouldUsePathSubcategoryNavigation = hasCategorySidebar
    && navigationSelection.pathState.selectedMainTagPathSlug === categorySidebar.slug

  const activeSecondaryTagSlug = useMemo(() => {
    if (!activeNavigationTag) {
      return 'trending'
    }

    const availableSlugs = new Set([
      activeNavigationTag.slug,
      ...activeNavigationTag.childs.map(child => child.slug),
    ])

    return availableSlugs.has(navigationSelection.activeTagSlug)
      ? navigationSelection.activeTagSlug
      : activeNavigationTag.slug
  }, [activeNavigationTag, navigationSelection.activeTagSlug])

  const activeSidebarSubcategorySlug = hasCategorySidebar && activeSecondaryTagSlug !== categorySidebar.slug
    ? activeSecondaryTagSlug
    : null

  const handleSecondaryNavigation = useCallback((targetTag: string) => {
    if (!activeNavigationTag) {
      return
    }

    updateFilters({ tag: targetTag, mainTag: activeNavigationTag.slug })

    if (shouldUsePathSubcategoryNavigation) {
      const nextPath = targetTag === activeNavigationTag.slug
        ? `/${activeNavigationTag.slug}`
        : `/${activeNavigationTag.slug}/${targetTag}`
      router.push(nextPath as Route)
    }
  }, [activeNavigationTag, router, shouldUsePathSubcategoryNavigation, updateFilters])

  const secondaryNavigation = activeNavigationTag
    ? (
        <HomeSecondaryNavigation
          tag={activeNavigationTag}
          activeSubtagSlug={activeSecondaryTagSlug}
          showCategoryTitle={showCategoryPathTitle}
          hideOnDesktop={hasCategorySidebar}
          onSelectTag={handleSecondaryNavigation}
        />
      )
    : null

  return (
    <>
      <div className="flex min-w-0 gap-6 lg:items-start lg:gap-10">
        {categorySidebar && (
          <CategorySidebar
            categorySlug={categorySidebar.slug}
            categoryTitle={categorySidebar.title}
            activeSubcategorySlug={activeSidebarSubcategorySlug}
            onNavigate={handleSecondaryNavigation}
            subcategories={categorySidebar.childs}
          />
        )}

        <div className="min-w-0 flex-1 space-y-4 lg:space-y-5">
          <FilterToolbar
            filters={filters}
            onFiltersChange={updateFilters}
            hideDesktopSecondaryNavigation={hasCategorySidebar}
            desktopTitle={categorySidebar?.title}
            secondaryNavigation={secondaryNavigation}
          />

          <OpenCardProvider>
            <EventsGrid
              filters={filters}
              initialEvents={initialEvents}
              maxColumns={hasCategorySidebar ? 3 : undefined}
            />
          </OpenCardProvider>
        </div>
      </div>
    </>
  )
}
