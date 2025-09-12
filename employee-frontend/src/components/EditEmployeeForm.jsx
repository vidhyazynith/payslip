// components/EmployeeUpdateForm.jsx
import { useState, useEffect } from 'react'
import { updateEmployee, getEmployeeById } from '../services/api'

const EmployeeUpdateForm = ({ employeeId, onEmployeeUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    employeeId: '',
    month: new Date().toISOString().slice(0, 7),
    paidDays: 0,
    lopDays: 0,
    remainingLeave: 0,
    leavesTaken: 0,
    earnings: [
      { type: 'Basic Pay', amount: 0 },
      { type: 'HRA', amount: 0 },
      { type: 'Special Allowance', amount: 0 }
    ],
    deductions: [
      { type: 'Income Tax', amount: 0 },
      { type: 'Employer PF contribution', amount: 0 },
      { type: 'Employee PF contribution', amount: 0 }
    ]
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setFetching(true)
        const employeeData = await getEmployeeById(employeeId)
        setFormData(employeeData)
      } catch (error) {
        setMessage('Error fetching employee data: ' + error.message)
      } finally {
        setFetching(false)
      }
    }

    if (employeeId) {
      fetchEmployeeData()
    }
  }, [employeeId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEarningChange = (index, field, value) => {
    const updatedEarnings = [...formData.earnings]
    updatedEarnings[index][field] = field === 'amount' ? parseFloat(value) || 0 : value
    setFormData(prev => ({
      ...prev,
      earnings: updatedEarnings
    }))
  }

  const handleDeductionChange = (index, field, value) => {
    const updatedDeductions = [...formData.deductions]
    updatedDeductions[index][field] = field === 'amount' ? parseFloat(value) || 0 : value
    setFormData(prev => ({
      ...prev,
      deductions: updatedDeductions
    }))
  }

  const addEarningField = () => {
    setFormData(prev => ({
      ...prev,
      earnings: [...prev.earnings, { type: '', amount: 0 }]
    }))
  }

  const removeEarningField = (index) => {
    if (formData.earnings.length <= 1) return
    setFormData(prev => ({
      ...prev,
      earnings: prev.earnings.filter((_, i) => i !== index)
    }))
  }

  const addDeductionField = () => {
    setFormData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { type: '', amount: 0 }]
    }))
  }

  const removeDeductionField = (index) => {
    if (formData.deductions.length <= 1) return
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateEmployee(employeeId, formData)
      setMessage('Employee updated successfully!')
      onEmployeeUpdated()
    } catch (error) {
      setMessage('Error updating employee: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="employee-form">Loading employee data...</div>
  }

  return (
    <div className="employee-form">
      <h2>Update Employee</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Employee ID *</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                disabled
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Payroll Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Month</label>
              <input
                type="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Paid Days</label>
              <input
                type="number"
                name="paidDays"
                value={formData.paidDays}
                onChange={handleChange}
                min="0"
                max="31"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>LOP Days</label>
              <input
                type="number"
                name="lopDays"
                value={formData.lopDays}
                onChange={handleChange}
                min="0"
                max="31"
              />
            </div>
            <div className="form-group">
              <label>Remaining Leave</label>
              <input
                type="number"
                name="remainingLeave"
                value={formData.remainingLeave}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Leaves Taken</label>
              <input
                type="number"
                name="leavesTaken"
                value={formData.leavesTaken}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <h3>Earnings</h3>
            <button type="button" onClick={addEarningField} className="add-button">
              Add Earning
            </button>
          </div>
          {formData.earnings.map((earning, index) => (
            <div key={index} className="form-row with-actions">
              <div className="form-group">
                <label>Type</label>
                <input
                  type="text"
                  value={earning.type}
                  onChange={(e) => handleEarningChange(index, 'type', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={earning.amount}
                  onChange={(e) => handleEarningChange(index, 'amount', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <button 
                type="button" 
                onClick={() => removeEarningField(index)}
                className="remove-button"
                disabled={formData.earnings.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <h3>Deductions</h3>
            <button type="button" onClick={addDeductionField} className="add-button">
              Add Deduction
            </button>
          </div>
          {formData.deductions.map((deduction, index) => (
            <div key={index} className="form-row with-actions">
              <div className="form-group">
                <label>Type</label>
                <input
                  type="text"
                  value={deduction.type}
                  onChange={(e) => handleDeductionChange(index, 'type', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={deduction.amount}
                  onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <button 
                type="button" 
                onClick={() => removeDeductionField(index)}
                className="remove-button"
                disabled={formData.deductions.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Employee'}
          </button>
        </div>
      </form>

      {message && <div className="message">{message}</div>}
    </div>
  )
}

export default EmployeeUpdateForm