<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" />
        <q-toolbar-title>
          <q-icon name="casino" class="q-mr-sm" />
          Spielleiter Tool
        </q-toolbar-title>
        
        <q-space />
        
        <q-btn flat dense icon="fa-solid fa-dice-d20" class="q-mr-md">
          <q-tooltip>Würfel</q-tooltip>
        </q-btn>
        <q-btn flat dense icon="settings">
          <q-tooltip>Einstellungen</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
      class="bg-grey-10"
    >
      <q-list>
        <q-item-label header class="text-grey-8">
          Navigation
        </q-item-label>
        
        <q-item
          clickable
          v-ripple
          :to="'/combat'"
          exact
        >
          <q-item-section avatar>
            <q-icon name="fa-solid fa-swords" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Kampf-Tracker</q-item-label>
            <q-item-label caption>Initiative & Kampfverwaltung</q-item-label>
          </q-item-section>
        </q-item>
        
        <q-item
          clickable
          v-ripple
          :to="'/templates'"
          exact
        >
          <q-item-section avatar>
            <q-icon name="fa-solid fa-users" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Templates</q-item-label>
            <q-item-label caption>Charaktere & Gegner</q-item-label>
          </q-item-section>
        </q-item>
        
        <q-separator class="q-my-md" />
        
        <q-item
          clickable
          v-ripple
          :to="'/settings'"
          exact
        >
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Einstellungen</q-item-label>
            <q-item-label caption>System & Regeln</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(true)
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>