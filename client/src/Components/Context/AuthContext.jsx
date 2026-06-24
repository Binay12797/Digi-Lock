import { createContext, useState, useEffect, Children } from "react";

export const AuthContext = createContext();

//user consist of userdetails and token
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user"); //converts to string

    return savedUser ? JSON.parse(savedUser) : null; //json.parse(savedUser) this converts to javaScript object
  });

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData)); //converts to string and store it in localstorage
    setUser(userData);
  };

  const logout = () => {
    const confirmed = confirm("Are you sure you want to logout");

    if (confirmed) {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    //AuthContext.Provider insures that all the compomponents inside it can access value passed
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
