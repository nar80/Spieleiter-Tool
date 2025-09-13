<template>
  <q-page class="q-pa-md">
    <!-- Kampf-Kontrollen -->
    <div class="row q-mb-md q-gutter-sm">
      <q-btn 
        v-if="!combatStore.isInCombat"
        color="green"
        icon="play_arrow"
        label="Kampf starten"
        @click="startCombat"
      />
      <q-btn 
        v-else
        color="red"
        icon="stop"
        label="Kampf beenden"
        @click="combatStore.endCombat"
      />
      
      <q-btn
        color="primary"
        icon="casino"
        label="Initiative würfeln"
        @click="rollInitiatives"
      />
      
      <q-space />
      
      <q-chip v-if="combatStore.isInCombat" color="amber" text-color="black">
        Runde {{ combatStore.roundNumber }}
      </q-chip>
    </div>
    
    <!-- Kämpfer-Listen -->
    <div class="row q-gutter-md q-mb-md">
      <!-- Spieler Liste (Links) -->
      <q-card class="col">
        <q-card-section class="q-pb-none">
          <div class="text-h6">Spieler</div>
        </q-card-section>
        <q-card-section class="q-pt-sm" style="max-height: 500px; overflow-y: auto">
          <q-list separator>
            <q-item 
              v-for="combatant in playerCombatants" 
              :key="combatant.id"
              :class="{ 
                'bg-amber-10': combatStore.isInCombat && combatStore.currentCombatant?.id === combatant.id,
                'bg-grey-9': combatant.hp.current <= 0
              }"
              @mouseenter="hoveredPlayer = combatant"
              @mouseleave="hoveredPlayer = null"
              clickable
            >
              <q-item-section avatar>
                <q-avatar 
                  :color="combatant.iconColor || 'green'"
                  text-color="white"
                  size="md"
                >
                  <q-icon :name="combatant.iconSymbol || 'person'" />
                  <q-badge floating color="dark" text-color="white">{{ combatant.initiative || '-' }}</q-badge>
                </q-avatar>
              </q-item-section>
            
              <q-item-section>
                <q-item-label>
                  {{ combatant.name }}
                  <q-icon v-if="combatant.targetId" name="trending_flat" color="orange" class="q-ml-sm">
                    <q-tooltip>Greift an: {{ getTargetName(combatant.targetId) }}</q-tooltip>
                  </q-icon>
                  <q-badge v-if="combatant.hp.current <= 0" color="red" class="q-ml-sm">
                    Kampfunfähig
                  </q-badge>
                  <q-chip v-if="combatant.currentCover" size="sm" color="brown" text-color="white" class="q-ml-sm">
                    {{ combatant.currentCover.label }}: {{ combatant.currentCover.value - (combatant.currentCover.damage || 0) }}
                    <q-icon v-if="combatant.currentCover.damage > 0" name="warning" size="xs" class="q-ml-xs" />
                  </q-chip>
                </q-item-label>
                <q-item-label caption>
                  <q-linear-progress 
                    :value="combatant.hp.current / combatant.hp.max" 
                    :color="getHpColor(combatant)"
                    size="20px"
                    class="q-mt-xs"
                  >
                    <div class="absolute-full flex flex-center">
                      <div class="text-white text-caption">
                        {{ combatant.hp.current }} / {{ combatant.hp.max }}
                      </div>
                    </div>
                  </q-linear-progress>
                </q-item-label>
              </q-item-section>
            
              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn
                    round
                    dense
                    flat
                    icon="gps_fixed"
                    :color="combatant.targetId ? 'orange' : 'grey'"
                    @click.stop="toggleTargeting(combatant)"
                  >
                    <q-tooltip>Ziel setzen</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    flat
                    icon="shield"
                    color="primary"
                    @click.stop="openDefenseDialog(combatant)"
                  >
                    <q-tooltip>Verteidigung</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    flat
                    icon="remove"
                    color="red"
                    @click.stop="dealDamage(combatant)"
                  >
                    <q-tooltip>Schaden</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    flat
                    icon="add"
                    color="green"
                    @click.stop="heal(combatant)"
                  >
                    <q-tooltip>Heilung</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    flat
                    icon="delete"
                    color="grey"
                    @click.stop="removeCombatant(combatant)"
                  >
                    <q-tooltip>Entfernen</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-if="playerCombatants.length === 0" class="text-center text-grey q-pa-xl">
            Keine Spieler vorhanden
          </div>
        </q-card-section>
      </q-card>
      
      <!-- NPCs Liste (Rechts) -->
      <q-card class="col">
        <q-card-section class="q-pb-none">
          <div class="text-h6">Gegner</div>
        </q-card-section>
        <q-card-section class="q-pt-sm" style="max-height: 500px; overflow-y: auto">
          <q-list separator>
            <q-item 
              v-for="combatant in npcCombatants" 
              :key="combatant.id"
              :class="{ 
                'bg-amber-10': combatStore.isInCombat && combatStore.currentCombatant?.id === combatant.id,
                'bg-grey-9': combatant.hp.current <= 0,
                'bg-red-10': isTargetOfCurrentPlayer(combatant.id)
              }"
              @click="selectNPC(combatant)"
              clickable
            >
              <q-item-section avatar>
                <q-avatar 
                  color="red"
                  text-color="white"
                  size="md"
                >
                  {{ combatant.initiative || '-' }}
                </q-avatar>
              </q-item-section>
              
              <q-item-section>
                <q-item-label>
                  {{ combatant.name }}
                  <q-badge v-if="combatant.hp.current <= 0" color="red" class="q-ml-sm">
                    Kampfunfähig
                  </q-badge>
                </q-item-label>
                <!-- Anzeige welche Spieler dieser NPC bekämpft -->
                <q-item-label v-if="combatant.engagedWith && combatant.engagedWith.length > 0" caption>
                  <div class="row q-gutter-xs q-mt-xs">
                    <div v-for="engagement in combatant.engagedWith" :key="engagement.playerId" class="row items-center q-gutter-xs">
                      <q-avatar size="20px" :color="getPlayerColor(engagement.playerId)" text-color="white">
                        <q-icon size="xs" :name="getPlayerIcon(engagement.playerId)" />
                      </q-avatar>
                      <span class="text-caption">{{ engagement.distance || '?' }}m</span>
                      <q-btn
                        flat
                        round
                        dense
                        size="xs"
                        icon="edit"
                        @click.stop="editDistance(combatant, engagement)"
                      />
                    </div>
                  </div>
                </q-item-label>
                <q-item-label caption>
                  <q-linear-progress 
                    :value="combatant.hp.current / combatant.hp.max" 
                    :color="getHpColor(combatant)"
                    size="20px"
                    class="q-mt-xs"
                  >
                    <div class="absolute-full flex flex-center">
                      <div class="text-white text-caption">
                        {{ combatant.hp.current }} / {{ combatant.hp.max }}
                      </div>
                    </div>
                  </q-linear-progress>
                </q-item-label>
              </q-item-section>
              
              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn
                    round
                    dense
                    flat
                    icon="group_add"
                    color="orange"
                    @click.stop="openEngagementDialog(combatant)"
                  >
                    <q-tooltip>Gegner zuweisen</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    flat
                    icon="shield"
                    color="primary"
                    @click.stop="openDefenseDialog(combatant)"
                  >
                    <q-tooltip>Verteidigung</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    flat
                    icon="remove"
                    color="red"
                    @click.stop="dealDamage(combatant)"
                  >
                    <q-tooltip>Schaden</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    flat
                    icon="add"
                    color="green"
                    @click.stop="heal(combatant)"
                  >
                    <q-tooltip>Heilung</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    flat
                    icon="delete"
                    color="grey"
                    @click.stop="removeCombatant(combatant)"
                  >
                    <q-tooltip>Entfernen</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-if="npcCombatants.length === 0" class="text-center text-grey q-pa-xl">
            Keine Gegner vorhanden
          </div>
        </q-card-section>
      </q-card>
    </div>
    
    <!-- Nächster Zug Buttons -->
    <div v-if="combatStore.isInCombat" class="row q-gutter-sm justify-center q-mb-md">
      <q-btn
        color="primary"
        icon="skip_previous"
        label="Vorheriger"
        @click="combatStore.previousTurn"
      />
      <q-btn
        color="primary"
        icon="skip_next"
        label="Nächster"
        @click="combatStore.nextTurn"
      />
    </div>
    
    <!-- Aktions-Panel für aktuellen Kämpfer -->
    <q-card v-if="combatStore.isInCombat && combatStore.currentCombatant" class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          {{ combatStore.currentCombatant.type === 'player' ? 'Spieler' : 'Aktionen' }}: {{ combatStore.currentCombatant.name }}
          <q-badge :color="combatStore.currentCombatant.type === 'player' ? 'green' : 'red'" class="q-ml-sm">
            {{ combatStore.currentCombatant.type === 'player' ? 'Spieler' : 'NPC' }}
          </q-badge>
        </div>
        
        <!-- Spieler Panel - Verwaltung -->
        <div v-if="combatStore.currentCombatant.type === 'player'">
          <div class="row q-gutter-md q-mb-md">
            <!-- Status & Werte -->
            <div class="col-auto">
              <div class="text-subtitle2 text-grey q-mb-sm">Status</div>
              <div class="q-gutter-xs">
                <div>Rüstung: {{ combatStore.currentCombatant.armor || 0 }}</div>
                <div>Widerstand: {{ combatStore.currentCombatant.toughness || 0 }}</div>
                <div v-if="combatStore.currentCombatant.criticalWounds" class="text-red">
                  Kritische Wunden: {{ combatStore.currentCombatant.criticalWounds }}
                </div>
              </div>
            </div>
            
            <!-- Munitions-Verwaltung -->
            <div class="col">
              <div class="text-subtitle2 text-grey q-mb-sm">Munition verbraucht</div>
              <div v-if="getCombatantWeapons(combatStore.currentCombatant).length" class="q-gutter-sm">
                <div v-for="(weapon, index) in getCombatantWeapons(combatStore.currentCombatant)" :key="weapon.instanceId || index" class="row items-center q-gutter-sm">
                  <div class="col-auto" style="min-width: 150px">
                    <strong>{{ weapon.name }}</strong>
                    <span v-if="weapon.mag > 0" class="text-caption q-ml-sm">
                      ({{ weapon.currentAmmo ?? weapon.mag }}/{{ weapon.mag }})
                    </span>
                  </div>
                  
                  <q-btn-group flat>
                    <q-btn 
                      flat 
                      dense 
                      size="sm" 
                      label="Einzel" 
                      @click="usePlayerAmmo(index, 1)"
                      :disable="!weapon.mag || weapon.currentAmmo === 0"
                    />
                    <q-btn 
                      v-if="weapon.rof?.includes('/')"
                      flat 
                      dense 
                      size="sm" 
                      :label="`Salve (${weaponStore.parseFireModes(weapon.rof).burst || 3})`" 
                      @click="usePlayerAmmo(index, weaponStore.parseFireModes(weapon.rof).burst || 3)"
                      :disable="!weapon.mag || weapon.currentAmmo < (weaponStore.parseFireModes(weapon.rof).burst || 3)"
                    />
                    <q-btn 
                      v-if="weapon.rof?.includes('/')"
                      flat 
                      dense 
                      size="sm" 
                      :label="`Voll (${weaponStore.parseFireModes(weapon.rof).full || 10})`" 
                      @click="usePlayerAmmo(index, weaponStore.parseFireModes(weapon.rof).full || 10)"
                      :disable="!weapon.mag || weapon.currentAmmo < (weaponStore.parseFireModes(weapon.rof).full || 10)"
                    />
                    <q-btn 
                      flat 
                      dense 
                      size="sm" 
                      icon="refresh" 
                      @click="reloadPlayerWeapon(index)"
                      :disable="!weapon.mag || weapon.currentAmmo === weapon.mag"
                    >
                      <q-tooltip>Nachladen</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </div>
              </div>
              <div v-else class="text-grey">
                Keine Waffen mit Munition
              </div>
            </div>
          </div>
          
          <!-- Notizen & Kritische Wunden -->
          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model="combatStore.currentCombatant.notes"
                label="Notizen"
                type="textarea"
                filled
                dense
                rows="2"
                @update:model-value="combatStore.saveCombat()"
                placeholder="Zustände, Effekte, etc."
              />
            </div>
            <div class="col-auto">
              <div class="text-subtitle2 text-grey q-mb-sm">Kritische Wunden</div>
              <div class="row q-gutter-xs">
                <q-btn 
                  round 
                  dense 
                  flat 
                  icon="remove" 
                  size="sm"
                  @click="adjustCriticalWounds(-1)"
                  :disable="!combatStore.currentCombatant.criticalWounds"
                />
                <q-chip square>
                  {{ combatStore.currentCombatant.criticalWounds || 0 }}
                </q-chip>
                <q-btn 
                  round 
                  dense 
                  flat 
                  icon="add" 
                  size="sm"
                  @click="adjustCriticalWounds(1)"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- NPC Panel - Aktionen -->
        <div v-else class="row q-gutter-md">
          <!-- Basis Info -->
          <div class="col-auto">
            <div class="text-subtitle2 text-grey">Werte</div>
            <div v-if="combatStore.currentCombatant.attributes?.KG">
              KG: {{ combatStore.currentCombatant.attributes.KG }}
            </div>
            <div v-if="combatStore.currentCombatant.attributes?.BF">
              BF: {{ combatStore.currentCombatant.attributes.BF }}
            </div>
            <div v-if="combatStore.currentCombatant.toughness || combatStore.currentCombatant.attributes?.WI">
              WI: {{ combatStore.currentCombatant.toughness || combatStore.currentCombatant.attributes?.WI }}
            </div>
              <div v-if="combatStore.currentCombatant.armor">
              Rüstung: {{ combatStore.currentCombatant.armor }}
            </div>
          </div>
          
          <!-- Waffen -->
          <div class="col">
            <div class="text-subtitle2 text-grey">Waffen & Aktionen</div>
            <div v-if="getCombatantWeapons(combatStore.currentCombatant).length">
              <div v-for="(weapon, index) in getCombatantWeapons(combatStore.currentCombatant)" :key="weapon.instanceId || (weapon.name + index)" class="q-mb-sm">
                <div class="row items-center q-gutter-xs">
                  <q-btn
                    :color="weapon.isReloading ? 'grey' : weapon.mag > 0 && weapon.currentAmmo === 0 ? 'orange' : 'primary'"
                    :disable="weapon.isReloading || (weapon.mag > 0 && weapon.currentAmmo === 0)"
                    @click="performAttack(weapon, index)"
                    no-caps
                  >
                    <div class="row items-center q-gutter-xs">
                      <span>{{ weapon.name }}</span>
                      <q-chip v-if="weapon.mag > 0" 
                        :color="weapon.currentAmmo > 0 ? 'green' : 'red'" 
                        text-color="white"
                        dense
                        size="sm"
                      >
                        {{ weapon.currentAmmo }}/{{ weapon.mag }}
                      </q-chip>
                      <q-chip v-if="weapon.isReloading" 
                        color="orange" 
                        text-color="white"
                        dense
                        size="sm"
                      >
                        Lädt ({{ weapon.reloadTimeLeft }})
                      </q-chip>
                    </div>
                  </q-btn>
                  
                  <!-- Nachladen-Button -->
                  <q-btn
                    v-if="weapon.mag > 0 && weapon.currentAmmo < weapon.mag && !weapon.isReloading"
                    flat
                    round
                    dense
                    icon="refresh"
                    size="sm"
                    color="orange"
                    @click="reloadWeapon(index)"
                  >
                    <q-tooltip>Nachladen ({{ weapon.reload }} Aktion{{ weapon.reload > 1 ? 'en' : '' }})</q-tooltip>
                  </q-btn>
                </div>
                <div class="text-caption text-grey q-ml-sm">
                  {{ weapon.damage }} | Pen: {{ weapon.pen || 0 }}
                  <span v-if="weapon.range"> | Range: {{ weapon.range }}m</span>
                  <span v-if="weapon.rof"> | RoF: {{ weapon.rof }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-grey">
              Keine Waffen ausgerüstet
            </div>
            
            <!-- Schnellaktionen -->
            <div class="q-mt-sm">
              <q-btn flat dense icon="casino" label="Würfeln" @click="openDiceDialog" />
              <q-btn flat dense icon="shield" label="Verteidigen" color="blue" />
              <q-btn flat dense icon="directions_run" label="Bewegen" color="orange" />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
    
    <!-- Schnell-Hinzufügen -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Kämpfer hinzufügen</div>
        
        <!-- Template-Buttons -->
        <div class="row q-gutter-sm">
          <q-btn
            color="blue"
            icon="person_add"
            label="Einzelne Templates"
            @click="showTemplateSelector = true"
          />
          <q-btn
            v-if="activePlayerGroup"
            color="green"
            icon="group_add"
            :label="`Spieler-Gruppe: ${activePlayerGroup.name}`"
            @click="addActiveGroupToCombat"
          />
          <q-btn
            color="red"
            icon="groups"
            label="Encounter hinzufügen"
            @click="showEncounterSelector = true"
          />
        </div>
      </q-card-section>
    </q-card>
    
    <!-- Template Selector Dialog -->
    <q-dialog v-model="showTemplateSelector">
      <q-card style="min-width: 500px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">Template auswählen</div>
        </q-card-section>
        
        <q-card-section style="max-height: 60vh" class="scroll">
          <q-list separator>
            <q-item-label header>Spieler</q-item-label>
            <q-item 
              v-for="template in characterStore.getPlayerTemplates()" 
              :key="template.id"
              clickable
              @click="addTemplateToCombat(template)"
            >
              <q-item-section avatar>
                <q-avatar color="green" text-color="white">
                  <q-icon name="person" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ template.name }}</q-item-label>
                <q-item-label caption>
                  HP: {{ template.hp?.max || template.hp }} | Init: {{ template.initiativeModifier }}
                  <span v-if="template.armorIds && template.armorIds.length > 0"> | {{ template.armorIds.length }} Rüstungsteil(e)</span>
                </q-item-label>
              </q-item-section>
            </q-item>
            
            <q-separator spaced />
            
            <q-item-label header>NPCs</q-item-label>
            <q-item 
              v-for="template in characterStore.getNPCTemplates()" 
              :key="template.id"
              clickable
              @click="addTemplateToCombat(template)"
            >
              <q-item-section avatar>
                <q-avatar color="red" text-color="white">
                  <q-icon name="person" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ template.name }}</q-item-label>
                <q-item-label caption>
                  {{ template.category }} | HP: {{ template.hp?.max || template.hp }} | Init: {{ template.initiativeModifier }}
                  <span v-if="template.armorIds && template.armorIds.length > 0"> | {{ template.armorIds.length }} Rüstungsteil(e)</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Schließen" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Encounter Selector Dialog -->
    <q-dialog v-model="showEncounterSelector">
      <q-card style="min-width: 500px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">Encounter auswählen</div>
        </q-card-section>
        
        <q-card-section style="max-height: 60vh" class="scroll">
          <q-list separator>
            <q-item 
              v-for="encounter in characterStore.encounterGroups" 
              :key="encounter.id"
              clickable
              @click="addEncounterToCombat(encounter)"
            >
              <q-item-section>
                <q-item-label>{{ encounter.name }}</q-item-label>
                <q-item-label caption>
                  {{ encounter.description || 'Keine Beschreibung' }}
                </q-item-label>
                <div class="q-mt-sm">
                  <q-chip 
                    v-for="npcId in encounter.npcIds" 
                    :key="npcId"
                    size="sm"
                    color="red"
                    text-color="white"
                  >
                    {{ characterStore.templates.find(t => t.id === npcId)?.name || 'Unbekannt' }}
                  </q-chip>
                </div>
              </q-item-section>
              <q-item-section side>
                <q-badge color="red">{{ encounter.npcIds.length }} NPCs</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
          
          <div v-if="characterStore.encounterGroups.length === 0" class="text-center text-grey q-pa-xl">
            Keine Encounters vorhanden. Erstelle sie in der Templates-Ansicht.
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Schließen" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Attack Dialog -->
    <q-dialog v-model="attackDialog">
      <q-card style="width: 85vw; max-width: 1200px; height: 85vh; max-height: 800px">
        <q-card-section class="q-pb-none">
          <div class="text-h5">Angriff: {{ currentWeapon?.name }}</div>
        </q-card-section>
        
        <q-card-section class="scroll" style="max-height: calc(90vh - 120px)">
          <!-- Feuermodus-Auswahl -->
          <div v-if="availableFireModes.length > 1" class="q-mb-md">
            <div class="text-subtitle2">Feuermodus</div>
            <q-btn-toggle
              v-model="selectedFireMode"
              toggle-color="primary"
              :options="availableFireModes"
              spread
              unelevated
              rounded
            />
            <div class="q-mt-sm text-caption">
              Munitionsverbrauch: {{ ammoUsage }} Schuss
            </div>
          </div>
          
          <!-- Trefferchance -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Trefferchance</div>
            
            <!-- Häufige Modifikatoren -->
            <div class="row q-gutter-md q-mb-md">
              <div class="col-auto">
                <div class="text-caption text-grey q-mb-xs">Häufige Modifikatoren:</div>
                <div class="q-gutter-sm">
                  <q-checkbox v-model="attackModifiers.aim" label="Zielen (+10)" dense />
                  <q-checkbox v-model="attackModifiers.shortRange" label="Kurze Reichweite (+10)" dense />
                  <q-checkbox v-model="attackModifiers.targetProne" label="Ziel liegend (-10)" dense />
                  <q-checkbox v-model="attackModifiers.running" label="Laufen (-20)" dense />
                </div>
              </div>
              
              <div class="col-auto">
                <div class="text-caption text-grey q-mb-xs">Zusätzlicher Modifikator:</div>
                <q-slider
                  v-model="attackModifiers.custom"
                  :min="-60"
                  :max="60"
                  :step="10"
                  label
                  label-always
                  color="primary"
                  track-size="10px"
                  thumb-size="20px"
                  style="width: 250px"
                  :label-value="attackModifiers.custom > 0 ? '+' + attackModifiers.custom : attackModifiers.custom"
                />
                <div class="text-center">
                  <q-btn 
                    flat 
                    dense 
                    size="sm" 
                    label="Reset" 
                    @click="attackModifiers.custom = 0"
                  />
                </div>
              </div>
            </div>
            
            <!-- Berechnung -->
            <div class="row items-center q-gutter-md bg-grey-10 q-pa-sm rounded-borders">
              <div>Basis: <strong>{{ attackSkill }}%</strong></div>
              <div v-if="attackModifiers.aim" class="text-green">Zielen: +10</div>
              <div v-if="attackModifiers.shortRange" class="text-green">Kurze Reichweite: +10</div>
              <div v-if="attackModifiers.targetProne" class="text-orange">Ziel liegend: -10</div>
              <div v-if="attackModifiers.running" class="text-red">Laufen: -20</div>
              <div v-if="selectedFireMode === 'burst'" class="text-green">Salve: +10</div>
              <div v-if="selectedFireMode === 'full'" class="text-green">Vollautomatik: +20</div>
              <div v-if="attackModifiers.custom !== 0" :class="attackModifiers.custom > 0 ? 'text-green' : 'text-red'">
                Sonstige: {{ attackModifiers.custom > 0 ? '+' : '' }}{{ attackModifiers.custom }}
              </div>
              <q-space />
              <div class="text-h5 text-primary">
                = {{ calculatedHitChance }}%
              </div>
            </div>
          </div>
          
          <!-- Würfelergebnis -->
          <div class="q-mb-md">
            <q-btn color="primary" label="Angriffswurf (W100)" @click="rollAttack" />
            <div v-if="attackRoll" class="q-mt-sm">
              <div class="text-h4" :class="attackHit ? 'text-green' : 'text-red'">
                Wurf: {{ attackRoll }}
              </div>
              <div v-if="attackHit">
                <div class="text-positive">TREFFER!</div>
              </div>
              <div v-else class="text-negative">VERFEHLT!</div>
            </div>
          </div>
          
          <!-- Treffer-Details -->
          <div v-if="attackHit" class="q-mb-md">
            <div class="text-h6 text-green q-mb-md">
              {{ hits.length }} Treffer!
            </div>
            
            <!-- Treffer-Liste -->
            <div v-for="(hit, index) in hits" :key="index" class="q-mb-md q-pa-md bg-grey-10 rounded-borders">
              <!-- Treffer-Header -->
              <div class="row items-center q-mb-sm">
                <q-chip color="primary" text-color="white" class="q-mr-md">
                  Treffer {{ index + 1 }}
                </q-chip>
                <div class="text-subtitle1">
                  <strong>{{ hit.location.name }}</strong>
                  <span class="text-caption text-grey q-ml-sm">
                    ({{ hit.originalRoll }} → {{ hit.reversedRoll }}{{ index > 0 ? '+' + (index * 10) : '' }} = {{ hit.roll }})
                  </span>
                </div>
              </div>
              
              <!-- Schaden-Bereich -->
              <div class="row items-start q-gutter-md">
                <div class="col-auto" style="min-width: 150px">
                  <q-btn 
                    v-if="!hit.damage"
                    color="orange" 
                    size="md"
                    label="Schaden würfeln" 
                    @click="rollDamageForHit(index)" 
                    class="full-width"
                  />
                </div>
                
                <div v-if="hit.damage" class="col">
                  <div class="text-h6">
                    Schaden: {{ hit.damage.total + (hit.furyDamageRolls?.reduce((sum, f) => sum + f.total, 0) || 0) }}
                    <q-chip 
                      color="purple" 
                      text-color="white" 
                      size="sm"
                      class="q-ml-sm"
                    >
                      Pen {{ currentWeapon?.pen || 0 }}
                    </q-chip>
                  </div>
                  <div class="text-caption text-grey">
                    Basis: {{ hit.damage.breakdown }}
                    <span v-if="hit.furyDamageRolls?.length > 0">
                      | Zorn: +{{ hit.furyDamageRolls.reduce((sum, f) => sum + f.total, 0) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Gerechter Zorn für diesen Treffer -->
              <div v-if="hit.damage?.hasCritical && systemStore.selectedSystem === 'wh40k'" class="q-mt-md q-ml-lg">
                <q-banner class="bg-amber-10 text-white">
                  <template v-slot:avatar>
                    <q-icon name="flash_on" />
                  </template>
                  <div class="text-h6">GERECHTER ZORN!</div>
                  <div>Natürliche {{ hit.damage.diceSize === 5 ? '5' : '10' }} gewürfelt!</div>
                </q-banner>
                
                <div class="q-mt-sm">
                  <q-btn 
                    v-if="!hit.righteousFuryRoll"
                    color="amber" 
                    size="sm"
                    label="Bestätigungswurf" 
                    @click="confirmRighteousFuryForHit(index)"
                  />
                  <div v-if="hit.righteousFuryRoll" class="q-mt-sm">
                    <div :class="hit.righteousFuryHit ? 'text-positive' : 'text-negative'">
                      Wurf: {{ hit.righteousFuryRoll }} (benötigt {{ calculatedHitChance }}%)
                    </div>
                    <div v-if="hit.righteousFuryHit && !hit.righteousFuryConfirmed">
                      <q-btn 
                        color="amber" 
                        size="sm"
                        label="Zusatzschaden" 
                        @click="rollRighteousFuryDamageForHit(index)"
                        class="q-mt-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div v-if="hit.furyDamageRolls?.length > 0" class="q-mt-sm">
                  <div class="text-subtitle2">Zusatzschaden:</div>
                  <div v-for="(fury, fIndex) in hit.furyDamageRolls" :key="fIndex">
                    +{{ fury.total }} ({{ fury.rolls.join('+') }}{{ fury.modifier >= 0 ? '+' : ''}}{{ fury.modifier }})
                    <span v-if="fury.hasCritical" class="text-amber"> → Weitere 10!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Schließen" v-close-popup @click="resetAttack" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Dice Dialog -->
    <q-dialog v-model="diceDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Würfeln</div>
        </q-card-section>
        
        <q-card-section>
          <div class="row q-gutter-sm">
            <q-btn v-for="dice in [4, 6, 8, 10, 12, 20, 100]" 
              :key="dice"
              :label="`W${dice}`"
              color="primary"
              @click="rollDice(dice)"
            />
          </div>
          
          <div v-if="lastDiceRoll" class="q-mt-md text-center">
            <div class="text-h3">{{ lastDiceRoll.result }}</div>
            <div class="text-caption">W{{ lastDiceRoll.dice }}</div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Schließen" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Schaden/Heilung Dialog -->
    <q-dialog v-model="damageDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">{{ damageMode === 'damage' ? 'Schaden' : 'Heilung' }}</div>
        </q-card-section>
        
        <q-card-section>
          <q-input
            v-model.number="damageAmount"
            :label="damageMode === 'damage' ? 'Schadenspunkte' : 'Heilungspunkte'"
            type="number"
            filled
            autofocus
            @keyup.enter="applyDamage"
          />
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Abbrechen" v-close-popup />
          <q-btn 
            flat 
            :label="damageMode === 'damage' ? 'Schaden zufügen' : 'Heilen'" 
            color="primary"
            @click="applyDamage"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Defense Dialog -->
    <q-dialog v-model="defenseDialog">
      <q-card style="width: 600px; max-width: 90vw">
        <q-card-section class="q-pb-none">
          <div class="text-h5">Verteidigung: {{ defendingCombatant?.name }}</div>
        </q-card-section>
        
        <q-card-section>
          <!-- Spieler-Version: Nur Deckungsverwaltung -->
          <div v-if="defendingCombatant?.type === 'player'">
            <!-- Deckungsauswahl bleibt gleich -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">Deckungsverwaltung</div>
              
              <div class="row q-gutter-md items-center q-mb-sm">
                <q-select
                  v-model="defendingCombatant.currentCover"
                  :options="coverTypesWithNone"
                  option-label="label"
                  label="Aktuelle Deckung"
                  filled
                  dense
                  style="width: 250px"
                  @update:model-value="updateCharacterCover"
                />
                
                <q-btn
                  v-if="defendingCombatant.currentCover && defendingCombatant.currentCover.value > 0"
                  flat
                  dense
                  size="sm"
                  icon="refresh"
                  label="Reset Schaden"
                  @click="resetCoverDamage"
                />
              </div>
              
              <div v-if="defendingCombatant.currentCover && defendingCombatant.currentCover.value > 0" class="q-pa-md bg-brown-10 rounded-borders">
                <div class="text-h6 q-mb-sm">{{ defendingCombatant.currentCover.label }}</div>
                <div class="row items-center q-gutter-md">
                  <div>
                    <div>Basis-Schutz: <strong>{{ defendingCombatant.currentCover.value }} RP</strong></div>
                    <div v-if="defendingCombatant.currentCover.damage > 0" class="text-orange">
                      Schaden erlitten: <strong>-{{ defendingCombatant.currentCover.damage }} RP</strong>
                    </div>
                    <div class="text-h5 q-mt-sm">
                      Aktuell: <strong>{{ defendingCombatant.currentCover.value - (defendingCombatant.currentCover.damage || 0) }} RP</strong>
                    </div>
                  </div>
                  
                  <q-space />
                  
                  <q-btn
                    color="orange"
                    icon="bolt"
                    label="Durchschlag (+1 Schaden)"
                    @click="damageCover"
                    :disable="!defendingCombatant.currentCover || defendingCombatant.currentCover.value <= (defendingCombatant.currentCover.damage || 0)"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- NPC-Version: Vollständiger Dialog -->
          <div v-else>
            <!-- Eingehender Schaden -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">Eingehender Angriff</div>
              <div class="row q-gutter-md">
                <q-input
                  v-model.number="incomingDamage"
                  label="Schaden"
                  type="number"
                  filled
                  dense
                  style="width: 120px"
                />
                <q-input
                  v-model.number="incomingPen"
                  label="Durchschlag"
                  type="number"
                  filled
                  dense
                  style="width: 120px"
                />
                <q-select
                  v-model="hitBodyPart"
                  :options="bodyParts"
                  label="Trefferzone"
                  filled
                  dense
                  style="width: 150px"
                />
              </div>
            </div>
            
            <!-- Verteidigungsoptionen -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">Verteidigung</div>
              
              <!-- Ausweichen/Parieren -->
              <div class="row q-gutter-md q-mb-md">
                <q-btn-toggle
                  v-model="defenseType"
                  toggle-color="primary"
                  :options="[
                    {label: 'Keine', value: 'none'},
                    {label: 'Ausweichen', value: 'dodge'},
                    {label: 'Parieren', value: 'parry'}
                  ]"
                />
                
                <div v-if="defenseType !== 'none'" class="row items-center q-gutter-sm">
                  <div>Basis: {{ actualDefenseSkill }}%</div>
                  <q-slider
                    v-model="defenseModifier"
                    :min="-60"
                    :max="60"
                    :step="10"
                    label
                    label-always
                    color="primary"
                    style="width: 150px"
                    :label-value="defenseModifier > 0 ? '+' + defenseModifier : defenseModifier"
                  />
                </div>
              </div>
              
              <div v-if="defenseType !== 'none'" class="q-mb-md">
                <q-btn 
                  color="primary" 
                  label="Verteidigungswurf (W100)" 
                  @click="rollDefense"
                />
                <div v-if="defenseRoll" class="q-mt-sm">
                  <div class="text-h5" :class="defenseSuccess ? 'text-green' : 'text-red'">
                    Wurf: {{ defenseRoll }} (benötigt {{ defenseSkill + defenseModifier }}%)
                  </div>
                  <div v-if="defenseSuccess" class="text-positive">
                    ERFOLGREICH {{ defenseType === 'dodge' ? 'AUSGEWICHEN' : 'PARIERT' }}!
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Deckung -->
          <div class="q-mb-md" v-if="defendingCombatant?.type != 'player'">
            <div class="text-subtitle2 q-mb-sm">Deckung</div>
            
            <!-- Deckungsauswahl -->
            <div class="row q-gutter-md items-center q-mb-sm">
              <q-select
                v-model="defendingCombatant.currentCover"
                :options="coverTypesWithNone"
                option-label="label"
                label="Aktuelle Deckung"
                filled
                dense
                style="width: 250px"
                @update:model-value="updateCharacterCover"
              />
              
              <q-btn
                v-if="defendingCombatant.currentCover && defendingCombatant.currentCover.value > 0"
                flat
                dense
                size="sm"
                icon="refresh"
                label="Reset Schaden"
                @click="resetCoverDamage"
              />
            </div>
            
            <div v-if="defendingCombatant.currentCover && defendingCombatant.currentCover.value > 0" class="q-pa-sm bg-brown-10 rounded-borders">
              <div class="text-caption">
                <strong>{{ defendingCombatant.currentCover.label }}</strong>
                <div>Basis-Schutz: {{ defendingCombatant.currentCover.value }} RP</div>
                <div v-if="defendingCombatant.currentCover.damage > 0" class="text-orange">
                  Schaden erlitten: -{{ defendingCombatant.currentCover.damage }} RP
                </div>
                <div class="text-weight-bold">
                  Aktueller Schutz: {{ defendingCombatant.currentCover.value - (defendingCombatant.currentCover.damage || 0) }} RP
                </div>
              </div>
            </div>
            
            <q-checkbox 
              v-model="hitZoneInCover" 
              label="Trefferzone ist in Deckung"
              class="q-mt-sm"
            />
          </div>
          
          <!-- Schadensberechnung -->
          <div v-if="!defenseSuccess && !defendingCombatant?.type != 'player'" class="q-pa-md bg-grey-10 rounded-borders">
            <div class="text-h6 q-mb-sm">Schadensberechnung</div>
            <div class="q-gutter-xs">
              <div>Eingehender Schaden: <strong>{{ incomingDamage }}</strong></div>
              <div>Durchschlag: <strong>{{ incomingPen }}</strong></div>
              <div v-if="hitZoneInCover && defendingCombatant?.currentCover?.value > 0">
                Deckung: <strong>-{{ calculateCoverReduction() }}</strong>
                <span v-if="willPenetrateCover()" class="text-orange q-ml-sm">
                  (Deckung durchschlagen!)
                </span>
              </div>
              <div>Rüstung: <strong>-{{ effectiveArmorForHitZone }}</strong></div>
              <div>Widerstandsbonus: <strong>-{{ toughnessBonus }}</strong></div>
              <q-separator class="q-my-sm" />
              <div class="text-h5 text-red">
                Finaler Schaden: {{ calculateFinalDamage() }}
              </div>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Schließen" v-close-popup v-if="defendingCombatant?.type === 'player'" />
          <q-btn flat label="Abbrechen" v-close-popup v-else />
          <q-btn 
            v-if="!defenseSuccess && defendingCombatant?.type !== 'player'"
            flat 
            label="Schaden anwenden" 
            color="red"
            @click="applyDefenseDamage"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Engagement Dialog (NPC kämpft gegen Spieler) -->
    <q-dialog v-model="engagementDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Gegner zuweisen: {{ engagementNPC?.name }}</div>
        </q-card-section>
        
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Wähle Spieler und Entfernungen:</div>
          <q-list>
            <q-item v-for="player in playerCombatants" :key="player.id">
              <q-item-section avatar>
                <q-checkbox 
                  :model-value="isEngagedWith(engagementNPC, player.id)"
                  @update:model-value="(val) => handleEngagementChange(player.id, val)"
                />
              </q-item-section>
              <q-item-section avatar>
                <q-avatar size="30px" :color="player.iconColor" text-color="white">
                  <q-icon size="sm" :name="player.iconSymbol" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ player.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input
                  v-if="isEngagedWith(engagementNPC, player.id)"
                  :model-value="getEngagementDistance(engagementNPC, player.id)"
                  @update:model-value="updateEngagementDistance(player.id, $event)"
                  type="number"
                  suffix="m"
                  filled
                  dense
                  style="width: 80px"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Abbrechen" v-close-popup />
          <q-btn flat label="Speichern" color="primary" @click="saveEngagements" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Initiative Dialog für alle Spieler -->
    <q-dialog v-model="initiativeDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Initiative eingeben</div>
          <div class="text-caption">{{ systemStore.initiativeDice() === 'd10' ? 'W10' : 'W20' }} + Modifier</div>
        </q-card-section>
        
        <q-card-section>
          <q-list>
            <q-item v-for="player in playerInitiatives" :key="player.id">
              <q-item-section avatar>
                <q-avatar :color="player.iconColor || 'green'" text-color="white" size="30px">
                  <q-icon :name="player.iconSymbol || 'person'" size="sm" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ player.name }}</q-item-label>
                <q-item-label caption>Modifier: {{ player.initiativeModifier || 0 }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input
                  v-model.number="player.rolledInitiative"
                  type="number"
                  filled
                  dense
                  style="width: 80px"
                  :label="`Total`"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Auto-Würfeln" @click="autoRollPlayerInitiatives" />
          <q-btn flat label="Abbrechen" v-close-popup />
          <q-btn flat label="Speichern" color="primary" @click="savePlayerInitiatives" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useCombatStore } from '../stores/combatStore'
