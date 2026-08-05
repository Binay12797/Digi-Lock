import { Box, Typography, Card, CardContent, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { tokens } from "../../theme";
import { formatDistanceToNow } from "date-fns";
import { useNavigate, useOutletContext } from "react-router-dom";
import { formatEvent } from "./AlertAndNotifications";
import { socket } from "../../Api/socket";
import api from "../../Api/api";

const DashboardNotifications = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const { setSelected } = useOutletContext();

  // Fetch notification history from MongoDB
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        setNotifications(response.data.data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  // Listen for new notifications
  useEffect(() => {
    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, []);

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
            "&:hover": {
              textDecoration: "underline",
            },
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
        {[...notifications]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((notification) => (
            <Card
              key={notification._id}
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
                    {formatEvent(notification)}
                  </Typography>

                  <Typography variant="h6">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
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
