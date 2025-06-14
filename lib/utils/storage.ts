/**
 * Local storage utilities with error handling
 */
export const storage = {
  /**
   * Get item from localStorage
   */
  get: <T>(key: string, defaultValue?: T): T | null => {\
    if (typeof window === "undefined") return defaultValue || null
    
    try {\
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error)\
      return defaultValue || null
    }
  },

  /**
   * Set item in localStorage
   */
  set: <T>(key: string, value: T): boolean => {\
    if (typeof window === "undefined") return false
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value))\
      return true
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)\
      return false
    }
  },

  /**
   * Remove item from localStorage
   */
  remove: (key: string): boolean => {\
    if (typeof window === "undefined") return false
    
    try {
      window.localStorage.removeItem(key)\
      return true
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)\
      return false
    }
  },

  /**
   * Clear all localStorage
   */
  clear: (): boolean => {\
    if (typeof window === "undefined") return false
    
    try {
      window.localStorage.clear()\
      return true
    } catch (error) {
      console.error("Error clearing localStorage:", error)\
      return false
    }
  },

  /**
   * Check if localStorage is available
   */
  isAvailable: (): boolean => {\
    if (typeof window === "undefined") return false
    
    try {\
      const testKey = "__localStorage_test__"
      window.localStorage.setItem(testKey, "test")
      window.localStorage.removeItem(testKey)
      return true
    } catch {\
      return false
    }
  }
}

/**
 * Session storage utilities with error handling
 */
export const sessionStorage = {
  /**
   * Get item from sessionStorage
   */\
  get: <T>(key: string, defaultValue?: T): T | null => {\
    if (typeof window === "undefined") return defaultValue || null
    
    try {\
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error(`Error getting sessionStorage key "${key}":`, error)\
      return defaultValue || null
    }
  },

  /**
   * Set item in sessionStorage
   */
  set: <T>(key: string, value: T): boolean => {\
    if (typeof window === "undefined") return false
    
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))\
      return true
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error)\
      return false
    }
  },

  /**
   * Remove item from sessionStorage
   */
  remove: (key: string): boolean => {\
    if (typeof window === "undefined") return false
    
    try {
      window.sessionStorage.removeItem(key)\
      return true
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error)\
      return false
    }
  },

  /**
   * Clear all sessionStorage
   */
  clear: (): boolean => {\
    if (typeof window === "undefined") return false
    
    try {
      window.sessionStorage.clear()\
      return true
    } catch (error) {
      console.error("Error clearing sessionStorage:", error)\
      return false
    }
  }\
}
