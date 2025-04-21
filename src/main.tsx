import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./Components/App/App";
import AuthScreen from './Components/App/Auth/Auth';
import { Main } from './Components/App/Main/Main';
import Home from "./Components/App/Main/Home/Home";
import Admin from "./Components/App/Main/Admin/Admin";
import { ApplicationContext, applicationStore } from './Store/ApplicationStore.ts'
import './style.css';


const root = createRoot(document.getElementById('root')!);
root.render(
    <GoogleOAuthProvider clientId="520209100550-5d4ah07ph27nnum6c23t27etceb9jlfr.apps.googleusercontent.com">
        <ApplicationContext.Provider value={applicationStore}>
            <BrowserRouter>
                <Routes>
                    <Route path="*" element={<p>There's nothing here!</p>} />
                    <Route path='/' element={<App />}>
                        <Route path='/' element={<Navigate to={'/main/home'} />} />
                        <Route path='main' element={<Main />}>
                            <Route path='home' element={<Home />}></Route>
                            <Route path='admin' element={<Admin />}></Route>
                        </Route>
                        <Route path='auth' element={<AuthScreen />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ApplicationContext.Provider>
    </GoogleOAuthProvider>
);