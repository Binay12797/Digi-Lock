import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useContext, useState, useEffect } from "react";
import { tokens, ColorModeContext } from "../../theme";
// import axios from "axios";
import api from "../../Api/api";

const Locks = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(true);

  //to export data from backend
  useEffect(() => {
    const fetchLocks = async () => {
      try {
        // 1. Replace with a real test deviceId string
        const testDeviceId = "test-lock-101";

        // 2. Use backticks and string interpolation to inject the ID
        const response = await api.get(
          `/lock/status/${testDeviceId}?t=${Date.now()}`,
        );

        // 3. Put the single object into an array so DataGrid doesn't crash
        if (response.data && response.data.success) {
          // Your backend doesn't send an '_id' currently, so we inject one for DataGrid
          const lockRow = {
            _id: response.data.deviceId, // Using deviceId as the unique row identifier
            deviceId: response.data.deviceId,
            status: response.data.status,
            time: response.data.lastUpdated,
            isOnline: true, // hardcoded placeholder since backend doesn't supply this yet
          };

          setLocks([lockRow]);
        }
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
      flex: 1,
      valueGetter: (value, row) => {
        const targetRow = row || value?.row; // this is done because different DataGrid versions pass different parameters.
        return targetRow?.time ? new Date(targetRow.time).getTime() : 0;
      },
      renderCell: (params) =>
        params.row.time ? new Date(params.row.time).toLocaleString() : "N/A",
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
      <Typography variant="h5" sx={{ color: colors.greenAccent[400] }}>
        Locks Status
      </Typography>
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
