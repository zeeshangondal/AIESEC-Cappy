import axios from 'axios';
import { localStorageUtils } from './localStorageUtils';  

const API_URL = 'http://localhost:3005/user';  

// Signup Service
const signup = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/signup`, data);
        console.log("User Created" )
        alert("User created successfully")
        return response.data;
    } catch (error) {
        alert("Error occured")
    }
}

// Login Service
const login = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/login`, data);

        // If login is successful and a JWT token is returned by the backend.
        if (response.status==200 && response.data && response.data.token) {
            
            // Save token to local storage using utility function
            localStorageUtils.setToken(response.data.token);
            if (response.data.user) {
                localStorageUtils.setLoggedInUser(JSON.stringify(response.data.user));
            }
            
            // Set up Axios to use the token for subsequent API requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorageUtils.getToken()}`;
        }else{
            return false
        }

        return true;
    } catch (error) {
        alert("Something wrong. Please try again");
    }
}

// Get Single User Service
const getUser = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        console.log("User Created" , response.data )
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

// Get All Users Service
const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

// Update User Service
const updateUser = async (data) => {
    try {
        const response = await axios.patch(`${API_URL}/${data._id}`, data);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

const updateAssignEpsCount = async (_id,data) => {
    try {
        const response = await axios.patch(`${API_URL}/updateAssignEpsCount/${_id}`, data);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

const dispatchEmails = async () => {
    try {
        const response = await axios.patch(`${API_URL}/email/dispatchEmails`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}


const assignEpsToUser = async (_id) => {
    try {
        const response = await axios.patch(`${API_URL}/assignEps/${_id}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}
// Delete User Service
const deleteUser = async (id, token) => {
    try {
        const response = await axios.delete(`${API_URL}/users/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

const users={ signup, login, getUser, getAllUsers, updateUser, deleteUser ,updateAssignEpsCount , assignEpsToUser , dispatchEmails}
export default users;
