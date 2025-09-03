// services/api.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Employee APIs
export const getEmployees = () => api.get('/employees')
export const getEmployeeById = (employeeId) => api.get(`/employee/${employeeId}`)
export const addEmployee = (employeeData) => api.post('/add-employee', employeeData)
export const updateEmployee = (employeeId, employeeData) => api.put(`/update-employee/${employeeId}`, employeeData)
export const deleteEmployee = (employeeId) => api.delete(`/delete-employee/${employeeId}`)

// Payslip APIs
export const sendPayslips = () => api.get('/send-payslips')

export default api