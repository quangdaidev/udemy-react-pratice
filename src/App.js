import './App.scss';
import Header from './components/Header';
import TableUsers from './components/TableUsers';
import Container from "react-bootstrap/Container";
import { ToastContainer, Bounce } from 'react-toastify';
import Home from './components/Home';
import { Routes, Route, Link, Router } from 'react-router-dom';
import Login from './components/Login';
import { useContext } from 'react';
import { UserContext } from './components/context/UserContext';

function App() {

  const { user } = useContext(UserContext);

  return (
    <>
      <div className='app-container'>
        <Header/>
        <Container>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/users" element={<TableUsers/>}/>
            <Route path="/login" element={<Login/>}/>
          </Routes>
        </Container>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
        />
    </>
  );
}

export default App;
