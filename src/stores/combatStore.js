import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCombatStore = defineStore('combat', () => {
  // State
  const combatants = ref([])
  const currentTurn = ref(0)
  const roundNumber = ref(1)
  const isInCombat = ref(false)
  
  // Getters
  const sortedCombatants = computed(() => {
    return [...combatants.value].sort((a, b) => b.initiative - a.initiative)
  })
  
  const currentCombatant = computed(() => {
    if (sortedCombatants.value.length === 0) return null
    return sortedCombatants.value[currentTurn.value]
  })
  
  // Actions
  const addCombatant = (combatant) => {
    // Konvertiere alte weapons zu weaponInstances wenn nötig
    let weaponInstances = combatant.weaponInstances || []
    
    // Fallback: Wenn weaponInstances leer ist aber weapons vorhanden, konvertiere
    if ((!weaponInstances || weaponInstances.length === 0) && combatant.weapons && combatant.weapons.length > 0) {
      weaponInstances = combatant.weapons.map(w => ({
        ...w,
        instanceId: Date.now() + Math.random()
      }))
    }
    
    // Füge Munitions-Tracking zu Waffen-Instanzen hinzu
    const weaponInstancesWithAmmo = weaponInstances.map(w => ({
      ...w,
      currentAmmo: w.currentAmmo !== undefined ? w.currentAmmo : (w.mag || 0),
      isReloading: w.isReloading || false,
      reloadTimeLeft: w.reloadTimeLeft || 0
    }))
    
    const newCombatant = {
      id: Date.now() + Math.random(),
      name: combatant.name || 'Unbekannt',
      type: combatant.type || 'npc', // 'player' oder 'npc'
      initiative: combatant.initiative || 0,
      initiativeModifier: combatant.initiativeModifier || 0,
      hp: {
        current: combatant.hp?.current || combatant.hp || 10,
        max: combatant.hp?.max || combatant.hp || 10
      },
      armorIds: combatant.armorIds || [],
      attributes: combatant.attributes || {},
      skills: combatant.skills || {},
      weaponInstances: weaponInstancesWithAmmo,
      notes: combatant.notes || '',
      conditions: combatant.conditions || [],
      isActive: true
    }
    combatants.value.push(newCombatant)
    return newCombatant
  }
  
  const removeCombatant = (id) => {
    const index = combatants.value.findIndex(c => c.id === id)
    if (index !== -1) {
      combatants.value.splice(index, 1)
    }
  }
  
  const updateCombatant = (id, updates) => {
    const combatant = combatants.value.find(c => c.id === id)
    if (combatant) {
      Object.assign(combatant, updates)
    }
  }
  
  const rollInitiative = (combatantId, diceRoll) => {
    const combatant = combatants.value.find(c => c.id === combatantId)
    if (combatant) {
      combatant.initiative = diceRoll + (combatant.initiativeModifier || 0)
    }
  }
  
  const rollAllInitiatives = (diceType = 'd10') => {
    combatants.value.forEach(combatant => {
      if (combatant.type === 'npc') {
        // Würfle automatisch für NPCs
        const roll = diceType === 'd20' ? 
          Math.floor(Math.random() * 20) + 1 :
          Math.floor(Math.random() * 10) + 1
        combatant.initiative = roll + (combatant.initiativeModifier || 0)
      }
    })
  }
  
  const startCombat = () => {
    isInCombat.value = true
    currentTurn.value = 0
    roundNumber.value = 1
  }
  
  const endCombat = () => {
    isInCombat.value = false
    currentTurn.value = 0
    roundNumber.value = 1
    combatants.value = [] // Clear all combatants when ending combat
  }
  
  const nextTurn = () => {
    // Reduziere Nachladezeit für den aktuellen Kämpfer
    const current = sortedCombatants.value[currentTurn.value]
    if (current && current.weaponInstances) {
      current.weaponInstances.forEach(weapon => {
        if (weapon.isReloading && weapon.reloadTimeLeft > 0) {
          weapon.reloadTimeLeft -= 1
          if (weapon.reloadTimeLeft <= 0) {
            weapon.isReloading = false
            weapon.currentAmmo = weapon.mag
          }
        }
      })
    }
    
    currentTurn.value++
    if (currentTurn.value >= sortedCombatants.value.length) {
      currentTurn.value = 0
      roundNumber.value++
    }
  }
  
  const previousTurn = () => {
    currentTurn.value--
    if (currentTurn.value < 0) {
      if (roundNumber.value > 1) {
        roundNumber.value--
        currentTurn.value = sortedCombatants.value.length - 1
      } else {
        currentTurn.value = 0
      }
    }
  }
  
  const dealDamage = (combatantId, amount) => {
    const combatant = combatants.value.find(c => c.id === combatantId)
    if (combatant) {
      combatant.hp.current = Math.max(0, combatant.hp.current - amount)
    }
  }
  
  const healDamage = (combatantId, amount) => {
    const combatant = combatants.value.find(c => c.id === combatantId)
    if (combatant) {
      combatant.hp.current = Math.min(combatant.hp.max, combatant.hp.current + amount)
    }
  }
  
  const clearCombat = () => {
    combatants.value = []
    currentTurn.value = 0
    roundNumber.value = 1
    isInCombat.value = false
  }
  
  // Munitions-Management
  const useAmmo = (combatantId, weaponIndex, amount) => {
    const combatant = combatants.value.find(c => c.id === combatantId)
    if (combatant && combatant.weaponInstances && combatant.weaponInstances[weaponIndex]) {
      const weapon = combatant.weaponInstances[weaponIndex]
      weapon.currentAmmo = Math.max(0, weapon.currentAmmo - amount)
      return weapon.currentAmmo
    }
    return 0
  }
  
  const reloadWeapon = (combatantId, weaponIndex) => {
    const combatant = combatants.value.find(c => c.id === combatantId)
    if (combatant && combatant.weaponInstances && combatant.weaponInstances[weaponIndex]) {
      const weapon = combatant.weaponInstances[weaponIndex]
      weapon.isReloading = true
      weapon.reloadTimeLeft = weapon.reload || 1
      
      // Wenn Nachladezeit < 1 (halbe Aktion), lade sofort
      if (weapon.reload <= 0.5) {
        weapon.isReloading = false
        weapon.currentAmmo = weapon.mag
      }
    }
  }
  
  const getWeaponStatus = (weapon) => {
    if (!weapon) return ''
    if (weapon.isReloading) {
      return `Lädt nach (${weapon.reloadTimeLeft} Aktion${weapon.reloadTimeLeft > 1 ? 'en' : ''})`
    }
    if (weapon.mag > 0) {
      return `${weapon.currentAmmo}/${weapon.mag} Schuss`
    }
    return ''
  }
  
  // Persistence
  const saveCombat = () => {
    const combatState = {
      combatants: combatants.value,
      currentTurn: currentTurn.value,
      roundNumber: roundNumber.value,
      isInCombat: isInCombat.value
    }
    localStorage.setItem('combatState', JSON.stringify(combatState))
  }
  
  const loadCombat = () => {
    const saved = localStorage.getItem('combatState')
    if (saved) {
      const state = JSON.parse(saved)
      combatants.value = state.combatants || []
      
      // Migriere alte Waffen-Formate
      combatants.value.forEach(combatant => {
        if (combatant.weapons) {
          combatant.weapons = combatant.weapons.map(weapon => {
            // Wenn rof das alte Format ist (single string ohne /)
            if (weapon.rof && typeof weapon.rof === 'string' && !weapon.rof.includes('/')) {
              weapon.rof = 'E/-/-' // Default für alte Waffen
            } else if (!weapon.rof || typeof weapon.rof !== 'string') {
              weapon.rof = 'E/-/-' // Default wenn rof fehlt oder kein String ist
            }
            // Stelle sicher dass currentAmmo existiert
            if (weapon.mag > 0 && weapon.currentAmmo === undefined) {
              weapon.currentAmmo = weapon.mag
            }
            return weapon
          })
        }
      })
      
      currentTurn.value = state.currentTurn || 0
      roundNumber.value = state.roundNumber || 1
      isInCombat.value = state.isInCombat || false
    }
  }
  
  return {
    // State
    combatants,
    currentTurn,
    roundNumber,
    isInCombat,
    // Getters
    sortedCombatants,
    currentCombatant,
    // Actions
    addCombatant,
    removeCombatant,
    updateCombatant,
    rollInitiative,
    rollAllInitiatives,
    startCombat,
    endCombat,
    nextTurn,
    previousTurn,
    dealDamage,
    healDamage,
    clearCombat,
    // Munitions-Management
    useAmmo,
    reloadWeapon,
    getWeaponStatus,
    // Persistence
    saveCombat,
    loadCombat
  }
})