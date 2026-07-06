import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";

import { useState } from "react";
import { tokens } from "../../theme";
import notificationsData from "../Data/mockdata";

const AlertAndNotifications = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [notifications, setNotifications] = useState(notificationsData); // first variable second function

  return (
    <Box sx={{ m: "20px" }}>
      <Typography variant="h5">Monitor events and system activities</Typography>

      <Box sx={{ display: "flex", mt: 3, gap: 5, mb: 4 }}>
        <Button variant="contained">All</Button>
        <Button variant="contained">Critical</Button>
        <Button variant="contained">Warning</Button>
        <Button variant="contained">Info</Button>
      </Box>
    </Box>
  );
};

export default AlertAndNotifications;
