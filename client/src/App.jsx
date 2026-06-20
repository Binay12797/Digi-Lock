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

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {/* A Material UI component that resets browser CSS defaults.*/}
        <CssBaseline />
        <Router>
          <Routes>
            {/* route path to login by default */}
            <Route path="/" element={<Navigate to="/Login" />} />

            <Route element={<AuthLayout />}>
              <Route path="/Signup" element={<Signup />} />
              <Route path="/Login" element={<Login />} />
            </Route>

            <Route element={<DashboardLayout />}>
              <Route path="/Dashboard" element={<Dashboard />} />
              <Route path="/Users" element={<Users />} />
              <Route path="/Locks" element={<Locks />} />
              <Route path="/AccessLogs" element={<AccessLogs />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
