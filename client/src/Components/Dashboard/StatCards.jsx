import { Card, CardContent, Box, Typography, useTheme } from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { tokens } from "../../theme";

const iconMap = {
  lock: <LockOutlinedIcon fontSize="large" />,
  users: <PeopleAltOutlinedIcon fontSize="large" />,
  unlock: <LockOpenOutlinedIcon fontSize="large" />,
  warning: <ReportProblemOutlinedIcon fontSize="large" />,
};

const StatCards = ({ title, value, subtitle, icon }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Card sx={{ height: "100%" }}>
      {/* so that all summary cards have the same height, card will fill the height of its parent element ie box */}
      <CardContent sx={{ bgcolor: colors.primary[400] }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
          }}
        >
          <Box>{iconMap[icon]}</Box>
          <Box sx={{ pr: 2 }}>
            <Typography variant="h4">{title}</Typography>
            <Typography variant="h3" sx={{ fontWeight: "bold" }}>
              {value}
            </Typography>
            <Typography variant="caption">{subtitle}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCards;
