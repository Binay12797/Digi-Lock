import { Box, Typography, Card, CardContent, useTheme } from "@mui/material";

import { useState } from "react";
import { tokens } from "../../theme";
import notificationsData from "../Data/mockdata";

import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

import { useOutletContext } from "react-router-dom";
import AlertAndNotifications from "./AlertAndNotifications";

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

    case "DOOR_OPENED":
      return "ℹ️ Door Openned by ";

    default:
      return event;
  }
};

const DashboardNotifications = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [notifications, setNotifications] = useState(notificationsData); // first variable second function
  const navigate = useNavigate();

  const { setSelected } = useOutletContext();

  return (
    <Box sx={{ m: "20px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", pr: 1 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Recent Notifications
        </Typography>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: colors.greenAccent[400],
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => {
            navigate("/AlertAndNotifications");
            setSelected("Alerts & Notifications");
          }}
        >
          View All
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* [...notifications] this is a spread operator creates a copy of notificaiton array so that sort dosent affect original array*/}
        {[...notifications]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5)
          .map((notification) => (
            //map is like an for loop, here creates card for each of the notifications data present
            //notification is just a variable name that points to the current notification an part of the array [notification, notification , notification]= notifications
            <Card
              key={notification.id}
              sx={{
                bgcolor:
                  theme.palette.mode === "light"
                    ? colors.greenAccent[800]
                    : colors.primary[500],
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
                    mr: 1,
                  }}
                >
                  <Typography variant="h6">
                    {formatEvent(notification.event)}
                    {notification.entityName}
                  </Typography>
                  <Typography variant="h6">
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true, //with addSuffix true "ago" is added
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

export default DashboardNotifications;
