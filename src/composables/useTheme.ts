import { ref, computed, watch } from 'vue'

export interface Theme {
  id: string
  name: string
  colors: {
    // Background colors
    bg: {
      primary: string
      secondary: string
      tertiary: string
    }
    // Text colors
    text: {
      primary: string
      secondary: string
      tertiary: string
    }
    // Border colors
    border: {
      primary: string
      secondary: string
    }
    // Accent colors
    accent: {
      primary: string
      secondary: string
      success: string
      error: string
      warning: string
    }
    // Interactive elements
    interactive: {
      hover: string
      active: string
    }
  }
}

const themes: Record<string, Theme> = {
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      bg: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6'
      },
      text: {
        primary: '#111827',
        secondary: '#6b7280',
        tertiary: '#9ca3af'
      },
      border: {
        primary: '#e5e7eb',
        secondary: '#d1d5db'
      },
      accent: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b'
      },
      interactive: {
        hover: '#f3f4f6',
        active: '#e5e7eb'
      }
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      bg: {
        primary: '#111827',
        secondary: '#1f2937',
        tertiary: '#374151'
      },
      text: {
        primary: '#f9fafb',
        secondary: '#d1d5db',
        tertiary: '#9ca3af'
      },
      border: {
        primary: '#374151',
        secondary: '#4b5563'
      },
      accent: {
        primary: '#3b82f6',
        secondary: '#60a5fa',
        success: '#34d399',
        error: '#f87171',
        warning: '#fbbf24'
      },
      interactive: {
        hover: '#374151',
        active: '#4b5563'
      }
    }
  },
  gruvbox: {
    id: 'gruvbox',
    name: 'Gruvbox Dark',
    colors: {
      bg: {
        primary: '#282828',
        secondary: '#3c3836',
        tertiary: '#504945'
      },
      text: {
        primary: '#ebdbb2',
        secondary: '#d5c4a1',
        tertiary: '#bdae93'
      },
      border: {
        primary: '#504945',
        secondary: '#665c54'
      },
      accent: {
        primary: '#458588',
        secondary: '#83a598',
        success: '#98971a',
        error: '#cc241d',
        warning: '#d79921'
      },
      interactive: {
        hover: '#3c3836',
        active: '#504945'
      }
    }
  }
}

const currentThemeId = ref<string>('light')

// Load theme from localStorage on initialization
const savedTheme = localStorage.getItem('theme')
if (savedTheme && themes[savedTheme]) {
  currentThemeId.value = savedTheme
}

const currentTheme = computed(() => themes[currentThemeId.value])

const setTheme = (themeId: string) => {
  if (themes[themeId]) {
    currentThemeId.value = themeId
    localStorage.setItem('theme', themeId)
    applyThemeToDOM()
  }
}

const applyThemeToDOM = () => {
  const theme = currentTheme.value
  const root = document.documentElement

  // Apply CSS custom properties
  Object.entries(theme.colors).forEach(([category, colors]) => {
    Object.entries(colors).forEach(([name, value]) => {
      root.style.setProperty(`--color-${category}-${name}`, value)
    })
  })

  // Set data attribute for CSS targeting
  root.setAttribute('data-theme', theme.id)
}

// Watch for theme changes and apply them
watch(currentTheme, applyThemeToDOM, { immediate: true })

export function useTheme() {
  return {
    themes: Object.values(themes),
    currentTheme,
    currentThemeId,
    setTheme
  }
}

// CSS classes that map to our theme variables
export const themeClasses = {
  bg: {
    primary: 'bg-theme-primary',
    secondary: 'bg-theme-secondary',
    tertiary: 'bg-theme-tertiary'
  },
  text: {
    primary: 'text-theme-primary',
    secondary: 'text-theme-secondary',
    tertiary: 'text-theme-tertiary'
  },
  border: {
    primary: 'border-theme-primary',
    secondary: 'border-theme-secondary'
  }
}
