import {
  Box,
  Typography,
  useTheme,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import { tokens } from "../../theme";
import api from "../../Api/api";
import { useEffect, useState } from "react";

import { useOutletContext } from "react-router-dom";

const Fingerprints = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [fingerprints, setFingerprints] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newLock, setNewLock] = useState("");
  const [open, setOpen] = useState(false);

  const { searchQuery } = useOutletContext();
  const query = (searchQuery || "").toLowerCase();
 const filteredfingerprints = (Array.isArray(fingerprints) ? fingerprints : []).filter((fingerprint) => {
  return (
    // Safe navigation on fingerprint.id (since backend might not send `id`)
    fingerprint._id?.toString().toLowerCase().includes(query) ||
    fingerprint.id?.toString().toLowerCase().includes(query) ||
    fingerprint.userName?.toLowerCase().includes(query) ||
    fingerprint.role?.toLowerCase().includes(query) ||
    fingerprint.relation?.toLowerCase().includes(query) ||
    (fingerprint.fingerprintId ?? "").toString().toLowerCase().includes(query) ||
    (fingerprint.enrolled ? "enrolled" : "not enrolled").includes(query) ||
    (fingerprint.locks ?? []).some((lock) =>
      lock.toLowerCase().includes(query)
    )
  );
  });

  useEffect(() => {
    fetchFingerprints();
  }, []);

  const fetchFingerprints = async () => {
    try {
      const res = await api.get("/fingerprint/get");
      setFingerprints(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openLockDialog = (user) => {
    setSelectedUser(user);
    setNewLock("");
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  //async is essential
  const addLock = async () => {
    if (!newLock.trim()) return;

    try {
      const updatedLocks = [
        ...new Set([...selectedUser.locks, newLock.trim()]),
      ];

      await api.patch(`/fingerprints/${selectedUser._id}/locks`, {
        locks: updatedLocks,
      });

      fetchFingerprints();

      setSelectedUser({
        ...selectedUser,
        locks: updatedLocks,
      });

      setNewLock("");
    } catch (err) {
      console.error(err);
    }
  };

  const removeLock = async (lockToRemove) => {
    try {
      const updatedLocks = selectedUser.locks.filter(
        (lock) => lock !== lockToRemove,
      );

      await api.patch(`/fingerprints/${selectedUser._id}/locks`, {
        locks: updatedLocks,
      });

      fetchFingerprints();

      setSelectedUser({
        ...selectedUser,
        locks: updatedLocks,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFingerprint = async (id) => {
    if (!window.confirm("Delete this fingerprint?")) return;

    try {
      await api.delete(`/fingerprints/${id}`);

      fetchFingerprints();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ m: "20px" }}>
      <Typography variant="h5" sx={{ color: colors.greenAccent[400] }}>
        Manage fingerprints and Lock Access
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
        {/* curly bracket for js code */}
        {filteredfingerprints.map((user) => (
          //lets name varable user as each card will be for one user which will consist of one fingerprint
          //user._id for mongoDB
          <Card key={user._id} sx={{ bgcolor: colors.primary[400], pt: "6px" }}>
            <CardContent>
              <Typography variant="h5">{user.userName}</Typography>
              <Typography>{user.role}</Typography>
              <Typography component="div" sx={{ mt: 2 }}>
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
                    {(user.locks ?? []).map((lock) => (
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
                    <Button
                      variant="outlined"
                      onClick={() => openLockDialog(user)}
                    >
                      Manage Locks
                    </Button>

                    <Button
                      variant="outlined"
                      sx={{
                        color: colors.grey[400],
                        borderColor: colors.grey[400],
                      }}
                      onClick={() => deleteFingerprint(user._id)}
                    >
                      Delete Fingerprint
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}

        <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Manage Locks
            {selectedUser && ` - ${selectedUser.userName}`}
          </DialogTitle>

          <DialogContent>
            <Box
              sx={{
                display: "flex",
                gap: "3px",
                mt: 1,
                mb: 1,
              }}
            >
              <TextField
                label="Lock Name"
                fullWidth
                value={newLock}
                onChange={(e) => setNewLock(e.target.value)}
              />

              <Button
                variant="outlined"
                onClick={addLock}
                sx={{ color: colors.greenAccent[400] }}
              >
                Add
              </Button>
            </Box>

            <Typography sx={{ mb: 1 }}>Authorized Locks:</Typography>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {selectedUser?.locks.map((lock) => (
                <Chip
                  key={lock}
                  label={lock}
                  color="success"
                  variant="outlined"
                  onDelete={() => removeLock(lock)}
                />
              ))}
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeDialog} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Fingerprints;
