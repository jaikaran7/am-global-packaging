'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type ProductLine = 'boxes' | 'papers'

interface ProductLineContextValue {
  activeProductLine: ProductLine
  setActiveProductLine: (line: ProductLine) => void
  hydrated: boolean
}

const ProductLineContext = createContext<ProductLineContextValue>({
  activeProductLine: 'boxes',
  setActiveProductLine: () => {},
  hydrated: false,
})

const STORAGE_KEY = 'admin-product-line'

export function ProductLineProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [activeProductLine, setActiveProductLineState] = useState<ProductLine>('boxes')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'papers' || stored === 'boxes') {
        setActiveProductLineState(stored)
      }
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  const setActiveProductLine = useCallback((line: ProductLine) => {
    setActiveProductLineState(line)
    try {
      localStorage.setItem(STORAGE_KEY, line)
    } catch {
      // ignore
    }
  }, [])

  return (
    <ProductLineContext.Provider value={{ activeProductLine, setActiveProductLine, hydrated }}>
      {children}
    </ProductLineContext.Provider>
  )
}

export function useProductLine() {
  return useContext(ProductLineContext)
}
