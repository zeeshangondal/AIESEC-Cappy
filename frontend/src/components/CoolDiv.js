import React from 'react';
import '../styles/CoolDiv.css';

const CoolDiv = ({ children }) => {
    return (
        <div className="cool-div">
            {children}
        </div>
    );
}

export default CoolDiv;
