import { Box, useTheme, Typography } from "@mui/material";
import { tokens } from "../../theme";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box sx={{ m: "20px" }}>
      <Typography variant="h5" sx={{ color: colors.greenAccent[400] }}>
        Welcome to your Dashboard
      </Typography>
    </Box>
  );
};

export default Dashboard;
