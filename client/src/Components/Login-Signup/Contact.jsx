import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";

const Contact = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box sx={{ m: "20px", mt: 11 }}>
      <Typography
        variant="h2"
        sx={{
          color: colors.greenAccent[400],
          fontWeight: "bold",
          mb: 2,
        }}
      >
        Contact Us
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
          gap: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 3,
            backgroundColor: colors.primary[400],
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            Contact Information
          </Typography>

          {/* here to arrange box vertically */}
          <Stack spacing={3}>
            <Box>
              <Typography
                sx={{ color: colors.greenAccent[400], fontWeight: "bold" }}
              >
                Email:
              </Typography>
              <Typography>
                rajab2007bal@gmail.com <br />
                binay.bista.009@gamil.com <br />
                bigyanlimbu179@gmail.com
                <br />
                kranabhat338@gmail.com
                <br />
                sambegshrestha2006@gmail.com <br />
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{ color: colors.greenAccent[400], fontWeight: "bold" }}
              >
                Phone
              </Typography>
              <Typography>9749555555</Typography>
            </Box>

            <Box>
              <Typography
                sx={{ color: colors.greenAccent[400], fontWeight: "bold" }}
              >
                Address
              </Typography>
              <Typography>
                Kathmandu University
                <br />
                Dhulikhel, Kavre
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default Contact;
