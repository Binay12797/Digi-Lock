import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "./LoginSignup.css"

import email_icon from '../../assets/email.png'
import user_icon from '../../assets/person.png'
import password_icon from '../../assets/password.png'

const Signup = () => {

  const navigate = useNavigate();

//  const [action,setAction] = useState("Sign Up");
//   // creating usestate variable
//   // useState is a react tool which provide us with a [var,func] func can be used to set data of this variable

  return (
    <div className="page-layout-rapper">
      <div className='container'>
        <div className='header'>
          <div className='text'>Sign Up</div>
          <div className='underline'></div>
        </div>

        <div className='inputs'>
      
          <div className='input'>
            <img src={user_icon} alt="" />
            <input type="text" placeholder='Name'/>
          </div>

          <div className='input'>
            <img src={email_icon} alt="" />
            <input type="email" placeholder='Email Id'/>
          </div>

          <div className='input'>
            <img src={password_icon} alt="" />
            <input type="password" placeholder='Password'/>
          </div>
        </div>
        
        <div className="submit-container">
          <div className= "submit">Sign Up</div>
          <div className= "submit gray"  onClick={()=>navigate('/Login')}>Login</div>
          {/* if you add an . before /Login eg:./Login on clicking Login button your url will be http://localhost:5173/Signup/Login which we dont want */}
        </div>
      </div>
    </div>  
  )
}
 
export default Signup;