import './App.css';
import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Signup from './pages/Signup';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import EpFunnel from './pages/EpFunnel';
import { localStorageUtils } from './APIs/localStorageUtils';
import Portfolio from './pages/Portfolio';
import UserProfile from './pages/UserProfile';


function App() {


    return (
        <div>
            <Router>
                {localStorageUtils.hasToken() && <Navbar />}
                <Routes>
                    <Route exact path="/login" element={<Login />} />
                    <Route exact path="/signup" element={<Signup />} />

                    <Route exact path="/" element={<EpFunnel />} />
                    <Route exact path="/portfolio" element={<Portfolio />} />
                    <Route exact path="/userProfile/:id" element={<UserProfile />} />
                    

                </Routes>
            </Router>
        </div>
    )
}

export default App;
