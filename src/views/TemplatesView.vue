<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h4">Character Templates</div>
      <q-space />
      <q-btn
        flat
        round
        dense
        icon="file_download"
        @click="handleExport"
      >
        <q-tooltip>Templates exportieren</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="file_upload"
        @click="showImportDialog = true"
      >
        <q-tooltip>Templates importieren</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="restart_alt"
        color="orange"
        @click="resetTemplates"
      >
        <q-tooltip>Auf Standard-Templates zurücksetzen</q-tooltip>
      </q-btn>
    </div>
    
    <!-- Tabs für Kategorien -->
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="left"
      narrow-indicator
    >
      <q-tab name="players" label="Spieler" />
      <q-tab name="npcs" label="NPCs" />
      <q-tab name="groups" label="Spieler-Gruppen" />
      <q-tab name="encounters" label="Encounters" />
    </q-tabs>
    
    <q-separator />
    
    <q-tab-panels v-model="tab" animated>
      <!-- Spieler Tab -->
      <q-tab-panel name="players">
        <div class="row q-gutter-md q-mb-md">
          <q-btn color="primary" icon="add" label="Neuer Spieler" @click="openTemplateDialog('player')" />
        </div>
        
        <div class="row q-col-gutter-md">
          <div v-for="template in playerTemplates" :key="template.id" class="col-12 col-md-6 col-lg-4">
            <q-card>
              <q-card-section>
                <div class="text-h6">{{ template.name }}</div>
                <div v-if="template.tags && template.tags.length > 0" class="q-mt-xs">
                  <q-chip 
                    v-for="tag in template.tags" 
                    :key="tag" 
                    size="sm" 
                    color="primary" 
                    text-color="white"
                  >
                    {{ tag }}
                  </q-chip>
                </div>
              </q-card-section>
              
              <q-card-section class="q-pt-none">
                <div>HP: {{ template.hp?.max || template.hp }}</div>
                <div>Initiative Mod: {{ template.initiativeModifier }}</div>
                <div v-if="template.armorIds && template.armorIds.length > 0">
                  <span class="text-caption">Rüstungsteile: </span>
                  <q-chip v-for="id in template.armorIds" :key="id" size="sm" color="brown" text-color="white">
                    {{ armorStore.getArmorById(id)?.name || 'Unbekannt' }}
                  </q-chip>
                </div>
                <div v-if="(template.weaponInstances && template.weaponInstances.length) || (template.weapons && template.weapons.length)">
                  Waffen: {{ getWeaponDisplay(template) }}
                </div>
              </q-card-section>
              
              <q-card-actions>
                <q-btn flat dense icon="edit" @click="editTemplate(template)">
                  <q-tooltip>Bearbeiten</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="content_copy" @click="duplicateTemplate(template.id)">
                  <q-tooltip>Kopieren</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="delete" color="red" @click="deleteTemplate(template.id)">
                  <q-tooltip>Löschen</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="shield" color="info" @click="openArmorDialog(template)">
                  <q-tooltip>Rüstung bearbeiten</q-tooltip>
                </q-btn>
                <q-space />
                <q-btn flat dense color="primary" label="Zu Kampf" @click="addToCombat(template)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
        
        <div v-if="playerTemplates.length === 0" class="text-center text-grey q-pa-xl">
          Keine Spieler-Templates vorhanden
        </div>
      </q-tab-panel>
      
      <!-- NPCs Tab -->
      <q-tab-panel name="npcs">
        <div class="row q-gutter-md q-mb-md">
          <q-btn color="primary" icon="add" label="Neuer NPC" @click="openTemplateDialog('npc')" />
        </div>
        
        <!-- Filter-Bereich -->
        <div class="row q-gutter-sm q-mb-md">
          <q-input
            v-model="searchQuery"
            debounce="300"
            filled
            dense
            placeholder="NPCs durchsuchen..."
            class="col-12 col-md-4"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append v-if="searchQuery">
              <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
            </template>
          </q-input>
          
          <q-input
            v-model="tagSearchQuery"
            @update:model-value="updateTagSearch"
            debounce="300"
            filled
            dense
            placeholder="Tags eingeben (getrennt durch Komma oder Leerzeichen)..."
            class="col-12 col-md-4"
            hint="z.B. 'Dämon, Chaos' oder 'Ork Boss'"
          >
            <template v-slot:prepend>
              <q-icon name="label" />
            </template>
            <template v-slot:append v-if="tagSearchQuery">
              <q-icon name="close" @click="clearTagSearch" class="cursor-pointer" />
            </template>
          </q-input>
          
          <q-select
            v-model="selectedCategory"
            :options="categoryOptions"
            label="Kategorie"
            filled
            dense
            clearable
            emit-value
            map-options
            class="col-12 col-md-3"
          >
            <template v-slot:prepend>
              <q-icon name="category" />
            </template>
          </q-select>
        </div>
        
        <!-- Aktive Filter anzeigen -->
        <div v-if="selectedTags.length > 0" class="q-mb-md">
          <span class="text-caption">Aktive Filter: </span>
          <q-chip 
            v-for="tag in selectedTags" 
            :key="tag"
            removable
            @remove="removeTagFilter(tag)"
            color="primary"
            text-color="white"
            size="sm"
          >
            {{ tag }}
          </q-chip>
        </div>
        
        <div class="row q-col-gutter-md">
          <div v-for="template in filteredNPCTemplates" :key="template.id" class="col-12 col-md-6 col-lg-4">
            <q-card>
              <q-card-section>
                <div class="text-h6">{{ template.name }}</div>
                <q-badge :color="getCategoryColor(template.category)">
                  {{ template.category }}
                </q-badge>
                <div v-if="template.tags && template.tags.length > 0" class="q-mt-xs">
                  <q-chip 
                    v-for="tag in template.tags" 
                    :key="tag" 
                    size="sm" 
                    color="primary" 
                    text-color="white"
                    clickable
                    @click="toggleTag(tag)"
                  >
                    {{ tag }}
                  </q-chip>
                </div>
              </q-card-section>
              
              <q-card-section class="q-pt-none">
                <div>HP: {{ template.hp?.max || template.hp }}</div>
                <div>Initiative Mod: {{ template.initiativeModifier }}</div>
                <div v-if="template.armorIds && template.armorIds.length > 0">
                  <span class="text-caption">Rüstungsteile: </span>
                  <q-chip v-for="id in template.armorIds" :key="id" size="sm" color="brown" text-color="white">
                    {{ armorStore.getArmorById(id)?.name || 'Unbekannt' }}
                  </q-chip>
                </div>
                <div v-if="(template.weaponInstances && template.weaponInstances.length) || (template.weapons && template.weapons.length)">
                  Waffen: {{ getWeaponDisplay(template) }}
                </div>
              </q-card-section>
              
              <q-card-actions>
                <q-btn flat dense icon="edit" @click="editTemplate(template)">
                  <q-tooltip>Bearbeiten</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="content_copy" @click="duplicateTemplate(template.id)">
                  <q-tooltip>Kopieren</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="delete" color="red" @click="deleteTemplate(template.id)">
                  <q-tooltip>Löschen</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="shield" color="info" @click="openArmorDialog(template)">
                  <q-tooltip>Rüstung bearbeiten</q-tooltip>
                </q-btn>
                <q-space />
                <q-btn flat dense color="primary" label="Zu Kampf" @click="addToCombat(template)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
        
        <div v-if="filteredNPCTemplates.length === 0" class="text-center text-grey q-pa-xl">
          {{ searchQuery || selectedTags.length > 0 || selectedCategory ? 'Keine NPCs gefunden' : 'Keine NPC-Templates vorhanden' }}
        </div>
      </q-tab-panel>
      
      <!-- Gruppen Tab -->
      <q-tab-panel name="groups">
        <div class="row q-gutter-md q-mb-md">
          <q-btn color="primary" icon="add" label="Neue Gruppe" @click="openGroupDialog()" />
        </div>
        
        <q-list bordered separator>
          <q-item v-for="group in characterStore.playerGroups" :key="group.id">
            <q-item-section avatar>
              <q-radio v-model="activeGroupId" :val="group.id" @update:model-value="setActiveGroup" />
            </q-item-section>
            
            <q-item-section>
              <q-item-label>{{ group.name }}</q-item-label>
              <q-item-label caption>
                {{ getGroupPlayers(group).length }} Spieler:
                {{ getGroupPlayers(group).map(p => p.name).join(', ') }}
              </q-item-label>
            </q-item-section>
            
            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn flat dense icon="edit" @click="editGroup(group)">
                  <q-tooltip>Bearbeiten</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="group_add" color="primary" @click="addGroupToCombat(group)">
                  <q-tooltip>Gruppe zu Kampf hinzufügen</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        
        <div v-if="characterStore.playerGroups.length === 0" class="text-center text-grey q-pa-xl">
          Keine Spielergruppen vorhanden
        </div>
      </q-tab-panel>
      
      <!-- Encounters Tab -->
      <q-tab-panel name="encounters">
        <div class="row q-gutter-md q-mb-md">
          <q-btn color="primary" icon="add" label="Neues Encounter" @click="openEncounterDialog()" />
        </div>
        
        <q-list bordered separator>
          <q-item v-for="encounter in characterStore.encounterGroups" :key="encounter.id">
            <q-item-section>
              <q-item-label>{{ encounter.name }}</q-item-label>
              <q-item-label caption>
                {{ encounter.description || 'Keine Beschreibung' }}
              </q-item-label>
              <div class="q-mt-sm">
                <q-chip 
                  v-for="(entry, index) in getEncounterDisplayEntries(encounter)"
                  :key="index"
                  size="sm"
                  color="red"
                  text-color="white"
                >
                  {{ entry }}
                </q-chip>
              </div>
            </q-item-section>
            
            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn flat dense icon="edit" @click="editEncounter(encounter)">
                  <q-tooltip>Bearbeiten</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="delete" color="red" @click="deleteEncounter(encounter.id)">
                  <q-tooltip>Löschen</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="add_circle" color="primary" @click="addEncounterToCombat(encounter)">
                  <q-tooltip>Zum Kampf hinzufügen</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        
        <div v-if="characterStore.encounterGroups.length === 0" class="text-center text-grey q-pa-xl">
          Keine Encounters vorhanden
        </div>
      </q-tab-panel>
    </q-tab-panels>
    
    <!-- Template Dialog mit Tabs -->
    <q-dialog v-model="templateDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">{{ editingTemplate ? 'Template bearbeiten' : 'Neues Template' }}</div>
        </q-card-section>
        
        <q-tabs
          v-model="templateDialogTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="basic" label="Grunddaten" />
          <q-tab name="talents" label="Talente" />
          <q-tab name="equipment" label="Ausrüstung & Notizen" />
        </q-tabs>
        
        <q-separator />
        
        <q-tab-panels v-model="templateDialogTab" animated style="min-height: 400px">
          <!-- Grunddaten Tab -->
          <q-tab-panel name="basic">
            <div class="q-gutter-sm">
              <q-input v-model="templateForm.name" label="Name" filled />
              
              <q-select
                v-model="templateForm.type"
                :options="[
                  { label: 'Spieler', value: 'player' },
                  { label: 'NPC', value: 'npc' }
                ]"
                label="Typ"
                filled
                emit-value
                map-options
              />
              
              <q-select
                v-if="templateForm.type === 'npc'"
                v-model="templateForm.category"
                :options="[
                  { label: 'Minion', value: 'minion' },
                  { label: 'Elite', value: 'elite' },
                  { label: 'Boss', value: 'boss' },
                  { label: 'Monster', value: 'monster' }
                ]"
                label="Kategorie"
                filled
                emit-value
                map-options
              />
              
              <!-- Tags direkt nach Kategorie -->
              <q-select
                v-model="templateForm.tags"
                :options="tagOptions"
                label="Tags"
                filled
                multiple
                use-chips
                use-input
                new-value-mode="add-unique"
                @new-value="createTag"
                hint="Tags helfen bei der Kategorisierung (z.B. Dämon, Ork, Verbrecher). Neue Tags werden automatisch hinzugefügt."
              >
                <template v-slot:prepend>
                  <q-icon name="label" />
                </template>
              </q-select>
              
              <div class="row q-gutter-sm">
                <q-input v-model.number="templateForm.hp" label="HP" type="number" filled class="col" />
                <q-input v-model.number="templateForm.initiativeModifier" label="Initiative Mod" type="number" filled class="col" />
              </div>
              
              <!-- WH40k Attribute (System wird aus Settings genommen) -->
              <div v-if="systemStore.selectedSystem === 'wh40k'">
                <div class="text-subtitle2 q-mb-xs q-mt-md">Grundwerte</div>
                <div class="row q-gutter-sm q-mb-sm">
                  <q-input v-model.number="templateForm.attributes.KG" label="KG (Kampfgeschick)" type="number" filled class="col" />
                  <q-input v-model.number="templateForm.attributes.BF" label="BF (Ballistik)" type="number" filled class="col" />
                  <q-input v-model.number="templateForm.attributes.ST" label="ST (Stärke)" type="number" filled class="col" />
                </div>
                <div class="row q-gutter-sm q-mb-sm">
                  <q-input v-model.number="templateForm.attributes.WI" label="WI (Widerstand)" type="number" filled class="col" />
                  <q-input v-model.number="templateForm.attributes.GE" label="GE (Gewandtheit)" type="number" filled class="col" />
                  <q-input v-model.number="templateForm.attributes.IN" label="IN (Intelligenz)" type="number" filled class="col" />
                </div>
                <div class="row q-gutter-sm">
                  <q-input v-model.number="templateForm.attributes.WA" label="WA (Wahrnehmung)" type="number" filled class="col" />
                  <q-input v-model.number="templateForm.attributes.WK" label="WK (Willenskraft)" type="number" filled class="col" />
                  <q-input v-model.number="templateForm.attributes.CH" label="CH (Charisma)" type="number" filled class="col" />
                </div>
              </div>
              
              <!-- D&D 5e Attribute -->
              <div v-if="systemStore.selectedSystem === 'dnd5e'">
                <div class="text-subtitle2 q-mb-xs q-mt-md">Attribute</div>
                <div class="row q-gutter-sm q-mb-sm">
                  <q-input v-model.number="templateForm.attributes.STR" label="STR (Stärke)" type="number" filled class="col" />
                  <q-input v-model.number="templateForm.attributes.DEX" label="DEX (Geschick)" type="number" filled class="col" />
                  <q-input v-model.number="templateForm.attributes.CON" label="CON (Konstitution)" type="number" filled class="col" />
                </div>
                <div class="row q-gutter-sm">
                  <q-input v-model.number="templateForm.attributes.INT" label="INT (Intelligenz)" type="number" filled class="col" />
                  <q-input v-model.number="templateForm.attributes.WIS" label="WIS (Weisheit)" type="number" filled class="col" />
                  <q-input v-model.number="templateForm.attributes.CHA" label="CHA (Charisma)" type="number" filled class="col" />
                </div>
              </div>
            </div>
          </q-tab-panel>
          
          <q-tab-panel name="talents">
  <div class="q-gutter-sm">
    <div class="text-subtitle2 q-mb-xs">Talente</div>
    
    <!-- Liste verfügbarer Talente -->
    <div v-for="talent in availableTalents" :key="talent.id" class="q-mb-sm">
      <q-checkbox
        v-model="selectedTalentIds"
        :val="talent.id"
        :label="talent.name"
      />
      
      <!-- Level-Slider für stackable Talente -->
      <div v-if="talent.stackable && selectedTalentIds.includes(talent.id)" class="q-ml-lg">
        <q-slider
          v-model="talentLevels[talent.id]"
          :min="1"
          :max="talent.maxStacks"
          :step="1"
          label
          markers
          snap
          :label-value="`Level ${talentLevels[talent.id] || 1}`"
        />
      </div>
      
      <div class="text-caption q-ml-lg text-grey">
        {{ talent.description }}
      </div>
    </div>
  </div>
