import {
  Box,
  useTheme,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { tokens } from "../../theme";
import { Bar, BarChart, ResponsiveContainer } from "recharts";

import { dashboardStats } from "../Data/mockdata";
import StatCards from "./StatCards";
import { useState } from "react";

import LockUsageChart from "./LockUsageChart";
import { lockUsageData } from "../Data/mockdata";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [stats, setStats] = useState(dashboardStats);

  return (
    <Box sx={{ m: "20px" }}>
      <Typography variant="h5" sx={{ color: colors.greenAccent[400] }}>
        Welcome to your Dashboard
      </Typography>
      <Box sx={{ mt: "15px" }}>
        {/* The Grid component in Material UI (MUI) is a powerful layout system built on CSS Flexbox. It provides a responsive 12-column grid architecture */}
        <Grid container spacing={2}>
          {stats.map((stat) => (
            <Grid key={stat.id} size={{ xs: 12, sm: 6, md: 3 }}>
              {/* xs:12 (On extra-small screens the card takes all 12 columns.) sm:6 (On tablets each card takes 6 out of 12 columns.) md:3 (on medium screens one card takes 3 space 3*4=12)*/}
              <StatCards
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                color={stat.color}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <LockUsageChart lockData={lockUsageData} />
          </Grid>
        </Grid>

        <Box>
          <Grid container></Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
