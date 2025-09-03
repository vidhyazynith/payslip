// App.jsx
import { useState, useEffect } from 'react'
import EmployeeForm from './components/EmployeeForm'
import EmployeeDashboard from './components/EmployeeDashboard'
import { getEmployees, sendPayslips } from './services/api'

function App() {
  const [employees, setEmployees] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await getEmployees()
      setEmployees(response.data)
    } catch (error) {
      setMessage('Error fetching employees: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendPayslips = async () => {
    try {
      setLoading(true)
      const response = await sendPayslips()
      setMessage(response.data.message)
      alert('Payslips sent successfully!')
    } catch (error) {
      setMessage('Error sending payslips: ' + error.message)
      alert('Error sending payslips: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Employee Payslip System</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'View Employees' : 'Add New Employee'}
        </button>
      </header>

      {message && (
        <div className="message">
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      <main className="app-main">
        {showForm ? (
          <EmployeeForm 
            onEmployeeAdded={fetchEmployees} 
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <>
            <EmployeeDashboard 
              employees={employees} 
              loading={loading} 
              onRefresh={fetchEmployees}
            />
            <div className="send-payslips-section">
              <button 
                className="btn btn-send"
                onClick={handleSendPayslips}
                disabled={loading || employees.length === 0}
              >
                {loading ? 'Sending...' : 'Send Payslips to All Employees'}
              </button>
              <p className="hint">
                This will generate and email payslips to all employees in the system
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App