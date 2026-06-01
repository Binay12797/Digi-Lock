import React, { useState } from 'react'
import "./LoginSignup.css"

import email_icon from '../../assets/email.png'
import user_icon from '../../assets/person.png'
import password_icon from '../../assets/password.png'

const LoginSignup = () => {

 const [action,setAction] = useState("Sign Up");
  // creating usestate variable
  // useState is a react tool which provide us with a [var,func] func can be used to set data of this variable

  return (
    <div className='container'>
      <div className='header'>
        <div className='text'>{action}</div>
        <div className='underline'></div>
      </div>

      <div className='inputs'>
        {action === 'Login'?<div/>:
        <div className='input'>
          <img src={user_icon} alt="" />
          <input type="text" placeholder='Name'/>
        </div>}

         <div className='input'>
          <img src={email_icon} alt="" />
          <input type="email" placeholder='Email Id'/>
        </div>

         <div className='input'>
          <img src={password_icon} alt="" />
          <input type="password" placeholder='Password'/>
        </div>
      </div>

      {action === 'Login'?<div className="forgot-password">Forgot Password? <span>click here</span></div>:<div/>}
      
      <div className="submit-container">
        <div className={action==="Login"?"submit gray":"submit"}  onClick={()=>{setAction("Sign Up")}} >Sign Up</div>
        <div className={action==="Sign Up"?"submit gray":"submit"} onClick={()=>{setAction("Login")}}>Login</div>
      </div>
    </div>
  )
}
 
export default LoginSignup;