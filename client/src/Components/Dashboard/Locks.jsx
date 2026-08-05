import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useContext, useState, useEffect } from "react";
import { tokens, ColorModeContext } from "../../theme";
import api from "../../Api/api";
import { socket } from "../../Api/socket";
import { useOutletContext } from "react-router-dom";

const Locks = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { searchQuery } = useOutletContext();

  // Initial fetch
  useEffect(() => {
    const fetchLocks = async () => {
      try {
        const testDeviceId = "test-lock-101";

        const response = await api.get(`/lock/status/${testDeviceId}`);

        if (response.data.success) {
          const lockRow = {
            _id: response.data.deviceId,
            deviceId: response.data.deviceId,
            location: response.data.location || "N/A",
            status: response.data.status,
            time: response.data.lastUpdated,
            isOnline:
              response.data.isOnline !== undefined
                ? response.data.isOnline
                : true,
          };

          setLocks([lockRow]);
        }
      } catch (error) {
        console.error("Error fetching lock:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocks();
  }, []);

  // Real-time updates
  useEffect(() => {
    socket.on("lockStatusUpdate", (updatedLock) => {
      console.log("Lock Update:", updatedLock);

      setLocks((prev) => {
        const index = prev.findIndex(
          (lock) => lock.deviceId === updatedLock.deviceId,
        );

        const newLock = {
          _id: updatedLock.deviceId,
          deviceId: updatedLock.deviceId,
          location: updatedLock.location || "N/A",
          status: updatedLock.status,
          time: updatedLock.lastUpdated,
          isOnline:
            updatedLock.isOnline !== undefined ? updatedLock.isOnline : true,
        };

        if (index !== -1) {
          const copy = [...prev];
          copy[index] = newLock;
          return copy;
        }

        return [...prev, newLock];
      });
    });

    return () => {
      socket.off("lockStatusUpdate");
    };
  }, []);

  const columns = [
    { field: "_id", headerName: "ID" },

    {
      field: "deviceId",
      headerName: "Device ID",
      flex: 1,
    },

    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },

    {
      field: "isOnline",
      headerName: "Device Status",
      flex: 1,
      renderCell: ({ row }) => (
        <Box
          sx={{
            width: "60%",
            m: "15px auto",
            display: "flex",
            justifyContent: "center",
            backgroundColor: row.isOnline
              ? colors.greenAccent[700]
              : colors.redAccent[700],
            borderRadius: "5px",
          }}
        >
          <Typography color={colors.grey[100]}>
            {row.isOnline ? "Online" : "Offline"}
          </Typography>
        </Box>
      ),
    },

    {
      field: "time",
      headerName: "Last Access Time",
      flex: 1,
      valueGetter: (value, row) => {
        const targetRow = row || value?.row;
        return targetRow?.time ? new Date(targetRow.time).getTime() : 0;
      },
      renderCell: (params) =>
        params.row.time ? new Date(params.row.time).toLocaleString() : "N/A",
    },
  ];

  const filteredLocks = locks.filter((lock) => {
    const query = searchQuery.toLowerCase();

    return (
      lock._id?.toLowerCase().includes(query) ||
      lock.deviceId?.toLowerCase().includes(query) ||
      lock.location?.toLowerCase().includes(query) ||
      lock.status?.toLowerCase().includes(query) ||
      String(lock.isOnline).toLowerCase().includes(query) ||
      (lock.time
        ? new Date(lock.time).toLocaleString().toLowerCase()
        : ""
      ).includes(query)
    );
  });

  return (
    <Box sx={{ m: "20px" }}>
      <Typography variant="h5" sx={{ color: colors.greenAccent[400] }}>
        Locks Status
      </Typography>

      <Box
        sx={{
          m: "10px 0 0 0",
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
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
          rows={filteredLocks}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default Locks;