import { useSystemStore } from '../stores/systemStore'
import { useCharacterStore } from '../stores/characterStore'
import { useWeaponStore } from '../stores/weaponStore'
import { useArmorStore } from '../stores/armorStore'
import { useQuasar } from 'quasar'

const combatStore = useCombatStore()
const systemStore = useSystemStore()
const characterStore = useCharacterStore()
const weaponStore = useWeaponStore()
const armorStore = useArmorStore()
const $q = useQuasar()

// Helper function to get all weapons
const getCombatantWeapons = (combatant) => {
  if (!combatant) return []
  
  // Nur noch weaponInstances verwenden
  return combatant.weaponInstances || []
}

// Selectors
const showTemplateSelector = ref(false)
const showEncounterSelector = ref(false)

// Schaden/Heilung
const damageDialog = ref(false)
const damageMode = ref('damage')
const damageAmount = ref(0)
const targetCombatant = ref(null)


// Attack System
const attackDialog = ref(false)
const currentWeapon = ref(null)
const currentWeaponIndex = ref(null)
const attackSkill = ref(30)
const attackModifiers = reactive({
  aim: false,
  shortRange: false,
  targetProne: false,
  running: false,
  custom: 0
})

// Speichere Modifikatoren pro Waffe/Kämpfer-Kombination
const savedModifiers = ref({})
const attackRoll = ref(null)
const attackHit = ref(false)
const hits = ref([]) // Array mit allen Treffern
const targetArmor = ref(0)
const selectedFireMode = ref('single')
const availableFireModes = ref([])

