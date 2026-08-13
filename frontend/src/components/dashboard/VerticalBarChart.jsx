import { buildCountAxisTicks, getChartColor } from './chartUtils'

function VerticalBarChart({
  data = [],
  valueKey = 'value',
  labelKey = 'label',
  formatValue,
  formatAxis,
  emptyLabel = 'No data',
  emptyHint,
}) {
  const format = formatValue || ((value) => String(value))
  const formatTick = formatAxis || format
  const values = data.map((item) => Number(item[valueKey]) || 0)
  const maxDataValue = Math.max(...values, 0)
  const hasValues = maxDataValue > 0
  const ticks = buildCountAxisTicks(hasValues ? maxDataValue : 0)
  const scaleMax = ticks[ticks.length - 1]?.value || 1
  const plotHeight = 180

  if (!data.length) {
    return (
      <div className="dashboard-chart dashboard-chart--empty">
        <p>{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="dashboard-chart dashboard-chart--vertical" role="img" aria-label="Bar chart">
      {!hasValues && emptyHint && (
        <p className="dashboard-chart__empty-hint">{emptyHint}</p>
      )}

      <div className="dashboard-chart__vertical-layout">
        <div className="dashboard-chart__y-axis">
          {[...ticks].reverse().map((tick, index) => (
            <span key={`${tick.value}-${index}`} className="dashboard-chart__y-label">
              {formatTick(tick.value)}
            </span>
          ))}
        </div>

        <div className="dashboard-chart__plot-area">
          <div className="dashboard-chart__grid">
            {ticks.map((tick, index) => (
              <div
                key={`${tick.value}-${index}`}
                className="dashboard-chart__grid-line"
                style={{ bottom: `${tick.position}%` }}
              />
            ))}
          </div>

          <div className="dashboard-chart__plot" style={{ height: `${plotHeight}px` }}>
            {data.map((item, index) => {
              const value = Number(item[valueKey]) || 0
              const barHeight = hasValues
                ? Math.max((value / scaleMax) * plotHeight, value > 0 ? 10 : 0)
                : 0
              const barColor = getChartColor(0)

              return (
                <div key={`${item[labelKey]}-${index}`} className="dashboard-chart__column">
                  <div className="dashboard-chart__bar-wrap" style={{ height: `${plotHeight}px` }}>
                    {hasValues ? (
                      <div
                        className="dashboard-chart__bar"
                        style={{ height: `${barHeight}px`, background: barColor }}
                        title={`${item[labelKey]}: ${format(value)}`}
                      />
                    ) : (
                      <div className="dashboard-chart__bar dashboard-chart__bar--placeholder" />
                    )}
                  </div>
                  <span className="dashboard-chart__x-label">{item[labelKey]}</span>
                  <span className="dashboard-chart__value-label">{format(value)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerticalBarChart
