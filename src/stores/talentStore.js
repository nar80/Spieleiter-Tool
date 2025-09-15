import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTalentStore = defineStore('talent', () => {
  
  const defaultTalents = [
    // ========== MECHANICUS/TECH TALENTE ==========
    {
      id: 'flesh_is_weak',
      name: 'Das Fleisch ist schwach',
      description: 'Bionische Verbesserungen gewähren +1 RP pro Level auf alle Trefferzonen und die Eigenschaft Maschine',
      shortDesc: '+1 RP pro Level',
      type: 'passive',
      stackable: true,
      maxStacks: 5,
      displayInCombat: true,
      effects: {
        armorBonus: 1, // +1 RP pro Level für alle Trefferzonen
        trait: 'machine' // Verleiht die Maschinen-Eigenschaft
      },
      requirements: ['mechanicus', 'servitor', 'tech-priest', 'techpriest'],
      system: 'wh40k'
    },
    {
      id: 'mechadendrite',
      name: 'Mechadendrit',
      description: 'Zusätzliche mechanische Gliedmaßen gewähren einen Extra-Angriff oder Tech-Use Aktion',
      shortDesc: '+1 Extra-Angriff',
      type: 'passive',
      stackable: false,
      displayInCombat: true,
      effects: {
        extraAttacks: 1,
        bonusActions: ['tech_use', 'medicae']
      },
      requirements: ['mechanicus', 'tech-priest', 'techpriest'],
      system: 'wh40k'
    },
    {
      id: 'deepanalyses',
      name: 'Tiefen Analyse',
      description: 'Durch genaue Analyse des Ziels wird das Ausweichen und die Rüstung des Ziels Reduziert. IN -10 Bei erfolg Erfolgsgrad Runden erhält das Ziel -10 ausweichen -3 RS ',
      shortDesc: 'Scann Gegner',
      type: 'active',
      stackable: false,
      displayInCombat: true,
      effects: {
        Analysiert: ['-10 Ausweichen', '-3 Rüstung'], 
      },
      requirements: ['mechanicus', 'tech-priest', 'techpriest'],
      system: 'wh40k'
    },
    {
      id: 'machine_trait',
      name: 'Maschinen-Eigenschaft',
      description: 'Immun gegen Furcht, Gift und Betäubung. Kann nur durch Tech-Use geheilt werden, nicht durch normale Medizin',
      shortDesc: 'Immun: Furcht/Gift/Betäubung',
      type: 'passive',
      stackable: false,
      displayInCombat: true,
      effects: {
        immunities: ['fear', 'poison', 'stun', 'fatigue'],
        healingType: 'tech_use_only'
      },
      requirements: ['servitor', 'machine', 'mechanicus'],
      system: 'wh40k'
    },
    {
      id: 'vox_skill',
      name: 'Unheilige-Reperatur',
      description: 'Kann mit einer Int Probe andere Maschienen reparieren heilt IN bonus Punkte',
      shortDesc: 'Reperatur',
      type: 'active',
      stackable: false,
      displayInCombat: true,
      effects: {
        healingType: 'tech_use_only'
      },
      requirements: ['maschine'],
      system: 'wh40k'
    },
    
    // ========== CHAOS/DÄMON TALENTE ==========
    {
      id: 'daemonic',
      name: 'Dämonisch',
      description: 'Dämonische Wesen halbieren allen Schaden von nicht-gesegneten oder nicht-Warp Waffen (aufgerundet)',
      shortDesc: 'Halbiert normalen Schaden',
      type: 'passive',
      stackable: false,
      displayInCombat: true,
      effects: {
        damageReduction: 0.5, // Halbiert Schaden
        ignoresWeapons: ['normal'], // Nur normale Waffen betroffen
        vulnerableTo: ['blessed', 'force', 'warp'] // Voller Schaden von diesen
      },
      requirements: ['daemon', 'possessed', 'warp'],
      system: 'wh40k'
    },
    {
      id: 'unnatural_toughness',
      name: 'Unnatürliche Widerstandskraft',
      description: 'Multipliziert den Widerstandsbonus. Level 1 = x2, Level 2 = x3, Level 3 = x4',
      shortDesc: 'Widerstandsbonus x',
      type: 'passive',
      stackable: true,
      maxStacks: 3,
      displayInCombat: true,
      effects: {
        toughnessMultiplier: 1 // +1 pro Level, also Level 1 = x2, Level 2 = x3, etc.
      },
      requirements: ['daemon', 'chaos', 'space marine', 'ork'],
      system: 'wh40k'
    },
    {
      id: 'unnatural_strength',
      name: 'Unnatürliche Stärke',
      description: 'Multipliziert den Stärkebonus für Nahkampfschaden. Level 1 = x2, Level 2 = x3',
      shortDesc: 'Stärkebonus x',
      type: 'passive',
      stackable: true,
      maxStacks: 2,
      displayInCombat: true,
      effects: {
        strengthMultiplier: 1 // +1 pro Level
      },
      requirements: ['daemon', 'chaos', 'space marine', 'ork'],
      system: 'wh40k'
    },
    {
      id: 'fear_rating',
      name: 'Furcht',
      description: 'Verursacht Furcht bei Gegnern. Gegner müssen Willenskraft-Test bestehen oder fliehen/sind gelähmt',
      shortDesc: 'Furcht ',
      type: 'passive',
      stackable: true,
      maxStacks: 4,
      displayInCombat: true,
      effects: {
        fearRating: 1 // Furcht 1-4
      },
      requirements: ['daemon', 'monster', 'xenos', 'horror'],
      system: 'wh40k'
    },
    {
      id: 'stuff_of_nightmares',
      name: 'Stoff der Albträume',
      description: 'Ignoriert kritische Treffer außer durch gesegnete/Warp-Waffen. Stirbt nur bei 0 HP durch massive Gewalt',
      shortDesc: 'Ignoriert kritische Treffer',
      type: 'passive',
      stackable: false,
      displayInCombat: true,
      effects: {
        ignoresCritical: true,
        specialDeath: true
      },
      requirements: ['daemon', 'warp'],
      system: 'wh40k'
    },
    {
      id: 'demon_fire',
      name: 'Dämonisches Feuer',
      description: 'Ein Feuer welches 5 meter um den Horror lodert. Wk zum wieder Stand min soviele erfolge wie der WK Wirkungswurf. Schaden 1W10+WKb Rüstung -1 Pro Erfolgsgrad',
      shortDesc: 'Ignoriert kritische Treffer',
      type: 'active',
      stackable: false,
      displayInCombat: true,
      effects: {
        ignoresCritical: true,
        specialDeath: true
      },
      requirements: ['dämon', 'warp'],
      system: 'wh40k'
    },
    
    // ========== KAMPF-TALENTE ==========
    {
      id: 'swift_attack',
      name: 'Schneller Angriff',
      description: 'Kann 2 Angriffe mit Nahkampfwaffen in einer Runde machen',
      shortDesc: '2 Nahkampfangriffe',
      type: 'active',
      stackable: false,
      displayInCombat: true,
      effects: {
        extraMeleeAttacks: 1
      },
      requirements: [], // Keine speziellen Requirements
      system: 'wh40k'
    },
    {
      id: 'lightning_attack',
      name: 'Blitzangriff',
      description: 'Kann 3 Angriffe mit Nahkampfwaffen in einer Runde machen',
      shortDesc: '3 Nahkampfangriffe',
      type: 'active',
      stackable: false,
      displayInCombat: true,
      effects: {
        extraMeleeAttacks: 2
      },
      requirements: [], // Braucht normalerweise Swift Attack als Voraussetzung
      system: 'wh40k'
    },
    {
      id: 'two_weapon_wielder',
      name: 'Beidhändiger Kämpfer',
      description: 'Kann mit zwei Waffen gleichzeitig angreifen ohne Malus',
      shortDesc: '2 Waffen ohne Malus',
      type: 'passive',
      stackable: false,
      displayInCombat: true,
      effects: {
        dualWield: true
      },
      requirements: [],
      system: 'wh40k'
    },
    {
      id: 'true_grit',
      name: 'Zähigkeit',
      description: 'Reduziert kritische Effekte um 2 Punkte (min. 1)',
      shortDesc: 'Kritische -2',
      type: 'passive',
      stackable: false,
      displayInCombat: true,
      effects: {
        criticalReduction: 2 // -2 auf kritische Treffer-Tabelle
      },
      requirements: [],
      system: 'wh40k'
    },
    {
      id: 'hardy',
      name: 'Abgehärtet',
      description: 'Kann Betäubung ignorieren und bleibt bei 0 HP noch 1 Runde bei Bewusstsein',
      shortDesc: 'Ignoriert Betäubung',
      type: 'passive',
      stackable: false,
      displayInCombat: true,
      effects: {
        ignoreStun: true,
        lastStand: true
      },
      requirements: [],
      system: 'wh40k'
    },
    {
      id: 'lightning_reflexes',
      name: 'Blitzschnelle Reflexe',
      description: 'Außergewöhnlich schnelle Reaktionszeit gewährt +2 auf alle Initiativewürfe',
      shortDesc: 'Initiative +2',
      type: 'passive',
      stackable: false,
      displayInCombat: false, // Nicht so wichtig im Kampf anzuzeigen
      effects: {
        initiativeBonus: 2
      },
      requirements: [],
      system: 'wh40k'
    },
    
    // ========== ANFÜHRER/AURA TALENTE ==========
    {
      id: 'iron_discipline',
      name: 'Eiserne Disziplin',
      description: 'Verbündete in 10m Radius ignorieren Furcht und Panik',
      shortDesc: 'Aura: Keine Furcht (10m)',
      type: 'aura',
      stackable: false,
      range: 10, // 10 Meter Radius
      displayInCombat: true,
      effects: {
        alliesIgnoreFear: true
      },
      requirements: ['leader', 'commander', 'sergeant'],
      system: 'wh40k'
    },
    {
      id: 'master_orator',
      name: 'Meisterredner',
      description: 'Kann Verbündete inspirieren und ihnen +10 auf alle Tests geben',
      shortDesc: 'Aura: +10 alle Tests',
      type: 'aura',
      stackable: false,
      range: 20,
      displayInCombat: true,
      effects: {
        alliesBonus: 10
      },
      requirements: ['leader', 'preacher', 'commander'],
      system: 'wh40k'
    },
    
    // ========== SPEZIAL-TALENTE ==========
    {
      id: 'regeneration',
      name: 'Regeneration',
      description: 'Heilt 1 HP pro Runde automatisch. Bei Level 2+ auch verlorene Gliedmaßen',
      shortDesc: '1 HP/Runde Heilung',
      type: 'passive',
      stackable: true,
      maxStacks: 3,
      displayInCombat: true,
      effects: {
        regenPerRound: 1,
        regenLimbs: false // true ab Level 2
      },
      requirements: ['daemon', 'xenos', 'mutant', 'nurgle'],
      system: 'wh40k'
    },
    {
      id: 'phase',
      name: 'Phasenverschiebung',
      description: 'Kann durch Wände gehen und ist schwer zu treffen (-20 auf Angriffe)',
      shortDesc: '-20 zu treffen',
      type: 'passive',
      stackable: false,
      displayInCombat: true,
      effects: {
        hitPenalty: -20,
        phaseWalk: true
      },
      requirements: ['daemon', 'warp', 'ghost'],
      system: 'wh40k'
    },
    {
      id: 'toxic',
      name: 'Toxisch',
      description: 'Alle Nahkampfangriffe vergiften das Ziel (1d10 Schaden pro Runde für 3 Runden)',
      shortDesc: 'Angriffe vergiften',
      type: 'passive',
      stackable: false,
      displayInCombat: true,
      effects: {
        poisonDamage: '1d10',
        poisonDuration: 3
      },
      requirements: ['nurgle', 'toxic', 'plague'],
      system: 'wh40k'
    },
    {
      id: 'natural armor',
      name: 'Natürliche Rüstung',
      description: 'Natürliche Panzerplatten, dickes Fell, zähe Haut usw.',
      shortDesc: 'Natürlicher Schutz vor Verletzungen',
      type: 'passive',
      stackable: true,
      maxStacks: 5,
      displayInCombat: true,
      effects: {
        armorBonus: 1,
      },
      requirements: ['tier','bestie'],
      system: 'wh40k'
    },
    {
      id: 'summondemonette',
      name: 'Demonette beschwören',
      description: 'Beschwört eine Demonette des Slaanesh WK Probe ist erforderlich zeit Eine Runde',
      shortDesc: 'Beschwörung',
      type: 'aktive',
      stackable: false,
      displayInCombat: true,
      effects: {
        summon: ['Demonette'],
      },
      requirements: ['kultist'],
      system: 'wh40k'
    },
    {
      id: 'auraeupo',
      name: 'Aura der Euphorie',
      description: 'von der Kreatur geht eine Aura aus die euch euphorisch macht es ist schwer sich zu konzentieren. -10BF,-10KG',
      shortDesc: 'Aura -10BF, -10KG',
      type: 'passive',
      stackable: false,
      displayInCombat: true,
      effects: {
      },
      requirements: ['dämon'],
      system: 'wh40k'
    },
    {
      id: 'warp_instability',
      name: 'Warp-Instabilität',
      description: 'Dämon wird bei 0 HP zurück in den Warp verbannt statt zu sterben',
      shortDesc: 'Verbannung statt Tod',
      type: 'passive',
      stackable: false,
      displayInCombat: false, // Nicht so wichtig im Kampf anzuzeigen
      effects: {
        banishOnDeath: true
      },
      requirements: ['daemon', 'warp'],
      system: 'wh40k'
    }
  ]
  
  // Custom Talente (für User-erstellte)
  const customTalents = ref([])
  
  const allTalents = computed(() => {
    return [...defaultTalents, ...customTalents.value]
  })
  
  // Hilfsfunktionen
  
  // Berechne effektive Rüstung mit Talenten
  const calculateEffectiveArmor = (baseArmor, talents = []) => {
    let totalBonus = 0
    
    talents.forEach(talentInstance => {
      const talentDef = allTalents.value.find(t => t.id === talentInstance.id)
      if (talentDef && talentDef.effects.armorBonus) {
        const stacks = talentInstance.level || 1
        totalBonus += talentDef.effects.armorBonus * stacks
      }
    })
    
    return baseArmor + totalBonus
  }
  
  // Berechne effektiven Widerstandsbonus
  const calculateEffectiveToughness = (baseToughness, talents = []) => {
    let multiplier = 1
    
    talents.forEach(talentInstance => {
      const talentDef = allTalents.value.find(t => t.id === talentInstance.id)
      if (talentDef && talentDef.id === 'unnatural_toughness') {
        const level = talentInstance.level || 1
        multiplier = level + 1 // Level 1 = x2, Level 2 = x3, etc.
      }
    })
    
    return Math.floor(baseToughness / 10) * multiplier
  }
  
  // Berechne effektiven Stärkebonus für Nahkampf
  const calculateEffectiveStrength = (baseStrength, talents = []) => {
    let multiplier = 1
    
    talents.forEach(talentInstance => {
      const talentDef = allTalents.value.find(t => t.id === talentInstance.id)
      if (talentDef && talentDef.id === 'unnatural_strength') {
        const level = talentInstance.level || 1
        multiplier = level + 1 // Level 1 = x2, Level 2 = x3
      }
    })
    
    return Math.floor(baseStrength / 10) * multiplier
  }
  
  // Berechne Initiative-Bonus aus Talenten
  const calculateInitiativeBonus = (talents = []) => {
    let bonus = 0
    
    talents.forEach(talentInstance => {
      const talentDef = allTalents.value.find(t => t.id === talentInstance.id)
      if (talentDef && talentDef.effects?.initiativeBonus) {
        bonus += talentDef.effects.initiativeBonus
      }
    })
    
    return bonus
  }
  
  // Prüfe ob Talent für Template verfügbar ist
  const isTalentAvailableForTemplate = (talent, template) => {
    if (!talent.requirements || talent.requirements.length === 0) {
      return true // Keine Requirements = für alle verfügbar
    }
    
    // Template muss mindestens ein Required Tag haben (case insensitive)
    return template.tags?.some(tag => 
      talent.requirements.some(req => 
        req.toLowerCase() === tag.toLowerCase()
      )
    )
  }
  
  // Hole alle Talente für Template
  const getAvailableTalentsForTemplate = (template, system = 'wh40k') => {
    return allTalents.value.filter(talent => {
      // Filter by system
      if (talent.system && talent.system !== system) return false
      
      // Check availability based on tags
      return isTalentAvailableForTemplate(talent, template)
    })
  }
  
  // Erstelle Talent-Instanz für Character
  const createTalentInstance = (talentId, level = 1) => {
    const talent = allTalents.value.find(t => t.id === talentId)
    if (!talent) return null
    
    return {
      id: talentId,
      name: talent.name,
      level: talent.stackable ? level : 1,
      active: talent.type === 'active' ? false : true
    }
  }
  
  // Hole Talent-Definition
  const getTalentById = (id) => {
    return allTalents.value.find(t => t.id === id)
  }
  
  // Format Talent für Anzeige
  const formatTalentDisplay = (talentInstance) => {
    const talent = getTalentById(talentInstance.id)
    if (!talent) return 'Unbekanntes Talent'
    
    let display = talent.name
    if (talent.stackable && talentInstance.level > 1) {
      display += ` ${talentInstance.level}`
    }
    
    // Füge Short Description hinzu für spezielle Effekte
    if (talent.id === 'unnatural_toughness') {
      display += ` (x${(talentInstance.level || 1) + 1})`
    } else if (talent.id === 'unnatural_strength') {
      display += ` (x${(talentInstance.level || 1) + 1})`
    } else if (talent.id === 'fear_rating') {
      display += ` ${talentInstance.level || 1}`
    }
    
    return display
  }
  
  // Persistenz für custom Talente
  const saveCustomTalents = () => {
    localStorage.setItem('customTalents', JSON.stringify(customTalents.value))
  }
  
  const loadCustomTalents = () => {
    const saved = localStorage.getItem('customTalents')
    if (saved) {
      customTalents.value = JSON.parse(saved)
    }
  }
  
  // Lade custom Talente beim Store-Start
  loadCustomTalents()
  
  return {
    // State
    allTalents,
    defaultTalents,
    customTalents,
    
    // Getters
    getTalentById,
    getAvailableTalentsForTemplate,
    
    // Berechnungen
    calculateEffectiveArmor,
    calculateEffectiveToughness,
    calculateEffectiveStrength,
    calculateInitiativeBonus,
    
    // Aktionen
    isTalentAvailableForTemplate,
    createTalentInstance,
    formatTalentDisplay,
    
    // Persistenz
    saveCustomTalents,
    loadCustomTalents
  }
})