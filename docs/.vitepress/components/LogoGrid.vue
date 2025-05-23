<template>
  <div class="logo-grid-container">
    <!-- Controls -->
    <div class="controls">
      <!-- Search -->
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search logos..."
          class="search-input"
        />
      </div>

      <!-- View Toggle -->
      <div class="view-toggle">
        <button
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
          class="view-btn"
        >
          Grid
        </button>
        <button
          :class="{ active: viewMode === 'list' }"
          @click="viewMode = 'list'"
          class="view-btn"
        >
          List
        </button>
      </div>
    </div>

    <!-- Results Count -->
    <div class="results-info">
      Showing {{ filteredLogos.length }} of {{ data?.logos?.length || 0 }} logos
      <span v-if="searchQuery">
        {{ searchQuery ? `matching "${searchQuery}"` : '' }}
      </span>
    </div>

    <!-- Logo Grid -->
    <div :class="['logo-grid', viewMode]">
      <div
        v-for="logo in filteredLogos"
        :key="logo.id"
        :class="['logo-card']"
        @click="selectLogo(logo)"
      >
        <div class="logo-icon">
          <img 
            :src="getLogoUrl(logo.id)" 
            :alt="logo.name"
            @error="handleImageError"
            loading="lazy"
          />
        </div>
        <div class="logo-info">
          <div class="logo-name">{{ logo.name }}</div>
          <div class="logo-colors">
            <span 
              v-for="color in (logo.colors || []).slice(0, 3)" 
              :key="color"
              class="color-dot"
              :style="{ backgroundColor: color }"
              :title="color"
            ></span>
            <span v-if="!logo.colors || logo.colors.length === 0" class="no-colors">No colors</span>
          </div>
          <div v-if="logo.hasSymbol" class="symbol-badge">Has Symbol</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredLogos.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No logos found</h3>
      <p>Try adjusting your search query</p>
    </div>

    <!-- Logo Modal -->
    <div v-if="selectedLogo" class="modal-overlay" @click="selectedLogo = null">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="selectedLogo = null">×</button>
        
        <div class="modal-header">
          <div class="modal-logo">
            <img 
              :src="getLogoUrl(selectedLogo.id, 128)" 
              :alt="selectedLogo.name"
            />
          </div>
          <div class="modal-info">
            <h2>{{ selectedLogo.name }}</h2>
            <p class="modal-website">
              <a :href="selectedLogo.website" target="_blank">{{ selectedLogo.website }}</a>
            </p>
            <div class="modal-meta">
              <div class="modal-colors">
                <span class="colors-label">Brand Colors:</span>
                <span 
                  v-for="color in (selectedLogo.colors || [])" 
                  :key="color"
                  class="color-chip"
                  :style="{ backgroundColor: color }"
                >
                  {{ color }}
                </span>
                <span v-if="!selectedLogo.colors || selectedLogo.colors.length === 0" class="no-colors-modal">No brand colors specified</span>
              </div>
              <span v-if="selectedLogo.hasSymbol" class="symbol-badge">Has Symbol Variant</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <a
            :href="getLogoUrl(selectedLogo.id, null, 'svg')"
            :download="`${selectedLogo.id}.svg`"
            class="btn btn-primary"
          >
            Download SVG
          </a>
          <a
            :href="getLogoUrl(selectedLogo.id, 512, 'png')"
            :download="`${selectedLogo.id}.png`"
            class="btn btn-secondary"
          >
            Download PNG
          </a>
          <button @click="copyToClipboard(selectedLogo)" class="btn btn-secondary">
            Copy SVG
          </button>
          <a
            v-if="selectedLogo.website"
            :href="selectedLogo.website"
            target="_blank"
            class="btn btn-secondary"
          >
            Visit Website
          </a>
        </div>

        <div class="modal-usage">
          <h3>Usage Examples</h3>
          <div class="code-examples">
            <div class="code-example">
              <label>Direct CDN (SVG)</label>
              <code>{{ getLogoUrl(selectedLogo.id, null, 'svg') }}</code>
            </div>
            <div class="code-example">
              <label>API with size (PNG)</label>
              <code>{{ getLogoUrl(selectedLogo.id, 64, 'png') }}</code>
            </div>
            <div class="code-example">
              <label>API with custom color</label>
              <code>{{ getLogoUrl(selectedLogo.id, null, 'svg', 'ff0000') }}</code>
            </div>
            <div class="code-example">
              <label>HTML Image</label>
              <code>{{ `<img src="${getLogoUrl(selectedLogo.id)}" alt="${selectedLogo.name}" width="64" height="64" />` }}</code>
            </div>
            <div class="code-example">
              <label>Fetch metadata</label>
              <code>{{ `fetch('${API_BASE}/logos/${selectedLogo.id}').then(res => res.json())` }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import logoData from '../data/logos.json'

// API Configuration
// Environment-based URL configuration
const getBaseUrls = () => {
  if (typeof window === 'undefined') return { API_BASE: 'https://logohub.dev/api/v1', CDN_BASE: 'https://logohub.dev' }
  
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const API_BASE = isDev 
    ? import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
    : import.meta.env.VITE_PROD_API_BASE_URL || 'https://logohub.dev/api/v1'
  
  const CDN_BASE = isDev 
    ? import.meta.env.VITE_CDN_BASE_URL || 'http://localhost:3000'
    : import.meta.env.VITE_PROD_CDN_BASE_URL || 'https://logohub.dev'
    
  return { API_BASE, CDN_BASE }
}

const { API_BASE, CDN_BASE } = getBaseUrls()

const data = ref(logoData)
const viewMode = ref('grid')
const selectedLogo = ref(null)
const searchQuery = ref('')

const logos = computed(() => {
  return data.value?.logos || []
})

const filteredLogos = computed(() => {
  if (!searchQuery.value.trim()) {
    return logos.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return logos.value.filter(logo => {
    const nameMatch = logo.name.toLowerCase().includes(query)
    const websiteMatch = logo.website && logo.website.toLowerCase().includes(query)
    const idMatch = logo.id.toLowerCase().includes(query)
    return nameMatch || websiteMatch || idMatch
  })
})

function getLogoUrl(logoId, size = 64, format = 'svg', color = null) {
  const params = new URLSearchParams()
  
  if (size) params.append('size', size.toString())
  if (format && format !== 'svg') params.append('format', format)
  if (color) params.append('color', color)
  
  const queryString = params.toString()
  const baseUrl = `${CDN_BASE}/api/v1/logos/${logoId}`
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

function selectLogo(logo) {
  selectedLogo.value = logo
}

async function copyToClipboard(logo) {
  try {
    // Fetch the SVG content from the API
    const response = await fetch(getLogoUrl(logo.id, null, 'svg'))
    const svgContent = await response.text()
    
    await navigator.clipboard.writeText(svgContent)
    console.log('SVG copied to clipboard!')
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy SVG:', error)
    // Fallback: copy the URL instead
    await navigator.clipboard.writeText(getLogoUrl(logo.id, null, 'svg'))
  }
}

function handleImageError(event) {
  // Fallback for missing logos - could show a placeholder
  console.warn('Failed to load logo:', event.target.src)
  event.target.style.display = 'none'
}
</script>

<style scoped>
.logo-grid-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-container {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  font-size: 1rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.view-toggle {
  display: flex;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  overflow: hidden;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  border-right: 1px solid var(--vp-c-border);
}

.view-btn:last-child {
  border-right: none;
}

.view-btn.active {
  background: var(--vp-c-brand);
  color: white;
}

.results-info {
  margin-bottom: 1rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.logo-grid {
  display: grid;
  gap: 1rem;
}

.logo-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.logo-grid.list {
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.logo-card {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--vp-c-bg);
}

.logo-card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  margin-bottom: 1rem;
}

.logo-icon img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.logo-info {
  text-align: center;
}

.logo-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.logo-colors {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--vp-c-border);
}

.no-colors {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.no-colors-modal {
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.symbol-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  font-size: 0.75rem;
  border-radius: 4px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--vp-c-text-2);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--vp-c-bg);
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  margin: 1rem;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
}

.modal-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.modal-logo {
  flex-shrink: 0;
}

.modal-logo img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.modal-info h2 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.modal-website {
  margin: 0 0 1rem 0;
}

.modal-website a {
  color: var(--vp-c-brand);
  text-decoration: none;
}

.modal-colors {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.colors-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.color-chip {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-family: monospace;
  border-radius: 4px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: var(--vp-c-brand);
  color: white;
}

.btn-secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-border);
}

.modal-usage h3 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
}

.code-examples {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.code-example {
  background: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 6px;
}

.code-example label {
  display: block;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.code-example code {
  background: var(--vp-c-bg-alt);
  padding: 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  display: block;
  word-break: break-all;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .logo-grid.grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .modal-header {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style> 