</q-tab-panel>
          <!-- Ausrüstung Tab -->
          <q-tab-panel name="equipment">
            <div class="q-gutter-sm">
              <!-- Waffen-Auswahl -->
              <div class="q-mb-sm">
                <div class="text-subtitle2 q-mb-xs">Waffen</div>
                
                <!-- Bereits zugewiesene Waffen -->
                <q-list dense bordered class="q-mb-sm" v-if="templateForm.weaponInstances && templateForm.weaponInstances.length > 0">
                  <q-item v-for="(weapon, index) in templateForm.weaponInstances" :key="weapon.instanceId">
                    <q-item-section>
                      <q-item-label>{{ weapon.name }}</q-item-label>
                      <q-item-label caption>
                        {{ weapon.damage }} | Pen: {{ weapon.pen }}
                        <span v-if="weapon.range"> | Range: {{ weapon.range }}m</span>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        size="sm"
                        @click="removeWeaponInstance(index)"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
                
                <!-- Waffe hinzufügen -->
                <div class="row q-gutter-sm">
                  <q-select
                    v-model="selectedWeaponToAdd"
                    :options="availableWeapons"
                    label="Waffe hinzufügen"
                    filled
                    class="col"
                    emit-value
                    map-options
                    option-label="label"
                    option-value="value"
                  >
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                          <q-item-label caption>
                            {{ scope.opt.damage }} | Pen: {{ scope.opt.pen }}
                            <span v-if="scope.opt.range"> | Range: {{ scope.opt.range }}m</span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-btn 
                    color="primary" 
                    icon="add" 
                    label="Hinzufügen"
                    @click="addWeaponInstance"
                    :disable="!selectedWeaponToAdd"
                  />
                </div>
              </div>
              
              <!-- Notizen -->
              <q-input 
                v-model="templateForm.notes" 
                label="Notizen" 
                type="textarea" 
                filled 
                rows="6"
                hint="Besondere Fähigkeiten, Taktiken, Hintergrund..."
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
        
        <q-card-actions align="right">
          <q-btn flat label="Abbrechen" @click="closeTemplateDialog" />
          <q-btn flat label="Speichern" color="primary" @click="saveTemplate" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Rest der Dialoge bleiben gleich... -->
    <!-- Group Dialog -->
    <q-dialog v-model="groupDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ editingGroup ? 'Gruppe bearbeiten' : 'Neue Gruppe' }}</div>
        </q-card-section>
        
        <q-card-section>
          <q-input v-model="groupForm.name" label="Gruppenname" filled />
          
          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Spieler auswählen:</div>
            <q-option-group
              v-model="groupForm.playerIds"
              :options="playerOptions"
              type="checkbox"
            />
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Abbrechen" @click="closeGroupDialog" />
          <q-btn flat label="Speichern" color="primary" @click="saveGroup" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Armor Selection Dialog -->
    <q-dialog v-model="armorDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">Rüstung für {{ armorTemplate?.name }}</div>
        </q-card-section>
        
        <q-card-section style="max-height: 60vh" class="scroll">
          <div v-if="armorTemplate">
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">Ausgerüstete Rüstung:</div>
              <div v-if="!armorTemplate.armorIds || armorTemplate.armorIds.length === 0" class="text-grey">
                Keine Rüstung ausgerüstet
              </div>
              <q-chip 
                v-for="armorId in armorTemplate.armorIds" 
                :key="armorId"
                color="brown"
                text-color="white"
                removable
                @remove="removeArmorFromTemplate(armorId)"
              >
                {{ armorStore.getArmorById(armorId)?.name || 'Unbekannt' }}
                (RP: {{ armorStore.getArmorById(armorId)?.rp || 0 }})
              </q-chip>
            </div>
            
            <q-separator class="q-my-md" />
            
            <div class="text-subtitle1 q-mb-sm">Verfügbare Rüstungen:</div>
            
            <div v-for="(categoryArmors, category) in armorStore.armorsByCategory" :key="category">
              <q-expansion-item
                v-if="categoryArmors.length > 0"
                :label="armorStore.categoryNames[category]"
                header-class="text-subtitle2"
                default-opened
              >
                <q-list separator>
                  <q-item 
                    v-for="armor in categoryArmors" 
                    :key="armor.id"
                    clickable
                    @click="addArmorToTemplate(armor.id)"
                    :disable="armorTemplate.armorIds?.includes(armor.id)"
                  >
                    <q-item-section>
                      <q-item-label>{{ armor.name }}</q-item-label>
                      <q-item-label caption>
                        Bedeckt: {{ armorStore.formatCoverage(armor.coverage) }} | RP: {{ armor.rp }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon 
                        v-if="armorTemplate.armorIds?.includes(armor.id)"
                        name="check"
                        color="green"
                      />
                      <q-btn
                        v-else
                        flat
                        round
                        icon="add"
                        color="primary"
                        size="sm"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-expansion-item>
            </div>
          </div>
        </q-card-section>
        
        <q-card-section>
          <div class="text-subtitle2">Effektive Rüstungswerte:</div>
          <div class="row q-gutter-sm q-mt-xs">
            <q-chip v-for="part in ['head', 'torso', 'arms', 'legs']" :key="part">
              {{ armorStore.bodyPartNames[part] }}: 
              {{ getEffectiveArmorForPart(part) }} RP
            </q-chip>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Schließen" v-close-popup @click="closeArmorDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Encounter Dialog -->
    <q-dialog v-model="encounterDialog" persistent>
      <q-card style="min-width: 600px; max-width: 900px">
        <q-card-section>
          <div class="text-h6">{{ editingEncounter ? 'Encounter bearbeiten' : 'Neues Encounter' }}</div>
        </q-card-section>
        
        <q-card-section style="max-height: 70vh" class="scroll">
          <q-input 
            v-model="encounterForm.name" 
            label="Encounter Name" 
            filled 
            class="q-mb-md"
            hint="z.B. 'Ork-Patrouille', 'Boss-Kampf'"
          />
          
          <q-input 
            v-model="encounterForm.description" 
            label="Beschreibung" 
            type="textarea"
            filled 
            class="q-mb-md"
            hint="Optionale Beschreibung des Encounters"
          />
          
          <!-- Tag Filter für Encounter NPCs -->
          <div class="q-mb-md">
            <q-input
              v-model="encounterTagFilter"
              @update:model-value="updateEncounterTagFilter"
              debounce="300"
              filled
              dense
              placeholder="Nach Tags filtern (getrennt durch Komma oder Leerzeichen)..."
              class="q-mb-sm"
              hint="z.B. 'Dämon, Chaos' oder 'Ork Boss'"
            >
              <template v-slot:prepend>
                <q-icon name="label" />
              </template>
              <template v-slot:append v-if="encounterTagFilter">
                <q-icon name="close" @click="clearEncounterTagFilter" class="cursor-pointer" />
              </template>
            </q-input>
            
            <!-- Aktive Filter anzeigen -->
            <div v-if="encounterSelectedTags.length > 0">
              <span class="text-caption">Aktive Filter: </span>
              <q-chip 
                v-for="tag in encounterSelectedTags" 
                :key="tag"
                removable
                @remove="removeEncounterTagFilter(tag)"
                color="primary"
                text-color="white"
                size="sm"
              >
                {{ tag }}
              </q-chip>
            </div>
          </div>
          
          <!-- Bereits hinzugefügte NPCs -->
          <div v-if="encounterForm.npcEntries && encounterForm.npcEntries.length > 0" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Ausgewählte NPCs:</div>
            <q-list bordered separator dense>
              <q-item v-for="(entry, index) in encounterForm.npcEntries" :key="index">
                <q-item-section>
                  <q-item-label>
                    {{ entry.count }}x {{ characterStore.templates.find(t => t.id === entry.npcId)?.name || 'Unbekannt' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      round
                      size="sm"
                      icon="remove"
                      @click="decreaseNpcCount(index)"
                      :disable="entry.count <= 1"
                    />
                    <span class="q-px-sm" style="min-width: 30px; text-align: center;">{{ entry.count }}</span>
                    <q-btn
                      flat
                      round
                      size="sm"
                      icon="add"
                      @click="increaseNpcCount(index)"
                    />
                    <q-btn
                      flat
                      round
                      size="sm"
                      icon="delete"
                      color="red"
                      @click="removeNpcEntry(index)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          
          <div class="text-subtitle2 q-mb-sm">NPCs hinzufügen:</div>
          <div class="row q-col-gutter-sm">
            <div v-for="npc in filteredEncounterNPCs" :key="npc.id" class="col-12 col-md-6">
              <q-card flat bordered>
                <q-item>
                  <q-item-section>
                    <q-item-label>{{ npc.name }}</q-item-label>
                    <q-item-label caption>
                      <q-badge :color="getCategoryColor(npc.category)" size="sm">
                        {{ npc.category }}
                      </q-badge>
                      <span v-if="npc.tags && npc.tags.length > 0" class="q-ml-sm">
                        <q-chip 
                          v-for="tag in npc.tags" 
                          :key="tag" 
                          size="xs" 
                          dense
                        >
                          {{ tag }}
                        </q-chip>
                      </span>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      dense
                      icon="add"
                      color="primary"
                      @click="addNpcToEncounter(npc.id)"
                    >
                      <q-tooltip>Zu Encounter hinzufügen</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-card>
            </div>
          </div>
          
          <div v-if="filteredEncounterNPCs.length === 0" class="text-center text-grey q-pa-md">
            {{ encounterSelectedTags.length > 0 ? 'Keine NPCs mit diesen Tags gefunden' : 'Keine NPCs verfügbar' }}
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Abbrechen" @click="closeEncounterDialog" />
          <q-btn flat label="Speichern" color="primary" @click="saveEncounter" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Import Dialog -->
    <q-dialog v-model="showImportDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Templates importieren</div>
        </q-card-section>
        
        <q-card-section>
          <q-file
            v-model="importFile"
            label="JSON-Datei auswählen"
            filled
            accept=".json"
            @update:model-value="handleFileSelect"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          
          <div class="q-mt-md">
            <q-radio v-model="importMode" val="merge" label="Zu bestehenden Templates hinzufügen" />
            <q-radio v-model="importMode" val="replace" label="Alle Templates ersetzen" color="red" />
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Abbrechen" v-close-popup />
          <q-btn 
            flat 
            label="Importieren" 
            color="primary" 
            @click="handleImport"
            :disable="!importFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useCharacterStore } from '../stores/characterStore'
import { useCombatStore } from '../stores/combatStore'
import { useWeaponStore } from '../stores/weaponStore'
import { useArmorStore } from '../stores/armorStore'
import { useSystemStore } from '../stores/systemStore'
import { useTalentStore } from '../stores/talentStore'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const characterStore = useCharacterStore()
const combatStore = useCombatStore()
const weaponStore = useWeaponStore()
const armorStore = useArmorStore()
const systemStore = useSystemStore()
const talentStore = useTalentStore()
const $q = useQuasar()
const router = useRouter()

// Tab state
const tab = ref('players')
const templateDialogTab = ref('basic')

// Filter state
const searchQuery = ref('')
const selectedTags = ref([])
const selectedCategory = ref(null)
const tagSearchQuery = ref('')

// Template state
const templateDialog = ref(false)
const editingTemplate = ref(null)
const templateForm = reactive({
  name: '',
  type: 'npc',
  category: 'minion',
  hp: 10,
  initiativeModifier: 0,
  toughness: 30,
  notes: '',
  tags: [], // Tags für Kategorisierung
  talents: [],
  weaponInstances: [], // Neue Waffen-Instanzen
  attributes: {
    // WH40k
    KG: 30, // Kampfgeschick (WS)
    BF: 30, // Ballistik (BS)
    ST: 30, // Stärke (S)
    WI: 30, // Widerstand (T)
    GE: 30, // Gewandtheit (Ag)
    IN: 30, // Intelligenz (Int)
    WA: 30, // Wahrnehmung (Per)
    WK: 30, // Willenskraft (WP)
    CH: 30, // Charisma (Fel)
    // D&D 5e
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10
  }
})

// Group state
const groupDialog = ref(false)
const editingGroup = ref(null)
const groupForm = reactive({
  name: '',
  playerIds: []
})

// Armor state
const armorDialog = ref(false)
const armorTemplate = ref(null)

// Weapon selection state
const selectedWeaponToAdd = ref(null)

// Talent-Auswahl
const selectedTalentIds = ref([])
const talentLevels = ref({})

// Import/Export state
const showImportDialog = ref(false)
const importFile = ref(null)
const importMode = ref('merge')
const importFileContent = ref(null)

// Encounter state
const encounterDialog = ref(false)
const editingEncounter = ref(null)
const encounterForm = reactive({
  name: '',
  description: '',
  npcIds: [], // Für Kompatibilität mit alten Encounters
  npcEntries: [] // Neue Struktur: [{npcId: string, count: number}]
})

// Encounter filter state
const encounterTagFilter = ref('')
const encounterSelectedTags = ref([])

const activeGroupId = computed({
  get: () => characterStore.playerGroups.find(g => g.isActive)?.id,
  set: (id) => characterStore.setActiveGroup(id)
})

// Computed
const playerTemplates = computed(() => characterStore.getPlayerTemplates())
const npcTemplates = computed(() => characterStore.getNPCTemplates())

const filteredNPCTemplates = computed(() => {
  let templates = npcTemplates.value
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    templates = templates.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.notes?.toLowerCase().includes(query) ||
      t.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  // Filter by selected tags (alle Tags müssen vorhanden sein)
  if (selectedTags.value.length > 0) {
    templates = templates.filter(t => {
      if (!t.tags || t.tags.length === 0) return false
      return selectedTags.value.every(tag => {
        const tagLower = tag.toLowerCase()
        return t.tags.some(tTag => tTag.toLowerCase().includes(tagLower))
      })
    })
  }
  
  // Filter by category
  if (selectedCategory.value) {
    templates = templates.filter(t => t.category === selectedCategory.value)
  }
  
  return templates
})

 const availableTalents = computed(() => {
  return talentStore.getAvailableTalentsForTemplate(
    templateForm,
    systemStore.selectedSystem
  )
})

const availableTags = computed(() => {
  return characterStore.getAllTags()
})

const categoryOptions = [
  { label: 'Minion', value: 'minion' },
  { label: 'Elite', value: 'elite' },
  { label: 'Boss', value: 'boss' },
  { label: 'Monster', value: 'monster' }
]

const tagOptions = computed(() => {
  const existingTags = characterStore.getAllTags()
  const commonTags = [
    'Mensch', 'Ork', 'Eldar', 'Tau', 'Necron', 'Tyranid',
    'Dämon', 'Chaos', 'Kultist', 'Mutant', 'Psioniker',
    'Tier', 'Monster', 'Untoter', 'Maschine', 'Xenos',
    'Verbrecher', 'Pirat', 'Söldner', 'Adeptus', 'Inquisition',
    'Nurgle', 'Khorne', 'Tzeentch', 'Slaanesh'
  ]
  const allTags = [...new Set([...existingTags, ...commonTags])].filter(tag => tag && tag.length > 0)
  return allTags.sort()
})

const playerOptions = computed(() => 
  playerTemplates.value.map(p => ({
    label: p.name,
    value: p.id
  }))
)

const npcOptions = computed(() =>
  npcTemplates.value.map(n => ({
    label: n.name,
    value: n.id
  }))
)

const filteredEncounterNPCs = computed(() => {
  let templates = npcTemplates.value
  
  // Filter by selected tags
  if (encounterSelectedTags.value.length > 0) {
    templates = templates.filter(t => {
      if (!t.tags || t.tags.length === 0) return false
      return encounterSelectedTags.value.every(tag => {
        const tagLower = tag.toLowerCase()
        return t.tags.some(tTag => tTag.toLowerCase().includes(tagLower))
      })
    })
  }
  
  return templates
})

const availableWeapons = computed(() => {
  // Nutze die neue Funktion die Template-Tags berücksichtigt
  if (!templateForm.tags || templateForm.tags.length === 0) {
    // Wenn noch keine Tags gesetzt sind, zeige alle Waffen des Systems
    return weaponStore.weaponTemplates
      .filter(w => w.system === systemStore.selectedSystem || !w.system)
      .map(w => ({
        label: w.name,
        value: w,
        damage: w.damage,
        pen: w.pen,
        range: w.range
      }))
  }
  
  // Nutze die getAvailableWeaponsForTemplate Funktion mit den aktuellen Tags
  return weaponStore.getAvailableWeaponsForTemplate(
    { tags: templateForm.tags }, 
    systemStore.selectedSystem
  ).map(w => ({
    label: w.name,
    value: w,
    damage: w.damage,
    pen: w.pen,
    range: w.range
  }))
})
// Methods
const getCategoryColor = (category) => {
  const colors = {
    minion: 'grey',
    elite: 'orange',
    boss: 'red',
    monster: 'purple'
  }
  return colors[category] || 'grey'
}

const openTemplateDialog = (type = 'npc') => {
  editingTemplate.value = null
  templateDialogTab.value = 'basic'
  Object.assign(templateForm, {
    name: '',
    type,
    category: 'minion',
    hp: 10,
    initiativeModifier: 0,
    toughness: 30,
    notes: '',
    tags: [],
    weaponInstances: [],
    attributes: {
      // WH40k
      KG: 30, BF: 30, ST: 30, WI: 30, GE: 30, IN: 30, WA: 30, WK: 30, CH: 30,
      // D&D 5e
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
    }
  })
  selectedWeaponToAdd.value = null
  templateDialog.value = true
}

const editTemplate = (template) => {
  editingTemplate.value = template
  templateDialogTab.value = 'basic'
  Object.assign(templateForm, {
    name: template.name,
    type: template.type,
    category: template.category,
    hp: template.hp?.max || template.hp || 10,
    initiativeModifier: template.initiativeModifier,
    notes: template.notes,
    tags: template.tags ? [...template.tags] : [],
    weaponInstances: template.weaponInstances ? [...template.weaponInstances] : (template.weapons || []),
    attributes: template.attributes || {
      // WH40k
      KG: 30, BF: 30, ST: 30, WI: 30, GE: 30, IN: 30, WA: 30, WK: 30, CH: 30,
      // D&D 5e
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
    }
  })
     // DANACH die Talente separat laden
    selectedTalentIds.value = template.talents?.map(t => t.id) || []
    talentLevels.value = {}
    template.talents?.forEach(t => {
      if (t.level > 1) {
        talentLevels.value[t.id] = t.level
      }
    })
  selectedWeaponToAdd.value = null
  templateDialog.value = true
}

const closeTemplateDialog = () => {
  templateDialog.value = false
  editingTemplate.value = null
}

const saveTemplate = () => {
  if (!templateForm.name) {
    $q.notify({
      type: 'negative',
      message: 'Bitte Namen eingeben'
    })
    return
  }
  
  const talents = selectedTalentIds.value.map(id => ({
    id,
    level: talentLevels.value[id] || 1
  }))

  const templateData = {
    name: templateForm.name,
    type: templateForm.type,
    category: templateForm.category,
    system: systemStore.selectedSystem, // System aus Store
    hp: templateForm.hp,
    initiativeModifier: templateForm.initiativeModifier,
    toughness: templateForm.toughness,
    notes: templateForm.notes,
    tags: templateForm.tags || [],
    weaponInstances: templateForm.weaponInstances || [],
    attributes: templateForm.attributes || {},
    talents
  }
  
  if (editingTemplate.value) {
    characterStore.updateTemplate(editingTemplate.value.id, templateData)
  } else {
    characterStore.addTemplate(templateData)
  }
  
  closeTemplateDialog()
  
  $q.notify({
    type: 'positive',
    message: 'Template gespeichert'
  })
}

const deleteTemplate = (id) => {
  $q.dialog({
    title: 'Bestätigen',
    message: 'Template wirklich löschen?',
    cancel: true
  }).onOk(() => {
    characterStore.removeTemplate(id)
    $q.notify({
      type: 'positive',
      message: 'Template gelöscht'
    })
  })
}

const duplicateTemplate = (id) => {
  characterStore.duplicateTemplate(id)
  $q.notify({
    type: 'positive',
    message: 'Template kopiert'
  })
}

const addToCombat = (template) => {
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
    message: `${template.name} zum Kampf hinzugefügt`
  })
  
  router.push('/combat')
}

// Group methods
const openGroupDialog = () => {
  editingGroup.value = null
  groupForm.name = ''
  groupForm.playerIds = []
  groupDialog.value = true
}

const editGroup = (group) => {
  editingGroup.value = group
  groupForm.name = group.name
  groupForm.playerIds = [...group.playerIds]
  groupDialog.value = true
}

const closeGroupDialog = () => {
  groupDialog.value = false
  editingGroup.value = null
}

const saveGroup = () => {
  if (!groupForm.name) {
    $q.notify({
      type: 'negative',
      message: 'Bitte Gruppennamen eingeben'
    })
    return
  }
  
  if (editingGroup.value) {
    // Update existing group
    editingGroup.value.name = groupForm.name
    editingGroup.value.playerIds = [...groupForm.playerIds]
    characterStore.saveTemplates()
  } else {
    // Create new group
    characterStore.addPlayerGroup({
      name: groupForm.name,
      playerIds: groupForm.playerIds
    })
  }
  
  closeGroupDialog()
  
  $q.notify({
    type: 'positive',
    message: 'Gruppe gespeichert'
  })
}

const setActiveGroup = (groupId) => {
  characterStore.setActiveGroup(groupId)
  $q.notify({
    type: 'positive',
    message: 'Aktive Gruppe geändert'
  })
}

const getGroupPlayers = (group) => {
  return characterStore.templates.filter(t => group.playerIds.includes(t.id))
}

// Weapon instance methods
const addWeaponInstance = () => {
  if (!selectedWeaponToAdd.value) {
    return
  }
  
  // selectedWeaponToAdd ist bereits das Waffen-Objekt (wegen emit-value und map-options)
  const weapon = selectedWeaponToAdd.value
  
  const instance = {
    ...weaponStore.getWeaponById(weapon) || weapon, // Fallback auf das übergebene Objekt
    instanceId: Date.now() + Math.random() // Unique instance ID
  }
  
  if (!templateForm.weaponInstances) {
    templateForm.weaponInstances = []
  }
  
  templateForm.weaponInstances.push(instance)
  selectedWeaponToAdd.value = null
  
  $q.notify({
    type: 'positive',
    message: `${instance.name} hinzugefügt`
  })
}

const removeWeaponInstance = (index) => {
  templateForm.weaponInstances.splice(index, 1)
}

const getWeaponDisplay = (template) => {
  // Neue weaponInstances verwenden wenn vorhanden
  if (template.weaponInstances && template.weaponInstances.length > 0) {
    const weaponCounts = {}
    template.weaponInstances.forEach(w => {
      weaponCounts[w.name] = (weaponCounts[w.name] || 0) + 1
    })
    return Object.entries(weaponCounts)
      .map(([name, count]) => count > 1 ? `${name} (${count}x)` : name)
      .join(', ')
  }
  // Fallback auf altes weapons Array für Kompatibilität
  if (template.weapons && template.weapons.length > 0) {
    return template.weapons.map(w => w.name || w).join(', ')
  }
  return 'Keine'
}

const addGroupToCombat = (group) => {
  const players = getGroupPlayers(group)
  
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
    message: `${players.length} Spieler zum Kampf hinzugefügt`
  })
  
  router.push('/combat')
}

