// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './components/Splash';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import EpFunnel from './pages/EpFunnel';
import { localStorageUtils } from './APIs/localStorageUtils';
import Portfolio from './pages/Portfolio';
import UserProfile from './pages/UserProfile';

function App() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate a loading time (replace with your actual loading logic)
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        // Cleanup the timer when the component is unmounted
        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            <Router>
                {loading ? (
                    <Splash />
                ) : (
                    <>
                        {localStorageUtils.hasToken() && <Navbar />}
                        <Routes>
                            <Route exact path="/login" element={<Login />} />
                            <Route exact path="/signup" element={<Signup />} />
                            <Route exact path="/" element={<EpFunnel />} />
                            <Route exact path="/portfolio" element={<Portfolio />} />
                            <Route exact path="/userProfile/:id" element={<UserProfile />} />
                        </Routes>
                    </>
                )}
            </Router>
        </div>
    );
}

export default App;
