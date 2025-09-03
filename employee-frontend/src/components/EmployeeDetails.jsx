// components/EmployeeDetails.jsx
const EmployeeDetails = ({ employee, onClose }) => {
  return (
    <div className="employee-details-overlay">
      <div className="employee-details">
        <div className="details-header">
          <h2>Employee Details</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <div className="details-content">
          <div className="details-section">
            <h3>Basic Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Name</label>
                <span>{employee.name}</span>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <span>{employee.email}</span>
              </div>
              <div className="detail-item">
                <label>Designation</label>
                <span>{employee.designation}</span>
              </div>
              <div className="detail-item">
                <label>Employee ID</label>
                <span>{employee.employeeId}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Payroll Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Month</label>
                <span>{employee.month}</span>
              </div>
              <div className="detail-item">
                <label>Paid Days</label>
                <span>{employee.paidDays}</span>
              </div>
              <div className="detail-item">
                <label>LOP Days</label>
                <span>{employee.lopDays}</span>
              </div>
              <div className="detail-item">
                <label>Remaining Leave</label>
                <span>{employee.remainingLeave}</span>
              </div>
              <div className="detail-item">
                <label>Leaves Taken</label>
                <span>{employee.leavesTaken}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Earnings</h3>
            <div className="earnings-deductions">
              {employee.earnings.map((earning, index) => (
                <div key={index} className="item">
                  <span className="type">{earning.type}</span>
                  <span className="amount">₹{earning.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="item total">
                <span className="type">Gross Earnings</span>
                <span className="amount">₹{employee.grossEarnings?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Deductions</h3>
            <div className="earnings-deductions">
              {employee.deductions.map((deduction, index) => (
                <div key={index} className="item">
                  <span className="type">{deduction.type}</span>
                  <span className="amount">₹{deduction.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="item total">
                <span className="type">Total Deductions</span>
                <span className="amount">₹{employee.totalDeductions?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          <div className="details-section highlight">
            <h3>Net Pay</h3>
            <div className="net-pay-display">
              <span className="label">Amount:</span>
              <span className="value">₹{employee.salary?.toFixed(2) || '0.00'}</span>
            </div>
            {employee.netPayWords && (
              <div className="net-pay-words">
                <span className="label">In Words:</span>
                <span className="value">{employee.netPayWords}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetails