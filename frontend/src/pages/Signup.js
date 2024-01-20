import React, { useEffect, useState } from 'react';
import APIs from '../APIs/users'
import { Link, useNavigate } from 'react-router-dom';
import { localStorageUtils } from '../APIs/localStorageUtils';
import {FaFacebook, FaInstagram, FaLinkedin} from "react-icons/fa";
import '../styles/Signup.css';

export default function Signup() {
    const navigate = useNavigate();
    useEffect(() => {
        if (localStorageUtils.hasToken()) {
            navigate("/")
        }
    })

    const initialFormData = {
        username: '',
        email: '',
        LC: '',
        role: '',
        password: '',
        confirm: '',
        TL: '',
        appPassword: '',
        emailSubject: '',
        emailBody:''
    };

    const [formData, setFormData] = useState(initialFormData);
    const [passwordError, setPasswordError] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'confirm' || e.target.name === 'password') {
            setPasswordError(formData.password !== e.target.value && e.target.name === 'confirm');
        }
    };

    const handleReset = () => {
        setFormData(initialFormData);
        setPasswordError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm) {
            setPasswordError(true);
            console.error("Passwords do not match!");
            return;
        }    
        console.log(formData);
    
        try {
            await APIs.signup(formData);
            handleReset()
            window.location="/login"
        } catch (error) {
            // Error handling in the signup function already shows an alert, so no need to repeat it here
            console.error("Error while signing up:", error);
        }
    };
    
    return (
        <div className="signup-container">
            <div className="black-background" >
                <div className="company-info" style={{ marginRight: '80px', backgroundColor: 'black', width: '90%' }}>
                    {/* Placeholder for Company Logo */}
                    <img className={"logo"}
                         src={`${process.env.PUBLIC_URL}/logo.png`}
                         alt="Company Logo"
                         style={{ marginLeft: '30px', width: '550px', height: '550px' }}
                    />

                    {/* Placeholder for Tagline */}
                    <p style={{ marginLeft: '20px', color: 'white' , display: 'inline'}}>Powered by Xandria</p>

                    {/* Placeholder for Social Media Icons */}
                    <div className="social-media-icons" style={{ display: 'inline' }}>
                        <br/>
                        <br/>
                        <a href="https://www.facebook.com/xandriacoai/">
                            <FaFacebook size={30} style={{ color: '#2ec1d3' ,width: '100px'}} />
                        </a>

                        <a href="https://www.instagram.com/x.a.n.d.r.i.a/">
                            <FaInstagram size={30} style={{ color: '#2ec1d3', width: '40px' }} />
                        </a>

                        <a href="https://www.linkedin.com/company/xandria-in/">
                            <FaLinkedin size={30} style={{ color: '#2ec1d3', width: '89px' }} />
                        </a>

                    </div>
                </div>
            </div>
        <div className="d-flex justify-content-center align-items-center" style={{ marginTop: '8vh', width:'60%' }}>
            <form onSubmit={handleSubmit} style={{ textAlign: 'left', width: '70%' }}>
                <h2 className='text-center mb-4'>Sign Up</h2>
                <div className="row">
                    {/* Left Column */}
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Username</label>
                            <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} required />
                        </div>

                        <div className="form-group mt-2">
                            <label>Email</label>
                            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group mt-2">
                            <label>LC</label>
                            <select className="form-control" name="LC" value={formData.LC} onChange={handleChange} required>
                                <option value="">Select LC</option>
                                <option value="AIESEC in Islamabad">AIESEC in Islamabad</option>
                            </select>
                        </div>

                        <div className="form-group mt-2">
                            <label>Role</label>
                            <input type="text" className="form-control" name="role" value={formData.role} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>TL Name</label>
                            <input type="text" className="form-control" name="TL" value={formData.TL} onChange={handleChange} required />
                        </div>

                        <div className="form-group mt-2">
                            <label>Password</label>
                            <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
                        </div>

                        <div className="form-group mt-2">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                                name="confirm"
                                value={formData.confirm}
                                onChange={handleChange}
                                required
                            />
                            {passwordError && <div className="invalid-feedback">Passwords do not match!</div>}
                        </div>

                        <div className="form-group mt-2">
                            <label>App Password</label>
                            <input type="text" className="form-control" name="appPassword" value={formData.appPassword} onChange={handleChange} required />
                        </div>
                    </div>
                </div>
                <div className="col-md-12">
                        <div className="form-group mt-2">
                            <label>Email Subject</label>
                            <input type="text" className="form-control" name="emailSubject" value={formData.emailSubject} onChange={handleChange} required />
                        </div>

                        <div className="form-group mt-2">
                            <label>Email Body</label>
                            <textarea className="form-control" name="emailBody" value={formData.emailBody} rows='5' onChange={handleChange} required/>
                        </div>
                    </div>
                <div className="d-flex justify-content-end mt-3">
                    <button type="button" className="btn btn-secondary m-2" onClick={handleReset}>Reset</button>
                    <button type="submit" className="btn btn-primary m-2">Sign Up</button>
                </div>

                <div className="text-center mt-3">
                    <small>Already have an account? <Link to="/login">Log in</Link></small>
                </div>

                
            </form>
        </div>
     </div>
    );
}
