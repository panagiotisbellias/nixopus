<template>
  <div class="code-group">
    <div class="tabs">
      <button 
        v-for="tab in parsedTabs" 
        :key="tab.label"
        :class="{ active: activeTab === tab.label }"
        @click="activeTab = tab.label"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="code-container">
      <pre><code>{{ getCurrentCode() }}</code></pre>
      <button @click="copyCode" class="copy-btn" :title="copied ? 'Copied!' : 'Copy to clipboard'">
        {{ copied ? '✓' : '📋' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  tabs: {
    type: [Array, String],
    default: () => []
  },
  defaultTab: {
    type: String,
    default: ''
  }
})

const activeTab = ref('')
const copied = ref(false)

// Parse tabs prop - handles both array and JSON string
const parsedTabs = computed(() => {
  if (!props.tabs || (Array.isArray(props.tabs) && props.tabs.length === 0)) {
    return []
  }
  
  if (typeof props.tabs === 'string') {
    try {
      return JSON.parse(props.tabs)
    } catch (error) {
      console.warn('Invalid JSON in tabs prop:', error)
      return []
    }
  }
  
  return props.tabs
})

const getCurrentCode = () => {
  return parsedTabs.value.find(tab => tab.label === activeTab.value)?.code || ''
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(getCurrentCode())
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (error) {
    console.error('Failed to copy code:', error)
  }
}

// Set initial active tab
onMounted(() => {
  if (parsedTabs.value.length > 0) {
    if (props.defaultTab && parsedTabs.value.some(tab => tab.label === props.defaultTab)) {
      activeTab.value = props.defaultTab
    } else {
      activeTab.value = parsedTabs.value[0].label
    }
  }
})
</script>

<style scoped>
.code-group {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  background: var(--vp-c-bg);
}

.tabs {
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-border);
  display: flex;
  flex-wrap: wrap;
}

.tabs button {
  padding: 10px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  flex-shrink: 0;
}

.tabs button:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
}

.tabs button.active {
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.code-container {
  position: relative;
  background: var(--vp-code-block-bg);
}

.code-container pre {
  margin: 0;
  padding: 20px;
  overflow-x: auto;
  background: var(--vp-code-block-bg);
  color: var(--vp-code-block-color);
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 1.5;
}

.code-container pre code {
  background: transparent;
  padding: 0;
  font-size: inherit;
  color: inherit;
  white-space: pre;
}

.copy-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--vp-code-copy-code-bg, rgba(255,255,255,0.1));
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 12px;
  color: var(--vp-c-text-2);
  transition: all 0.2s ease;
  opacity: 0.8;
  min-width: 32px;
  text-align: center;
}

.copy-btn:hover {
  background: var(--vp-code-copy-code-hover-bg, rgba(255,255,255,0.2));
  opacity: 1;
  transform: translateY(-1px);
}

.copy-btn:active {
  transform: translateY(0) scale(0.95);
}

/* Responsive design */
@media (max-width: 640px) {
  .tabs button {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .code-container pre {
    padding: 16px;
    font-size: 13px;
  }
  
  .copy-btn {
    top: 8px;
    right: 8px;
    padding: 4px 8px;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .copy-btn {
    background: rgba(255,255,255,0.1);
  }
  
  .copy-btn:hover {
    background: rgba(255,255,255,0.2);
  }
}
</style>