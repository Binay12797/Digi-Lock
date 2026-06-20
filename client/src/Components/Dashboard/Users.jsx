import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useContext } from "react";
import { tokens, ColorModeContext } from "../../theme";
import { mockDataUsers } from "../Data/mockdata";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

const Users = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    { field: "id", headerName: "ID" }, //field represent value grabbed
    { field: "name", headerName: "Name", flex: 1, cellClassName: "name-cell" }, //flex: 1 will extend the cells width
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "access",
      headerName: "Access Level",
      flex: 1,
      renderCell: ({ row: { access } }) => {
        return (
          <Box
            sx={{
              width: "60%",
              m: " 10px auto",
              p: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor:
                access === "admin"
                  ? colors.greenAccent[600]
                  : colors.greenAccent[700],

              borderRadius: "4px",
            }}
          >
            {/* we dont have if else so we use, as code after && is executed only if condition before is mett ie TRUE */}
            {access === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {access === "manager" && <ManageAccountsIcon />}
            {access === "user" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {access}
            </Typography>
          </Box>
        ); //m: top , bottom
      },
    },
  ];

  return (
    <Box sx={{ m: "20px" }}>
      <Typography variant="h5">Managing Users</Typography>
      <Box
        sx={{
          height: "80vh",
          m: "10px 0 0 0",
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeadersInner": {
            backgroundColor: `$colors.blueAccent[700] !important`,
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
          autoHeight
          checkboxSelection
          rows={mockDataUsers}
          columns={columns}
        />
      </Box>
    </Box>
  );
};

export default Users;
