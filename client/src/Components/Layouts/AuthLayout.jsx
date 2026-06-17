import { Outlet } from "react-router-dom";
import Navbar from "../Login-Signup/Navbar.jsx";

const AuthLayout = () => {
  return (
    //That's a React Fragment, written in its shorthand form. it exists because every component in React must return a single root element. Without it, this would be invalid:
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default AuthLayout;
