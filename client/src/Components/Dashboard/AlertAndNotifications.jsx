import { Box, Typography, Card, CardContent, useTheme } from "@mui/material";

import { useState } from "react";
import { tokens } from "../../theme";
import notificationsData from "../Data/mockdata";

const formatEvent = (event) => {
  switch (event) {
    case "FAILED_FINGERPRINT":
      return "🚨 Failed Fingerprint Attempt at ";

    case "LOCK_TAMPER":
      return "🚨 Lock Tamper Detected at ";

    case "LOCK_OFFLINE":
      return "⚠️ Lock Offline at ";

    case "USER_ADDED":
      return "ℹ️ Added New User ";

    default:
      return event;
  }
};

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
      <Typography variant="h5" sx={{ color: colors.greenAccent[400] }}>
        Monitor Events and System Activities
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          mb: "30px",
          mt: "25px",
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
              <Typography variant="h3" color="error">
                {criticalCount}
              </Typography>
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
              <Typography variant="h3" color="warning">
                {warningCount}
              </Typography>
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
              <Typography variant="h3" color="info">
                {infoCount}
              </Typography>
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
              <Typography variant="h3" color="success">
                {allCount}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Recent Notifications
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {notifications.map((notification) => (
          //map is like an for loop, here creates card for each of the notifications data present
          //notification is just a variable name that points to the current notification an part of the array [notification, notification , notification]= notifications
          <Card
            key={notification.id}
            sx={{
              bgcolor: colors.primary[400],
              pt: "5px",
              borderLeft:
                notification.severity === "critical"
                  ? "6px solid #f44336"
                  : notification.severity === "warning"
                    ? "6px solid #ff9800"
                    : "6px solid #2196f3",
            }}
          >
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mr: 4 }}
              >
                <Typography variant="h5">
                  {formatEvent(notification.event)}
                  {notification.entityName}
                </Typography>
                <Typography variant="h5">
                  {new Date(notification.timestamp).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default AlertAndNotifications;
