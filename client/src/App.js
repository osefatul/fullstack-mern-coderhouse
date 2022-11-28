import './App.css';
import {
  Routes,
  Route,
} from "react-router-dom";
import Home from './pages/Home/Home';
import Navigation from './components/shared/navigation/Navigation';
import Login from './pages/Login/Login';
import Registration from './pages/Registration/Registration';




function App() {
  return (
    <Routes>

    {/* <Navigation /> */}

    <Route path="/" element={<Home/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Registration/>}/>


  </Routes>

  );
}

export default App;
