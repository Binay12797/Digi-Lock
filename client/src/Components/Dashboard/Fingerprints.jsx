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
import { fingerprintData } from "../Data/mockdata";
import { useState } from "react";
import { tokens } from "../../theme";

import { useOutletContext } from "react-router-dom";

const Fingerprints = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [fingerprints, setFingerprints] = useState(fingerprintData);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newLock, setNewLock] = useState("");
  const [open, setOpen] = useState(false);

  const { searchQuery } = useOutletContext();

  const filteredfingerprints = fingerprints.filter((fingerprint) => {
    const query = searchQuery.toLowerCase();

    return (
      fingerprint.id.toString()?.toLowerCase().includes(query) ||
      fingerprint.userName?.toLowerCase().includes(query) ||
      fingerprint.role?.toLowerCase().includes(query) ||
      // "If the value on the left is null or undefined, use the value on the right instead."
      (fingerprint.fingerprintId ?? "").toLowerCase().includes(query) ||
      (fingerprint.enrolled ? "enrolled" : "not enrolled").includes(query) ||
      fingerprint.locks.some((lock) => lock.toLowerCase().includes(query))
    );
  });

  const openLockDialog = (user) => {
    setSelectedUser(user);
    setNewLock("");
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const addLock = () => {
    if (!newLock.trim()) return;

    setFingerprints((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              locks: [...new Set([...user.locks, newLock.trim()])], //add new lock
            }
          : user,
      ),
    );

    setNewLock(""); // making this empty
  };

  const removeLock = (lockToRemove) => {
    setFingerprints((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              locks: user.locks.filter((lock) => lock !== lockToRemove), //remvoes the lock
            }
          : user,
      ),
    );

    setSelectedUser((prev) => ({
      ...prev,
      locks: prev.locks.filter((lock) => lock !== lockToRemove),
    }));
  };

  const deleteFingerprint = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this fingerprint?",
    );

    if (!confirmDelete) return;

    setFingerprints((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              enrolled: false,
              fingerprintId: null,
            }
          : user,
      ),
    );
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
          <Card key={user.id} sx={{ bgcolor: colors.primary[400], pt: "6px" }}>
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
                    <Button
                      variant="outlined"
                      onClick={() => openLockDialog(user)}
                    >
                      Manage Locks
                    </Button>

                    <Button
                      variant="outlined"
                      color={colors.grey[400]}
                      onClick={() => deleteFingerprint(user.id)}
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
