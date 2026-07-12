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
    <Card
      sx={{
        height: "100%",
        bgcolor: colors.primary[400],
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Typography variant="h5">Unlocks</Typography>
        <Typography variant="subtitle2" mb={2}>
          Todays successful unlocks
        </Typography>
        {/* The ResponsiveContainer component is a container that adjusts its width and height based on the size of its parent element. */}
        <ResponsiveContainer width={"100%"} height={320}>
          <BarChart
            data={lockData} //passes data for mock data
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[800]} />
            <XAxis
              dataKey="lockName"
              tick={{ fill: colors.grey[100] }}
              tickLine={{ stroke: colors.grey[600] }}
              axisLine={{ stroke: colors.grey[500] }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: colors.grey[100] }}
              axisLine={{ stroke: colors.grey[500] }}
              tickLine={{ stroke: colors.grey[600] }}
            />
            <Tooltip
              contentStyle={{
                background: colors.primary[500],
                border: "none",
                borderRadius: 8,
                color: "#fff",
              }}
            />
            <Bar
              dataKey="unlocks"
              fill={colors.blueAccent[700]}
              radius={[8, 8, 0, 0]}
            ></Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LockUsageChart;
