import {BrowserRouter as Router, Routes ,Route , Navigate} from 'react-router-dom'
import Login from './Components/Login-Signup/Login'
import Signup from './Components/Login-Signup/Signup'
import Navbar from './Components/Login-Signup/Navbar'
import { ColorModeContext, useMode } from './theme'
import {CssBaseline, ThemeProvider } from "@mui/material"
import Dashboard from './Components/Dashboard/Dashboard'
// import Topbar from './Components/Global/Topbar'  //note if any import is not used page will show white screen only

function App() {

  const [theme, colorMode] = useMode();

  return(
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {/* A Material UI component that resets browser CSS defaults.*/}
        <CssBaseline/> 

        <Router>
          <div className='app'>
            <Navbar/>
            {/* <Login/> This links our loginsignup component to web */}

            <main className="content">

              {/* <Topbar/> */}
              <Routes>
              
                {/* route path to login by default */}
                <Route path='/' element={<Navigate to="/Login" />} />

                <Route path='/Signup' element={<Signup/>} />

                {/* path is set to login when element is login */}
                <Route path='/Login' element= {<Login/>} />

                

                <Route path='/Dashboard' element={<Dashboard/>} />


              </Routes>
              
            </main>
            
          </div>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
 
}

export default App
