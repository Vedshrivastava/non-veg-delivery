import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import StoreContextProvider from './context/StoreContext.jsx';
import { ChakraProvider } from '@chakra-ui/react';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ChakraProvider>
    <BrowserRouter>
      <StoreContextProvider>
        <App />
      </StoreContextProvider>
    </BrowserRouter>
  </ChakraProvider>,
);
