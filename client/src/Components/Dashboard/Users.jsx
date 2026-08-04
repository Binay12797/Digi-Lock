import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useContext, useState, useEffect } from "react";
import { tokens, ColorModeContext } from "../../theme";
import { mockDataUsers } from "../Data/mockdata";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
// import axios from "axios";
import api from "../../Api/api";

import { useOutletContext } from "react-router-dom";

const Users = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [users, setUsers] = useState([]); //array is passed
  const [loading, setLoading] = useState(true);

  const { searchQuery } = useOutletContext();

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response = await api.get(`/user/info?t=${Date.now()}`);
        //setUsers(response.data.data || []);
        if (response.data.success) {
          // Map through the array and assign the value of _id to a new id key
          const formattedUsers = response.data.data.map((user) => ({
            ...user,
            id: user._id, // Maps MongoDB's _id to the standard id field MUI expects
          }));

          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error("Error while fetching Users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsersData();
  }, []);
  //[]: You are telling React: "Only run this code once, immediately after the component is first added to the screen (mounted).

  const columns = [
    { field: "id", headerName: "ID" }, //field represent value grabbed
    { field: "name", headerName: "Name", flex: 1, cellClassName: "name-cell" }, //flex: 1 will extend the cells width
    { field: "email", headerName: "Email", flex: 1 },
    { field: "relation", headerName: "Relation", flex: 1 },
    // {
    //   field: "access",
    //   headerName: "Access Level",
    //   flex: 1,
    //   renderCell: ({ row: { access } }) => {
    //     return (
    //       <Box
    //         sx={{
    //           width: "60%",
    //           m: " 10px auto",
    //           p: "5px",
    //           display: "flex",
    //           justifyContent: "center",
    //           alignItems: "center",
    //           backgroundColor:
    //             access === "admin"
    //               ? colors.greenAccent[600]
    //               : colors.greenAccent[700],

    //           borderRadius: "4px",
    //         }}
    //       >
    //         {/* we dont have if else so we use, as code after && is executed only if condition before is mett ie TRUE */}
    //         {access === "admin" && <AdminPanelSettingsOutlinedIcon />}
    //         {access === "manager" && <ManageAccountsIcon />}
    //         {access === "user" && <LockOpenOutlinedIcon />}
    //         <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
    //           {access}
    //         </Typography>
    //       </Box>
    //     ); //m: top , bottom
    //   },
    // },
  ];

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();

    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.access?.toLowerCase().includes(query)
    );
  });

  return (
    <Box sx={{ m: "20px" }}>
      <Typography variant="h5" sx={{ color: colors.greenAccent[400] }}>
        Managing Users
      </Typography>
      <Box
        sx={{
          m: "10px 0 0 0",
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: `${colors.blueAccent[700]} !important`,
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: colors.blueAccent[700],
            borderTop: "none",
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={filteredUsers}
          columns={columns}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default Users;
