import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import PanelHeader from '../components/ui/PanelHeader'
import { formatPeso } from '../utils/currency'

function DeleteUtilityPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [utility, setUtility] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`/api/utilities/${id}`)
      .then((response) => setUtility(response.data.data))
      .catch(() => setError('Unable to load utility details.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await axios.delete(`/api/utilities/${id}`)
      navigate('/utilities')
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to delete utility. It may be referenced by products.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Link to="/utilities" className="page-back-link"><ArrowLeft size={16} /> Back to utilities</Link>
        <p className="page-header__description">Loading utility...</p>
      </div>
    )
  }

  if (!utility) {
    return (
      <div>
        <Link to="/utilities" className="page-back-link"><ArrowLeft size={16} /> Back to utilities</Link>
        <p className="form-error">{error || 'Utility not found.'}</p>
      </div>
    )
  }

  return (
    <div>
      <Link to={`/utilities/${id}`} className="page-back-link"><ArrowLeft size={16} /> Back to utility</Link>
      <PageHeader title="Delete utility" description="Permanently remove this utility rate." />

      <Card className="delete-card">
        <div className="delete-card__icon"><AlertTriangle size={24} /></div>
        <PanelHeader title="Confirm deletion" />
        <p className="form-section__description">
          You are about to delete <strong>{utility.name}</strong>. Utilities referenced by products cannot be deleted.
        </p>
        <div className="detail-grid detail-grid--2">
          <div className="detail-item"><span className="detail-item__label">Code</span><span className="detail-item__value">{utility.code}</span></div>
          <div className="detail-item">
            <span className="detail-item__label">Rate</span>
            <span className="detail-item__value detail-item__value--mono">{formatPeso(utility.rate, 4)}</span>
          </div>
        </div>
        {error && <p className="form-error form-error--banner">{error}</p>}
        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={() => navigate(`/utilities/${id}`)}>Cancel</Button>
          <Button variant="destructive" type="button" icon={Trash2} onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete utility'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default DeleteUtilityPage
