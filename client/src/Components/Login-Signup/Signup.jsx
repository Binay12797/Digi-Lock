import React, { useState } from "react";
import { unstable_setDevServerHooks, useNavigate } from "react-router-dom";
// import axios from "axios";
import api from "../../Api/api";
import "./LoginSignup.css";

import email_icon from "../../assets/email.png";
import user_icon from "../../assets/person.png";
import password_icon from "../../assets/password.png";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async () => {
    setErrorMessage("");

    // if name is left empty then it has bollean value 0 and !name= 1
    if (!name || !email || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    try {
      const response = await api.post("/create", {
        name: name,
        email: email,
        password: password,
      });

      if (response.data.success) {
        alert("Account Created Sucessfully! Please log in.");
        navigate("/login");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(
          "Cannot Connect to server. Backend might not be running.",
        );
      }
    }
  };

  return (
    <>
      <div className="auth-page" />
      <div className="page-layout-wrapper">
        <div className="container">
          <div className="header">
            <div className="text">Sign Up</div>
            <div className="underline"></div>
          </div>

          {errorMessage && (
            <div
              style={{
                color: "red",
                textAlign: "center",
                marginTop: "15px",
                fontSize: "17px",
              }}
            >
              {errorMessage}
            </div>
          )}

          <div className="inputs">
            <div className="input">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="input">
              <img src={email_icon} alt="" />
              <input
                type="email"
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity(
                    "Please enter a valid email format!",
                  )
                }
                placeholder="Email Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
                    handleSignup();
                  }
                }}
              />
            </div>
          </div>

          <div className="submit-container">
            <div className="submit" onClick={handleSignup}>
              Sign Up
            </div>
            <div className="line" />
            <div className="submit gray" onClick={() => navigate("/Login")}>
              Already Have An Account
            </div>
            {/* if you add an . before /Login eg:./Login on clicking Login button your url will be http://localhost:5173/Signup/Login which we dont want */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
