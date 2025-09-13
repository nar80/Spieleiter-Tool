# Spielleiter-Tool - Projektdokumentation

## Übersicht
Ein modulares Kampf- und Session-Management-Tool für Pen&Paper-Rollenspiele. Unterstützt verschiedene Systeme (WH40k, D&D, etc.) und hilft beim Verwalten von Kämpfen, Initiative, NPCs und Spielercharakteren.

## Technischer Stack
- **Vue 3** mit Composition API
- **Quasar Framework** für UI-Komponenten
- **Pinia** für State Management  
- **Vite** als Build-Tool
- **localStorage** für Persistenz (später evtl. IndexedDB)

## Bereits implementiert

### Kampf-Tracker (CombatView.vue)
- ✅ Initiative-Verwaltung mit Sortierung
- ✅ HP-Tracking mit visuellen Balken
- ✅ Rundenverwaltung (Next/Previous Turn)
- ✅ Spieler vs NPC Unterscheidung
- ✅ Schaden/Heilung mit Dialog
- ✅ Initiative würfeln (W10/W20) - Spieler manuell eingeben
- ✅ Auto-Save im localStorage
- ✅ Kampf starten/beenden
- ✅ Notizen-Feld für Spieler
- ✅ Template-System für schnelles Hinzufügen

### Angriffs-System (WH40k)
- ✅ Angriffswürfe mit Trefferchance-Berechnung
- ✅ Trefferzonen-System mit Digit-Umkehrung (WH40k-konform)
- ✅ Schadenswürfel mit Formeln (1d10+X)
- ✅ Gerechter Zorn (Righteous Fury) bei natürlicher 10
- ✅ Penetration und Rüstungsabzug
- ✅ Verschiedene Modifikatoren (Zielen, Laufen, Deckung)

### Waffen-System
- ✅ Waffen-Templates mit allen Eigenschaften
- ✅ Feuermodi (Einzel/Salve/Vollautomatik)
- ✅ Munitions-Tracking und Nachladen
- ✅ Verschiedene Nachladezeiten (0.5/1/2 Aktionen)
- ✅ Munition wird beim Schuss abgezogen
- ✅ Feuermodus-Toggle im Angriffsdialog

### Character-Templates
- ✅ Spieler und NPC Templates
- ✅ Alle WH40k Attribute (KG, BF, ST, WI, GE, IN, WA, WK, CH)
- ✅ Waffen-Zuweisung aus Waffen-Store
- ✅ HP als Objekt (current/max)
- ✅ Spielergruppen-Verwaltung

### UI/UX
- ✅ Dunkles Theme als Standard
- ✅ Responsive Layout mit Drawer-Navigation
- ✅ Farbcodierung (Grün=Spieler, Rot=NPCs)
- ✅ Aktiver Kämpfer wird hervorgehoben
- ✅ HP-Balken mit Farbindikator (grün/orange/rot)
- ✅ Waffen-Buttons mit Munitionsanzeige

## Geplante Features

### Phase 1: Basis-Funktionalität
- **Würfel-System**
  - Alle Standard-Würfel (W4, W6, W8, W10, W12, W20, W100)
  - Würfel-Historie/Log
  - Modifikatoren (+/- X)
  - Advantage/Disadvantage (für D&D)
  - Erfolgsgrade (für WH40k)

- **Angriffs-System Erweiterungen**
  - Mehrfachtreffer bei Salve (alle 2 Erfolgsgrade)
  - Mehrfachtreffer bei Vollautomatik (jeder Erfolgsgrad)
  - Zielen auf spezifische Körperteile
  - Deckungsregeln
  - Überwachung/Suppression

### Phase 2: Character Management
- **Template-System**
  - Vordefinierte Gegner-Templates
  - Gruppen-Templates (z.B. 5x Ork-Krieger)
  - Import/Export als JSON
  - Kategorien (Monster, NPCs, Bossgegner)

- **Character-Editor**
  - Attribute (je nach System)
  - Fertigkeiten/Skills
  - Waffen & Ausrüstung
  - Spezialfähigkeiten
  - Notizen

### Phase 3: Erweiterte Features
- **Conditions/Status-Effekte**
  - Betäubt, Verlangsamt, Blutend, etc.
  - Automatische Rundenzähler
  - Effekt-Ende-Erinnerungen

- **Multi-System-Support**
  - System-Plugins für verschiedene Regelwerke
  - WH40k: Kritische Treffer-Tabellen, Warp-Phänomene
  - D&D 5e: Spell Slots, Death Saves
  - Pathfinder: Conditions, Action Economy
  - Custom: Eigene Regeln definieren

### Phase 4: Session-Tools
- **Encounter-Builder**
  - CR/Schwierigkeitsgrad-Berechnung
  - Zufällige Begegnungen
  - Loot-Generator

- **Session-Notes**
  - Quick-Notes während des Spiels
  - NPC-Tracker
  - Plot-Points
  - Timeline

