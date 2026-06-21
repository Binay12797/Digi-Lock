import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useContext, useEffect, useState } from "react";
import { tokens, ColorModeContext } from "../../theme";
import { mockAccessLogs } from "../Data/mockdata";
import { GridToolbar } from "@mui/x-data-grid/internals";
import axios from "axios";

const AccessLogs = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessLogs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/AccessLogs",
        );
        setAccessLogs(response.data);
      } catch (error) {
        console.error("Error fetching Access Logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccessLogs();
  }, []);

  const columns = [
    { field: "deviceId", headerName: "DeviceId", flex: 1 }, //flex: 1 will extend the cells width
    { field: "location", headerName: "Location", flex: 1 },
    {
      field: "timestamp",
      headerName: "Last Access Time",
      valueGetter: (value, row) => new Date(row.timestamp).getTime(), //converts to date and time then date is converted into a number

      renderCell: (params) =>
        params.row.timestamp
          ? new Date(params.row.timestamp).toLocaleString() //params passes everything about current row all cells
          : "N/A",
      flex: 1,
    },
    {
      field: "name",
      headerName: "User Name",
      valueGetter: (value, row) => row.user?.name,
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
        return (
          <Box
            sx={{
              width: "70%",
              m: "15px auto",
              display: "flex",
              justifyContent: "center",
              backgroundColor:
                status === "SUCCESS"
                  ? colors.greenAccent[700]
                  : colors.redAccent[700],
              borderRadius: "5px",
            }}
          >
            {status === "SUCCESS" && (
              <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
                SUCCESS
              </Typography>
            )}
            {status === "FAILED" && (
              <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
                FAILED
              </Typography>
            )}
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
          rows={accessLogs}
          columns={columns}
          getRowId={(row) => row._id}
          showToolbar
          loading={loading}
        />
        {/*getRowId is a function that tells the DataGrid:"When you need the unique ID for a row, use the _id property." */}
        {/* columns to arrange */}
      </Box>
    </Box>
  );
};

export default AccessLogs;