// Debug watcher für Feuermodus (kann später entfernt werden)
watch(selectedFireMode, (newVal, oldVal) => {
  console.log('Fire mode changed from', oldVal, 'to', newVal)
})

// Dice System
const diceDialog = ref(false)
const lastDiceRoll = ref(null)

// Defense System
const defenseDialog = ref(false)
const defendingCombatant = ref(null)
const incomingDamage = ref(0)
const incomingPen = ref(0)
const hitBodyPart = ref('Körper')
const defenseType = ref('none')
const defenseSkill = ref(30)
const defenseModifier = ref(0)
const defenseRoll = ref(null)
const defenseSuccess = ref(false)
const hitZoneInCover = ref(false)

const bodyParts = ['Kopf', 'Körper', 'Linker Arm', 'Rechter Arm', 'Linkes Bein', 'Rechtes Bein']

const coverTypes = [
  { label: 'Dünnes Metall/Glas', value: 4 },
  { label: 'Lagerkiste/Sandsäcke', value: 8 },
  { label: 'Cogitatorbank', value: 12 },
  { label: 'Stahlbeton/Stein', value: 16 },
  { label: 'Schott/Plaststahl', value: 32 }
]

const coverTypesWithNone = [
  { label: 'Keine Deckung', value: 0 },
  ...coverTypes.map(c => ({ ...c, damage: 0 }))
]

