import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "../Global/Topbar";
import Sidebar from "../Global/Sidebar";

const DashboardLayout = () => {
  const [selected, setSelected] = useState(() => {
    return localStorage.getItem("CurrentPage") || "Dashboard";
  }); // which item is currently selected ie on which page we are currently in

  //"Whenever the selected value changes ie the vaue writtem in {},[], run this code."--------> useEffect
  useEffect(() => {
    localStorage.setItem("CurrentPage", selected);
  }, [selected]);
  return (
    //That's a React Fragment, written in its shorthand form. it exists because every component in React must return a single root element. Without it, this would be invalid:

    //display: "flex": This tells the browser to arrange all direct children (the <Sidebar/> and the main <div>) in a single horizontal row.
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar selected={selected} setSelected={setSelected} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar selected={selected} setSelected={setSelected} />
        {/*flex: 1 on the Outlet wrapper:" It tells the content area to expand to fill all remaining vertical space under the Topbar. */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Outlet />
          {/* The <Outlet/> is a hole you cut out in that container that holds your Sidebar and Topbar. You are telling React, "Whatever page the user clicks on, please show it right here inside this window" */}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