// Armor methods
const openArmorDialog = (template) => {
  armorTemplate.value = template
  armorDialog.value = true
}

const closeArmorDialog = () => {
  armorDialog.value = false
  armorTemplate.value = null
}

const addArmorToTemplate = (armorId) => {
  if (!armorTemplate.value.armorIds) {
    armorTemplate.value.armorIds = []
  }
  if (!armorTemplate.value.armorIds.includes(armorId)) {
    armorTemplate.value.armorIds.push(armorId)
    characterStore.updateTemplate(armorTemplate.value.id, {
      armorIds: armorTemplate.value.armorIds
    })
  }
}

const removeArmorFromTemplate = (armorId) => {
  const index = armorTemplate.value.armorIds.indexOf(armorId)
  if (index > -1) {
    armorTemplate.value.armorIds.splice(index, 1)
    characterStore.updateTemplate(armorTemplate.value.id, {
      armorIds: armorTemplate.value.armorIds
    })
  }
}

const getEffectiveArmorForPart = (part) => {
  if (!armorTemplate.value?.armorIds) return 0
  const armorData = armorStore.getArmorForBodyPart(armorTemplate.value.armorIds, part)
  return armorData.rp
}

// Export/Import Functions
const handleExport = () => {
  const result = characterStore.exportTemplates()
  
  if (result.success) {
    const fileName = `spielleiter-templates-${new Date().toISOString().split('T')[0]}.json`
    $q.notify({
      type: 'positive',
      message: `Templates exportiert`,
      caption: `Datei "${fileName}" wurde in deinen Downloads-Ordner gespeichert`,
      timeout: 5000
    })
  } else {
    $q.notify({
      type: 'negative',
      message: `Export fehlgeschlagen: ${result.error}`
    })
  }
}

