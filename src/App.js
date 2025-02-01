// src/App.js
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import SpinWheel from './games/SpinWheel';
import CardGame2 from './games/CardGame2';
import BoardGame from './games/BoardGame';
import Quiz from './games/Quiz';
import Preamble from './components/Preamble/Preamble'; // Import the Preamble component
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/global.css';

const Layout = ({ children }) => (
  <div className="app">
    <Navbar />
    <main className="main-content">
      {children}
    </main>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>,
  },
  // {
  //   path: '/spin-wheel',
  //   element: <Layout><SpinWheel /></Layout>,
  // },
  {
    path: '/card-game2',
    element: <Layout><CardGame2 /></Layout>,
  },
  {
    path: '/board-game',
    element: <Layout><BoardGame /></Layout>,
  },
  {
    path: '/quiz',
    element: <Layout><Quiz /></Layout>,
  },
  {
    path: '/preamble', // Add the route for the Preamble page
    element: <Layout><Preamble /></Layout>,
  },
], {
  future: {
    v7_startTransition: true,
  },
});

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;