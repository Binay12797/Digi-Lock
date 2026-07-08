import { Card, CardContent, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const LockUsageChart = ({ lockData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Card sx={{ height: "100%", bgcolor: colors.primary[400] }}>
      <CardContent>
        <Typography variant="h5">Unlocks</Typography>
        <Typography variant="subtitle1" mb={2}>
          Todays successful unlocks
        </Typography>
        {/* The ResponsiveContainer component is a container that adjusts its width and height based on the size of its parent element. */}
        <ResponsiveContainer width={"100%"} height={320}>
          <BarChart
            data={lockData}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
          >
            <XAxis dataKey="lockName" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="unlocks" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LockUsageChart;
