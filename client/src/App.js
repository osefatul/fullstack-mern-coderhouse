import './App.css';
import {
  Routes,
  Route,
} from "react-router-dom";
import Home from './pages/Home/Home';
import Navigation from './components/shared/navigation/Navigation';
import GuestRoutes from './ProtectedRoutes/GuestRoutes';
import Authenticate from './pages/authenticate/Authenticate';
import ProtectedRoutes from './ProtectedRoutes/ProtectedRoutes';
import Rooms from './pages/rooms/Rooms';
import Activate from './pages/activate/Activate';
import SemiProtectRoutes from './ProtectedRoutes/SemiProtectRoutes';




function App() {
  return (
    <Routes>


      {/* <Route path="/" element={
        <>
          <Navigation />
          <Home/>
        </>
      }/> */}


      {/* <Route path="/authenticate" element={
        <>
          <Navigation />
          <Authenticate />
        </>
      }/> */}


      {/* <Route path="/rooms" element={
        <>
          <Navigation />
          <Rooms />
        </>
      }/> */}


      {/* <Route path="/activate" element={
        <>
          <Navigation />
          <Activate />
        </>
      }/> */}


    <Route path='/' element={<GuestRoutes/>}>
      <Route path="/" element={
          <>
            <Navigation />
            <Home/>
          </>
        }/>


      <Route path="authenticate" element={
        <>
          <Navigation />
          <Authenticate />
        </>
      }/>

    </Route>


    <Route path='/' element={<SemiProtectRoutes/>}>
      <Route path="activate" element={
        <>
          <Navigation />
          <Activate />
        </>
      }/>
    </Route>


    <Route path='/' element={<ProtectedRoutes/>}>
      <Route path="/rooms" element={
        <>
          <Navigation />
          <Rooms />
        </>
      }/>
    </Route>


  </Routes>

  );
}

export default App;