const handleFileSelect = (file) => {
  if (!file) {
    importFileContent.value = null
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    importFileContent.value = e.target.result
  }
  reader.readAsText(file)
}

const resetTemplates = () => {
  $q.dialog({
    title: 'Templates zurücksetzen',
    message: 'ACHTUNG: Dies löscht ALLE aktuellen Templates, Gruppen und Encounters und lädt die 10 Standard WH40k Templates. Fortfahren?',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Zurücksetzen',
      color: 'negative'
    }
  }).onOk(() => {
    const result = characterStore.resetToDefaultTemplates()
    
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: `Templates zurückgesetzt`,
        caption: `${result.templatesAdded} Standard-Templates geladen`
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Fehler beim Zurücksetzen'
      })
    }
  })
}

const handleImport = () => {
  if (!importFileContent.value) {
    $q.notify({
      type: 'negative',
      message: 'Keine Datei ausgewählt'
    })
    return
  }
  
  let result
  if (importMode.value === 'replace') {
    result = characterStore.replaceAllTemplates(importFileContent.value)
  } else {
    result = characterStore.importTemplates(importFileContent.value)
  }
  
  if (result.success) {
    let message = `${result.templatesImported} Templates`
    if (result.groupsImported > 0) message += ` und ${result.groupsImported} Gruppen`
    if (result.encountersImported > 0) message += ` und ${result.encountersImported} Encounters`
    message += ' importiert'
    
    $q.notify({
      type: 'positive',
      message
    })
    showImportDialog.value = false
    importFile.value = null
    importFileContent.value = null
  } else {
    $q.notify({
      type: 'negative',
      message: `Import fehlgeschlagen: ${result.error}`
    })
  }
}

