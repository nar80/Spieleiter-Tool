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
      restrictions: ['Servitor', 'Maschine'],
      system: 'wh40k'
      // Keine restrictions - natürliche Waffe für Tiere/Monster
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
      restrictions: ['Servitor', 'Maschine'],
      skill: 'WS',
      system: 'wh40k'
      // Keine restrictions - natürliche Waffe für Tiere/Monster
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
      system: 'wh40k',
      requirements: ['dämon', 'chaos'] // Nur für Dämonen/Chaos
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
      system: 'wh40k',
      requirements: ['nurgle', 'dämon', 'chaos'] // Nur für Nurgle/Chaos
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
      system: 'wh40k',
      requirements: ['dämon', 'chaos'] // Nur für Dämonen/Chaos
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
      restrictions: ['Servitor', 'Maschine'],
      skill: 'WS',
      system: 'wh40k'
      // Keine restrictions - natürliche Waffe für bestimmte Monster
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
    
    // Fernkampf - Grundwaffen
    {
      id: 'lasgun',
      name: 'Lasgewehr',
      type: 'ranged',
      range: 110,
      damage: '1d10+4',
      pen: 7,
      rof: 'E/3/-',
      mag: 30,
      reload: 2,
      special: [],
      skill: 'BS',
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'Servitor', 'Maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
    
    // Schwere Waffen
    {
      id: 'serv_claws',
      name: 'Servitor Klauen',
      type: 'melee',
      damage: '1d10+4',
      pen: 2,
      special: [],
      skill: 'WS',
      system: 'wh40k',
      requirements: ["servitor", "maschine"], // Nur Templates mit "servitor" Tag
      restrictions: ['tier', 'dämon'] // Servitoren können schwere Waffen haben
    },
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon'] // Servitoren können schwere Waffen haben
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon'] // Servitoren können schwere Waffen haben
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon'] // Servitoren können schwere Waffen haben
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
      system: 'wh40k',
      restrictions: ['servitor', 'maschine'] // Tiere und Dämonen können primitive Waffen nutzen
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
      system: 'wh40k',
      restrictions: ['tier', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'servitor', 'maschine']
    },
    {
      id: 'druhkari_great_weapon',
      name: 'Druhkari Klaivare',
      type: 'melee',
      damage: '2d10+4',
      pen: 3,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Balanced'],
      skill: 'WS',
      system: 'wh40k',
      restrictions: ['tier', 'servitor', 'maschine']
    },
    {
      id: 'druhkari_poison_weapon',
      name: 'Giftklinge',
      type: 'melee',
      damage: '1d10+5',
      pen: 4,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Balanced','Toxic'],
      skill: 'WS',
      system: 'wh40k',
      restrictions: ['tier', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['servitor', 'maschine'] // Tiere können primitive Waffen nutzen
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
    {
      id: 'eldarsword',
      name: 'Eldar Energieschwert',
      type: 'melee',
      damage: '1d10+4',
      pen: 8,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Balanced', 'Energiefield'],
      skill: 'WS',
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
    {
      id: 'hellsword',
      name: 'Höllenklinge',
      type: 'melee',
      damage: '1d10+5',
      pen: 2,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Energiefield'],
      skill: 'WS',
      system: 'wh40k',
      restrictions: ['tier','servitor', 'maschine']
    },
    {
      id: 'shuriken',
      name: 'Shurikenkatapult',
      type: 'ranged',
      damage: '1d10+4',
      pen: 4,
      rof: 'E/3/10',
      mag: 100,
      reload: 2,
      special: ['Reliable'],
      skill: 'BS',
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
    // Granaten
     {
      id: 'spreng_granate',
      name: 'Sprenggranate',
      type: 'grenade',
      damage: '2d10+4',
      pen: 6,
      rof: 'E/-/-',
      mag: 1,
      reload: 1,
      special: ['Blast(4)'],
      skill: 'BS',
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
     {
      id: 'fragment_granate',
      name: 'Fragmentgranate',
      type: 'grenade',
      damage: '2d10',
      pen: 0,
      rof: 'E/-/-',
      mag: 1,
      reload: 1,
      special: [],
      skill: 'BS',
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
    {
      id: 'steel_viper',
      name: 'Stahlviper',
      type: 'ranged',
      range: 30,
      damage: '1d10+3',
      pen: 7,
      rof: 'E/2/-',
      mag: 8,
      reload: 1,
      special: ['Toxic', 'Tearing'],
      skill: 'BS',
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
    {
      id: 'pison_rifle',
      name: 'Splittergewehr',
      type: 'ranged',
      range: 60,
      damage: '1d10+2',
      pen: 7,
      rof: 'E/3/6',
      mag: 36,
      reload: 1,
      special: ['Toxic'],
      skill: 'BS',
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon'] // Servitoren können schwere Waffen haben
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
    {
      id: 'mars_melter',
      name: 'Melter (Mars)',
      type: 'ranged',
      range: 20,
      damage: '2d10+8',
      pen: 13,
      rof: 'E/-/-',
      mag: 5,
      reload: 2,
      special: ['Melta'],
      skill: 'BS',
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
    {
      id: 'mars_multimelter',
      name: 'Multi-Melter (Mars)',
      type: 'ranged',
      range: 60,
      damage: '4d10+5',
      pen: 13,
      rof: 'E/-/-',
      mag: 10,
      reload: 2,
      special: ['Melta', 'Explosiv(1)'],
      skill: 'BS',
      system: 'wh40k',
      restrictions: ['tier', 'dämon']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
    {
      id: 'flamer_heavy',
      name: 'Schwerer Flammenwerfer(Locke++)',
      type: 'ranged',
      range: 30,
      damage: '2d10+6',
      pen: 4,
      rof: 'E/-/-',
      mag: 10,
      reload: 2,
      special: ['Flame', 'Spray','focused'],
      skill: 'BS',
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'servitor', 'maschine'] // Primitive Waffe
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon'] // Servitoren können Werkzeuge nutzen
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['servitor', 'maschine'] // Tiere können werfen
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
      system: 'wh40k',
      restrictions: ['servitor', 'maschine'] // Tiere können werfen
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
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
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
    {
      id: 'energie_maul',
      name: 'Energie Schlagstock',
      type: 'melee',
      damage: '1d10+5',
      pen: 4,
      rof: '-/-/-',
      mag: 0,
      reload: 0,
      special: ['Shocking','Energiefield'],
      skill: 'WS',
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },

    // Exostische Xeno Waffen
     {
      id: 'webrifle',
      name: 'Netzgewehr',
      type: 'range',
      damage: '0',
      pen: 0,
      range: 40,
      rof: 'E/-/-',
      mag: 1,
      reload: 1,
      special: ['Bewegunshemmend'],
      skill: 'BS',
      system: 'wh40k',
      restrictions: ['tier', 'dämon', 'servitor', 'maschine']
    },
    {
      id: 'double_plasma',
      name: 'Zwillings-Plasma',
      type: 'range',
      damage: '2d10+3',
      pen: 5,
      range: 80,
      rof: 'E/2/-',
      mag: 20,
      reload: 2,
      special: ['Shocking'],
      skill: 'BS',
      system: 'wh40k',
      require: ['maschine']
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
      requirements: weapon.requirements || [],
      restrictions: weapon.restrictions || [],
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
  
  // Check if weapon is available for template
  // Check if weapon is available for template
  const isWeaponAvailableForTemplate = (weapon, template) => {
    // Check requirements (template must have at least one required tag) - case insensitive
    if (weapon.requirements && weapon.requirements.length > 0) {
      if (!template.tags || !template.tags.some(tag => 
        weapon.requirements.some(req => req.toLowerCase() === tag.toLowerCase())
      )) {
        return false
      }
    }
    
    // Check restrictions (template must not have any restricted tag) - case insensitive
    if (weapon.restrictions && weapon.restrictions.length > 0) {
      if (template.tags && template.tags.some(tag => 
        weapon.restrictions.some(res => res.toLowerCase() === tag.toLowerCase())
      )) {
        return false
      }
    }
    
    return true
  }
  
  // Get available weapons for template
  const getAvailableWeaponsForTemplate = (template, system) => {
    return weaponTemplates.value.filter(w => {
      // Filter by system
      if (w.system && w.system !== system) return false
      
      // Check availability based on tags
      return isWeaponAvailableForTemplate(w, template)
    })
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
 const rollDamage = (damageFormula, hasTearing = false, strengthBonus = 0, weaponType = 'ranged') => {
    const match = damageFormula.match(/(\d+)d(\d+)([+-]\d+)?/)
    if (!match) return { total: 0, rolls: [], formula: damageFormula, hasCritical: false }
    
    const numDice = parseInt(match[1])
    const diceSize = parseInt(match[2])
    let modifier = parseInt(match[3]) || 0
    
    // Füge Stärkebonus bei Nahkampfwaffen hinzu
    if (weaponType === 'melee' && strengthBonus > 0) {
      modifier += strengthBonus
    }
    
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
    
    // Tearing logic bleibt gleich...
    let tearingInfo = null
    if (hasTearing && rolls.length > 0) {
      const lowestIndex = rolls.indexOf(Math.min(...rolls))
      const oldRoll = rolls[lowestIndex]
      const newRoll = Math.floor(Math.random() * diceSize) + 1
      
      if (newRoll > oldRoll) {
        total = total - oldRoll + newRoll
        rolls[lowestIndex] = newRoll
        tearingInfo = { applied: true, oldRoll, newRoll }
        
        if (newRoll === 10 || (diceSize === 5 && newRoll === 5)) {
          hasCritical = true
        }
      }
    }
    
    return {
      total,
      rolls,
      modifier,
      formula: damageFormula,
      hasCritical,
      tearingInfo,
      strengthBonusApplied: weaponType === 'melee' ? strengthBonus : 0
    }
  }
  
  // Gerechter Zorn
  const rollRighteousFury = (damageFormula) => {
    return rollDamage(damageFormula)
  }

  // Persistence für custom Waffen
  const saveCustomWeapons = () => {
    localStorage.setItem('customWeapons', JSON.stringify(customWeapons.value))
  }
  
  const loadCustomWeapons = () => {
    const saved = localStorage.getItem('customWeapons')
    if (saved) {
      customWeapons.value = JSON.parse(saved)
    }
  }
  
  // Load custom weapons on store creation
  loadCustomWeapons()
  
  // Create weapon instance for character
  const createWeaponInstance = (weaponTemplate) => {
    return {
      ...weaponTemplate,
      currentAmmo: weaponTemplate.mag || 0,
      id: weaponTemplate.id + '_' + Date.now()
    }
  }
  
  return {
    // State
    weaponTemplates,
    customWeapons,
    // Getters
    getWeaponById,
    getWeaponByName,
    getHitLocationFromRange,
    parseFireModes,
    getAmmoUsage,
    isWeaponAvailableForTemplate,
    getAvailableWeaponsForTemplate,
    getHitLocation,
    getHitLocationFromRange,
  
    // Actions
    addCustomWeapon,
    removeCustomWeapon,
    updateCustomWeapon,
    createWeaponInstance,
    saveCustomWeapons,
    loadCustomWeapons,
    rollDamage,
    rollRighteousFury
  }
})