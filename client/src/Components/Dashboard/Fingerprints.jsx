import {
  Box,
  Typography,
  useTheme,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { tokens } from "../../theme";
import api from "../../Api/api";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const Fingerprints = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [fingerprints, setFingerprints] = useState([]);

  const { searchQuery } = useOutletContext();

  useEffect(() => {
    fetchFingerprints();
  }, []);

  const fetchFingerprints = async () => {
    try {
      const res = await api.get("/fingerprint/get");

      if (res.data.success) {
        setFingerprints(res.data.data);
      } else {
        setFingerprints([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFingerprint = async (id) => {
    if (!window.confirm("Delete this fingerprint?")) return;

    try {
      await api.delete(`/fingerprint/delete/${id}`);
      fetchFingerprints();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFingerprints = fingerprints.filter((user) => {
    const query = searchQuery.toLowerCase();

    return (
      user._id?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.relation?.toLowerCase().includes(query) ||
      user.fingerprint?.toLowerCase().includes(query) ||
      (user.isActive ? "active" : "inactive").includes(query)
    );
  });

  return (
    <Box sx={{ m: "20px" }}>
      <Typography variant="h5" sx={{ color: colors.greenAccent[400] }}>
        Registered Fingerprints
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: 3,
        }}
      >
        {filteredFingerprints.map((user) => (
          <Card
            key={user._id}
            sx={{
              bgcolor: colors.primary[400],
            }}
          >
            <CardContent>
              <Typography variant="h5" fontWeight="100">
                {user.name}
              </Typography>

              <Typography>
                <strong>Relation:</strong> {user.relation}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                <strong>Fingerprint ID:</strong> {user.fingerprint || "N/A"}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                <strong>Status:</strong>{" "}
                <Typography
                  component="span"
                  sx={{
                    color: user.isActive ? "#4caf50" : "#f44336",
                    fontWeight: "bold",
                  }}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </Typography>
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => deleteFingerprint(user._id)}
                >
                  Delete Fingerprint
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}

        {filteredFingerprints.length === 0 && (
          <Typography align="center">No fingerprints found.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Fingerprints;
