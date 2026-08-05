import { Box, Typography, Button, TextField } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";

import { Formik } from "formik";
import { useEffect, useState, useRef } from "react";

import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import api from "../../Api/api";
import { socket } from "../../Api/socket";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  relation: "",
  contact: "",
  address: "",
  fingerprintId: "",
};

const phoneRegExp = /^\+?\d{1,15}$/;

const userFormSchema = yup.object().shape({
  firstName: yup.string().required("Required"),
  lastName: yup.string().required("Required"),
  email: yup.string().email("Invalid email").required("Required"),
  relation: yup.string().required("Required"),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("Required"),
  address: yup.string().required("Required"),
  fingerprintId: yup.string().required("Please scan fingerprint"),
});

const AddUser = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [openDialog, setOpenDialog] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const setFieldValueRef = useRef(null);

  const [enrollmentStatus, setEnrollmentStatus] = useState(
    "Waiting for fingerprint...",
  );
  const [instruction, setInstruction] = useState(
    "Place your finger on scanner",
  );

  const sessionIdRef = useRef(null);

  useEffect(() => {
    // Handle enrollment progress updates
    const handleProgress = (data) => {
      setEnrollmentStatus(`State: ${data.state}`);

      switch (data.state) {
        case "started":
          setInstruction("Initializing enrollment process...");
          break;

        case "waiting_scan1":
          setInstruction("Place your finger on the sensor for Scan 1.");
          break;

        case "scan1_done":
          setInstruction("Scan 1 captured successfully!");
          break;

        case "waiting_scan2":
          setInstruction(
            "Place the same finger back on the sensor for Scan 2.",
          );
          break;

        case "scan2_done":
          setInstruction("Scan 2 captured successfully!");
          break;

        case "processing":
          setInstruction("Analyzing and compiling templates. Please hold...");
          break;

        default:
          setInstruction("Processing...");
      }
    };

    // Handle enrollment timeout
    const handleTimeout = (data) => {
      console.warn(data.message);
      alert("Enrollment session timed out. Please try again.");
      handleCloseDialog();
    };

    const handleFingerprintReady = (data) => {
      if (!data.success) return;

      console.log("Fingerprint successfully captured:", data.fingerprint);

      if (setFieldValueRef.current) {
        setFieldValueRef.current("fingerprintId", data.fingerprint);
      }

      setOpenDialog(false);
      setIsEnrolling(false);
      sessionIdRef.current = null;
    };

    // Register listeners
    socket.on("ENROLL_PROGRESS", handleProgress);
    socket.on("ENROLLMENT_TIMEOUT", handleTimeout);
    socket.on("FINGERPRINT_READY", handleFingerprintReady);

    // Cleanup listeners
    return () => {
      socket.off("ENROLL_PROGRESS", handleProgress);
      socket.off("ENROLLMENT_TIMEOUT", handleTimeout);
      socket.off("FINGERPRINT_READY", handleFingerprintReady);

      //  cleanup
      setFieldValueRef.current = null;
    };
  }, []);

  const handleEnrollFingerprint = async (setFieldValue) => {
    try {
      setFieldValueRef.current = setFieldValue;
      sessionIdRef.current = crypto.randomUUID();

      // 1. Open the UI loading dialog immediately
      setIsEnrolling(true);
      setOpenDialog(true);
      setEnrollmentStatus("Establishing connection...");
      setInstruction("Connecting to the gateway...");

      // 3. Register enrollment on the backend
      const response = await api.post("/api/startEnroll", {
        sessionId: sessionIdRef.current,
      });

      if (response.data.success) {
        setEnrollmentStatus("Waiting for device...");
        setInstruction("Please place your finger on the scanner.");
      }
    } catch (error) {
      console.error("Failed to start Enrollment:", error);
      setEnrollmentStatus("Connection Failed");
      setInstruction(
        error.response?.data?.message || "Could not start enrollment.",
      );
    }
  };

  const handleCloseDialog = async () => {
    // Notify backend to free up the session
    if (sessionIdRef.current) {
      try {
        await api.post("/api/cancelEnroll", {
          sessionId: sessionIdRef.current,
        });
      } catch (err) {
        console.warn("Failed to clear session on backend:", err.message);
      }
    }

    sessionIdRef.current = null;
    setOpenDialog(false);
    setIsEnrolling(false);
    setEnrollmentStatus("Waiting for fingerprint...");
    setInstruction("Place your finger on scanner");
  };
  const handleSubmit = async (values, { resetForm }) => {
    console.log("Submitting Signup Data to Database:", values);
    try {
      const response = await api.post("/api/enroll", values);

      if (response.data.success) {
        alert("User successfully registered in the system!");
        resetForm(); // Successfully clears Formik fields
      }
    } catch (error) {
      console.error("Failed to submit form:", error);
      alert(
        error.response?.data?.message || "Something went wrong during signup.",
      );
    }
  };

  return (
    <Box sx={{ m: "20px" }}>
      <Box>
        <Typography
          variant="h5"
          sx={{ color: colors.greenAccent[400], mb: "10px" }}
        >
          Create a New User Profile
        </Typography>
      </Box>

      <Formik
        onSubmit={handleSubmit}
        initialValues={initialValues}
        validationSchema={userFormSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit: formikSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={formikSubmit}>
            <Box
              sx={{
                mt: "15px",
                display: "grid",
                gap: "30px",
                gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="First Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Last Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Relation/Position"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.relation}
                name="relation"
                error={!!touched.relation && !!errors.relation}
                helperText={touched.relation && errors.relation}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Contact"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contact}
                name="contact"
                error={!!touched.contact && !!errors.contact}
                helperText={touched.contact && errors.contact}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Address"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address}
                name="address"
                error={!!touched.address && !!errors.address}
                helperText={touched.address && errors.address}
                sx={{ gridColumn: "span 4" }}
              />
              <Box
                sx={{
                  gridColumn: "span 4",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <TextField
                  fullWidth
                  variant="filled"
                  label="Fingerprint Id"
                  value={values.fingerprintId}
                  disabled
                  error={!!touched.fingerprintId && !!errors.fingerprintId}
                  helperText={touched.fingerprintId && errors.fingerprintId}
                  sx={{ gridColumn: "span 3" }}
                />
                <Button
                  variant="outlined"
                  color={isEnrolling ? "error" : "secondary"}
                  onClick={() => handleEnrollFingerprint(setFieldValue)}
                  // onClick={() => {
                  //   setFieldValue("fingerprintId", "fpchong-02");
                  // }}
                >
                  Scan Finger
                </Button>
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "right", mt: "20px" }}>
              <Button type="submit" color="secondary" variant="contained">
                Create New User
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      <Dialog
        open={openDialog}
        onClose={() => {}} // Block clicking background to close
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor:
                theme.palette.mode === "dark" ? colors.primary[600] : null,
              borderRadius: 2,
              minWidth: 450,
              p: 1,
            },
          },
        }}
      >
        <DialogTitle variant="h5">Enroll Fingerprint</DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 2,
          }}
        >
          <CircularProgress color="secondary" />
          <Typography variant="h6">{enrollmentStatus}</Typography>
          <Typography variant="h6" color="secondary">
            {instruction}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button color="error" onClick={handleCloseDialog}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddUser;
