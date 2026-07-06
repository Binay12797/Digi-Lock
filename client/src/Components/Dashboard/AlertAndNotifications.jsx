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

  const criticalCount = notifications.filter(
    (notifications) => notifications.severity === "critical",
  ).length;

  const warningCount = notifications.filter(
    (notifications) => notifications.severity === "warning",
  ).length;

  const infoCount = notifications.filter(
    (notifications) => notifications.severity === "info",
  ).length;

  const allCount = notifications.length;

  return (
    <Box sx={{ m: "20px" }}>
      <Typography variant="h5">Monitor events and system activities</Typography>

      <Box sx={{ display: "flex", mt: 3, gap: 5, mb: 4 }}>
        <Button variant="contained">All</Button>
        <Button variant="contained">Critical</Button>
        <Button variant="contained">Warning</Button>
        <Button variant="contained">Info</Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          mb: "30px",
        }} // it tells to make four column of equla width and fill up the screen/ grid container
      >
        <Card sx={{ bgcolor: colors.primary[400] }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pr: 2,
                mt: 1,
              }}
            >
              <Typography color="error" variant="h3">
                🚨 Critical
              </Typography>
              <Typography variant="h3">{criticalCount}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: colors.primary[400] }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pr: 2,
                mt: 1,
              }}
            >
              <Typography color="warning" variant="h3">
                ⚠️ Warning
              </Typography>
              <Typography variant="h3">{warningCount}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: colors.primary[400] }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pr: 2,
                mt: 1,
              }}
            >
              <Typography color="info" variant="h3">
                ℹ️ Info
              </Typography>
              <Typography variant="h3">{infoCount}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: colors.primary[400] }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pr: 2,
                mt: 1,
              }}
            >
              <Typography color="success" variant="h3">
                📋 Total
              </Typography>
              <Typography variant="h3">{allCount}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AlertAndNotifications;
