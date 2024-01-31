import './App.css';
import Test from './components/Test';
import Home from './components/Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Nav} from 'react-bootstrap'
import Chat from './components/Chat.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className='App'>
        <Routes>
        <Route path='/test' element = {<Test/>} />
        <Route path='/' element= {<Home/>} />
        <Route path='/chat' element={<Chat/>}/>

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