// Computed
// Targeting System
const selectedCombatant = ref(null)
const selectedTarget = ref(null)
const editingDistance = ref(null)
const hoveredPlayer = ref(null)

// Player Icons für visuelle Unterscheidung
const playerIcons = ['person', 'face', 'psychology', 'sentiment_satisfied', 'mood', 'account_circle', 'badge', 'military_tech']
const playerColors = ['green', 'teal', 'cyan', 'lime', 'light-green', 'blue', 'indigo', 'purple']

// Computed properties für getrennte Listen
const playerCombatants = computed(() => {
  const players = combatStore.sortedCombatants.filter(c => c.type === 'player')
  // Weise jedem Spieler ein Icon und Farbe zu basierend auf Index
  players.forEach((player, index) => {
    player.iconSymbol = playerIcons[index % playerIcons.length]
    player.iconColor = playerColors[index % playerColors.length]
  })
  return players
})

const npcCombatants = computed(() => 
  combatStore.sortedCombatants.filter(c => c.type === 'npc')
)

const activePlayerGroup = computed(() => 
  characterStore.playerGroups.find(g => g.isActive)
)

const effectiveArmorForHitZone = computed(() => {
  if (!defendingCombatant.value) return 0
  
  let armor = 0
  if (defendingCombatant.value?.armorIds && defendingCombatant.value.armorIds.length > 0) {
    const bodyPartMap = {
      'Kopf': 'head',
      'Körper': 'torso',
      'Linker Arm': 'arms',
      'Rechter Arm': 'arms', 
      'Linkes Bein': 'legs',
      'Rechtes Bein': 'legs'
    }
    const bodyPart = bodyPartMap[hitBodyPart.value] || 'torso'
    const armorData = armorStore.getArmorForBodyPart(defendingCombatant.value.armorIds, bodyPart)
    armor = armorData.rp
  }
  // Kein Fallback - ohne Rüstungsteile = 0 Rüstung
  
  // Nur Penetration von Rüstung abziehen
  return Math.max(0, armor - (Number(incomingPen.value) || 0))
})

