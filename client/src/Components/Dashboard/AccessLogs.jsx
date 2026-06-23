import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useContext, useEffect, useState } from "react";
import { tokens, ColorModeContext } from "../../theme";
import api from "../../Api/api";

const AccessLogs = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessLogs = async () => {
      try {
        // Appending timestamp to bypass stale browser cache states
        const response = await api.get(`/api/Logs?t=${Date.now()}`);
        setAccessLogs(response.data.data || []);
      } catch (error) {
        console.error("Error fetching Access Logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccessLogs();
  }, []);

  const columns = [
    { field: "deviceId", headerName: "DeviceId", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    {
      field: "createdAt",
      headerName: "Last Access Time",
      // 🔄 FIX: Read backend's 'createdAt' field and safely handle empty states to avoid NaN errors
      valueGetter: (value, row) => {
        const targetRow = row || value?.row; 
        return targetRow?.createdAt ? new Date(targetRow.createdAt).getTime() : 0;
      },
      renderCell: (params) =>
        params.row.createdAt
          ? new Date(params.row.createdAt).toLocaleString()
          : "N/A",
      flex: 1,
    },
    {
      field: "userId",
      headerName: "User Name",
      // 🔄 FIX: Extracts the populated user name safely across varied DataGrid versions
      valueGetter: (value, row) => {
        const targetRow = row || value?.row;
        return targetRow?.userId?.name || "System Operator";
      },
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ row: { status } }) => {
        // Standardize status value parsing to uppercase to cleanly match conditions
        const currentStatus = status?.toUpperCase() || "FAILED";
        return (
          <Box
            sx={{
              width: "70%",
              m: "15px auto",
              display: "flex",
              justifyContent: "center",
              backgroundColor:
                currentStatus === "SUCCESS"
                  ? colors.greenAccent[700]
                  : colors.redAccent[700],
              borderRadius: "5px",
            }}
          >
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {currentStatus}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "reason",
      headerName: "Reason",
      flex: 1,
    },
    {
      field: "method",
      headerName: "Method",
      flex: 1,
    },
  ];

  return (
    <Box sx={{ m: "20px" }}>
      <Typography variant="h5">Locks Status</Typography>
      
      {/* 🔄 FIX: Added explicit height (550px) to prevent DataGrid from collapsing into invisibility */}
      <Box
        sx={{
          height: 550, 
          width: "100%",
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
          rows={accessLogs}
          columns={columns}
          getRowId={(row) => row._id}
          slotProps={{ toolbar: { showQuickFilter: true } }} // Modern standard replacement for showToolbar
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default AccessLogs;