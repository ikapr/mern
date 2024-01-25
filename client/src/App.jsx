import './App.css';
import Auth from './utils/auth';
import io from 'socket.io-client';
import Navbar from './components/Navbar';
import { Outlet } from 'react-router-dom';
import { useState, createContext, useEffect } from 'react';

export const GloballySharedData = createContext({});

let serverPort = 3001;
let liveLinkMain = window && (window.location.host.includes(`local`) || window.location.host.includes(`127`)) ? `http://localhost:${serverPort}` : `https://google-bookssearch-e06d29a0e0cc.herokuapp.com/`;
const socket = io(liveLinkMain);

function App() {
  const storedUser = Auth && Auth.loggedIn() ? Auth.getProfile() : localStorage && localStorage.getItem(`user`) ? JSON.parse(localStorage.getItem(`user`)) || null : null;
  let [state, setState] = useState({});
  let [users, setUsers] = useState([]);
  let [user, setUser] = useState(null);

  useEffect(() => {
    socket.on(`data`, (data) => {
      let users = JSON.parse(data.users);
      let loggedInUser = user && user != null ? users.find(usr => usr._id === user?._id) : storedUser ? users.find(usr => usr._id == storedUser.userId) : null;
      let globalState = {
        user: loggedInUser,
        ...data,
        users,
      };
      setUsers(users);
      setState(globalState);
      let userToSet = globalState.user || user || loggedInUser;
      if (loggedInUser != undefined && loggedInUser != null) setUser(userToSet);
      console.log(`Globally Shared Data`, { globalState, user: userToSet, users });
    });

    socket.on(`usersChanged`, (usersDatabaseChange) => {
      console.log(`Users Database Change Detected`, usersDatabaseChange);
      let loggedInUser = user && user != null ? users.find(usr => usr._id === user?._id) : storedUser ? users.find(usr => usr._id == storedUser.userId) : null;
      setUser(loggedInUser);
      setUsers(users);
      console.log(`Globally Shared Data`, { state, user, users });
    })

    return () => {
      socket.off(`data`);
      socket.off(`usersChanged`);
    }
  }, [user, state, storedUser, users]);

  return (
    <>
      <GloballySharedData.Provider value={{ state, user, setUser, users }}>
        <Navbar />
        <Outlet />
      </GloballySharedData.Provider>
    </>
  );
}

export default App;