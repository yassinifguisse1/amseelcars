"use client"

import { useState, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'
import styles from './FilterBar.module.scss'

export interface FilterState {
  brand: string
  name: string
  minPrice: string
  maxPrice: string
  currency: 'MAD' | 'EUR' | 'USD'
}

interface FilterBarProps {
  brands: string[]
  onFilterChange: (filters: FilterState) => void
  currency: 'MAD' | 'EUR' | 'USD'
  onCurrencyChange: (currency: 'MAD' | 'EUR' | 'USD') => void
}

export default function FilterBar({ 
  brands, 
  onFilterChange,
  currency,
  onCurrencyChange 
}: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    brand: '',
    name: '',
    minPrice: '',
    maxPrice: '',
    currency: currency
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: string | 'MAD' | 'EUR' | 'USD') => {
    const newFilters = { ...filters, [key]: value, currency: currency }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleCurrencyChange = (newCurrency: 'MAD' | 'EUR' | 'USD') => {
    const newFilters = { ...filters, currency: newCurrency }
    setFilters(newFilters)
    onCurrencyChange(newCurrency)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      brand: '',
      name: '',
      minPrice: '',
      maxPrice: '',
      currency: currency
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  // Sync currency when prop changes
  useEffect(() => {
    if (filters.currency !== currency) {
      setFilters(prev => ({ ...prev, currency: currency }))
    }
  }, [currency])

  const hasActiveFilters = filters.brand || filters.name || filters.minPrice || filters.maxPrice

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterBarHeader}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle filters"
        >
          <Filter className={styles.filterIcon} />
          <span>Filtres</span>
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
              Marque
            </label>
            <select
              id="brand-filter"
              className={styles.select}
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            >
              <option value="">Toutes les marques</option>
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
              Nom du véhicule
            </label>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <input
                id="name-filter"
                type="text"
                className={styles.input}
                placeholder="Rechercher un véhicule..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
              {filters.name && (
                <button
                  className={styles.clearButton}
                  onClick={() => handleFilterChange('name', '')}
                  aria-label="Clear search"
                >
                  <X className={styles.clearIcon} />
                </button>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>Prix par jour ({currency})</label>
            <div className={styles.priceRange}>
              <input
                type="number"
                className={styles.input}
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                min="0"
              />
              <span className={styles.priceSeparator}>-</span>
              <input
                type="number"
                className={styles.input}
                placeholder="Max"
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
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  )
}

