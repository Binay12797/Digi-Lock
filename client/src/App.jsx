import {BrowserRouter as Router, Routes ,Route , Navigate} from 'react-router-dom'
import Login from './Components/Login-Signup/Login'
import Signup from './Components/Login-Signup/Signup'
import Navbar from './Components/Login-Signup/Navbar'

function App() {
  return(
    <Router>
      <div>
        <Navbar/>
        {/* <Login/> This links our loginsignup component to web */}

        <Routes>
          
          {/* route path to login by default */}
          <Route path='/' element={<Navigate to="/Login" />} />

          {/* path is set to login when element is login */}
          <Route path='/Login' element= {<Login/>} />

          <Route path='/Signup' element={<Signup/>} />

        </Routes>
      </div>
    </Router>
  )
 
}

export default App
