import './App.css'
import LandingPage from "./pages/LandingPage.jsx";
import { Routes, Route } from "react-router-dom";
import Signup from './pages/signupPage.jsx';
import LoginPage from './pages/loginPage.jsx';
// import VdoComponent from './pages/newVdoComponent.jsx';
import VdoConf from './pages/vdoConf.jsx';
import HomePage from './pages/homePage.jsx';
import HistoryPage from './pages/historyPage.jsx';

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />}/>
        <Route path="/auth/register" element={<Signup/>} />
        <Route path="/auth/login" element={<LoginPage/>} />
        {/* <Route path="/:url" element={<VdoConf/>} /> */}
        <Route path="/meet/:url" element={<VdoConf/>} />
        {/* <Route path="/meet/:url" element={<VdoComponent/>} /> */}
        <Route path="/home" element={<HomePage/>} />
        <Route path="/history" element={<HistoryPage/>} /> 
      </Routes>
  );
}

export default App
