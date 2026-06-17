import { useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar"; //helps to build you a sidebar
// import "react-pro-sidebar/dist/css/styles.css"; used in old version library uses css in js styling internally
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LockIcon from "@mui/icons-material/Lock";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import FingerprintOutlinedIcon from "@mui/icons-material/FingerprintOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

//we make item so that we dont have to write same block of code multiple times
const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme(); // theme shade
  const colors = tokens(theme.palette.mode); //directly to token shade
  return (
    //active will higilight currently selected title
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const DashboardSidebar = () => {
  const theme = useTheme(); // theme shade
  const colors = tokens(theme.palette.mode); //directly to token shade
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard"); // which item is currently selected ie on which page we are currently in

  return (
    <Box
      sx={{
        "&.pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "&.pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "&.pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "&.pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "&.pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <Sidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          ></MenuItem>

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/Dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Locks"
              to="/Dashboard"
              icon={<LockIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Users"
              to="/Dashboard"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Fingerprints"
              to="/Dashboard"
              icon={<FingerprintOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Access Logs"
              to="/Dashboard"
              icon={<DescriptionIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Alerts & Notifications"
              to="/Dashboard"
              icon={<NotificationsNoneOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Settings"
              to="/Dashboard"
              icon={<SettingsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default DashboardSidebar;
