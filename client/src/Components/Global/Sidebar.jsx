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
import Logo from "../../assets/Logo.png";
import LogoutIcon from "@mui/icons-material/Logout";

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
      component={<Link to={to} />}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const DashboardSidebar = ({ selected, setSelected }) => {
  const theme = useTheme(); // theme shade
  const colors = tokens(theme.palette.mode); //directly to token shade
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        position: "sticky",
        top: 0,
        height: "100vh",
        "& .ps-sidebar-container": {
          backgroundColor: colors.primary[400],
          height: "100%",
        },
        "& .ps-menu-button": {
          padding: "5px 35px 5px 20px ",
        },
        "& .ps-menu-button:hover": {
          backgroundColor: "transparent",
          color: "#868dfb",
        },
        "& .ps-menu-icon": {
          backgroundColor: "transparent",
        },
        "& .ps-active": {
          color: "#6870fa ",
        },
      }}
    >
      <Sidebar
        collapsed={isCollapsed}
        style={{ height: "100%", position: "relative" }}
      >
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              // top right bottom left
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {/* In JavaScript, if the left side of the && is truthy, the code returns the right side (the Box component). */}
            {!isCollapsed && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  ml: "15px",
                  // margin left
                }}
              >
                <Typography variant="h3" color={colors.grey[900]}>
                  Digi-Lock
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingBottom: "25px",
                }}
              >
                {/* alt= alternative text description */}
                <img
                  alt="Digi-Lock Logo"
                  height="100px"
                  width="auto"
                  src={Logo}
                />
              </Box>
            </Box>
          )}

          <Box>
            <Box>
              <Item
                title="Dashboard"
                to="/Dashboard"
                icon={<HomeOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Locks"
                to="/Locks"
                icon={<LockIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Users"
                to="/Users"
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
                to="/AccessLogs"
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
            {/* position: "absolute" on the Logout Box: This pulls the Logout button out of the normal "flow" of the Menu. By setting bottom: "10px", you tell the browser: "No matter what, stick this to the bottom of the sidebar ie: ends at 10 px from the bottom of the page." */}
            <Box sx={{ position: "absolute", bottom: "10px", width: "100%" }}>
              <Item
                title="Logout"
                to="/"
                icon={<LogoutIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default DashboardSidebar;
