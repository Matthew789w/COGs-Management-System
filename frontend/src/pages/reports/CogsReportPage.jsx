import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from '../../lib/api'
import { Printer } from 'lucide-react'
import ManufacturingNav from '../../components/manufacturing/ManufacturingNav'
import ReportFilters from '../../components/reports/ReportFilters'
import ReportsNav from '../../components/reports/ReportsNav'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import CollapsibleSection from '../../components/ui/CollapsibleSection'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import TableLoadingState from '../../components/ui/TableLoadingState'
import {
  buildReportParams,
  formatReportValue,
  getColumnLabel,
  getReportColumns,
  getReportDefinition,
} from '../../utils/reports'

function CogsReportPage() {
  const { reportSlug } = useParams()
  const definition = getReportDefinition(reportSlug)

  const [meta, setMeta] = useState(null)
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    productId: '',
    productionBatchId: '',
    dateFrom: '',
    dateTo: '',
    category: '',
    profitMargin: '30',
  })

  useEffect(() => {
    setLoadingMeta(true)
    axios
      .get('/api/reports/meta')
      .then((response) => {
        setMeta(response.data.data || null)
      })
      .finally(() => setLoadingMeta(false))
  }, [])

  const loadReport = useCallback(
    async (activeFilters = filters) => {
      if (!definition) return

      setLoading(true)
      setError('')

      try {
        const response = await axios.get(definition.endpoint, {
          params: buildReportParams(activeFilters),
        })
        setReport(response.data.data || null)
      } catch (requestError) {
        setReport(null)
        setError(
          requestError.response?.data?.message
            || 'Unable to generate this report. Please adjust filters and try again.',
        )
      } finally {
        setLoading(false)
      }
    },
    [definition, filters],
  )

  useEffect(() => {
    if (definition) {
      loadReport()
    }
  }, [definition, reportSlug])

  const columns = useMemo(
    () => getReportColumns(report?.rows || [], reportSlug),
    [report?.rows, reportSlug],
  )

  const summaryEntries = useMemo(() => Object.entries(report?.summary || {}), [report?.summary])

  const handlePrint = () => window.print()

  if (!definition) {
    return (
      <div className="manufacturing-report">
        <PageHeader title="Report not found" description="The requested COGS report type does not exist." />
        <ManufacturingNav />
        <EmptyState title="Unknown report" description="Choose a report from the COGS reports hub." />
      </div>
    )
  }

  return (
    <div className="manufacturing-report">
      <PageHeader
        title={definition.title}
        description={definition.description}
        action={
          <Button variant="secondary" onClick={handlePrint}>
            <Printer size={16} />
            Print report
          </Button>
        }
      />

      <ManufacturingNav />

      <div className="reports-layout">
        <ReportsNav />

        <div className="reports-layout__content">
          <CollapsibleSection
            title="Report filters"
            description="Filter by product, date range, production batch, or category."
            defaultOpen
            className="no-print"
          >
            <ReportFilters
              definition={definition}
              meta={meta}
              loadingMeta={loadingMeta}
              filters={filters}
              onChange={setFilters}
              onApply={loadReport}
              applying={loading}
            />
          </CollapsibleSection>

          {summaryEntries.length > 0 && (
            <div className="report-kpi-grid">
              {summaryEntries.map(([key, value]) => (
                <div key={key} className="report-kpi">
                  <span className="report-kpi__label">{getColumnLabel(key)}</span>
                  <strong className="report-kpi__value">{formatReportValue(key, value)}</strong>
                </div>
              ))}
            </div>
          )}

          <Card className="report-document">
            {error && <p className="form-error">{error}</p>}

            {loading ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead className="table__head">
                    <tr>
                      {columns.length > 0 ? (
                        columns.map((column) => <th key={column}>{getColumnLabel(column)}</th>)
                      ) : (
                        <>
                          <th>Loading</th>
                          <th>Data</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="table__body">
                    <TableLoadingState
                      colSpan={Math.max(columns.length, 2)}
                      message="Generating report…"
                      rows={6}
                    />
                  </tbody>
                </table>
              </div>
            ) : !report?.rows?.length ? (
              <EmptyState
                title="No report data"
                description="No records matched the selected filters. Try widening the date range or removing filters."
              />
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead className="table__head">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          className={
                            column.includes('cost')
                            || column.includes('price')
                            || column.includes('variance')
                            || column.includes('quantity')
                            || column.includes('percent')
                              ? 'table__col-num'
                              : undefined
                          }
                        >
                          {getColumnLabel(column)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="table__body">
                    {report.rows.map((row, index) => (
                      <tr key={row.batch_id || row.product_id || row.reference_id || index} className="table__row">
                        {columns.map((column) => (
                          <td
                            key={column}
                            className={
                              column.includes('cost')
                              || column.includes('price')
                              || column.includes('variance')
                              || column.includes('quantity')
                              || column.includes('percent')
                                ? 'table__col-num table__cell-mono'
                                : undefined
                            }
                          >
                            {column === 'status' || column === 'configured' ? (
                              <span className={`report-status report-status--${row[column] === 'on_target' || row[column] === true ? 'ready' : row[column] === 'over_standard' ? 'pending' : row[column] === false ? 'pending' : 'ready'}`}>
                                {formatReportValue(column, row[column])}
                              </span>
                            ) : (
                              formatReportValue(column, row[column])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CogsReportPage
