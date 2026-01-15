import React from 'react';
import App from '@/App';
import { queryClient } from '@/configs';
import { CustomCursor } from './components/CustomCursor';

import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

import { QueryClientProvider } from '@tanstack/react-query';

import './index.css';

createRoot(document.getElementById('root')!).render(
    <HelmetProvider>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <React.StrictMode>
                    <CustomCursor />
                    <App />
                </React.StrictMode>
            </BrowserRouter>
        </QueryClientProvider>
    </HelmetProvider>
);
