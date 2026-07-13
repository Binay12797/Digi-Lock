import React, { useState, useContext } from "react";
import {
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  useTheme,
  ListItemIcon,
} from "@mui/material";
import { AuthContext } from "../Context/AuthContext";
import { tokens } from "../../theme";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

const AdminProfileMenu = ({ anchorEl, openProfile, handleClose }) => {
  const { logout } = useContext(AuthContext);
  const theme = useTheme(); // theme shade
  const colors = tokens(theme.palette.mode);
  const email = "binaybista@gmail.com";

  return (
    <Box>
      <Menu
        anchorEl={anchorEl} // an propery of menu to point out where to spawn drop down menu
        id="userAccountMenu"
        open={openProfile} // true or false
        onClose={handleClose}
        onClick={handleClose} // to close menu if an item is clicked
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              bgcolor: colors.primary[400],
              backgroundImage: "none",
              backdropFilter: "blur(10px)",
              color: colors.blueAccent[100],
              border: "1px",
              borderColor: colors.grey[600],
              borderStyle: "solid",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }} //transformOrigin defines the point on the menu itself that will be "glued" to the landing spot you just defined.
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }} //defines a point on the button or element that you clicked. It’s the "landing spot" where you want the menu to connect.
        //right side and bottom of the button where you clicked
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <MenuItem onClick={handleClose}>
            <ListItemIcon sx={{ color: colors.greenAccent[400] }}>
              <PersonOutlinedIcon />
            </ListItemIcon>
            <Typography variant="h5" sx={{ color: colors.greenAccent[400] }}>
              Admin Profile
            </Typography>
          </MenuItem>
          <Box
            sx={{
              px: 2,
              py: 0,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="h5" sx={{ color: colors.grey[100] }}>
              Name: {}
            </Typography>
            <Typography variant="h5" sx={{ color: colors.grey[100] }}>
              Email: {email}
            </Typography>
          </Box>
          <Divider sx={{ bgcolor: colors.grey[600] }} />
          <MenuItem onClick={logout}>
            <ListItemIcon sx={{ color: colors.grey[100] }}>
              <LogoutIcon />
            </ListItemIcon>
            <Typography variant="h5" sx={{ color: colors.grey[100] }}>
              Logout
            </Typography>
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
};

export default AdminProfileMenu;
