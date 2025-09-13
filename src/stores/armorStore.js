import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useArmorStore = defineStore('armor', () => {
  // Hardcoded armor data - not stored in localStorage
  const defaultArmors = [
    // Primitive Rüstungen
    {
      id: 'armor_1',
      name: 'Schweres Leder/Felle',
      coverage: ['arms', 'torso', 'legs'],
      rp: 2,
      category: 'primitive'
    },
    {
      id: 'armor_2',
      name: 'Groxfelle/Kettenrüstung',
      coverage: ['arms', 'torso', 'legs'],
      rp: 3,
      category: 'primitive'
    },
    {
      id: 'armor_3',
      name: 'Vollplatte',
      coverage: ['head', 'torso', 'arms', 'legs'],
      rp: 5,
      category: 'primitive'
    },
    {
      id: 'armor_4',
      name: 'Brenngeißel-Bestienleder',
      coverage: ['torso'],
      rp: 6,
      category: 'primitive'
    },
    
    // Armaplastrüstungen
    {
      id: 'armor_5',
      name: 'Armaplasthelm',
      coverage: ['head'],
      rp: 2,
      category: 'armaplast'
    },
    {
      id: 'armor_6',
      name: 'Armaplastumhang',
      coverage: ['arms', 'torso', 'legs'],
      rp: 3,
      category: 'armaplast'
    },
    {
      id: 'armor_7',
      name: 'Armaplastmantel',
      coverage: ['arms', 'torso', 'legs'],
      rp: 3,
      category: 'armaplast'
    },
    {
      id: 'armor_8',
      name: 'Armee-Armaplastrüstung',
      coverage: ['head', 'torso', 'arms', 'legs'],
      rp: 4,
      category: 'armaplast'
    },
    
    // Aramidrüstungen
    {
      id: 'armor_9',
      name: 'Aramidkapuze',
      coverage: ['head'],
      rp: 3,
      category: 'aramid'
    },
    {
      id: 'armor_10',
      name: 'Xeno-Aramid',
      coverage: ['arms', 'torso', 'legs'],
      rp: 3,
      category: 'aramid'
    },
    {
      id: 'armor_11',
      name: 'Aramidkampfmantel',
      coverage: ['arms', 'torso', 'legs'],
      rp: 4,
      category: 'aramid'
    },
    {
      id: 'armor_12',
      name: 'Aramidweste',
      coverage: ['torso'],
      rp: 4,
      category: 'aramid'
    },
    
    // Plattenrüstungen
    {
      id: 'armor_13',
      name: 'Plattenhelm',
      coverage: ['head'],
      rp: 4,
      category: 'plate'
    },
    {
      id: 'armor_14',
      name: 'Leichte Sicherheits-Plattenrüstung',
      coverage: ['head', 'torso', 'arms', 'legs'],
      rp: 5,
      category: 'plate'
    },
    {
      id: 'armor_15',
      name: 'Brustpanzer',
      coverage: ['torso'],
      rp: 6,
      category: 'plate'
    },
    {
      id: 'armor_16',
      name: 'Gardisten-Plattenrüstung',
      coverage: ['head', 'torso', 'arms', 'legs'],
      rp: 6,
      category: 'plate'
    },
    
    // Andere Rüstungen
    {
      id: 'armor_17',
      name: 'Gepanzerter Bodysuit',
      coverage: ['arms', 'torso', 'legs'],
      rp: 3,
      category: 'other'
    },
    
    // Servorüstungen
    {
      id: 'armor_18',
      name: 'Leichte Servorüstung',
      coverage: ['head', 'torso', 'arms', 'legs'],
      rp: 7,
      category: 'servo'
    },
    {
      id: 'armor_19',
      name: 'Servorüstung',
      coverage: ['head', 'torso', 'arms', 'legs'],
      rp: 8,
      category: 'servo'
    }
  ]
  
  // Custom armors (if we ever need them - not used currently)
  const customArmors = ref([])
  
  // Combined armor list
  const armors = computed(() => [...defaultArmors, ...customArmors.value])
  
  // Get armor by ID
  function getArmorById(id) {
    return armors.value.find(a => a.id === id)
  }
  
  // Get armor by name
  function getArmorByName(name) {
    return armors.value.find(a => a.name === name)
  }
  
  // Get armors by category
  const armorsByCategory = computed(() => {
    const categories = {
      primitive: [],
      armaplast: [],
      aramid: [],
      plate: [],
      servo: [],
      other: []
    }
    
    for (let armor of armors.value) {
      if (categories[armor.category]) {
        categories[armor.category].push(armor)
      }
    }
    
    return categories
  })
  
  // Get armor protection for a specific body part
  function getArmorForBodyPart(armorIds, bodyPart) {
    let maxRP = 0
    let bestArmor = null
    
    for (let id of armorIds) {
      const armor = getArmorById(id)
      if (armor && armor.coverage.includes(bodyPart)) {
        if (armor.rp > maxRP) {
          maxRP = armor.rp
          bestArmor = armor
        }
      }
    }
    
    return { rp: maxRP, armor: bestArmor }
  }
  
  // Get armor value based on hit location (WH40k style)
  function getArmorByLocation(armorIds, location) {
    // Map WH40k hit locations to body parts
    const locationMap = {
      'head': 'head',
      'body': 'torso',
      'right arm': 'arms',
      'left arm': 'arms',
      'right leg': 'legs',
      'left leg': 'legs'
    }
    
    const bodyPart = locationMap[location.toLowerCase()] || 'torso'
    return getArmorForBodyPart(armorIds, bodyPart)
  }
  
  // Category display names
  const categoryNames = {
    primitive: 'Primitive Rüstungen',
    armaplast: 'Armaplastrüstungen',
    aramid: 'Aramidrüstungen',
    plate: 'Plattenrüstungen',
    servo: 'Servorüstungen',
    other: 'Andere Rüstungen'
  }
  
  // Body part display names
  const bodyPartNames = {
    head: 'Kopf',
    torso: 'Körper',
    arms: 'Arme',
    legs: 'Beine'
  }
  
  // Format coverage for display
  function formatCoverage(coverage) {
    if (coverage.length === 4) {
      return 'Alle'
    }
    return coverage.map(part => bodyPartNames[part] || part).join(', ')
  }
  
  return {
    armors,
    defaultArmors,
    customArmors,
    armorsByCategory,
    categoryNames,
    bodyPartNames,
    getArmorById,
    getArmorByName,
    getArmorForBodyPart,
    getArmorByLocation,
    formatCoverage
  }
})