// Encounter Functions
const openEncounterDialog = () => {
  editingEncounter.value = null
  encounterForm.name = ''
  encounterForm.description = ''
  encounterForm.npcIds = []
  encounterForm.npcEntries = []
  encounterTagFilter.value = ''
  encounterSelectedTags.value = []
  encounterDialog.value = true
}

const editEncounter = (encounter) => {
  editingEncounter.value = encounter
  encounterForm.name = encounter.name
  encounterForm.description = encounter.description || ''
  
  // Konvertiere alte npcIds zu npcEntries wenn nötig
  if (encounter.npcEntries && encounter.npcEntries.length > 0) {
    encounterForm.npcEntries = [...encounter.npcEntries]
  } else if (encounter.npcIds && encounter.npcIds.length > 0) {
    // Konvertiere alte npcIds zu npcEntries mit count: 1
    encounterForm.npcEntries = encounter.npcIds.map(id => ({ npcId: id, count: 1 }))
  } else {
    encounterForm.npcEntries = []
  }
  
  encounterForm.npcIds = [...(encounter.npcIds || [])] // Für Kompatibilität
  encounterTagFilter.value = ''
  encounterSelectedTags.value = []
  encounterDialog.value = true
}

const closeEncounterDialog = () => {
  encounterDialog.value = false
  editingEncounter.value = null
  encounterTagFilter.value = ''
  encounterSelectedTags.value = []
}

