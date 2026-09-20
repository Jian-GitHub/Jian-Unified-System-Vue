<script setup lang="ts">
import type { Component } from 'vue'
import AnimatedValue from '@/components/common/AnimatedValue.vue'
import { vSpotlight } from '@/directives/motion'
defineProps<{
  label: string
  value: string
  note?: string
  tone?: 'default' | 'positive' | 'warning' | 'danger'
  icon?: Component
  featured?: boolean
  badge?: string
  secondaryLabel?: string
  secondaryValue?: string
}>()
</script>
<template>
  <article v-spotlight :class="['heph-card', 'heph-stat', tone, { featured }]">
    <div class="stat-topline"><span class="stat-label">{{ label }}</span><span v-if="icon" class="stat-icon"><component :is="icon" /></span></div>
    <div class="stat-value"><AnimatedValue :value="value" /></div>
    <div v-if="secondaryValue" class="stat-secondary">
      <span>{{ secondaryLabel }}</span>
      <strong><AnimatedValue :value="secondaryValue" /></strong>
    </div>
    <div class="stat-bottom"><span v-if="note" class="stat-note">{{ note }}</span><span v-if="badge" class="stat-badge">{{ badge }}</span></div>
  </article>
</template>
<style scoped>
.heph-stat { padding: 12px 14px; min-height: 126px; display: flex; flex-direction: column; gap: 6px; }
.stat-topline { display: flex; align-items: center; justify-content: space-between; gap: 8px; }.stat-label { color: var(--heph-muted); font-size: 11px; font-weight: 500; }.stat-icon { display: grid; place-items: center; width: 24px; height: 24px; border: 1px solid var(--heph-line); border-radius: 8px; color: var(--heph-muted); }.stat-icon svg { width: 15px; height: 15px; }
.stat-value { font-size: clamp(21px,1.9vw,29px); font-weight: 600; color: var(--heph-ink); letter-spacing: -1px; line-height: 1.05; overflow-wrap: anywhere; }
.stat-secondary { display: flex; align-items: baseline; justify-content: flex-end; flex-wrap: wrap; gap: 4px 6px; margin: -3px 2px -2px 0; padding-top: 6px; border-top: 1px solid var(--heph-line); }.stat-secondary span { color: var(--heph-muted); font-size: 10px; }.stat-secondary strong { color: var(--heph-ink); font-size: 15px; font-weight: 600; letter-spacing: -.4px; }
.stat-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; }.stat-note { overflow-wrap: anywhere; color: var(--heph-muted); font-size: 10px; line-height: 1.5; }.stat-badge { font-size: 10px; color: var(--heph-pine); background: var(--heph-mint); padding: 3px 6px; border-radius: 4px; white-space: nowrap; }
.featured { background: #183c35; border-color: #183c35; }.featured .stat-label,.featured .stat-note { overflow-wrap: anywhere; color: #9fbfb2; }.featured .stat-value { color: #f3faf5; }.featured .stat-icon { color: #bce7cd; border-color: #ffffff20; background: #ffffff05; }.featured .stat-badge { color: #c5e8d2; background: #ffffff0c; }
.featured .stat-secondary { border-color: #ffffff17; }.featured .stat-secondary span { color: #9fbfb2; }.featured .stat-secondary strong { color: #f3faf5; }
.stat-icon { transition: color .25s ease, background .25s ease, transform .35s var(--heph-ease); }
.heph-stat.is-spotlight-active .stat-icon { color: var(--heph-pine); background: var(--heph-mint); transform: rotate(-4deg) scale(1.06); }
.featured.is-spotlight-active .stat-icon { color: #d6f5e2; background: #ffffff12; }
@media(max-width:600px) { .heph-stat { min-height: 132px; padding: 13px; gap: 9px; }.stat-value { font-size: 23px; }.stat-topline { align-items: flex-start; }.stat-icon { width: 25px; height: 25px; flex: none; }.stat-bottom { flex-wrap: wrap; } }
@media(prefers-reduced-motion:reduce) { .stat-icon { transition: none; }.heph-stat.is-spotlight-active .stat-icon { transform: none; } }
</style>
