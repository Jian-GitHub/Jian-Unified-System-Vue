import { onBeforeUnmount, onMounted, ref, watchEffect, type Ref } from 'vue'
import { init, use, type EChartsCoreOption, type EChartsType } from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'

use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, SVGRenderer])

export interface ChartAppearance {
  ink: string
  muted: string
  line: string
  paper: string
  soft: string
  primary: string
  secondary: string
  lime: string
}

/** Update for data, language, resolved theme, reduced motion and container size. */
export function useEChart(target: Ref<HTMLElement | null>, option: (appearance: ChartAppearance) => EChartsCoreOption) {
  const revision = ref(0)
  let chart: EChartsType | undefined
  let resize: ResizeObserver | undefined
  let theme: MutationObserver | undefined
  let stop: (() => void) | undefined
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const refresh = () => { revision.value++ }

  onMounted(() => {
    if (!target.value) return
    chart = init(target.value, undefined, { renderer: 'svg' })
    stop = watchEffect(() => {
      void revision.value
      const css = getComputedStyle(document.documentElement)
      const color = (name: string) => css.getPropertyValue('--heph-' + name).trim()
      const options = option({
        ink: color('ink'), muted: color('muted'), line: color('line'),
        paper: color('paper-solid'), soft: color('canvas-soft'),
        primary: color('pine-2'), secondary: color('blue'), lime: color('lime'),
      })
      chart?.setOption({
        ...options,
        animation: !motion.matches && options.animation !== false,
        animationDuration: 450,
        animationDurationUpdate: 250,
      }, { notMerge: true })
    })
    resize = new ResizeObserver(() => chart?.resize())
    resize.observe(target.value)
    theme = new MutationObserver(refresh)
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    motion.addEventListener('change', refresh)
  })
  onBeforeUnmount(() => {
    stop?.()
    resize?.disconnect()
    theme?.disconnect()
    motion.removeEventListener('change', refresh)
    chart?.dispose()
  })
}
