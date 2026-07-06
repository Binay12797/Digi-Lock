import { Box, IconButton, useTheme, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase"; // used to create a search bar
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import AdminProfileMenu from "./AdminProfile";

const Topbar = ({ selected, setSelected }) => {
  const theme = useTheme(); // theme shade
  const colors = tokens(theme.palette.mode); //directly to token shde
  const colorMode = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState(null); // anchor element
  const openProfile = Boolean(anchorEl); //open to know if the profile is being shown or not
  const navigate = useNavigate();

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    //box is similar to div but we can write css directly inside the box
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        padding: 2,
      }}
    >
      <Box sx={{ ml: "4px" }}>
        <Typography variant="h4" color={colors.grey[900]}>
          {selected}
        </Typography>
      </Box>

      <Box sx={{ display: "flex" }}>
        {/* Search Bar */}
        <Box
          sx={{
            display: "flex",
            backgroundColor: colors.primary[400],
            borderRadius: "3px",
            mr: "10px",
          }}
        >
          <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
          <IconButton type="button" sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>

        {/* ICONS */}
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton
          onClick={() => {
            navigate("/AlertAndNotifications");
            setSelected("Alerts & Notifications");
          }}
        >
          <NotificationsOutlinedIcon
            sx={{
              color:
                selected === "Alerts & Notifications"
                  ? colors.blueAccent[400]
                  : "white",
            }}
          />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton onClick={handleClick}>
          <PersonOutlinedIcon />
        </IconButton>

        <AdminProfileMenu
          // these are values being passed to adminprofilemenu function
          anchorEl={anchorEl}
          openProfile={openProfile}
          handleClose={handleClose}
        />
      </Box>
    </Box>
  );
};

export default Topbar;
