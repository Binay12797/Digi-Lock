import React from "react";
import "./Navbar.css";
import logo from "../../assets/Logo.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="navbar">
      <div className="navbar-left" onClick={() => navigate("/Login")}>
        <img src={logo} alt="Digi-Lock Logo" className="logo" />
        <span className="navbar-title" onClick={() => navigate("/Login")}>
          Digi-Lock
        </span>
      </div>

      <div className="navbar-right" onClick={() => navigate("/contact")}>
        <span className="navbar-item">Contact</span>
      </div>
    </div>
  );
};

export default Navbar;
