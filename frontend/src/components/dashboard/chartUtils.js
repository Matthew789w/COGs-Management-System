import { getChartColor } from './chartTheme'

export const CHART_COLOR_CLASSES = [
  'dashboard-chart__color-0',
  'dashboard-chart__color-1',
  'dashboard-chart__color-2',
  'dashboard-chart__color-3',
  'dashboard-chart__color-4',
  'dashboard-chart__color-5',
]

export { CHART_PALETTE, BATCH_STATUS_COLORS, COST_MIX_COLORS, getChartColor } from './chartTheme'

export function getNiceMax(value) {
  if (value <= 0) {
    return 1
  }

  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude

  if (normalized <= 1) return magnitude
  if (normalized <= 2) return 2 * magnitude
  if (normalized <= 5) return 5 * magnitude

  return 10 * magnitude
}

export function buildAxisTicks(maxValue, tickCount = 4) {
  const niceMax = getNiceMax(maxValue)
  const step = niceMax / tickCount

  return Array.from({ length: tickCount + 1 }, (_, index) => {
    const value = step * index
    return {
      value,
      position: niceMax > 0 ? (value / niceMax) * 100 : 0,
    }
  })
}

/** Integer ticks for count-based charts (e.g. production batches) */
export function buildCountAxisTicks(maxValue, preferredTicks = 5) {
  const scaleMax =
    maxValue <= 0 ? 4 : Math.max(Math.ceil(maxValue * 1.25), maxValue + 1, 4)
  const step = Math.max(1, Math.ceil(scaleMax / preferredTicks))

  const ticks = []
  for (let value = 0; value <= scaleMax; value += step) {
    ticks.push({
      value,
      position: scaleMax > 0 ? (value / scaleMax) * 100 : 0,
    })
  }

  const lastTick = ticks[ticks.length - 1]
  if (!lastTick || lastTick.value !== scaleMax) {
    ticks.push({
      value: scaleMax,
      position: 100,
    })
  }

  return ticks
}
