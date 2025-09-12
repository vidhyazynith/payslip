// components/EmployeeForm.jsx
import { useState } from 'react'
import { addEmployee } from '../services/api'

const EmployeeForm = ({ onEmployeeAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    employeeId: '',
    month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
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
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // setFormData(prev => ({
    //   ...prev,
    //   [name]: value
    // }))

    // 🔹 CHANGE 2: Format month properly before saving
    if (name === "month") {
      const [year, month] = value.split("-")
  const formatted = new Date(Number(year), Number(month) , 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
      })
      setFormData(prev => ({ ...prev, [name]: formatted }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleEarningChange = (index, field, value) => {
    const updatedEarnings = [...formData.earnings]
    updatedEarnings[index][field] = field === 'amount' ? parseFloat(value) || 0 : value

    // find the updated Basic Pay
  const basicPay = updatedEarnings.find(e => e.type === "Basic Pay")?.amount || 0

  // calculate PF (6% of Basic Pay)
  const employeePF = parseFloat((basicPay * 0.12).toFixed(2))
  const employerPF = parseFloat((basicPay * 0.12).toFixed(2))

  const updatedDeductions = formData.deductions.map(d => {
    if (d.type === "Employee PF contribution") return { ...d, amount: employeePF }
    if (d.type === "Employer PF contribution") return { ...d, amount: employerPF }
    return d
  })


    setFormData(prev => ({
      ...prev,
      earnings: updatedEarnings,
      deductions: updatedDeductions
    }))
  }

  // const handleDeductionChange = (index, field, value) => {
  //   const updatedDeductions = [...formData.deductions]
  //   updatedDeductions[index][field] = field === 'amount' ? parseFloat(value) || 0 : value
  //   setFormData(prev => ({
  //     ...prev,
  //     deductions: updatedDeductions
  //   }))
  // }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addEmployee(formData)
      setMessage('Employee added successfully!')
      onEmployeeAdded()
      // Reset form
      setFormData({
        name: '',
        email: '',
        designation: '',
        employeeId: '',
        month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
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
    } catch (error) {
      setMessage('Error adding employee: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="employee-form">
      <h2>Add New Employee</h2>
      
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
                value={new Date(formData.month).toISOString().slice(0, 7)}
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
          <h3>Earnings</h3>
          {formData.earnings.map((earning, index) => (
            <div key={index} className="form-row">
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
            </div>
          ))}
        </div>

        <div className="form-section">
          <h3>Deductions</h3>
          {formData.deductions.map((deduction, index) => (
            <div key={index} className="form-row">
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
                  readOnly={deduction.type.includes("PF")}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Employee'}
          </button>
        </div>
      </form>

      {message && <div className="message">{message}</div>}
    </div>
  )
}

export default EmployeeForm