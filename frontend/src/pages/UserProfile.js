import React, { useState, useEffect } from 'react';
import usersServices from '../APIs/users';
import { Button, Modal, Form } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [showEmailInfo, setShowEmailInfo] = useState(false);
    const { id } = useParams();

    async function fetchUser() {
        const response = await usersServices.getUser(id);
        setUser(response.user);
        setFormData({
            _id: response.user._id,
            username: response.user.username,
            email: response.user.email,
            LC: response.user.LC,
            role: response.user.role,
            TL: response.user.TL,
            password: response.user.password,
            appPassword: response.user.appPassword,
            emailSubject: response.user.emailSubject,
            emailBody: response.user.emailBody
        });
    }

    useEffect(() => {
        fetchUser();
    }, []);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await usersServices.updateUser(formData);
            alert("Information updated successfully!");
            fetchUser();
        } catch (error) {
            alert("An error occurred: " + error.message);
        }
        setShowModal(false);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    const obscuredPassword = '*'.repeat(user.password.length);
    const obscuredAppPassword = '*'.repeat(user.appPassword.length);

    return (
        <div className="container mt-5">
            {/* User Info div */}
            <div className="p-4 shadow rounded">
                <div
                    className="d-flex justify-content-between align-items-center my-auto border-bottom pb-2"
                    onClick={() => {setShowEmailInfo(false); setShowUserInfo(!showUserInfo)}}
                    style={{ cursor: 'pointer' }}
                >
                    <h4 className="">My Profile</h4>
                    <div>
                        <Button variant="link">
                            {showUserInfo ? '🔼' : '🔽'}
                        </Button>
                    </div>
                </div>
                {showUserInfo && (
                    <div className="mt-4">
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>LC:</strong> {user.LC}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                        <p><strong>TL Name:</strong> {user.TL}</p>
                        <p><strong>Password:</strong> {obscuredPassword}</p>
                        <div className="d-flex mt-4">
                            <Button variant="primary" className="mr-2" onClick={() => { setShowEmailInfo(false); setShowModal(true) }}>Update Profile</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* New Div for email attributes */}
            <div className="p-4 shadow rounded mt-2">
                <div
                    className="d-flex justify-content-between align-items-center my-auto border-bottom pb-2"
                    onClick={() => {setShowUserInfo(false); setShowEmailInfo(!showEmailInfo)}}
                    style={{ cursor: 'pointer' }}
                >
                    <h4>Email Information</h4>
                    <div>
                        <Button variant="link">
                            {showEmailInfo ? '🔼' : '🔽'}
                        </Button>
                    </div>
                </div>
                {showEmailInfo && (
                    <div className="mt-4">
                        <p><strong>App Password:</strong> {obscuredAppPassword}</p>
                        <p><strong>Email Subject:</strong> {user.emailSubject}</p>
                        <p><strong>Email Body:</strong> {user.emailBody}</p>
                        <div className="d-flex mt-4">
                            <Button variant="primary" className="mr-2" onClick={() => { setShowUserInfo(false); setShowModal(true) }}>Update Email Info</Button>
                        </div>
                    </div>
                )}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update {showUserInfo ? 'Profile' : 'Email information'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                        {/* ... (rest of the fields to update including emailSubject and emailBody) */}
                        <div className="row">
                            {showUserInfo && !showEmailInfo ?
                                <>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Username</label>
                                            <input required type="text" className="form-control" name="username" value={formData.username} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group mt-3">
                                            <label>Email</label>
                                            <input required type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group mt-3">
                                            <label>LC</label>
                                            <input required type="text" className="form-control" name="LC" value={formData.LC} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Role</label>
                                            <input required type="text" className="form-control" name="role" value={formData.role} onChange={handleInputChange} />
                                        </div>

                                        <div className="form-group mt-3">
                                            <label>TL Name</label>
                                            <input required type="text" className="form-control" name="TL" value={formData.TL} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group mt-3">
                                            <label>Password</label>
                                            <input required type="text" className="form-control" name="password" value={formData.password} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </>
                                : ''}
                            <div>
                                {showEmailInfo && !showUserInfo ?
                                    <>
                                        <div className="form-group">
                                            <label>App Password</label>
                                            <input required type="text" className="form-control" name="appPassword" value={formData.appPassword} onChange={handleInputChange} />
                                        </div>

                                        <div className="form-group mt-3">
                                            <label>Email Subject</label>
                                            <input type="text" className="form-control" name="emailSubject" value={formData.emailSubject} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group mt-3">
                                            <label>Email Body</label>
                                            <textarea className="form-control" name="emailBody" value={formData.emailBody} rows='10' onChange={handleInputChange} />
                                        </div>

                                    </>
                                    : ''}
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-3">
                            <Button variant="primary" type="submit">Update</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
}