const toughnessBonus = computed(() => {
  if (!defendingCombatant.value) return 0
  // WiB ist die 10er Stelle vom WI (Widerstand) Attribut
  const wi = defendingCombatant.value?.attributes?.WI || 30
  return Math.floor(wi / 10)
})

const actualDefenseSkill = computed(() => {
  if (!defendingCombatant.value) return 30
  
  if (defenseType.value === 'parry') {
    // Parieren nutzt Kampfgeschick (KG)
    let baseSkill = defendingCombatant.value.attributes?.KG || 30
    
    // Prüfe ob der Verteidiger eine Waffe mit Balanced/Unbalanced hat
    // Nimm die erste Nahkampfwaffe
    const meleeWeapon = defendingCombatant.value.weapons?.find(w => 
      w.skill === 'WS' || w.type === 'melee' || w.mag === 0
    )
    
    if (meleeWeapon?.special) {
      if (meleeWeapon.special.includes('Balanced')) {
        baseSkill += 10 // Balanced gibt +10 auf Parieren
      }
      if (meleeWeapon.special.includes('Unbalanced') || meleeWeapon.special.includes('Unwieldy')) {
        return 0 // Kann nicht zum Parieren verwendet werden
      }
    }
    
    return baseSkill
  } else if (defenseType.value === 'dodge') {
    // Ausweichen nutzt Gewandtheit (GE)
    return defendingCombatant.value.attributes?.GE || 30
  }
  
  return 30
})

const calculatedHitChance = computed(() => {
  let chance = attackSkill.value
  let totalMod = 0
  
  // Häufige Modifikatoren
  if (attackModifiers.aim) totalMod += 10
  if (attackModifiers.shortRange) totalMod += 10
  if (attackModifiers.targetProne) totalMod -= 10
  if (attackModifiers.running) totalMod -= 20
  
  // Feuermodus
  if (selectedFireMode.value === 'burst') totalMod += 10
  if (selectedFireMode.value === 'full') totalMod += 20
  
  // Custom Modifikator
  totalMod += attackModifiers.custom
  
  // Maximum +/-60 Modifikation
  totalMod = Math.min(60, Math.max(-60, totalMod))
  
  chance += totalMod
  
  // Endgültige Chance zwischen 1% und 95%
  return Math.min(95, Math.max(1, chance))
})

const ammoUsage = computed(() => {
  if (!currentWeapon.value) return 0
  return weaponStore.getAmmoUsage(currentWeapon.value.rof, selectedFireMode.value)
})

// Removed totalDamage and damageBreakdown - now handled per hit

// Lade gespeicherten Kampf
onMounted(() => {
  combatStore.loadCombat()
})


// Engagement Dialog State
const engagementDialog = ref(false)
const engagementNPC = ref(null)
const tempEngagements = ref([])

// Targeting Functions für Spieler
const selectCombatant = (combatant) => {
  // Nicht mehr benötigt - wir nutzen nur noch hover und currentCombatant
}

const toggleTargeting = (combatant) => {
  if (combatant.targetId) {
    combatant.targetId = null
    $q.notify({
      type: 'info',
      message: `${combatant.name} hat kein Ziel mehr`
    })
    combatStore.saveCombat()
  } else {
    // Temporär für Zielauswahl merken
    selectedCombatant.value = combatant
    $q.notify({
      type: 'info',
      message: `Wähle ein Ziel für ${combatant.name}`
    })
  }
}

const getTargetName = (targetId) => {
  const target = combatStore.combatants.find(c => c.id === targetId)
  return target ? target.name : 'Unbekannt'
}

const isTargetOfCurrentPlayer = (npcId) => {
  // Prüfe ob der hoverte Spieler auf diesen NPC zielt
  if (hoveredPlayer.value && hoveredPlayer.value.targetId === npcId) {
    return true
  }
  // Prüfe ob der aktuelle Spieler (der an der Reihe ist) auf diesen NPC zielt
  if (combatStore.currentCombatant && 
      combatStore.currentCombatant.type === 'player' && 
      combatStore.currentCombatant.targetId === npcId) {
    return true
  }
  return false
}

// Engagement Functions für NPCs
const selectNPC = (npc) => {
  // Wenn ein Spieler ausgewählt ist, setze ihn als Ziel dieses NPCs
  if (selectedCombatant.value && selectedCombatant.value.type === 'player') {
    selectedCombatant.value.targetId = npc.id
    combatStore.saveCombat()
    $q.notify({
      type: 'info',
      message: `${selectedCombatant.value.name} zielt auf ${npc.name}`
    })
    // Entferne die Markierung
    selectedCombatant.value = null
  }
}

const openEngagementDialog = (npc) => {
  engagementNPC.value = npc
  // Kopiere bestehende Engagements oder erstelle leeres Array
  tempEngagements.value = npc.engagedWith ? [...npc.engagedWith] : []
  engagementDialog.value = true
}

const isEngagedWith = (npc, playerId) => {
  // Für den Dialog verwenden wir tempEngagements
  return tempEngagements.value.some(e => e.playerId === playerId)
}

const handleEngagementChange = (playerId, newValue) => {
  // Check if player is already in the list
  const exists = tempEngagements.value.some(e => e.playerId === playerId)
  
  if (newValue && !exists) {
    // Add player
    tempEngagements.value.push({ playerId, distance: 10 })
  } else if (!newValue && exists) {
    // Remove player
    tempEngagements.value = tempEngagements.value.filter(e => e.playerId !== playerId)
  }
}

const getEngagementDistance = (npc, playerId) => {
  const engagement = tempEngagements.value.find(e => e.playerId === playerId)
  return engagement ? engagement.distance : 10
}

const updateEngagementDistance = (playerId, distance) => {
  const engagement = tempEngagements.value.find(e => e.playerId === playerId)
  if (engagement) {
    engagement.distance = parseInt(distance) || 0
  }
}

const saveEngagements = () => {
  if (engagementNPC.value) {
    engagementNPC.value.engagedWith = [...tempEngagements.value]
    combatStore.saveCombat()
    $q.notify({
      type: 'positive',
      message: 'Gegner-Zuweisungen gespeichert'
    })
  }
  engagementDialog.value = false
}

const getPlayerIcon = (playerId) => {
  const player = playerCombatants.value.find(p => p.id === playerId)
  return player ? player.iconSymbol : 'person'
}

const getPlayerColor = (playerId) => {
  const player = playerCombatants.value.find(p => p.id === playerId)
  return player ? player.iconColor : 'green'
}

const editDistance = (npc, engagement) => {
  $q.dialog({
    title: 'Entfernung ändern',
    message: `Entfernung zu ${getTargetName(engagement.playerId)}:`,
    prompt: {
      model: engagement.distance || 10,
      type: 'number'
    },
    cancel: true
  }).onOk((value) => {
    engagement.distance = parseInt(value) || 0
    combatStore.saveCombat()
  })
}

