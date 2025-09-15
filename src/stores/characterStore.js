import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWeaponStore } from './weaponStore'

export const useCharacterStore = defineStore('character', () => {
  // State
  const templates = ref([])
  const playerGroups = ref([])
  const encounterGroups = ref([]) // NPC/Gegner Gruppen
  
  // Actions
  const addTemplate = (template) => {
    // Stelle sicher dass hp immer ein Objekt ist
    let hpObject = { current: 10, max: 10 }
    if (typeof template.hp === 'number') {
      hpObject = { current: template.hp, max: template.hp }
    } else if (template.hp && typeof template.hp === 'object') {
      hpObject = {
        current: template.hp.current || template.hp.max || 10,
        max: template.hp.max || 10
      }
    }
    
    const newTemplate = {
      id: Date.now() + Math.random(),
      name: template.name || 'Unbekannt',
      type: template.type || 'npc', // 'player' oder 'npc'
      category: template.category || 'default', // 'player', 'monster', 'boss', etc
      tags: template.tags || [], // Neue Tags für bessere Kategorisierung
      hp: hpObject,
      armorIds: template.armorIds || [], // List of equipped armor IDs
      talents: template.talents || [],
      attributes: template.attributes || {},
      weaponInstances: template.weaponInstances || [], // Multiple instances of same weapon
      skills: template.skills || {},
      notes: template.notes || '',
      system: template.system || 'wh40k'
    }
    templates.value.push(newTemplate)
    saveTemplates()
    return newTemplate
  }
  
  const updateTemplate = (id, updates) => {
    const template = templates.value.find(t => t.id === id)
    if (template) {
      Object.assign(template, updates)
      saveTemplates()
    }
  }
  
  const removeTemplate = (id) => {
    const index = templates.value.findIndex(t => t.id === id)
    if (index !== -1) {
      templates.value.splice(index, 1)
      saveTemplates()
    }
  }
  
  const duplicateTemplate = (id) => {
    const template = templates.value.find(t => t.id === id)
    if (template) {
      const copy = { ...template, name: `${template.name} (Kopie)` }
      delete copy.id
      return addTemplate(copy)
    }
  }
  
  // Player Groups
  const addPlayerGroup = (group) => {
    const newGroup = {
      id: Date.now() + Math.random(),
      name: group.name || 'Neue Gruppe',
      playerIds: group.playerIds || [],
      isActive: group.isActive || false
    }
    playerGroups.value.push(newGroup)
    saveTemplates()
    return newGroup
  }
  
  const setActiveGroup = (groupId) => {
    playerGroups.value.forEach(g => {
      g.isActive = g.id === groupId
    })
    saveTemplates()
  }
  
  const getActivePlayerTemplates = () => {
    const activeGroup = playerGroups.value.find(g => g.isActive)
    if (!activeGroup) return []
    
    return templates.value.filter(t => 
      activeGroup.playerIds.includes(t.id)
    )
  }
  
  // Encounter Groups (NPC Gruppen)
  const addEncounterGroup = (group) => {
    const newGroup = {
      id: Date.now() + Math.random(),
      name: group.name || 'Neues Encounter',
      description: group.description || '',
      npcIds: group.npcIds || [],
      difficulty: group.difficulty || 'medium' // easy, medium, hard, deadly
    }
    encounterGroups.value.push(newGroup)
    saveTemplates()
    return newGroup
  }
  
  const updateEncounterGroup = (id, updates) => {
    const group = encounterGroups.value.find(g => g.id === id)
    if (group) {
      Object.assign(group, updates)
      saveTemplates()
    }
  }
  
  const removeEncounterGroup = (id) => {
    const index = encounterGroups.value.findIndex(g => g.id === id)
    if (index !== -1) {
      encounterGroups.value.splice(index, 1)
      saveTemplates()
    }
  }
  
  const getEncounterNPCs = (groupId) => {
    const group = encounterGroups.value.find(g => g.id === groupId)
    if (!group) return []
    return templates.value.filter(t => group.npcIds.includes(t.id))
  }
  
   const prepareEncounterForCombat = (encounter) => {
    let npcsToAdd = []
    
    // Nutze die neue npcEntries Struktur wenn vorhanden
    if (encounter.npcEntries && encounter.npcEntries.length > 0) {
      encounter.npcEntries.forEach(entry => {
        const template = templates.value.find(t => t.id === entry.npcId)
        if (template) {
          // Füge so viele Kopien hinzu wie count angibt
          for (let i = 0; i < entry.count; i++) {
            const nameSuffix = entry.count > 1 ? ` ${i + 1}` : ''
            npcsToAdd.push({
              name: template.name + nameSuffix,
              type: 'npc',
              hp: template.hp?.max || template.hp || 10,
              armorIds: template.armorIds || [],
              attributes: template.attributes,
              talents: template.talents || [],
              weaponInstances: template.weaponInstances || template.weapons || []
            })
          }
        }
      })
    } else if (encounter.npcIds && encounter.npcIds.length > 0) {
      // Fallback auf alte npcIds Struktur - gruppiere gleiche IDs
      const npcCounts = {}
      encounter.npcIds.forEach(id => {
        npcCounts[id] = (npcCounts[id] || 0) + 1
      })
      
      Object.entries(npcCounts).forEach(([id, count]) => {
        const template = templates.value.find(t => t.id === parseFloat(id))
        if (template) {
          for (let i = 0; i < count; i++) {
            const nameSuffix = count > 1 ? ` ${i + 1}` : ''
            npcsToAdd.push({
              name: template.name + nameSuffix,
              type: 'npc',
              hp: template.hp?.max || template.hp || 10,
              armorIds: template.armorIds || [],
              attributes: template.attributes,
              talents: template.talents || [],
              weaponInstances: template.weaponInstances || template.weapons || []
            })
          }
        }
      })
    }
    
    return npcsToAdd
  }

  // Getters
  const getTemplatesByCategory = (category) => {
    return templates.value.filter(t => t.category === category)
  }
  
  const getPlayerTemplates = () => {
    return templates.value.filter(t => t.type === 'player')
  }
  
  const getNPCTemplates = () => {
    return templates.value.filter(t => t.type === 'npc')
  }
  
  // Neue Tag-basierte Funktionen
  const getTemplatesByTags = (tags) => {
    if (!tags || tags.length === 0) return templates.value
    return templates.value.filter(t => {
      if (!t.tags || t.tags.length === 0) return false
      return tags.some(tag => t.tags.includes(tag))
    })
  }
  
  const getAllTags = () => {
    const tagSet = new Set()
    templates.value.forEach(t => {
      if (t.tags && Array.isArray(t.tags)) {
        t.tags.forEach(tag => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }
  
  // Persistence
  const saveTemplates = () => {
    localStorage.setItem('characterTemplates', JSON.stringify({
      templates: templates.value,
      playerGroups: playerGroups.value,
      encounterGroups: encounterGroups.value
    }))
  }
  
  const loadTemplates = () => {
    const saved = localStorage.getItem('characterTemplates')
    if (saved) {
      const data = JSON.parse(saved)
      templates.value = data.templates || []
      playerGroups.value = data.playerGroups || []
      encounterGroups.value = data.encounterGroups || []
    }
    
    // Füge Standard-Templates hinzu wenn leer
    if (templates.value.length === 0) {
      addDefaultTemplates()
    }
  }
  
  // Export/Import Functions
  const exportTemplates = () => {
    const exportData = {
      version: '1.1',
      exportDate: new Date().toISOString(),
      templates: templates.value,
      playerGroups: playerGroups.value,
      encounterGroups: encounterGroups.value
    }
    
    try {
      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `spielleiter-templates-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // console.log('Templates exportiert nach Downloads-Ordner')
      return { success: true, data: exportData }
    } catch (error) {
      console.error('Export error:', error)
      return { success: false, error: error.message }
    }
  }
  
  const importTemplates = (jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
      
      if (!data.templates) {
        throw new Error('Keine Templates in der Datei gefunden')
      }
      
      // Option 1: Merge with existing templates
      const importedTemplates = data.templates.map(template => ({
        ...template,
        id: Date.now() + Math.random() // Generate new IDs to avoid conflicts
      }))
      
      templates.value = [...templates.value, ...importedTemplates]
      
      // Import player groups if present
      if (data.playerGroups) {
        const importedGroups = data.playerGroups.map(group => ({
          ...group,
          id: Date.now() + Math.random()
        }))
        playerGroups.value = [...playerGroups.value, ...importedGroups]
      }
      
      // Import encounter groups if present
      if (data.encounterGroups) {
        const importedEncounters = data.encounterGroups.map(group => ({
          ...group,
          id: Date.now() + Math.random()
        }))
        encounterGroups.value = [...encounterGroups.value, ...importedEncounters]
      }
      
      saveTemplates()
      
      return {
        success: true,
        templatesImported: importedTemplates.length,
        groupsImported: data.playerGroups ? data.playerGroups.length : 0,
        encountersImported: data.encounterGroups ? data.encounterGroups.length : 0
      }
    } catch (error) {
      console.error('Import error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  const resetToDefaultTemplates = () => {
    // Clear all existing data
    templates.value = []
    playerGroups.value = []
    encounterGroups.value = []
    
    // Add default templates
    addDefaultTemplates()
    
    // Save to localStorage
    saveTemplates()
    
    return {
      success: true,
      templatesAdded: templates.value.length
    }
  }
  
  const replaceAllTemplates = (jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
      
      if (!data.templates) {
        throw new Error('Keine Templates in der Datei gefunden')
      }
      
      // Replace all existing templates
      templates.value = data.templates
      playerGroups.value = data.playerGroups || []
      encounterGroups.value = data.encounterGroups || []
      
      saveTemplates()
      
      return {
        success: true,
        templatesImported: data.templates.length,
        groupsImported: data.playerGroups ? data.playerGroups.length : 0,
        encountersImported: data.encounterGroups ? data.encounterGroups.length : 0
      }
    } catch (error) {
      console.error('Replace error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  const addDefaultTemplates = () => {
    // Get weapon store for weapon templates
    const weaponStore = useWeaponStore()
    
    // WH40k Piraten
    addTemplate({
      name: 'Pirat',
      type: 'npc',
      category: 'minion',
      tags: ['Mensch', 'Verbrecher', 'Pirat'],
      hp: 9,
      toughness: 30,
      system: 'wh40k',
      armorIds: ['armor_10'], // Xeno-Aramid
      attributes: {
        KG: 30, BF: 30, ST: 30, WI: 30,
        GE: 35, IN: 25, WA: 30, WK: 25, CH: 25
      },
      weaponInstances: [
        weaponStore?.getWeaponByName('Laspistole') || { name: 'Laspistole', damage: '1d10+2', pen: 0, rof: 'E/2/-', mag: 30, reload: 0.5 },
        weaponStore?.getWeaponByName('Monoschwert') || { name: 'Monoschwert', damage: '1d10+2', pen: 2, rof: '-/-/-', mag: 0, reload: 0 }
      ],
      notes: 'Void-Born Pirat, Teil einer Piraten-Crew'
    })
    
    addTemplate({
      name: 'Piraten-Kapitän',
      type: 'npc',
      category: 'elite',
      tags: ['Mensch', 'Verbrecher', 'Pirat', 'Anführer'],
      hp: 14,
      toughness: 35,
      system: 'wh40k',
      armorIds: ['armor_11', 'armor_9'], // Aramidkampfmantel + Aramidkapuze
      attributes: {
        KG: 40, BF: 38, ST: 35, WI: 35,
        GE: 40, IN: 30, WA: 35, WK: 35, CH: 40
      },
      weaponInstances: [
        weaponStore?.getWeaponByName('Boltpistole') || { name: 'Boltpistole', damage: '1d10+5', pen: 4, rof: 'E/2/-', mag: 8, reload: 1 },
        weaponStore?.getWeaponByName('Energieschwert') || { name: 'Energieschwert', damage: '1d10+5', pen: 5, rof: '-/-/-', mag: 0, reload: 0 }
      ],
      notes: 'Erfahrener Raumpiraten-Anführer'
    })
    
    // Chaos Kultisten
    addTemplate({
      name: 'Chaos Kultist',
      type: 'npc',
      category: 'minion',
      tags: ['Mensch', 'Chaos', 'Kultist'],
      hp: 8,
      toughness: 30,
      system: 'wh40k',
      armorIds: ['armor_1'], // Schweres Leder/Felle
      attributes: {
        KG: 25, BF: 25, ST: 30, WI: 30,
        GE: 30, IN: 20, WA: 25, WK: 20, CH: 20
      },
      weaponInstances: [
        weaponStore?.getWeaponByName('Autopistole') || { name: 'Autopistole', damage: '1d10+2', pen: 0, rof: 'E/6/-', mag: 18, reload: 1 },
        weaponStore?.getWeaponByName('Messer') || { name: 'Messer', damage: '1d5', pen: 0, rof: '-/-/-', mag: 0, reload: 0 }
      ],
      notes: 'Wahnsinniger Anhänger der dunklen Götter'
    })
    
    addTemplate({
      name: 'Chaos Prediger',
      type: 'npc',
      category: 'elite',
      tags: ['Mensch', 'Chaos', 'Kultist', 'Anführer'],
      hp: 12,
      toughness: 32,
      system: 'wh40k',
      armorIds: ['armor_6'], // Armaplastumhang
      attributes: {
        KG: 30, BF: 28, ST: 30, WI: 32,
        GE: 30, IN: 35, WA: 30, WK: 40, CH: 45
      },
      weaponInstances: [
        weaponStore?.getWeaponByName('Stub Revolver') || { name: 'Stub Revolver', damage: '1d10+3', pen: 0, rof: 'E/-/-', mag: 6, reload: 2 },
        weaponStore?.getWeaponByName('Seuchendolch') || { name: 'Seuchendolch', damage: '1d5+3', pen: 2, rof: '-/-/-', mag: 0, reload: 0 }
      ],
      notes: 'Charismatischer Anführer eines Chaos-Kults'
    })
    
    addTemplate({
      name: 'Chaos Space Marine (Verwundet)',
      type: 'npc',
      category: 'boss',
      tags: ['Space Marine', 'Chaos', 'Boss'],
      hp: 20,
      toughness: 45,
      system: 'wh40k',
      armorIds: ['armor_16'], // Gardisten-Plattenrüstung (beschädigt)
      attributes: {
        KG: 45, BF: 40, ST: 50, WI: 45,
        GE: 35, IN: 35, WA: 35, WK: 40, CH: 30
      },
      weaponInstances: [
        weaponStore?.getWeaponByName('Bolter') || { name: 'Bolter', damage: '1d10+5', pen: 4, rof: 'E/3/6', mag: 24, reload: 1 },
        weaponStore?.getWeaponByName('Kettenschwert') || { name: 'Kettenschwert', damage: '1d10+4', pen: 3, rof: '-/-/-', mag: 0, reload: 0 }
      ],
      notes: 'Schwerverw undeter Chaos Marine - immer noch tödlich'
    })
    
    // Dämonen und besessene
    addTemplate({
      name: 'Kleiner Warpgeist',
      type: 'npc',
      category: 'minion',
      tags: ['Dämon', 'Warp', 'Geist'],
      hp: 6,
      toughness: 25,
      system: 'wh40k',
      armorIds: [], // Keine Rüstung
      attributes: {
        KG: 30, BF: 0, ST: 20, WI: 25,
        GE: 40, IN: 15, WA: 30, WK: 25, CH: 10
      },
      weaponInstances: [
        weaponStore?.getWeaponByName('Klauen') || { name: 'Klauen', damage: '1d10+2', pen: 2, rof: '-/-/-', mag: 0, reload: 0 }
      ],
      notes: 'Schwacher Dämon aus dem Warp'
    })
    
    addTemplate({
      name: 'Besessener Kultist',
      type: 'npc',
      category: 'elite',
      tags: ['Mensch', 'Chaos', 'Dämon', 'Besessen'],
      hp: 13,
      toughness: 38,
      system: 'wh40k',
      armorIds: ['armor_1'], // Zerrissene Kleidung/Felle
      attributes: {
        KG: 38, BF: 20, ST: 40, WI: 38,
        GE: 35, IN: 15, WA: 25, WK: 30, CH: 5
      },
      weaponInstances: [
        weaponStore?.getWeaponByName('Klauen') || { name: 'Klauen', damage: '1d10+2', pen: 2, rof: '-/-/-', mag: 0, reload: 0 },
        weaponStore?.getWeaponByName('Biss') || { name: 'Biss', damage: '1d10+3', pen: 3, rof: '-/-/-', mag: 0, reload: 0 }
      ],
      notes: 'Von einem Dämon besessener Kultist'
    })
    
    addTemplate({
      name: 'Seuchenverehrer',
      type: 'npc',
      category: 'elite',
      tags: ['Mensch', 'Chaos', 'Nurgle', 'Kultist'],
      hp: 15,
      toughness: 40,
      system: 'wh40k',
      armorIds: ['armor_2'], // Groxfelle/Kettenrüstung
      attributes: {
        KG: 35, BF: 25, ST: 35, WI: 40,
        GE: 20, IN: 25, WA: 25, WK: 35, CH: 15
      },
      weaponInstances: [
        weaponStore?.getWeaponByName('Schrotflinte') || { name: 'Schrotflinte', damage: '1d10+4', pen: 0, rof: 'E/2/-', mag: 8, reload: 2 },
        weaponStore?.getWeaponByName('Seuchendolch') || { name: 'Seuchendolch', damage: '1d5+3', pen: 2, rof: '-/-/-', mag: 0, reload: 0 }
      ],
      notes: 'Nurgle-Anhänger, unnatürlich zäh'
    })
    
    addTemplate({
      name: 'Warp-Hexe',
      type: 'npc',
      category: 'boss',
      tags: ['Mensch', 'Psioniker', 'Chaos', 'Hexe'],
      hp: 11,
      toughness: 30,
      system: 'wh40k',
      armorIds: ['armor_6'], // Armaplastumhang
      attributes: {
        KG: 25, BF: 30, ST: 25, WI: 30,
        GE: 35, IN: 40, WA: 35, WK: 45, CH: 35
      },
      weaponInstances: [
        weaponStore?.getWeaponByName('Laspistole') || { name: 'Laspistole', damage: '1d10+2', pen: 0, rof: 'E/2/-', mag: 30, reload: 0.5 },
        weaponStore?.getWeaponByName('Stab') || { name: 'Stab', damage: '1d10', pen: 0, rof: '-/-/-', mag: 0, reload: 0 }
      ],
      notes: 'Psioniker mit Warp-Kräften (Homebrew Psikräfte erforderlich)'
    })
    
    addTemplate({
      name: 'Blutkultist-Berserker',
      type: 'npc',
      category: 'elite',
      tags: ['Mensch', 'Chaos', 'Khorne', 'Berserker'],
      hp: 12,
      toughness: 32,
      system: 'wh40k',
      armorIds: ['armor_2'], // Groxfelle/Kettenrüstung
      attributes: {
        KG: 42, BF: 20, ST: 38, WI: 32,
        GE: 38, IN: 20, WA: 25, WK: 25, CH: 20
      },
      weaponInstances: [
        weaponStore?.getWeaponByName('Kettenaxt') || { name: 'Kettenaxt', damage: '1d10+4', pen: 3, rof: '-/-/-', mag: 0, reload: 0 },
        weaponStore?.getWeaponByName('Kettenaxt') || { name: 'Kettenaxt', damage: '1d10+4', pen: 3, rof: '-/-/-', mag: 0, reload: 0 }
      ],
      notes: 'Khorne-Anhänger, kämpft mit zwei Waffen'
    })
  }
  
  // Die Export/Import Funktionen sind bereits oben definiert
  
  // Load on store creation
  loadTemplates()
  
  return {
    // State
    templates,
    playerGroups,
    encounterGroups,
    // Template Actions
    addTemplate,
    updateTemplate,
    removeTemplate,
    duplicateTemplate,
    // Group Actions
    addPlayerGroup,
    setActiveGroup,
    prepareEncounterForCombat,
    getActivePlayerTemplates,
    // Encounter Groups
    addEncounterGroup,
    updateEncounterGroup,
    removeEncounterGroup,
    getEncounterNPCs,
    // Getters
    getTemplatesByCategory,
    getPlayerTemplates,
    getNPCTemplates,
    getTemplatesByTags,
    getAllTags,
    // Persistence
    saveTemplates,
    loadTemplates,
    exportTemplates,
    importTemplates,
    replaceAllTemplates,
    resetToDefaultTemplates
  }
})