### Phase 5: Erweiterte Persistenz
- **Save/Load System**
  - Mehrere Kampagne-Slots
  - Cloud-Sync (optional)
  - Export als PDF-Report

## Projektstruktur

```
spielleiter-tool/
├── src/
│   ├── stores/
│   │   ├── combatStore.js      # Kampf-State & Logik
│   │   ├── characterStore.js   # Character-Templates
│   │   ├── weaponStore.js      # Waffen-System
│   │   ├── systemStore.js      # Regel-System-Config
│   │   └── diceStore.js        # (TODO) Würfel-System
│   ├── views/
│   │   ├── CombatView.vue      # Kampf-Tracker
│   │   ├── TemplatesView.vue   # Character-Templates
│   │   └── SettingsView.vue    # System-Einstellungen
│   ├── components/
│   │   ├── DiceRoller.vue      # (TODO) Würfel-Component
│   │   ├── CharacterCard.vue   # (TODO) Character-Display
│   │   └── AttackDialog.vue    # (TODO) Angriffs-Dialog
│   └── systems/
│       ├── wh40k.js            # (TODO) WH40k-Regeln
│       ├── dnd5e.js            # (TODO) D&D 5e-Regeln
│       └── custom.js           # (TODO) Custom-Regeln
```

## System-spezifische Features

### Warhammer 40k
- Initiative: 1W10 + Agility Bonus
- Erfolgsgrade: DoS/DoF Berechnung
- Kritische Treffer-Tabellen
- Warp-Phänomene
- Korruption & Wahnsinn

### D&D 5e
- Initiative: 1W20 + DEX Modifier
- Advantage/Disadvantage
- Death Saving Throws
- Spell Slots
- Action/Bonus Action/Reaction

## UI/UX Konzepte

### Farb-Schema
- **Spieler**: Grün (#4CAF50)
- **NPCs**: Rot (#F44336)
- **Aktiv**: Amber (#FFC107)
- **Disabled**: Grau (#9E9E9E)
- **Kritisch**: Purple (#9C27B0)

### Keyboard Shortcuts (geplant)
- `Space`: Nächster Zug
- `N`: Neuer Kämpfer
- `R`: Würfeln
- `D`: Schaden-Dialog
- `H`: Heilung-Dialog
- `Ctrl+S`: Kampf speichern

## Entwicklungs-Notizen

### Port-Konfiguration
- Development: Port 3001 (oder 3002 wenn belegt)
- Vite-Config mit Quasar-Plugin konfiguriert
- Sass-Variables-Problem gelöst mit absolutem Pfad

### State Management
- Pinia Stores für zentrale Datenverwaltung
- localStorage für Persistenz
- Reactive System für Live-Updates

### Bekannte Issues
- Edit-Funktion für Kämpfer noch nicht implementiert
- Mehrfachtreffer bei Salve/Vollautomatik noch nicht implementiert

## Nächste Schritte (Priorität)
1. **Mehrfachtreffer-System**
   - Bei Salve: alle 2 Erfolgsgrade = 1 zusätzlicher Treffer
   - Bei Vollautomatik: jeder Erfolgsgrad = 1 zusätzlicher Treffer
   - Verteilung auf mehrere Ziele

2. **Würfel-System vervollständigen**
   - Würfel-Historie/Log
   - Erfolgsgrade-Anzeige
   - Advantage/Disadvantage (für D&D)

3. **Conditions/Status-Effekte**
   - Betäubt, Blutend, Brennend, etc.
   - Automatische Rundenzähler
   - Effekt-Ende-Erinnerungen

## Test-Daten

### Beispiel WH40k NPC
```javascript
{
  name: "Ork Nob",
  type: "npc",
  hp: { current: 15, max: 15 },
  attributes: {
    KG: 40, BF: 29, ST: 45, WI: 45, 
    GE: 30, IN: 20, WA: 30, WK: 30, CH: 20
  },
  armor: 4,
  weapons: [
    { 
      name: "Choppa", 
      damage: "1d10+4", 
      pen: 2,
      rof: "E/-/-",
      mag: 0,
      reload: 0
    }
  ],
  initiativeModifier: 3
}
```

### Beispiel D&D 5e NPC
```javascript
{
  name: "Goblin",
  type: "npc", 
  hp: { current: 7, max: 7 },
  attributes: {
    STR: 8, DEX: 14, CON: 10,
    INT: 10, WIS: 8, CHA: 8
  },
  armor: 15,
  weapons: [
    { name: "Scimitar", damage: "1d6+2", attackBonus: 4 }
  ],
  initiativeModifier: 2
}
```

## Befehle

### Development
```bash
cd F:/Hobby-Projekte/spielleiter-tool
npm run dev
```

### Build
```bash
npm run build
```

### Installation neuer Packages
```bash
npm install [package-name]
```

## Ressourcen
- [Vue 3 Docs](https://vuejs.org/)
- [Quasar Framework](https://quasar.dev/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [WH40k Rules Reference](https://wh40k.lexicanum.com/)
- [D&D 5e SRD](https://www.dndbeyond.com/)