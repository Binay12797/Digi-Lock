import React from 'react'
import "./Navbar.css"
import logo from '../../assets/Logo.png'

const Navbar = () => {
  return (
    <div className="navbar">
        <div className="navbar-left">
            <img src={logo} alt="Digi-Lock Logo" className='logo'/>
            <span className='navbar-title'>Digi-Lock</span>
        </div>

        <div className="navbar-right">
          <span className='navbar-item'>Contact</span>
        </div>
    </div>
  )
}


export default Navbar;