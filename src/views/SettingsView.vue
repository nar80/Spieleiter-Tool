<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Einstellungen</div>
        <div class="text-subtitle2 text-grey">System & Regel-Konfiguration</div>
      </q-card-section>
      
      <q-card-section>
        <q-select
          v-model="selectedSystem"
          :options="systems"
          label="Spielsystem"
          filled
          emit-value
          map-options
        />
      </q-card-section>
      
      <q-card-section>
        <div class="text-h6 q-mb-md">Daten-Management</div>
        <div class="row q-gutter-sm">
          <q-btn 
            label="Waffen zurücksetzen" 
            color="warning" 
            outline
            @click="resetWeapons"
            icon="refresh"
          >
            <q-tooltip>Setzt alle Waffen-Templates auf Standard zurück</q-tooltip>
          </q-btn>
          <q-btn 
            label="Kampf löschen" 
            color="negative" 
            outline
            @click="clearCombat"
            icon="delete"
          >
            <q-tooltip>Löscht den aktuellen Kampf</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
      
      <q-card-section>
        <div class="text-center text-grey q-pa-xl">
          <q-icon name="settings" size="64px" />
          <div class="q-mt-md">Weitere Einstellungen kommen bald...</div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useSystemStore } from '../stores/systemStore'
import { useWeaponStore } from '../stores/weaponStore'
import { useCombatStore } from '../stores/combatStore'
import { useQuasar } from 'quasar'

const systemStore = useSystemStore()
const weaponStore = useWeaponStore()
const combatStore = useCombatStore()
const $q = useQuasar()

const selectedSystem = computed({
  get: () => systemStore.selectedSystem,
  set: (value) => systemStore.setSystem(value)
})

const systems = [
  { label: 'Warhammer 40k', value: 'wh40k' },
  { label: 'D&D 5e', value: 'dnd5e' },
  { label: 'Pathfinder', value: 'pathfinder' },
  { label: 'Custom', value: 'custom' }
]

const resetWeapons = () => {
  $q.dialog({
    title: 'Waffen zurücksetzen',
    message: 'Möchten Sie wirklich alle Waffen-Templates auf die Standard-Waffen zurücksetzen? Dies kann nicht rückgängig gemacht werden.',
    ok: {
      label: 'Zurücksetzen',
      color: 'warning'
    },
    cancel: {
      label: 'Abbrechen',
      color: 'grey'
    }
  }).onOk(() => {
    weaponStore.resetWeapons()
    // Lade auch den Kampf neu um die Waffen zu aktualisieren
    combatStore.loadCombat()
    $q.notify({
      type: 'positive',
      message: 'Waffen wurden zurückgesetzt'
    })
  })
}

const clearCombat = () => {
  $q.dialog({
    title: 'Kampf löschen',
    message: 'Möchten Sie wirklich den aktuellen Kampf löschen? Alle Kämpfer werden entfernt.',
    ok: {
      label: 'Löschen',
      color: 'negative'
    },
    cancel: {
      label: 'Abbrechen',
      color: 'grey'
    }
  }).onOk(() => {
    combatStore.clearCombat()
    combatStore.saveCombat()
    $q.notify({
      type: 'info',
      message: 'Kampf wurde gelöscht'
    })
  })
}
</script>