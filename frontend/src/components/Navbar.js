import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { localStorageUtils } from "../APIs/localStorageUtils";

function Navbar() {

    const handleLogout = () => {
        // Display a confirmation dialog
        const confirmLogout = window.confirm("Are you sure you want to logout?");

        // If user confirms, proceed with the logout process
        if (confirmLogout) {
            localStorage.removeItem("jwt_token");
            window.location = "/login"
        }
    };

    const loggedInUser = localStorageUtils.getLoggedInUser();

    return (
        <div style={{ fontWeight: 'bold' }}>
            <nav className="d-flex flex-row justify-content-between">
                <div className="container d-flex flex-row justify-content-start align-items-center my-auto">
                <span style={{ fontFamily: 'Poppins, sans-serif' }} className="nav-link link-primary fs-5 font-weight-bold text-uppercase" to="">CAPPY</span>
                    <Link className="nav-link link-secondary fs-6" to="/">EP Funnel</Link>
                    <Link className="nav-link link-secondary fs-6" to="/portfolio">Portfolio</Link>
                </div>
                <div className="d-flex flex-row justify-content-end align-items-center my-auto">
                    <Link className="nav-link link-secondary fs-6" to={`/userProfile/${loggedInUser._id}`}>{loggedInUser && `${loggedInUser.username}`}</Link>  
                    <Link className="nav-link link-secondary fs-6" onClick={handleLogout}>Logout</Link>
                </div>
            </nav>
            <div className='text-center bg-primary' style={{ height: '5px' }}></div>
        </div>
    );

}

export default Navbar;
