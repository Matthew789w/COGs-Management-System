import { getChartColor } from './chartTheme'
import { getNiceMax } from './chartUtils'

function HorizontalBarChart({
  data = [],
  valueKey = 'value',
  labelKey = 'label',
  formatValue,
  secondaryKey,
  formatSecondary,
  emptyLabel = 'No data',
}) {
  const format = formatValue || ((value) => String(value))
  const formatSecondaryValue = formatSecondary || format
  const values = data.map((item) => Math.abs(Number(item[valueKey]) || 0))
  const maxDataValue = Math.max(...values, 0)
  const scaleMax = getNiceMax(maxDataValue)

  if (!data.length) {
    return (
      <div className="dashboard-chart dashboard-chart--empty">
        <p>{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="dashboard-chart dashboard-chart--horizontal" role="img" aria-label="Horizontal bar chart">
      {data.map((item, index) => {
        const value = Number(item[valueKey]) || 0
        const width =
          scaleMax > 0 ? Math.max((Math.abs(value) / scaleMax) * 100, Math.abs(value) > 0 ? 8 : 0) : 0
        const barColor = getChartColor(index)
        const secondaryValue = secondaryKey ? item[secondaryKey] : null
        const showSecondary =
          secondaryKey &&
          secondaryValue !== undefined &&
          secondaryValue !== null &&
          secondaryValue !== ''

        return (
          <div key={`${item[labelKey]}-${index}`} className="dashboard-chart__row">
            <div className="dashboard-chart__row-label" title={item[labelKey]}>
              {item[labelKey]}
            </div>
            <div className="dashboard-chart__row-track">
              <div
                className="dashboard-chart__row-bar"
                style={{ width: `${width}%`, background: barColor }}
              />
            </div>
            <div className="dashboard-chart__row-value">
              <span>{format(value)}</span>
              {showSecondary && (
                <span className="dashboard-chart__row-secondary">
                  {formatSecondaryValue(secondaryValue)}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default HorizontalBarChart