const removeCombatant = (combatant) => {
  $q.dialog({
    title: 'Bestätigen',
    message: `${combatant.name} wirklich entfernen?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    combatStore.removeCombatant(combatant.id)
    combatStore.saveCombat()
  })
}

const startCombat = () => {
  if (combatStore.combatants.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Keine Kämpfer vorhanden'
    })
    return
  }
  
  combatStore.startCombat()
  combatStore.saveCombat()
  // Reset gespeicherte Modifikatoren bei neuem Kampf
  savedModifiers.value = {}
}

// Initiative Dialog State
const initiativeDialog = ref(false)
const playerInitiatives = ref([])

const rollInitiatives = () => {
  // Nutze das ausgewählte System aus den Einstellungen
  const dice = systemStore.initiativeDice()
  const systemName = systemStore.currentSystem().name
  
  // Würfle automatisch für NPCs
  combatStore.rollAllInitiatives(dice)
  
  // Sammle alle Spieler für Initiative-Eingabe
  const players = combatStore.combatants.filter(c => c.type === 'player')
  
  if (players.length > 0) {
    // Bereite Spieler-Liste für Dialog vor mit Icons und Farben
    playerInitiatives.value = playerCombatants.value.map(player => ({
      ...player,
      rolledInitiative: player.initiative || (player.initiativeModifier || 0)
    }))
    
    // Öffne Dialog
    initiativeDialog.value = true
  } else {
    combatStore.saveCombat()
    $q.notify({
      type: 'positive',
      message: `Initiative gewürfelt (${systemName})`
    })
  }
}

const autoRollPlayerInitiatives = () => {
  const dice = systemStore.initiativeDice()
  
  playerInitiatives.value.forEach(player => {
    const roll = dice === 'd20' ? 
      Math.floor(Math.random() * 20) + 1 :
      Math.floor(Math.random() * 10) + 1
    player.rolledInitiative = roll + (player.initiativeModifier || 0)
  })
  
  $q.notify({
    type: 'info',
    message: 'Initiative automatisch gewürfelt'
  })
}

const savePlayerInitiatives = () => {
  // Speichere alle Spieler-Initiativen
  playerInitiatives.value.forEach(player => {
    combatStore.updateCombatant(player.id, { initiative: player.rolledInitiative })
  })
  
  combatStore.saveCombat()
  initiativeDialog.value = false
  
  $q.notify({
    type: 'positive',
    message: `Initiative gespeichert`
  })
}

const dealDamage = (combatant) => {
  targetCombatant.value = combatant
  damageMode.value = 'damage'
  damageAmount.value = 0
  damageDialog.value = true
}

const heal = (combatant) => {
  targetCombatant.value = combatant
  damageMode.value = 'heal'
  damageAmount.value = 0
  damageDialog.value = true
}

const applyDamage = () => {
  if (!targetCombatant.value || !damageAmount.value) return
  
  if (damageMode.value === 'damage') {
    combatStore.dealDamage(targetCombatant.value.id, damageAmount.value)
  } else {
    combatStore.healDamage(targetCombatant.value.id, damageAmount.value)
  }
  
  combatStore.saveCombat()
}

const editCombatant = (combatant) => {
  // TODO: Implementiere Edit-Dialog
  $q.notify({
    type: 'info',
    message: 'Edit-Funktion kommt noch'
  })
}

const getHpColor = (combatant) => {
  const ratio = combatant.hp.current / combatant.hp.max
  if (ratio > 0.6) return 'green'
  if (ratio > 0.3) return 'orange'
  return 'red'
}

// Template Methods
const addTemplateToCombat = (template) => {
  combatStore.addCombatant({
    name: template.name,
    type: template.type,
    hp: template.hp?.max || template.hp || 10,
    initiativeModifier: template.initiativeModifier,
    armorIds: template.armorIds || [],
    toughness: template.toughness,
    attributes: template.attributes,
    weaponInstances: template.weaponInstances || [],
    weapons: template.weapons || []
  })
  combatStore.saveCombat()
  
  $q.notify({
    type: 'positive',
    message: `${template.name} hinzugefügt`
  })
  
  showTemplateSelector.value = false
}

// Encounter Methods
const addEncounterToCombat = (encounter) => {
  const npcs = characterStore.getEncounterNPCs(encounter.id)
  
  if (npcs.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Encounter hat keine NPCs'
    })
    return
  }
  
  npcs.forEach(npc => {
    combatStore.addCombatant({
      name: npc.name,
      type: 'npc',
      hp: npc.hp?.max || npc.hp || 10,
      initiativeModifier: npc.initiativeModifier,
      armorIds: npc.armorIds || [],
      toughness: npc.toughness,
      attributes: npc.attributes,
      weaponInstances: npc.weaponInstances || npc.weapons || []
    })
  })
  
  combatStore.saveCombat()
  
  $q.notify({
    type: 'positive',
    message: `${npcs.length} NPCs aus "${encounter.name}" hinzugefügt`
  })
  
  showEncounterSelector.value = false
}

const addActiveGroupToCombat = () => {
  if (!activePlayerGroup.value) return
  
  const players = characterStore.templates.filter(t => 
    activePlayerGroup.value.playerIds.includes(t.id)
  )
  
  if (players.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Gruppe hat keine Spieler'
    })
    return
  }
  
  players.forEach(player => {
    combatStore.addCombatant({
      name: player.name,
      type: 'player',
      hp: player.hp?.max || player.hp || 10,
      initiativeModifier: player.initiativeModifier,
      armor: player.armor,
      armorIds: player.armorIds || [],
      toughness: player.toughness,
      attributes: player.attributes,
      weaponInstances: player.weaponInstances || [],
      weapons: player.weapons || []
    })
  })
  
  combatStore.saveCombat()
  
  $q.notify({
    type: 'positive',
    message: `${players.length} Spieler hinzugefügt`
  })
}

// Nachladen-Funktion
const reloadWeapon = (weaponIndex) => {
  const weapons = getCombatantWeapons(combatStore.currentCombatant)
  const weapon = weapons[weaponIndex]
  if (!weapon) return
  
  // Verwende die combatStore Funktion für korrektes Nachladen
  combatStore.reloadWeapon(combatStore.currentCombatant.id, weaponIndex)
  combatStore.saveCombat()
  
  // Prüfe Nachladezeit für Benachrichtigung
  if (weapon.reload <= 0.5) {
    $q.notify({
      type: 'positive',
      message: `${weapon.name} nachgeladen! (Halbe Aktion)`
    })
  } else if (weapon.reload === 1) {
    $q.notify({
      type: 'info',
      message: `${weapon.name} wird nachgeladen (1 Aktion)`
    })
  } else {
    $q.notify({
      type: 'warning',
      message: `${weapon.name} wird nachgeladen (${weapon.reload} Aktionen) - Waffe ist blockiert!`
    })
  }
}

// Attack System Methods
const performAttack = (weapon, index) => {
  currentWeapon.value = weapon
  currentWeaponIndex.value = index
  targetCombatant.value = null
  
  // Lade gespeicherte Modifikatoren für diese Waffe
  const weaponKey = `${combatStore.currentCombatant.id}_${weapon.name}_${index}`
  if (savedModifiers.value[weaponKey]) {
    const saved = savedModifiers.value[weaponKey]
    attackModifiers.aim = saved.aim
    attackModifiers.shortRange = saved.shortRange
    attackModifiers.targetProne = saved.targetProne
    attackModifiers.running = saved.running
    attackModifiers.custom = saved.custom
  } else {
    // Reset auf Standard wenn keine gespeicherten Werte
    attackModifiers.aim = false
    attackModifiers.shortRange = false
    attackModifiers.targetProne = false
    attackModifiers.running = false
    attackModifiers.custom = 0
  }
  
  // Prüfe ob genug Munition vorhanden
  if (weapon.mag > 0 && weapon.currentAmmo === 0) {
    $q.dialog({
      title: 'Keine Munition',
      message: 'Die Waffe muss nachgeladen werden.',
      ok: { label: 'Nachladen', color: 'primary' },
      cancel: true
    }).onOk(() => {
      combatStore.reloadWeapon(combatStore.currentCombatant.id, index)
      combatStore.saveCombat()
      $q.notify({
        type: 'info',
        message: `${weapon.name} wird nachgeladen (${weapon.reload} Aktion${weapon.reload > 1 ? 'en' : ''})`
      })
    })
    return
  }
  
  // Setze verfügbare Feuermodi
  const modes = weaponStore.parseFireModes(weapon.rof)
  const currentAmmo = weapon.currentAmmo ?? weapon.mag ?? 0
  availableFireModes.value = []
  
  // Debug-Log für Feuermodi
  console.log('Weapon RoF:', weapon.rof, 'Parsed modes:', modes)
  
  if (modes.single) {
    availableFireModes.value.push({ label: 'Einzel', value: 'single' })
  }
  if (modes.burst > 0) {
    const canBurst = weapon.mag === 0 || currentAmmo >= modes.burst
    if (canBurst) {
      availableFireModes.value.push({ label: `Salve (${modes.burst})`, value: 'burst' })
    }
  }
  if (modes.full > 0) {
    const canFull = weapon.mag === 0 || currentAmmo >= modes.full
    if (canFull) {
      availableFireModes.value.push({ label: `Vollaut (${modes.full})`, value: 'full' })
    }
  }
  
  // Setze ersten verfügbaren Modus als Standard
  if (availableFireModes.value.length > 0) {
    selectedFireMode.value = availableFireModes.value[0].value
  } else {
    selectedFireMode.value = 'single'
  }
  
  console.log('Available fire modes:', availableFireModes.value, 'Selected:', selectedFireMode.value)
  
  // Setze Skill basierend auf Waffe
  const attacker = combatStore.currentCombatant
  if (weapon.skill === 'BS' && attacker.attributes?.BF) {
    attackSkill.value = attacker.attributes.BF
  } else if (weapon.skill === 'WS' && attacker.attributes?.KG) {
    attackSkill.value = attacker.attributes.KG
  } else if (attacker.attributes?.BS) {
    // Fallback auf alte Notation
    attackSkill.value = attacker.attributes.BS
  } else if (attacker.attributes?.WS) {
    attackSkill.value = attacker.attributes.WS
  } else {
    attackSkill.value = 30 // Default
  }
  
  // Reset (aber behalte gespeicherte Modifikatoren)
  attackRoll.value = null
  attackHit.value = false
  hits.value = []
  
  // Frage nach Ziel
  const enemies = combatStore.sortedCombatants.filter(c => 
    c.type !== combatStore.currentCombatant.type && c.hp.current > 0
  )
  
  if (enemies.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Keine gültigen Ziele vorhanden'
    })
    return
  }
  
  if (enemies.length === 1) {
    targetCombatant.value = enemies[0]
    targetArmor.value = enemies[0].armor || 0
  } else {
    // TODO: Ziel-Auswahl Dialog
    targetCombatant.value = enemies[0]
    targetArmor.value = enemies[0].armor || 0
  }
  
  attackDialog.value = true
}

const rollAttack = () => {
  // Speichere Modifikatoren für diese Waffe
  const weaponKey = `${combatStore.currentCombatant.id}_${currentWeapon.value.name}_${currentWeaponIndex.value}`
  savedModifiers.value[weaponKey] = {
    aim: attackModifiers.aim,
    shortRange: attackModifiers.shortRange,
    targetProne: attackModifiers.targetProne,
    running: attackModifiers.running,
    custom: attackModifiers.custom
  }
  
  const roll = Math.floor(Math.random() * 100) + 1
  attackRoll.value = roll
  
  // Prüfe auf Ladehemmung (WH40k)
  const hasReliable = currentWeapon.value.special?.includes('Reliable') || false
  const jamThreshold = hasReliable ? 100 : 96 // Reliable: nur bei 100, sonst bei 96-100
  
  if (roll >= jamThreshold) {
    attackHit.value = false
    // Waffe hat Ladehemmung
    $q.notify({
      type: 'negative',
      message: `Ladehemmung! ${currentWeapon.value.name} blockiert!`,
      caption: 'Eine volle Aktion zum Beheben erforderlich'
    })
    // TODO: Markiere Waffe als blockiert
    return // Beende hier, keine Munition verbraucht
  }
  
  attackHit.value = roll <= calculatedHitChance.value
  
  // Verbrauche Munition BEIM SCHUSS
  if (currentWeapon.value.mag > 0 && currentWeaponIndex.value !== null) {
    const ammoUsed = ammoUsage.value
    combatStore.useAmmo(combatStore.currentCombatant.id, currentWeaponIndex.value, ammoUsed)
    combatStore.saveCombat()
  }
  
  // Reset hits array
  hits.value = []
  
  if (attackHit.value) {
    // Berechne Anzahl der Treffer basierend auf Feuermodus und Erfolgsgraden
    let numHits = 1 // Mindestens 1 Treffer
    
    if (systemStore.selectedSystem === 'wh40k') {
      const margin = calculatedHitChance.value - roll // Erfolgsgrade
      const degreesOfSuccess = Math.floor(margin / 10)
      
      if (selectedFireMode.value === 'burst') {
        // Salve: Alle 2 Erfolgsgrade (20 Punkte) = 1 zusätzlicher Treffer
        numHits += Math.floor(margin / 20)  // margin ist die Differenz in Punkten
        // Maximum basierend auf RoF
        const modes = weaponStore.parseFireModes(currentWeapon.value.rof)
        numHits = Math.min(numHits, modes.burst || 3)
      } else if (selectedFireMode.value === 'full') {
        // Vollautomatik: Jeder Erfolgsgrad (10 Punkte) = 1 zusätzlicher Treffer
        numHits += Math.floor(margin / 10)  // margin ist die Differenz in Punkten
        // Maximum basierend auf RoF
        const modes = weaponStore.parseFireModes(currentWeapon.value.rof)
        numHits = Math.min(numHits, modes.full || 10)
      }
    }
    
    // Erstelle Treffer mit Trefferzonen
    for (let i = 0; i < numHits; i++) {
      // WH40k Regel: Erste Zone basiert auf dem vertauschten Original-Wurf
      // Jeder weitere Treffer ist +10 auf die VERTAUSCHTE Zahl
      
      // Vertausche erst die Ziffern des Original-Wurfs
      const tens = Math.floor(roll / 10)
      const ones = roll % 10
      let reversedRoll
      
      if (ones === 0) {
        reversedRoll = tens || 100 // 20 wird zu 02, 00 wird zu 100
      } else if (roll < 10) {
        reversedRoll = roll * 10 // 05 wird zu 50
      } else {
        reversedRoll = ones * 10 + tens // 32 wird zu 23
      }
      
      // Dann addiere +10 für jeden zusätzlichen Treffer
      let hitZone = reversedRoll + (i * 10)
      // Wenn über 100, von vorne anfangen
      if (hitZone > 100) {
        hitZone = hitZone - 100
      }
      
      // Hole die Trefferzone direkt mit getHitLocationFromRange
      const location = weaponStore.getHitLocationFromRange(hitZone)
      
      hits.value.push({
        roll: hitZone, // Die finale Trefferzonen-Nummer
        originalRoll: roll, // Der ursprüngliche Angriffswurf
        reversedRoll: reversedRoll, // Der vertauschte Wurf
        location: location,
        damage: null,
        righteousFuryRoll: null,
        righteousFuryHit: false,
        righteousFuryConfirmed: false,
        furyDamageRolls: []
      })
    }
  }
}

// Neue Funktionen für Mehrfachtreffer
const rollDamageForHit = (index) => {
  if (!currentWeapon.value || !hits.value[index]) return
  
  // Prüfe ob Waffe Tearing hat
  const hasTearing = currentWeapon.value.special?.includes('Tearing') || false
  const damage = weaponStore.rollDamage(currentWeapon.value.damage, hasTearing)
  
  // Erstelle Breakdown-String
  let breakdown = `${damage.rolls.join('+')}${damage.modifier >= 0 ? '+' : ''}${damage.modifier}`
  if (damage.tearingInfo?.applied) {
    breakdown += ` (Tearing: ${damage.tearingInfo.oldRoll}→${damage.tearingInfo.newRoll})`
  }
  
  hits.value[index].damage = {
    ...damage,
    breakdown
  }
}

const confirmRighteousFuryForHit = (index) => {
  if (!hits.value[index]) return
  
  const roll = Math.floor(Math.random() * 100) + 1
  hits.value[index].righteousFuryRoll = roll
  hits.value[index].righteousFuryHit = roll <= calculatedHitChance.value
}

const rollRighteousFuryDamageForHit = (index) => {
  if (!currentWeapon.value || !hits.value[index]) return
  
  hits.value[index].righteousFuryConfirmed = true
  
  const furyDamage = weaponStore.rollRighteousFury(currentWeapon.value.damage)
  if (!hits.value[index].furyDamageRolls) {
    hits.value[index].furyDamageRolls = []
  }
  hits.value[index].furyDamageRolls.push(furyDamage)
  
  // Wenn wieder eine 10 gewürfelt wurde, kann erneut bestätigt werden
  if (furyDamage.hasCritical) {
    hits.value[index].righteousFuryConfirmed = false
    hits.value[index].righteousFuryRoll = null
    hits.value[index].righteousFuryHit = false
  }
}

// applyAttackDamage wurde entfernt - Schaden wird nicht mehr automatisch angewendet

const resetAttack = () => {
  attackRoll.value = null
  attackHit.value = false
  hits.value = []
}

// Spieler-Verwaltung Funktionen
const usePlayerAmmo = (weaponIndex, amount) => {
  const weapons = getCombatantWeapons(combatStore.currentCombatant)
  const weapon = weapons[weaponIndex]
  if (!weapon || !weapon.mag) return
  
  // Update weapon ammo directly
  weapon.currentAmmo = Math.max(0, (weapon.currentAmmo ?? weapon.mag) - amount)
  combatStore.saveCombat()
  
  $q.notify({
    type: 'info',
    message: `${weapon.name}: ${amount} Schuss verbraucht (${weapon.currentAmmo}/${weapon.mag} übrig)`
  })
}

const reloadPlayerWeapon = (weaponIndex) => {
  const weapons = getCombatantWeapons(combatStore.currentCombatant)
  const weapon = weapons[weaponIndex]
  if (!weapon || !weapon.mag) return
  
  weapon.currentAmmo = weapon.mag
  combatStore.saveCombat()
  
  $q.notify({
    type: 'positive',
    message: `${weapon.name} nachgeladen!`
  })
}

const adjustCriticalWounds = (amount) => {
  if (!combatStore.currentCombatant.criticalWounds) {
    combatStore.currentCombatant.criticalWounds = 0
  }
  combatStore.currentCombatant.criticalWounds = Math.max(0, combatStore.currentCombatant.criticalWounds + amount)
  combatStore.saveCombat()
}

// Dice Methods
const openDiceDialog = () => {
  lastDiceRoll.value = null
  diceDialog.value = true
}

const rollDice = (dice) => {
  const result = Math.floor(Math.random() * dice) + 1
  lastDiceRoll.value = { dice, result }
}

// Defense System Functions
const openDefenseDialog = (combatant) => {
  defendingCombatant.value = combatant
  incomingDamage.value = 0
  incomingPen.value = 0
  hitBodyPart.value = 'Körper'
  defenseType.value = 'none'
  defenseRoll.value = null
  defenseSuccess.value = false
  hitZoneInCover.value = false
  defenseModifier.value = 0
  
  // Initialisiere Deckung wenn noch nicht vorhanden
  if (!combatant.currentCover) {
    combatant.currentCover = { label: 'Keine Deckung', value: 0, damage: 0 }
  }
  
  // Setze initialen Verteidigungsskill (wird in computed property angepasst)
  defenseSkill.value = 30 // Default
  
  defenseDialog.value = true
}

const rollDefense = () => {
  const roll = Math.floor(Math.random() * 100) + 1
  defenseRoll.value = roll
  const targetValue = Math.min(95, Math.max(1, actualDefenseSkill.value + defenseModifier.value))
  defenseSuccess.value = roll <= targetValue
}

const calculateCoverReduction = () => {
  if (!hitZoneInCover.value || !defendingCombatant.value?.currentCover) return 0
  
  const cover = defendingCombatant.value.currentCover
  const effectiveCover = Math.max(0, cover.value - (cover.damage || 0))
  const pen = Number(incomingPen.value) || 0
  
  return Math.max(0, effectiveCover - pen)
}

const willPenetrateCover = () => {
  if (!hitZoneInCover.value || !defendingCombatant.value?.currentCover) return false
  
  const cover = defendingCombatant.value.currentCover
  const effectiveCover = Math.max(0, cover.value - (cover.damage || 0))
  const pen = Number(incomingPen.value) || 0
  
  // Deckung wird durchschlagen wenn Schaden > (Deckung - Durchschlag)
  const coverAfterPen = Math.max(0, effectiveCover - pen)
  
  return Number(incomingDamage.value) > coverAfterPen
}

const updateCharacterCover = () => {
  // Stelle sicher dass die Deckung damage Property hat
  if (defendingCombatant.value.currentCover && !defendingCombatant.value.currentCover.damage) {
    defendingCombatant.value.currentCover.damage = 0
  }
  combatStore.saveCombat()
}

const resetCoverDamage = () => {
  if (defendingCombatant.value.currentCover) {
    defendingCombatant.value.currentCover.damage = 0
    combatStore.saveCombat()
    $q.notify({
      type: 'positive',
      message: 'Deckungsschaden zurückgesetzt'
    })
  }
}

const damageCover = () => {
  if (defendingCombatant.value.currentCover) {
    if (!defendingCombatant.value.currentCover.damage) {
      defendingCombatant.value.currentCover.damage = 0
    }
    defendingCombatant.value.currentCover.damage++
    combatStore.saveCombat()
    
    const remainingCover = defendingCombatant.value.currentCover.value - defendingCombatant.value.currentCover.damage
    
    $q.notify({
      type: 'warning',
      message: `Deckung durchschlagen! ${defendingCombatant.value.currentCover.label} hat nur noch ${remainingCover} RP`
    })
  }
}

const calculateFinalDamage = () => {
  if (!incomingDamage.value || defenseSuccess.value) return 0
  
  let damage = Number(incomingDamage.value) || 0
  const pen = Number(incomingPen.value) || 0
  
  // Deckung zuerst (wenn Trefferzone in Deckung)
  if (hitZoneInCover.value && defendingCombatant.value?.currentCover?.value > 0) {
    damage = Math.max(0, damage - calculateCoverReduction())
  }
  
  // Rüstung von ausgerüsteten Teilen
  let armor = 0
  if (defendingCombatant.value?.armorIds && defendingCombatant.value.armorIds.length > 0) {
    // Bestimme Körperteil basierend auf hitBodyPart
    const bodyPartMap = {
      'Kopf': 'head',
      'Körper': 'torso',
      'Linker Arm': 'arms',
      'Rechter Arm': 'arms', 
      'Linkes Bein': 'legs',
      'Rechtes Bein': 'legs'
    }
    const bodyPart = bodyPartMap[hitBodyPart.value] || 'torso'
    const armorData = armorStore.getArmorForBodyPart(defendingCombatant.value.armorIds, bodyPart)
    armor = armorData.rp
  }
  // Kein Fallback mehr - ohne Rüstungsteile gibt es keine Rüstung
  
  // Penetration nur von Rüstung abziehen, nicht von WiB
  const effectiveArmor = Math.max(0, armor - pen)
  damage = Math.max(0, damage - effectiveArmor)
  
  // Widerstandsbonus separat abziehen (wird nicht von Durchschlag beeinflusst)
  const wi = defendingCombatant.value?.attributes?.WI || 30
  const toughnessBonus = Math.floor(wi / 10)
  damage = Math.max(0, damage - toughnessBonus)
  
  return damage
}

const applyDefenseDamage = () => {
  const finalDamage = calculateFinalDamage()
  
  if (finalDamage > 0) {
    combatStore.dealDamage(defendingCombatant.value.id, finalDamage)
    
    // Deckung beschädigen wenn durchschlagen
    if (hitZoneInCover.value && willPenetrateCover()) {
      if (defendingCombatant.value.currentCover) {
        if (!defendingCombatant.value.currentCover.damage) {
          defendingCombatant.value.currentCover.damage = 0
        }
        defendingCombatant.value.currentCover.damage++
        
        const remainingCover = defendingCombatant.value.currentCover.value - defendingCombatant.value.currentCover.damage
        
        $q.notify({
          type: 'warning',
          message: `Deckung durchschlagen! ${defendingCombatant.value.currentCover.label} hat nur noch ${remainingCover} RP`
        })
      }
    }
    
    combatStore.saveCombat()
    
    $q.notify({
      type: 'negative',
      message: `${defendingCombatant.value.name} erleidet ${finalDamage} Schaden`
    })
  } else {
    $q.notify({
      type: 'positive',
      message: 'Kein Schaden durchgekommen!'
    })
  }
}
</script>