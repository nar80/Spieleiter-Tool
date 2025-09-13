import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSystemStore = defineStore('system', () => {
  // State
  const selectedSystem = ref('wh40k')
  
  // System configurations
  const systemConfigs = {
    wh40k: {
      name: 'Warhammer 40k',
      initiativeDice: 'd10',
      initiativeLabel: 'W10 (WH40k)',
      attributes: ['WS', 'BS', 'S', 'T', 'Ag', 'Int', 'Per', 'WP', 'Fel']
    },
    dnd5e: {
      name: 'D&D 5e',
      initiativeDice: 'd20',
      initiativeLabel: 'W20 (D&D)',
      attributes: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
    },
    pathfinder: {
      name: 'Pathfinder',
      initiativeDice: 'd20',
      initiativeLabel: 'W20 (Pathfinder)',
      attributes: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
    },
    custom: {
      name: 'Custom',
      initiativeDice: 'd20',
      initiativeLabel: 'W20 (Custom)',
      attributes: []
    }
  }
  
  // Getters
  const currentSystem = () => systemConfigs[selectedSystem.value]
  const initiativeDice = () => currentSystem().initiativeDice
  const initiativeLabel = () => currentSystem().initiativeLabel
  
  // Actions
  const setSystem = (system) => {
    if (systemConfigs[system]) {
      selectedSystem.value = system
      saveSettings()
    }
  }
  
  // Persistence
  const saveSettings = () => {
    localStorage.setItem('systemSettings', JSON.stringify({
      selectedSystem: selectedSystem.value
    }))
  }
  
  const loadSettings = () => {
    const saved = localStorage.getItem('systemSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      selectedSystem.value = settings.selectedSystem || 'wh40k'
    }
  }
  
  // Load settings on store creation
  loadSettings()
  
  return {
    // State
    selectedSystem,
    systemConfigs,
    // Getters
    currentSystem,
    initiativeDice,
    initiativeLabel,
    // Actions
    setSystem,
    saveSettings,
    loadSettings
  }
})