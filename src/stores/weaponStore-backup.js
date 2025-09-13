import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWeaponStore = defineStore('weapon', () => {
  // State für custom Waffen
  const customWeapons = ref([])
  
  // Standard-Waffen (fest codiert, nicht im localStorage)
  const defaultWeapons = [
    // Natürliche Waffen / Dämonische Angriffe
    {
      id: 'natural_claws',
      name: 'Klauen',
      type: 'melee',
      damage: '1d10+2',
      pen: 2,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Primitive'],
      skill: 'WS',
      system: 'wh40k'
    },
    {
      id: 'natural_bite',
      name: 'Biss',
      type: 'melee',
      damage: '1d10+3',
      pen: 3,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Primitive'],
      skill: 'WS',
      system: 'wh40k'
    },
    {
      id: 'daemon_sword',
      name: 'Dämonenschwert',
      type: 'melee',
      damage: '1d10+6',
      pen: 6,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Warp Weapon', 'Tearing'],
      skill: 'WS',
      system: 'wh40k'
    },
    {
      id: 'plague_knife',
      name: 'Seuchendolch',
      type: 'melee',
      damage: '1d5+3',
      pen: 2,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Toxic', 'Corrupt'],
      skill: 'WS',
      system: 'wh40k'
    },
    {
      id: 'warp_claws',
      name: 'Warpklauen',
      type: 'melee',
      damage: '1d10+5',
      pen: 8,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Warp Weapon', 'Felling (2)'],
      skill: 'WS',
      system: 'wh40k'
    },
    {
      id: 'tentacles',
      name: 'Tentakel',
      type: 'melee',
      damage: '1d10+1',
      pen: 0,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Flexible', 'Snare'],
      skill: 'WS',
      system: 'wh40k'
    },
    
    // Fernkampf - Pistolen
    {
      id: 'las_pistol',
      name: 'Laspistole',
      type: 'ranged',
      range: 30,
      damage: '1d10+2',
      pen: 0,
      rof: 'E/2/-',
      mag: 30,
      reload: 0.5,
      special: ['Reliable'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'autopistol',
      name: 'Autopistole',
      type: 'ranged',
      range: 30,
      damage: '1d10+2',
      pen: 0,
      rof: 'E/6/-',
      mag: 18,
      reload: 1,
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'stub_revolver',
      name: 'Stub Revolver',
      type: 'ranged',
      range: 30,
      damage: '1d10+3',
      pen: 0,
      rof: 'E/-/-',
      mag: 6,
      reload: 2,
      special: ['Reliable'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'bolt_pistol',
      name: 'Boltpistole',
      type: 'ranged',
      range: 30,
      damage: '1d10+5',
      pen: 4,
      rof: 'E/2/-',
      mag: 8,
      reload: 1,
      special: ['Tearing'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'plasma_pistol',
      name: 'Plasmapistole',
      type: 'ranged',
      range: 30,
      damage: '1d10+6',
      pen: 6,
      rof: 'E/2/-',
      mag: 10,
      reload: 3,
      special: ['Overheat'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'inferno_pistol',
      name: 'Infernopistole',
      type: 'ranged',
      range: 10,
      damage: '2d10+4',
      pen: 12,
      rof: 'E/-/-',
      mag: 3,
      reload: 2,
      special: ['Melta'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'hand_flamer',
      name: 'Handflamer',
      type: 'ranged',
      range: 10,
      damage: '1d10+4',
      pen: 2,
      rof: 'E/-/-',
      mag: 2,
      reload: 2,
      special: ['Flame', 'Spray'],
      skill: 'BS',
      system: 'wh40k'
    },
    
    // Fernkampf - Grundwaffen
    {
      id: 'lasgun',
      name: 'Lasgewehr',
      type: 'ranged',
      range: 100,
      damage: '1d10+3',
      pen: 0,
      rof: 'E/3/-',
      mag: 60,
      reload: 1,
      special: ['Reliable'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'autogun',
      name: 'Autogewehr',
      type: 'ranged',
      range: 100,
      damage: '1d10+3',
      pen: 0,
      rof: 'E/3/10',
      mag: 30,
      reload: 1,
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'shotgun',
      name: 'Schrotflinte',
      type: 'ranged',
      range: 30,
      damage: '1d10+4',
      pen: 0,
      rof: 'E/2/-',
      mag: 8,
      reload: 2,
      special: ['Scatter'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'hunting_rifle',
      name: 'Scharfschützengewehr',
      type: 'ranged',
      range: 150,
      damage: '1d10+4',
      pen: 3,
      rof: 'E/-/-',
      mag: 5,
      reload: 1,
      special: ['Accurate'],
      skill: 'BS',
      system: 'wh40k'
    },
    
    // Bolter
    {
      id: 'bolter',
      name: 'Bolter',
      type: 'ranged',
      range: 100,
      damage: '1d10+5',
      pen: 4,
      rof: 'E/3/-',
      mag: 24,
      reload: 1,
      special: ['Tearing'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'storm_bolter',
      name: 'Sturmbolter',
      type: 'ranged',
      range: 90,
      damage: '1d10+5',
      pen: 4,
      rof: 'E/3/10',
      mag: 60,
      reload: 2,
      special: ['Tearing', 'Storm'],
      skill: 'BS',
      system: 'wh40k'
    },
    
    // Schwere Waffen
    {
      id: 'heavy_stubber',
      name: 'Schwerer Stubber',
      type: 'ranged',
      range: 100,
      damage: '1d10+4',
      pen: 3,
      rof: '-/-/8',
      mag: 75,
      reload: 2,
      special: [],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'heavy_bolter',
      name: 'Schwerer Bolter',
      type: 'ranged',
      range: 150,
      damage: '1d10+8',
      pen: 5,
      rof: '-/-/10',
      mag: 60,
      reload: 2,
      special: ['Tearing'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'autocannon',
      name: 'Autokanone',
      type: 'ranged',
      range: 300,
      damage: '3d10+8',
      pen: 6,
      rof: 'E/3/-',
      mag: 20,
      reload: 2,
      special: ['Reliable'],
      skill: 'BS',
      system: 'wh40k'
    },
    
    // Nahkampfwaffen - Primitive
    {
      id: 'knife',
      name: 'Messer',
      type: 'melee',
      damage: '1d5',
      pen: 0,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Primitive(7)'],
      skill: 'WS',
      system: 'wh40k'
    },
    {
      id: 'sword',
      name: 'Schwert',
      type: 'melee',
      damage: '1d10',
      pen: 0,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Balanced'],
      skill: 'WS',
      system: 'wh40k'
    },
    {
      id: 'great_weapon',
      name: 'Großschwert',
      type: 'melee',
      damage: '2d10',
      pen: 2,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Unbalanced'],
      skill: 'WS',
      system: 'wh40k'
    },
    {
      id: 'club',
      name: 'Keule',
      type: 'melee',
      damage: '1d10',
      pen: 0,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Primitive(7)'],
      skill: 'WS',
      system: 'wh40k'
    },
    
    // Nahkampfwaffen - Ketten
    {
      id: 'chainsword',
      name: 'Kettenschwert',
      type: 'melee',
      damage: '1d10+2',
      pen: 2,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Tearing', 'Balanced'],
      skill: 'WS',
      system: 'wh40k'
    },
    {
      id: 'chainaxe',
      name: 'Kettenaxt',
      type: 'melee',
      damage: '1d10+3',
      pen: 2,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Tearing', 'Unbalanced'],
      skill: 'WS',
      system: 'wh40k'
    },
    
    // Erweiterte Waffen aus Into the Storm
    {
      id: 'dervish_lasgun',
      name: 'Typ IV "Derwisch" Lasergewehr',
      type: 'ranged',
      range: 25,
      damage: '1d10+3',
      pen: 0,
      rof: 'E/4/-',
      mag: 20,
      reload: 1,
      special: ['Reliable'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'storm_lasgun',
      name: 'Sturmlasergewehr',
      type: 'ranged',
      range: 50,
      damage: '1d10+3',
      pen: 0,
      rof: 'E/-/5',
      mag: 120,
      reload: 2,
      special: ['Reliable'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'sniper_rifle',
      name: 'Scharfschützengewehr (erweitert)',
      type: 'ranged',
      range: 220,
      damage: '1d10+4',
      pen: 0,
      rof: 'E/-/-',
      mag: 6,
      reload: 1,
      special: ['Accurate'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'steel_viper',
      name: 'Stahlviper',
      type: 'ranged',
      range: 30,
      damage: '1d10+3',
      pen: 7,
      rof: 'E/-/-',
      mag: 8,
      reload: 1,
      special: ['Toxic', 'Tearing'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'assault_machinegun',
      name: 'Sturmmaschinengewehr',
      type: 'ranged',
      range: 100,
      damage: '1d10+4',
      pen: 3,
      rof: '-/-/16',
      mag: 200,
      reload: 2,
      special: ['Storm'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'solo_bolter',
      name: 'Solo-Bolter',
      type: 'ranged',
      range: 100,
      damage: '1d10+5',
      pen: 4,
      rof: 'E/-/-',
      mag: 8,
      reload: 1,
      special: ['Accurate', 'Tearing', 'Reliable'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'bolter_cane',
      name: 'Boltergestock',
      type: 'ranged',
      range: 30,
      damage: '1d10+5',
      pen: 4,
      rof: 'E/-/-',
      mag: 4,
      reload: 2,
      special: ['Tearing'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'beamer_melter',
      name: 'Strahler-Melter',
      type: 'ranged',
      range: 40,
      damage: '2d10+6',
      pen: 12,
      rof: 'E/-/-',
      mag: 6,
      reload: 2,
      special: ['Melta'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'clovis_plasma',
      name: 'Clovis-Plasmagewehr',
      type: 'ranged',
      range: 60,
      damage: '1d10+5',
      pen: 6,
      rof: 'E/3/5',
      mag: 40,
      reload: 5,
      special: ['Overheat'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'fury_plasma_pistol',
      name: 'Zorn-Plasmapistole',
      type: 'ranged',
      range: 40,
      damage: '1d10+8',
      pen: 6,
      rof: 'E/-/-',
      mag: 8,
      reload: 3,
      special: ['Accurate', 'Overheat'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'assault_flamer',
      name: 'Sturmflammenwerfer',
      type: 'ranged',
      range: 10,
      damage: '1d10+4',
      pen: 1,
      rof: 'E/-/-',
      mag: 12,
      reload: 3,
      special: ['Flame', 'Spray'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'flamer_mezoa',
      name: 'Flammenwerfer(Mezoa++)',
      type: 'ranged',
      range: 20,
      damage: '1d10+4',
      pen: 2,
      rof: 'E/-/-',
      mag: 6,
      reload: 2,
      special: ['Flame', 'Spray','focused'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'blunderbuss',
      name: 'Donnerbüchse',
      type: 'ranged',
      range: 30,
      damage: '1d10+2',
      pen: 0,
      rof: 'E/-/-',
      mag: 1,
      reload: 2,
      special: ['Primitive(7)', 'Inaccurate', 'Unreliable'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'bola_launcher',
      name: 'Bolawerfer',
      type: 'ranged',
      range: 20,
      damage: '1d10',
      pen: 0,
      rof: 'E/-/-',
      mag: 6,
      reload: 1,
      special: ['Snare', 'Primitive(7)'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'disposable_launcher',
      name: 'Einwegraketenwerfer',
      type: 'ranged',
      range: 200,
      damage: '3d10+3',
      pen: 4,
      rof: 'E/-/-',
      mag: 1,
      reload: 0,
      special: ['One-Shot'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'mezoa_lascutter',
      name: 'Mezoa-Laserschneider',
      type: 'ranged',
      range: 5,
      damage: '2d10+3',
      pen: 6,
      rof: 'E/-/-',
      mag: 10,
      reload: 2,
      special: [],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'disposable_firearm',
      name: 'Einweghandfeuerwaffe',
      type: 'ranged',
      range: 30,
      damage: '1d10+2',
      pen: 0,
      rof: 'E/2/-',
      mag: 8,
      reload: 2,
      special: ['Inaccurate', 'Unreliable'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'void_harpoon',
      name: 'Leerenharpune',
      type: 'ranged',
      range: 10,
      damage: '1d10+2',
      pen: 2,
      rof: 'E/-/-',
      mag: 1,
      reload: 1,
      special: [],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'civilian_firearm',
      name: 'Zivile Schusswaffe',
      type: 'ranged',
      range: 60,
      damage: '1d10+3',
      pen: 0,
      rof: 'E/2/-',
      mag: 6,
      reload: 1,
      special: [],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'hunting_javelin',
      name: 'Jagdwurfspeer',
      type: 'thrown',
      range: 10,
      damage: '1d10',
      pen: 0,
      rof: 'E/-/-',
      mag: 0,
      reload: 0,
      special: ['Primitive(7)'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'javelin',
      name: 'Wurfspeer',
      type: 'thrown',
      range: 10,
      damage: '1d10',
      pen: 0,
      rof: 'E/-/-',
      mag: 0,
      reload: 0,
      special: ['Primitive(7)'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'auto_grenade_launcher',
      name: 'Automatischer Granatwerfer',
      type: 'ranged',
      range: 15,
      damage: '2d10',
      pen: 0,
      rof: 'E/-/-',
      mag: 3,
      reload: 3,
      special: ['Blast(3)'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'mortar_locke',
      name: 'Mörser (Locke)',
      type: 'ranged',
      range: 300,
      damage: '2d10',
      pen: 3,
      rof: 'E/-/-',
      mag: 6,
      reload: 2,
      special: ['Blast(5)', 'Inaccurate', 'Indirect'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'mortar_voss',
      name: 'Mörser (Voss)',
      type: 'ranged',
      range: 300,
      damage: '2d10',
      pen: 3,
      rof: 'E/-/-',
      mag: 1,
      reload: 1,
      special: ['Blast(5)', 'Inaccurate', 'Indirect'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'homing_missile',
      name: 'Radarsuchkopfrakete',
      type: 'ranged',
      range: 350,
      damage: '3d10+6',
      pen: 6,
      rof: 'E/-/-',
      mag: 1,
      reload: 0,
      special: ['Accurate', 'One-Shot'],
      skill: 'BS',
      system: 'wh40k'
    },
    {
      id: 'tunnel_mortar',
      name: 'Tunnelmörser',
      type: 'ranged',
      range: 500,
      damage: '2d10+2',
      pen: 2,
      rof: 'E/-/-',
      mag: 1,
      reload: 1,
      special: ['Blast(4)', 'Shocking', 'Inaccurate', 'Indirect'],
      skill: 'BS',
      system: 'wh40k'
    },
    
    // Nahkampfwaffen - Energie
    {
      id: 'power_sword',
      name: 'Energieschwert',
      type: 'melee',
      damage: '1d10+5',
      pen: 5,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Power Field', 'Balanced'],
      skill: 'WS',
      system: 'wh40k'
    },
    {
      id: 'power_axe',
      name: 'Energieaxt',
      type: 'melee',
      damage: '1d10+7',
      pen: 7,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Power Field', 'Unbalanced'],
      skill: 'WS',
      system: 'wh40k'
    },
    {
      id: 'shock_maul',
      name: 'Schockstab',
      type: 'melee',
      damage: '1d10',
      pen: 0,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Shocking'],
      skill: 'WS',
      system: 'wh40k'
    }
  ]
  
  // Kombiniere Standard- und Custom-Waffen
  const weaponTemplates = computed(() => {
    return [...defaultWeapons, ...customWeapons.value]
  })
  
  // WH40k Trefferzonen
  const getHitLocationFromRange = (roll) => {
    if (roll >= 1 && roll <= 10) return { name: 'Kopf', armor: 0 }
    if (roll >= 11 && roll <= 20) return { name: 'Rechter Arm', armor: 0 }
    if (roll >= 21 && roll <= 30) return { name: 'Linker Arm', armor: 0 }
    if (roll >= 31 && roll <= 70) return { name: 'Körper', armor: 0 }
    if (roll >= 71 && roll <= 85) return { name: 'Rechtes Bein', armor: 0 }
    if (roll >= 86 && roll <= 100) return { name: 'Linkes Bein', armor: 0 }
    return { name: 'Körper', armor: 0 }
  }
  
  // Custom Waffen Management
  const addCustomWeapon = (weapon) => {
    const newWeapon = {
      id: 'custom_' + Date.now(),
      name: weapon.name || 'Custom Waffe',
      type: weapon.type || 'melee',
      range: weapon.range || 0,
      damage: weapon.damage || '1d10',
      pen: weapon.pen || 0,
      rof: weapon.rof || 'E/-/-',
      mag: weapon.mag || 0,
      reload: weapon.reload || 0,
      special: weapon.special || [],
      skill: weapon.skill || 'WS',
      system: weapon.system || 'wh40k',
      isCustom: true
    }
    customWeapons.value.push(newWeapon)
    saveCustomWeapons()
    return newWeapon
  }
  
  const removeCustomWeapon = (id) => {
    const index = customWeapons.value.findIndex(w => w.id === id)
    if (index !== -1) {
      customWeapons.value.splice(index, 1)
      saveCustomWeapons()
    }
  }
  
  const updateCustomWeapon = (id, updates) => {
    const weapon = customWeapons.value.find(w => w.id === id)
    if (weapon) {
      Object.assign(weapon, updates)
      saveCustomWeapons()
    }
  }
  
  // Get weapon by ID
  const getWeaponById = (id) => {
    return weaponTemplates.value.find(w => w.id === id)
  }
  
  // Get weapon by name
  const getWeaponByName = (name) => {
    return weaponTemplates.value.find(w => w.name === name)
  }
  
  // Parse Feuermodi
  const parseFireModes = (rof) => {
    if (!rof || typeof rof !== 'string') return { single: true, burst: 0, full: 0 }
    
    const parts = rof.split('/')
    return {
      single: parts[0] === 'E' || parts[0] === '1',
      burst: parseInt(parts[1]) || 0,
      full: parseInt(parts[2]) || 0
    }
  }
  
  // Get ammo usage for fire mode
  const getAmmoUsage = (rof, fireMode) => {
    if (!rof || typeof rof !== 'string') return 1
    
    const modes = parseFireModes(rof)
    
    switch(fireMode) {
      case 'single':
        return 1
      case 'burst':
        return modes.burst || 3
      case 'full':
        return modes.full || 10
      default:
        return 1
    }
  }
  
  // Trefferzonen-Berechnung
  const getHitLocation = (roll) => {
    const tensDigit = Math.floor(roll / 10)
    const onesDigit = roll % 10
    const reversedRoll = onesDigit * 10 + tensDigit
    
    if (reversedRoll === 0) return getHitLocationFromRange(100)
    return getHitLocationFromRange(reversedRoll)
  }
  
  // Schadenswurf mit Tearing
  const rollDamage = (damageFormula, hasTearing = false) => {
    const match = damageFormula.match(/(\d+)d(\d+)([+-]\d+)?/)
    if (!match) return { total: 0, rolls: [], formula: damageFormula, hasCritical: false }
    
    const numDice = parseInt(match[1])
    const diceSize = parseInt(match[2])
    const modifier = parseInt(match[3]) || 0
    
    let rolls = []
    let total = modifier
    let hasCritical = false
    
    for (let i = 0; i < numDice; i++) {
      const roll = Math.floor(Math.random() * diceSize) + 1
      rolls.push(roll)
      total += roll
      
      if (roll === 10 || (diceSize === 5 && roll === 5)) {
        hasCritical = true
      }
    }
    
    // Tearing: Würfle niedrigsten neu
    let tearingInfo = null
    if (hasTearing && rolls.length > 0) {
      const minIndex = rolls.indexOf(Math.min(...rolls))
      const oldRoll = rolls[minIndex]
      const newRoll = Math.floor(Math.random() * diceSize) + 1
      
      tearingInfo = { oldRoll, newRoll, applied: false }
      
      if (newRoll > oldRoll) {
        total = total - oldRoll + newRoll
        rolls[minIndex] = newRoll
        tearingInfo.applied = true
        
        if (newRoll === 10 || (diceSize === 5 && newRoll === 5)) {
          hasCritical = true
        }
      }
    }
    
    return {
      total: Math.max(0, total),
      rolls,
      modifier,
      formula: damageFormula,
      hasCritical,
      diceSize,
      tearingInfo
    }
  }
  
  // Gerechter Zorn
  const rollRighteousFury = (damageFormula) => {
    return rollDamage(damageFormula)
  }
  
  // Persistence (nur für custom Waffen)
  const saveCustomWeapons = () => {
    localStorage.setItem('customWeaponTemplates', JSON.stringify(customWeapons.value))
  }
  
  const loadCustomWeapons = () => {
    const saved = localStorage.getItem('customWeaponTemplates')
    if (saved) {
      customWeapons.value = JSON.parse(saved)
    }
  }
  
  // Beim Start laden
  loadCustomWeapons()
  
  return {
    weaponTemplates,
    defaultWeapons,
    customWeapons,
    addCustomWeapon,
    removeCustomWeapon,
    updateCustomWeapon,
    getWeaponById,
    getWeaponByName,
    parseFireModes,
    getAmmoUsage,
    getHitLocation,
    getHitLocationFromRange,
    rollDamage,
    rollRighteousFury,
    saveCustomWeapons,
    loadCustomWeapons
  }
})