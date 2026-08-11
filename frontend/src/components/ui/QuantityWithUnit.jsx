import { formatQuantity } from '../../utils/quantity'

function QuantityWithUnit({ value, unit }) {
  return (
    <span className="table__quantity">
      <span className="table__quantity-value">{formatQuantity(value)}</span>
      <span className="table__quantity-unit">{unit}</span>
    </span>
  )
}

export default QuantityWithUnit
