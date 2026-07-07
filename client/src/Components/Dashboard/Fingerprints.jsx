import {
  Box,
  Typography,
  useTheme,
  Button,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { fingerprintData } from "../Data/mockdata";
import { useState } from "react";
import { tokens } from "../../theme";

const Fingerprints = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [fingerprints, setFingerprints] = useState(fingerprintData);

  return (
    <Box sx={{ m: "20px" }}>
      <Typography variant="h5">Manage fingerprints and Lock Access</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
        {/* curly bracket for js code */}
        {fingerprints.map((user) => (
          //lets name varable user as each card will be for one user which will consist of one fingerprint
          <Card key={user.id} sx={{ bgcolor: colors.primary[400], pt: "6px" }}>
            <CardContent>
              <Typography>{user.userName}</Typography>
              <Typography>{user.role}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Fingerprints;
