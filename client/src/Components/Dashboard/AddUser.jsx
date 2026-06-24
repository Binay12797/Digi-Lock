import { Box, Typography, Button, TextField } from "@mui/material";
import { Formik } from "formik";

import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  relation: "",
  contact: "", //its easier to import constact as string later we can ise phone regex to validate it
  address: "",
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
});

const AddUser = () => {
  // isNonMobile  is boolean that says current device is mobile or desktop, Returns true if the viewport width is at least 600px, 600px is kind of standar helps to distinguish betn mobile and laptop
  const isNonMobile = useMediaQuery("(min-width:600px)");

  //triggers when we submit or form
  //handleSubmit is formiks built in tool
  const handleSubmit = (values) => {
    console.log(values);
  };

  return (
    <Box sx={{ m: "20px" }}>
      <Box>
        <Typography variant="h5">Create a New User Profile</Typography>
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
                name="relation" //used by touched.email and errors.email
                error={!!touched.email && !!errors.email} //passes boolean
                helperText={touched.email && errors.email} //passes the text
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
            </Box>
            <Box sx={{ display: "flex", justifyContent: "right", mt: "20px" }}>
              <Button type="submit" color="secondary" variant="contained">
                Create New User
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AddUser;
