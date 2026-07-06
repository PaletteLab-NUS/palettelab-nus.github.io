import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import People from "./components/People/People";
import Publications from "./components/Publications/Publications";
import News from "./components/News/News";
import Footer from "./components/Footer";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import "./App.css";
import NotFound from "./components/NotFound/NotFound";

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    const body = document.body;
    body.classList.remove("bg-home", "bg-people");

    if (location.pathname === "/" || location.pathname === "") {
      body.classList.add("bg-home");
    } else if (location.pathname === "/people" || location.pathname === "/people/") {
      body.classList.add("bg-people");
    } else if (
      location.pathname === "/publications" ||
      location.pathname === "/memories"
    ) {
      body.classList.add("bg-people");
    } else {
      // For unknown routes (e.g. 404 page), keep the homepage background.
      body.classList.add("bg-home");
    }
  }, [location.pathname]);

  return (
    <>
      <div className="App" id="scroll">
        <Navbar />
        <ScrollToTop />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/people" element={<People />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/memories" element={<News />} />
            {/* <Route path="/resume" element={<Resume />} /> */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <Router basename='/'>
      <AppContent />
    </Router>
  );
}

export default App;