const saveEncounter = () => {
  if (!encounterForm.name) {
    $q.notify({
      type: 'negative',
      message: 'Bitte Encounter-Namen eingeben'
    })
    return
  }
  
  if ((!encounterForm.npcEntries || encounterForm.npcEntries.length === 0) && 
      (!encounterForm.npcIds || encounterForm.npcIds.length === 0)) {
    $q.notify({
      type: 'negative',
      message: 'Bitte mindestens einen NPC auswählen'
    })
    return
  }
  
  // Erstelle npcIds aus npcEntries für Kompatibilität
  const allNpcIds = []
  encounterForm.npcEntries.forEach(entry => {
    for (let i = 0; i < entry.count; i++) {
      allNpcIds.push(entry.npcId)
    }
  })
  
  if (editingEncounter.value) {
    characterStore.updateEncounterGroup(editingEncounter.value.id, {
      name: encounterForm.name,
      description: encounterForm.description,
      npcIds: allNpcIds,
      npcEntries: encounterForm.npcEntries
    })
  } else {
    characterStore.addEncounterGroup({
      name: encounterForm.name,
      description: encounterForm.description,
      npcIds: allNpcIds,
      npcEntries: encounterForm.npcEntries
    })
  }
  
  closeEncounterDialog()
  
  $q.notify({
    type: 'positive',
    message: 'Encounter gespeichert'
  })
}

