import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";

import { Home } from "./pages/home";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import ProfilePage from "./pages/profile";
import Habits from "./pages/habits";
import { Reports } from "./pages/reports";
import { Quotes } from "./pages/quotes";
import { Onboarding } from "./pages/onboarding";
import ForgotPassword from "./pages/forgotpassword"
import ResetPassword from "./pages/resetPasswordToken";

import injectContext from "./store/appContext";

import Navbar from "./component/navbar";
import { Footer } from "./component/footer";

//create your first component
const Layout = () => {
    const isAuthenticated = !!localStorage.getItem('access_token');

    //the basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    const basename = process.env.BASENAME || "";

    if(!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL/ >;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    {isAuthenticated && <Navbar />}  {/* Only render if authenticated */}
                    <div className="content">
                        <Routes>
                            <Route element={<Home />} path="/" />
                            <Route element={<Login />} path="/login" />
                            <Route element={<Register />} path="/register" />
                            <Route element={<Onboarding />} path="/onboarding" />
                            <Route element={<ProfilePage />} path="/profile" />
                            <Route element={<Habits />} path="/habits" />
                            <Route element={<Reports />} path="/reports" />
                            <Route element={<Dashboard />} path="/dashboard" />
                            <Route element={<Quotes />} path="/quotes" />
                            <Route element={<ForgotPassword />} path="/forgotpassword" />
                            <Route element={<ResetPassword />} path="/resetpasswordtoken" />
                            <Route element={<h1>Not found!</h1>} />
                        </Routes>
                    </div>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
