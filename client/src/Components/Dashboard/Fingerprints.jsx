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
              <Typography variant="h5">{user.userName}</Typography>
              <Typography>{user.role}</Typography>
              <Typography sx={{ mt: 2 }}>
                <strong>Status:</strong>
                <Typography
                  component="span"
                  color={user.enrolled ? "success" : "error"}
                  sx={{ fontWeight: "bold" }}
                >
                  {" "}
                  {user.enrolled ? "Enrolled" : "Not Enrolled"}
                </Typography>
                <Typography>
                  <strong>Fingerprint ID:</strong> {user.fingerprintId ?? "N/A"}
                  {/* ?? nullish coalescing operator if fingerprintId is null N/A is shown*/}
                </Typography>
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1 }}>
                  <strong>Authorized Locks</strong>
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {user.locks.map((lock) => (
                      <Chip
                        key={lock}
                        label={lock}
                        color="success"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                    }}
                  >
                    <Button variant="outlined" color={colors.grey[400]}>
                      Update Fingerprint
                    </Button>

                    <Button variant="outlined" color={colors.grey[400]}>
                      Delete Fingerprint
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Fingerprints;
