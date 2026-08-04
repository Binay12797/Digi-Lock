import { Box, Typography, Card, CardContent, useTheme } from "@mui/material";

import { useState } from "react";
import { tokens } from "../../theme";
import notificationsData from "../Data/mockdata";

import { useOutletContext } from "react-router-dom";

export const formatEvent = (notification) => {
  switch (notification.event) {
    case "FAILED_FINGERPRINT":
      return `🚨 Failed Fingerprint Attempt at ${notification.entityName}`;

    case "LOCK_TAMPER":
      return `🚨 Lock Tamper Detected at ${notification.entityName}`;

    case "LOCK_OFFLINE":
      return `⚠️ Lock Offline at ${notification.entityName}`;

    case "USER_ADDED":
      return `ℹ️ Added New User ${notification.entityName}`;

    case "DOOR_OPENED":
      return `ℹ️ ${notification.lockName}  Opened by ${notification.entityName}`;

    default:
      return notification;
  }
};

const AlertAndNotifications = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [notifications, setNotifications] = useState(notificationsData); // first variable second function

  const { searchQuery } = useOutletContext();
  // const searchQuery = useOutletContext(); if you write this then searchquery consist of all items on context selected,setselected

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

  const filteredNotifications = notifications.filter((notification) => {
    const query = searchQuery.toLowerCase();

    return (
      formatEvent(notification).toLowerCase().includes(query) ||
      notification.event?.toLowerCase().includes(query) ||
      notification.lockName?.toLowerCase().includes(query) ||
      notification.entityName?.toLowerCase().includes(query) ||
      notification.severity?.toLowerCase().includes(query)
    );
  });

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
        {[...filteredNotifications]
          // if b-a is positive it tells b should come before a ie sorted such that b>a ie highest come first
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((notification) => (
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
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mr: 4,
                  }}
                >
                  <Typography variant="h5">
                    {formatEvent(notification)}
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
