import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginSignup.css";

import email_icon from "../../assets/email.png";
import user_icon from "../../assets/person.png";
import password_icon from "../../assets/password.png";

const Login = () => {
  const navigate = useNavigate();

  //creating variables to capture login details form user
  const [email, setEmail] = useState(""); //setEmail is a function that can change value of email
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  //function to run when login button is pressed
  const handleLogin = async () => {
    setErrorMessage(""); //clears past errors

    try {
      //now we should make an api request to running backend port.
      const response = await axios.post("http://localhost:3000/login", {
        email: email,
        password: password,
      }); //awati: wait till server response
      //after obtaining response , response is stored in response.

      if (response.data.success) {
        // alert("Welcome back!");
        navigate("/Dashboard");
      }
    } catch (error) {
      //to handle errors if server is down or details dosent match
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(
          "Cannot Connect to server. Backend might not be running",
        );
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="page-layout-wrapper">
        <div className="container">
          <div className="header">
            <div className="text">Login</div>
            <div className="underline"></div>
          </div>

          {errorMessage && (
            <div
              style={{ color: "red", textAlign: "center", marginTop: "10px" }}
            >
              {errorMessage}
            </div>
          )}

          <div className="inputs">
            <div className="input">
              <img src={email_icon} alt="" />
              <input
                type="email"
                placeholder="Email Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />{" "}
              {/*On change works every time an new character is entered or altered, e means event*/}
            </div>

            <div className="input">
              <img src={password_icon} alt="" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
              />
            </div>
          </div>

          <div className="forgot-password">
            Forgot Password? <span>click here</span>
          </div>

          <div className="submit-container">
            <div className="submit gray" onClick={() => navigate("/Signup")}>
              Sign Up
            </div>
            <div className="submit" onClick={handleLogin}>
              Login
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
