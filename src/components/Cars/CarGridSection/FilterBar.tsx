"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search, X, Filter } from 'lucide-react'
import styles from './FilterBar.module.scss'

export interface FilterState {
  brand: string
  name: string
  minPrice: string
  maxPrice: string
  currency: 'MAD' | 'EUR' | 'USD'
  /** Fleet category slug from URL (?category=) — not shown in filter UI */
  category: string
}

interface FilterBarProps {
  brands: string[]
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  currency: 'MAD' | 'EUR' | 'USD'
  onCurrencyChange: (currency: 'MAD' | 'EUR' | 'USD') => void
}

export default function FilterBar({ 
  brands, 
  filters,
  onFilterChange,
  currency,
  onCurrencyChange 
}: FilterBarProps) {
  const t = useTranslations('carsPage.filters')
  const tCars = useTranslations('carsPage')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters: FilterState = {
      ...filters,
      [key]: value,
      currency: key === 'currency' ? (value as FilterState['currency']) : filters.currency,
    }
    onFilterChange(newFilters)
  }

  const handleCurrencyChange = (newCurrency: 'MAD' | 'EUR' | 'USD') => {
    onCurrencyChange(newCurrency)
    onFilterChange({ ...filters, currency: newCurrency })
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      brand: '',
      name: '',
      minPrice: '',
      maxPrice: '',
      currency: currency,
      category: '',
    }
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.brand ||
    filters.name ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.category

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterBarHeader}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={t('toggleAria')}
        >
          <Filter className={styles.filterIcon} />
          <span>{t('title')}</span>
          {hasActiveFilters && <span className={styles.badge}>{Object.values(filters).filter(v => v && v !== currency).length}</span>}
        </button>
        
        <div className={styles.currencySelector}>
          <button
            className={`${styles.currencyButton} ${currency === 'MAD' ? styles.active : ''}`}
            onClick={() => handleCurrencyChange('MAD')}
          >
            MAD
          </button>
          <button
            className={`${styles.currencyButton} ${currency === 'EUR' ? styles.active : ''}`}
            onClick={() => handleCurrencyChange('EUR')}
          >
            EUR
          </button>
          <button
            className={`${styles.currencyButton} ${currency === 'USD' ? styles.active : ''}`}
            onClick={() => handleCurrencyChange('USD')}
          >
            USD
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.filterContent}>
          {/* Brand Filter */}
          <div className={styles.filterGroup}>
            <label htmlFor="brand-filter" className={styles.label}>
              {t('brand')}
            </label>
            <select
              id="brand-filter"
              className={styles.select}
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            >
              <option value="">{t('allBrands')}</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Name Search */}
          <div className={styles.filterGroup}>
            <label htmlFor="name-filter" className={styles.label}>
              {t('vehicleName')}
            </label>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <input
                id="name-filter"
                type="text"
                className={styles.input}
                placeholder={t('searchPlaceholder')}
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
              {filters.name && (
                <button
                  className={styles.clearButton}
                  onClick={() => handleFilterChange('name', '')}
                  aria-label={t('clearSearchAria')}
                >
                  <X className={styles.clearIcon} />
                </button>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>{t('pricePerDay', { currency })}</label>
            <div className={styles.priceRange}>
              <input
                type="number"
                className={styles.input}
                placeholder={t('min')}
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                min="0"
              />
              <span className={styles.priceSeparator}>-</span>
              <input
                type="number"
                className={styles.input}
                placeholder={t('max')}
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              className={styles.clearAllButton}
              onClick={clearFilters}
            >
              <X className={styles.clearIcon} />
              {tCars('resetFilters')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

