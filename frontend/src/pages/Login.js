import React, { useEffect, useState } from 'react';
import APIs from '../APIs/users';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { localStorageUtils } from '../APIs/localStorageUtils';


export default function Login() {
    
    const navigate = useNavigate();
    useEffect(()=>{
        if(localStorageUtils.hasToken()){
            navigate("/")
        }
    })

    const initialFormData = {
        email: '',
        password: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const [errorMessage, setErrorMessage] = useState(''); // State variable for error message

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setFormData(initialFormData);
        setErrorMessage(''); // Clear the error message on reset
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loginSuccess = await APIs.login(formData); // Assuming APIs.login is an asynchronous function
        if (!loginSuccess) {
            setErrorMessage('Invalid email or password. Please try again.'); // Set error message on failed login
        } else {
            setErrorMessage(''); // Clear the error message on successful login
            window.location="/"
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ marginTop: '8vh' }}>
            <div className="company-info" style={{ marginRight: '80px' }}>
                {/* Placeholder for Company Logo */}
                <img src={`${process.env.PUBLIC_URL}/xandria.png`} alt="Company Logo" style={{marginRight: '90px', width: '550px', height: '550px' }} />

                {/* Placeholder for Tagline */}
                <p>Your Company Taglines yeah very gooddd dofo f</p>
            </div>
            <form onSubmit={handleSubmit} style={{ textAlign: 'left', width: '35%' }}>
                <h2 className='text-center'>Log In</h2>
                {errorMessage && <div className="text-center text-danger mb-3">{errorMessage}</div>} {/* Conditionally display the error message */}
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <br />
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <br />
                <div className="d-flex justify-content-end">
                    <button type="button" className="btn btn-secondary m-2" onClick={handleReset}>Reset</button>
                    <button type="submit" className="btn btn-primary m-2">Log In</button>
                </div>

                <div className="text-center mb-3">
                    <small>Don't have an account? <Link to="/signup">Sign up</Link></small>
                </div>

            </form>
        </div>
    );
}
