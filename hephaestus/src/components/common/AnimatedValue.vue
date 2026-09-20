<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  value: string
  duration?: number
}>(), { duration: 650 })

interface NumericText {
  number: number
  prefix: string
  suffix: string
  decimals: number
}

const display = ref(props.value)
let frame = 0
let current = parseNumericText(props.value)?.number ?? 0

function parseNumericText(value: string): NumericText | null {
  const match = /\d[\d,]*(?:\.\d+)?/.exec(value)
  if (!match) return null
  const prefix = value.slice(0, match.index)
  const raw = match[0].replaceAll(',', '')
  const parsed = Number(raw) * (prefix.includes('-') ? -1 : 1)
  if (!Number.isFinite(parsed)) return null
  return {
    number: parsed,
    prefix,
    suffix: value.slice(match.index + match[0].length),
    decimals: raw.split('.')[1]?.length ?? 0,
  }
}

function format(value: number, target: NumericText) {
  const absolute = Math.abs(value)
  const formatted = new Intl.NumberFormat('en-NZ', {
    minimumFractionDigits: target.decimals,
    maximumFractionDigits: target.decimals,
  }).format(absolute)
  return `${target.prefix}${formatted}${target.suffix}`
}

function update(value: string) {
  cancelAnimationFrame(frame)
  const target = parseNumericText(value)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!target || reduceMotion || Math.abs(target.number) > 1e12 || props.duration <= 0) {
    display.value = value
    current = target?.number ?? current
    return
  }
  const start = current
  const startedAt = performance.now()
  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / props.duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    current = start + (target.number - start) * eased
    display.value = format(current, target)
    if (progress < 1) frame = requestAnimationFrame(tick)
    else {
      current = target.number
      display.value = value
    }
  }
  frame = requestAnimationFrame(tick)
}

watch(() => props.value, update, { immediate: true })
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <span class="animated-value" :aria-label="value"><span aria-hidden="true">{{ display }}</span></span>
</template>

<style scoped>
.animated-value { font: inherit; color: inherit; letter-spacing: inherit; font-variant-numeric: tabular-nums; }
</style>
