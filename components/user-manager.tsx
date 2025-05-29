"use client"
import { useState, useEffect } from "react"
import { Table, Button, Modal, Form } from "react-bootstrap"
import axios from "axios"

const UserManager = () => {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "" })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleShowModal = (user = null) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleUserChange = (e) => {
    const { name, value } = e.target
    setNewUser({ ...newUser, [name]: value })
  }

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        await axios.put(`/api/users/${selectedUser.id}`, newUser)
      } else {
        await axios.post("/api/users", newUser)
      }
      fetchUsers()
      handleCloseModal()
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`)
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  return (
    <div>
      <h2>User Management</h2>
      <Button variant="primary" onClick={() => handleShowModal()}>
        Add New User
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <Button variant="info" onClick={() => handleShowModal(user)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDeleteUser(user.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedUser ? "Edit User" : "Add New User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={newUser.name} onChange={handleUserChange} />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={newUser.email} onChange={handleUserChange} />
            </Form.Group>
            <Form.Group controlId="formRole">
              <Form.Label>Role</Form.Label>
              <Form.Control type="text" name="role" value={newUser.role} onChange={handleUserChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveUser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default UserManager
