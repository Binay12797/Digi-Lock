import { Outlet } from "react-router-dom";
import Topbar from "../Global/Topbar";
import Sidebar from "../Global/Sidebar";

const DashboardLayout = () => {
  return (
    //That's a React Fragment, written in its shorthand form. it exists because every component in React must return a single root element. Without it, this would be invalid:
    <>
      <Topbar />
      <Sidebar />
      <div className="app">
        <main className="content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
