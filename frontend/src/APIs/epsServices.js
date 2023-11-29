import axios from 'axios';

const EP_API_URL = 'http://localhost:3005/ep'; 

// Create EP Service
const createEP = async (data) => {
    try {
        const response = await axios.post(`${EP_API_URL}`, data);
        console.log("EP Created");
        return response.data;
    } catch (error) {
        alert("Error occurred while creating EP");
    }
}

// Get Single EP Service
const getEP = async (epId) => {
    try {
        const response = await axios.get(`${EP_API_URL}/${epId}`);
        console.log("EP Fetched", response.data);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

// Get All EPs Service
const getAllEPs = async () => {
    try {
        const response = await axios.get(`${EP_API_URL}`);
        console.log("All EPs Fetched", response.data);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

// Update EP Service
const updateEP = async (data) => {
    console.log(data)
    try {
        const response = await axios.patch(`${EP_API_URL}/${data._id}`, data);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

// Delete EP Service
const deleteEP = async (_id) => {
    try {
        const response = await axios.delete(`${EP_API_URL}/${_id}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

const epsServices = { createEP, getEP, getAllEPs, updateEP, deleteEP };
export default epsServices;
