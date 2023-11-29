import React, { useState, useEffect } from 'react';
import usersServices from '../APIs/users';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import CoolDiv from '../components/CoolDiv'
import epsServices from '../APIs/epsServices';
import { useNavigate } from 'react-router-dom';
import { localStorageUtils } from '../APIs/localStorageUtils';

export default function Portfolio() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState({});
    const [updatedAssignEPs, setUpdatedAssignEPs] = useState('');
    const [eps, setEps] = useState([]);
    const [unassignedEpsCount, setUnassignedEpsCount] = useState(0);
    const [showAssignModal, setShowAssignModal] = useState(false); // state for the new modal

    const navigate = useNavigate();

    if (!localStorageUtils.hasToken()) {
        navigate("/login")
    }

    async function fetchUsers() {
        try {
            const response = await usersServices.getAllUsers();
            setUsers(response.users || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    }
    async function fetchEps() {
        const response = await epsServices.getAllEPs();
        setEps(response.eps);
        setUnassignedEpsCount(response.eps.filter(ep => (!ep.assigned_TL || ep.assigned_TL === '-') && (!ep.assigned_Member || ep.assigned_Member === '-')).length)
    }

    useEffect(() => {
        fetchUsers();
        fetchEps();
    }, []);

    const openAssignModal = () => {
        setShowAssignModal(true);
    };

    const closeAssignModal = () => {
        setShowAssignModal(false);
    };


    const handleConfirmAssignEps = async () => {
        // Calculate the sum of assignEps for all users
        const totalAssignedEps = users.reduce((acc, user) => Number(acc) + Number(user.assignEps || 0), 0);    
        // Check if the totalAssignedEps is greater than unassignedEpsCount
        if (totalAssignedEps > unassignedEpsCount) {
            alert(`Only ${unassignedEpsCount} EPs can be assigned but you want to assign ${totalAssignedEps} EPs `);
            return; // Exit the function early
        }
        try {
            for (let user of users) {
                if (user.assignEps > 0) {
                    // Assign EPs to the user
                    await usersServices.assignEpsToUser(user._id);
                }
            }
            fetchEps();
            closeAssignModal(); // Close modal once all users have been processed
        } catch (error) {
            console.error("Failed to update user", error);
        }
    };
    

    const openModal = (user) => {
        setCurrentUser(user);
        setUpdatedAssignEPs(user.assignEps || ''); // Assuming assignEPs is a field in the user object
        setShowModal(true);
    };

    const closeModal = () => {
        setCurrentUser({});
        setUpdatedAssignEPs('');
        setShowModal(false);
    };

    const handleUpdate = async () => {
        try {
            await usersServices.updateAssignEpsCount(currentUser._id, { assignEps: updatedAssignEPs });
            const userToUpdate = { ...currentUser, assignEps: updatedAssignEPs };

            const updatedUsers = users.map(u => u._id === userToUpdate._id ? userToUpdate : u);
            setUsers(updatedUsers);
            closeModal();
        } catch (error) {
            console.error("Failed to update user", error);
        }
    };

    return (
        <div className="container mt-3">
            <CoolDiv>
                <div style={{ height: '10vh' }}>
                    <h1 className="text-center">Portfolio</h1>
                    <hr />
                </div>
            </CoolDiv>
            <br />
            <div className="d-flex justify-content-between">
                <span style={{ fontSize: '0.8rem' }}>Unassigned EPs: {unassignedEpsCount}</span>
                <Button size='sm' onClick={openAssignModal}>Assign EPs</Button>
            </div>

            <Modal show={showAssignModal} onHide={closeAssignModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Assign EPs</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Unassigned EPs: {unassignedEpsCount}</p>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Assign EP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(user => user.assignEps > 0).map(filteredUser => (
                                <tr key={filteredUser.id || filteredUser._id}>
                                    <td>{filteredUser.username}</td>
                                    <td>{filteredUser.assignEps}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={closeAssignModal}>Close</Button>
                    <Button variant="success" onClick={handleConfirmAssignEps}>Confirm</Button>
                </Modal.Footer>
            </Modal>

            <Table hover size="sm" style={{ fontSize: '0.8rem' }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>LC</th>
                        <th>Number of Assigned EPs</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id || user._id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.LC}</td>
                            <td style={{ cursor: 'pointer' }} onClick={() => { openModal(user) }}>
                                {user.assignEps}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Number of EPs for {currentUser.username}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Assign EPs</Form.Label>
                        <Form.Control
                            type="text"
                            value={updatedAssignEPs}
                            onChange={e => setUpdatedAssignEPs(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={closeModal}>Close</Button>
                    <Button variant="success" onClick={handleUpdate}>Save</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
