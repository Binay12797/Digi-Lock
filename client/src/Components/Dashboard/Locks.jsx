import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useContext, useState, useEffect } from "react";
import { tokens, ColorModeContext } from "../../theme";
import { mockDataLocks } from "../Data/mockdata";
import axios from "axios";

const Locks = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const [locks, setLock] = useState([]);
  const [loading, setLoading] = useState(true);

  //to export data from backend
  useEffect(() => {
    const fetchLocks = async () => {
      try {
        //axios converts response to json
        const response = await axios.get("http://localhost:3000/api/locks");
        setLock(response.data);
      } catch (error) {
        console.error("Error fetching locks data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocks();
  }, []);

  const columns = [
    { field: "_id", headerName: "ID" }, //field represent value grabbed
    { field: "deviceId", headerName: "DeviceId", flex: 1 }, //flex: 1 will extend the cells width
    { field: "location", headerName: "Location", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "isOnline",
      headerName: "Device Status",
      flex: 1,
      renderCell: ({ row: { isOnline } }) => {
        return (
          <Box
            sx={{
              width: "60%",
              m: "15px auto",
              display: "flex",
              justifyContent: "center",
              backgroundColor:
                isOnline === true
                  ? colors.greenAccent[700]
                  : colors.redAccent[700],
              borderRadius: "5px",
            }}
          >
            {isOnline === true && (
              <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
                Online
              </Typography>
            )}
            {isOnline === false && (
              <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
                Offline
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "time",
      headerName: "Last Access Time",
      valueGetter: (value, row) =>
        row.lastAction?.time
          ? new Date(row.lastAction.time).toLocaleString() //creates an new object called Date made by converting string to Date Object and .toLocaleString() formatt it into human reading
          : "N/A",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Last attempt",
      valueGetter: (value, row) => row.lastAction?.action,
      flex: 1,
    },
  ];

  return (
    <Box sx={{ m: "20px" }}>
      <Typography variant="h5">Locks Status</Typography>
      <Box
        sx={{
          m: "10px 0 0 0",
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
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
          rows={locks}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
        />
        {/*getRowId is a function that tells the DataGrid:"When you need the unique ID for a row, use the _id property." */}
        {/* columns to arrange */}
      </Box>
    </Box>
  );
};

export default Locks;
