import { BATCH_STATUS_COLORS, COST_MIX_COLORS, getChartColor } from './chartTheme'

function resolveSegmentColor(segment, index, colorMap, labelKey) {
  if (colorMap && segment[labelKey] && colorMap[segment[labelKey]]) {
    return colorMap[segment[labelKey]]
  }

  return getChartColor(index)
}

function DonutChart({
  data = [],
  valueKey = 'value',
  labelKey = 'label',
  formatValue,
  centerLabel,
  centerCaption,
  colorMap,
  emptyLabel = 'No data',
}) {
  const total = data.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0)
  const format = formatValue || ((value) => String(value))

  if (!data.length || total <= 0) {
    return (
      <div className="dashboard-chart dashboard-chart--empty dashboard-chart--donut-empty">
        <div className="dashboard-chart__donut-placeholder" aria-hidden="true">
          <span />
        </div>
        <p>{emptyLabel}</p>
      </div>
    )
  }

  let offset = 0
  const segments = data
    .map((item, index) => {
      const value = Number(item[valueKey]) || 0
      const percent = (value / total) * 100
      const start = offset
      offset += percent

      return {
        ...item,
        value,
        percent: Math.round(percent),
        start,
        end: offset,
        color: resolveSegmentColor(item, index, colorMap, labelKey),
      }
    })
    .filter((segment) => segment.value > 0)

  const gradientStops = segments
    .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
    .join(', ')

  return (
    <div className="dashboard-chart dashboard-chart--donut">
      <div className="dashboard-chart__donut-visual">
        <div
          className="dashboard-chart__donut-ring"
          style={{ background: `conic-gradient(${gradientStops})` }}
          role="img"
          aria-label="Donut chart"
        >
          <div className="dashboard-chart__donut-hole">
            {centerLabel && <strong>{centerLabel}</strong>}
            {centerCaption && <span>{centerCaption}</span>}
          </div>
        </div>
      </div>

      <div className="dashboard-chart__legend">
        {segments.map((segment, index) => (
          <div key={`${segment[labelKey]}-${index}`} className="dashboard-chart__legend-item">
            <span
              className="dashboard-chart__legend-swatch"
              style={{ background: segment.color }}
              aria-hidden="true"
            />
            <span className="dashboard-chart__legend-label">{segment[labelKey]}</span>
            <span className="dashboard-chart__legend-value">
              {format(segment.value)} · {segment.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DonutChart
export { BATCH_STATUS_COLORS, COST_MIX_COLORS }
