import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Components/Login-Signup/Login";
import Signup from "./Components/Login-Signup/Signup";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Dashboard from "./Components/Dashboard/Dashboard"; //note if any import is not used page will show white screen only
import DashboardLayout from "./Components/Layouts/DashboardLayout";
import AuthLayout from "./Components/Layouts/AuthLayout";
import Users from "./Components/Dashboard/Users";
import Locks from "./Components/Dashboard/Locks";
import AccessLogs from "./Components/Dashboard/AccessLogs";
import AddUser from "./Components/Dashboard/AddUser";
import AuthProvider from "./Components/Context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      {/* The <ThemeProvider> uses React Context to broadcast your custom theme object down to every single component nested inside it */}
      <ThemeProvider theme={theme}>
        {/* A Material UI component that resets browser CSS defaults.*/}
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* route path to login by default */}
              <Route path="/" element={<Navigate to="/Login" />} />

              <Route element={<AuthLayout />}>
                <Route path="/Signup" element={<Signup />} />
                <Route path="/Login" element={<Login />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/Users" element={<Users />} />
                <Route path="/Locks" element={<Locks />} />
                <Route path="/AccessLogs" element={<AccessLogs />} />
                <Route path="/AddUser" element={<AddUser />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
