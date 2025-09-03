// components/EmployeeDashboard.jsx
import { useState } from 'react'
import EmployeeDetails from './EmployeeDetails'

const EmployeeDashboard = ({ employees, loading, onRefresh }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="loading">Loading employees...</div>
  }

  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <h2>Employee Dashboard</h2>
        <div className="dashboard-controls">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={onRefresh} className="btn-refresh">Refresh</button>
        </div>
      </div>

      <div className="employee-list">
        {filteredEmployees.length === 0 ? (
          <div className="empty-state">
            {employees.length === 0 
              ? 'No employees found. Add your first employee to get started.' 
              : 'No employees match your search.'}
          </div>
        ) : (
          filteredEmployees.map(employee => (
            <div 
              key={employee._id} 
              className={`employee-card ${selectedEmployee?._id === employee._id ? 'selected' : ''}`}
              onClick={() => setSelectedEmployee(employee)}
            >
              <div className="employee-basic">
                <h3>{employee.name}</h3>
                <p>{employee.designation}</p>
                <p className="employee-id">ID: {employee.employeeId}</p>
              </div>
              <div className="employee-pay">
                <p className="net-pay">₹{employee.salary?.toFixed(2) || '0.00'}</p>
                <p className="pay-period">{employee.month}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedEmployee && (
        <EmployeeDetails 
          employee={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  )
}

export default EmployeeDashboard