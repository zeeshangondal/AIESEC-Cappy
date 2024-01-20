// Splash.js
import React from 'react';
import '../styles/Splash.css';

const Splash = () => {
    return (
        <div className="splash-container">
            {/* Add your splash screen content here */}
            <div className="loading-spinner">
                <img className={"logo"}
                     src={`${process.env.PUBLIC_URL}/logo.png`}
                     alt="Company Logo"
                     style={{  width: '300px', height: '300px' }}
                     />
            </div>

        </div>
    );
};

export default Splash;