// Neue Encounter-Methoden für Tag-Filter und mehrfaches Hinzufügen
const updateEncounterTagFilter = (value) => {
  if (!value) {
    encounterSelectedTags.value = []
    return
  }
  
  // Split by comma or multiple spaces
  const tags = value.split(/[,\s]+/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  encounterSelectedTags.value = tags
}

const clearEncounterTagFilter = () => {
  encounterTagFilter.value = ''
  encounterSelectedTags.value = []
}

const removeEncounterTagFilter = (tag) => {
  const index = encounterSelectedTags.value.indexOf(tag)
  if (index > -1) {
    encounterSelectedTags.value.splice(index, 1)
    encounterTagFilter.value = encounterSelectedTags.value.join(', ')
  }
}

const addNpcToEncounter = (npcId) => {
  // Prüfe ob NPC bereits in der Liste ist
  const existingEntry = encounterForm.npcEntries.find(e => e.npcId === npcId)
  
  if (existingEntry) {
    // Erhöhe count wenn bereits vorhanden
    existingEntry.count++
  } else {
    // Füge neuen Eintrag hinzu
    encounterForm.npcEntries.push({
      npcId: npcId,
      count: 1
    })
  }
  
  $q.notify({
    type: 'positive',
    message: 'NPC hinzugefügt',
    timeout: 500
  })
}

const increaseNpcCount = (index) => {
  if (encounterForm.npcEntries[index]) {
    encounterForm.npcEntries[index].count++
  }
}

const decreaseNpcCount = (index) => {
  if (encounterForm.npcEntries[index] && encounterForm.npcEntries[index].count > 1) {
    encounterForm.npcEntries[index].count--
  }
}

const removeNpcEntry = (index) => {
  encounterForm.npcEntries.splice(index, 1)
}

const getEncounterDisplayEntries = (encounter) => {
  const entries = []
  
  if (encounter.npcEntries && encounter.npcEntries.length > 0) {
    // Neue Struktur mit count
    encounter.npcEntries.forEach(entry => {
      const template = characterStore.templates.find(t => t.id === entry.npcId)
      if (template) {
        const displayText = entry.count > 1 ? `${entry.count}x ${template.name}` : template.name
        entries.push(displayText)
      }
    })
  } else if (encounter.npcIds && encounter.npcIds.length > 0) {
    // Alte Struktur - gruppiere gleiche IDs
    const npcCounts = {}
    encounter.npcIds.forEach(id => {
      npcCounts[id] = (npcCounts[id] || 0) + 1
    })
    
    Object.entries(npcCounts).forEach(([id, count]) => {
      const template = characterStore.templates.find(t => t.id === id)
      if (template) {
        const displayText = count > 1 ? `${count}x ${template.name}` : template.name
        entries.push(displayText)
      }
    })
  }
  
  return entries
}

const deleteEncounter = (id) => {
  $q.dialog({
    title: 'Bestätigen',
    message: 'Encounter wirklich löschen?',
    cancel: true
  }).onOk(() => {
    characterStore.removeEncounterGroup(id)
    $q.notify({
      type: 'positive',
      message: 'Encounter gelöscht'
    })
  })
}

const addEncounterToCombat = (encounter) => {
  const npcsToAdd = characterStore.prepareEncounterForCombat(encounter)
  
  if (npcsToAdd.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Encounter hat keine NPCs'
    })
    return
  }
  
  // Füge alle NPCs zum Kampf hinzu
  npcsToAdd.forEach(npc => {
    combatStore.addCombatant(npc)
  })
  
  combatStore.saveCombat()
  
  $q.notify({
    type: 'positive',
    message: `${npcsToAdd.length} NPCs aus "${encounter.name}" hinzugefügt`
  })
  
  router.push('/combat')
}

// Tag methods
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  // Update tag search query to reflect selected tags
  tagSearchQuery.value = selectedTags.value.join(', ')
}

const createTag = (val, done) => {
  if (val && val.length > 0) {
    const trimmedVal = val.trim()
    if (trimmedVal.length > 0) {
      done(trimmedVal, 'add-unique')
    }
  }
}

const updateTagSearch = (value) => {
  if (!value) {
    selectedTags.value = []
    return
  }
  
  // Split by comma or multiple spaces
  const tags = value.split(/[,\s]+/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  selectedTags.value = tags
}

const clearTagSearch = () => {
  tagSearchQuery.value = ''
  selectedTags.value = []
}

const removeTagFilter = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
    tagSearchQuery.value = selectedTags.value.join(', ')
  }
}
</script>