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
  contact: "", //its easier to import constact as string later we can ise phone regex to validate it
  address: "",
  fingerprintId: "",
};

const phoneRegExp = /^\+?\d{1,15}$/; //emmet abbreviation, phone regex

const userFormSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  relation: yup.string().required("required"),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  address: yup.string().required("required"),
  fingerprintId: yup.string().required("Please Scan fingerprint"),
});

const AddUser = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // isNonMobile  is boolean that says current device is mobile or desktop, Returns true if the viewport width is at least 600px, 600px is kind of standar helps to distinguish betn mobile and laptop
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [openDialog, setOpenDialog] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const setFieldValueRef = useRef(null); //works like a pointer

  const [enrollmentStatus, setEnrollmentStatus] = useState(
    "Waiting for fingerprint....",
  );
  const [instruction, setInstruction] = useState(
    "Place your finger on scanner",
  );

  const sessionIdRef = useRef(null);

  useEffect(() => {
    //you tell socket.io "Whenever you receive an event named enrollmentStatus, run this function."
    //.on "Start listening for this event."
    //.emit() means: "Send an event."

    socket.on("enrollmentStatus", (data) => {
      setEnrollmentStatus(data.message);
    });

    socket.on("enrollmentSuccess", (data) => {
      setFieldValueRef.current?.("fingerprintId", data.fingerprintId); //?. means "only call it if it exists"

      sessionIdRef.current = null;

      //close the dialogue
      setOpenDialog(false);
      setIsEnrolling(false);

      //disconnect as work is done
      socket.disconnect();
    });

    socket.on("enrollmentError", (data) => {
      console.log(data);
    });

    //.off() means: "Stop listening for this event." if you dont turn off listner multiple same listener will be formed when page is refreshed
    return () => {
      socket.off("enrollmentStatus");
      socket.off("enrollmentSuccess");
      socket.off("enrollmentError");
    };
  }, []);

  // must be inside as isEnrolling is definde inside
  const handleEnrollFingerprint = async (setFieldValue) => {
    setFieldValueRef.current = setFieldValue; //stores the reference to the setFieldValue function inside .current.

    const response = await api.post("/startEnroll");
    sessionIdRef.current = response.data.sessionId;

    socket.connect();

    setIsEnrolling(true);
    setOpenDialog(true);

    socket.emit("StartEnrollment", {
      sessionId: sessionIdRef.current,
    });
  };

  const handleCloseDialog = () => {
    socket.disconnect();

    setOpenDialog(false);
    setIsEnrolling(false);
  };

  //triggers when we submit or form
  //handleSubmit is formiks built in tool
  const handleSubmit = (values) => {
    console.log(values);
  };

  return (
    <Box sx={{ m: "20px" }}>
      <Box>
        <Typography variant="h5" sx={{ color: colors.greenAccent[400] }}>
          Create a New User Profile
        </Typography>
      </Box>

      <Formik
        onSubmit={handleSubmit}
        initialValues={initialValues}
        validationSchema={userFormSchema}
      >
        {/* this is a function specifically known as an anonymous arrow function. they come from formik*/}
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                mt: "15px",
                display: "grid",
                gap: "30px",
                gridTemplateColumns: "repeat(4,minmax(0,1fr))", //four sections minsize 0 to 1 fractional units
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" }, //for mobile device span is 4
              }}
            >
              <TextField
                fullWidth
                variant="filled" // fills the box with shade so its easier to see the box
                type="text"
                label="First Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName" //used by touched.firstName and errors.firstName
                error={!!touched.firstName && !!errors.firstName} //passes boolean
                helperText={touched.firstName && errors.firstName} //passes the text
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled" // fills the box with shade so its easier to see the box
                type="text"
                label="Last Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName" //used by touched.lastName and errors.lastName
                error={!!touched.lastName && !!errors.lastName} //passes boolean
                helperText={touched.lastName && errors.lastName} //passes the text
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled" // fills the box with shade so its easier to see the box
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email" //used by touched.email and errors.email
                error={!!touched.email && !!errors.email} //passes boolean
                helperText={touched.email && errors.email} //passes the text
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled" // fills the box with shade so its easier to see the box
                type="text"
                label="Relation/Position"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.relation}
                name="relation"
                error={!!touched.relation && !!errors.relation} //passes boolean
                helperText={touched.relation && errors.relation} //passes the text
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled" // fills the box with shade so its easier to see the box
                type="text"
                label="Contact"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contact}
                name="contact" //used by touched.contact and errors.contact
                error={!!touched.contact && !!errors.contact} //passes boolean
                helperText={touched.contact && errors.contact} //passes the text
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled" // fills the box with shade so its easier to see the box
                type="text"
                label="Address"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address}
                name="address" //used by touched.address and errors.address
                error={!!touched.address && !!errors.address} //passes boolean
                helperText={touched.address && errors.address} //passes the text
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
                  disabled // User shouldn't edit this manually
                  error={!!touched.fingerprintId && !!errors.fingerprintId}
                  helperText={touched.fingerprintId && errors.fingerprintId}
                  sx={{ gridColumn: "span 3" }}
                />
                <Button
                  variant="outlined"
                  color={isEnrolling ? "error" : "secondary"}
                  onClick={() => handleEnrollFingerprint(setFieldValue)}
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
        onClose={() => {}}
        maxWidth="xs"
        fullWidth //automatically sets width according to the content
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
        {/* onClose={() => {} prevents closing by clicking outside currently */}
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
          {/* colors.greenAccent[500] */}

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
