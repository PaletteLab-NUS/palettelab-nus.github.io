import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import People from "./components/People/People";
import Projects from "./components/Projects/Projects";
import Footer from "./components/Footer";
import Resume from "./components/Resume/ResumeNew";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "./style.css";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    const body = document.body;
    body.classList.remove("bg-home", "bg-people");

    if (location.pathname === "/") {
      body.classList.add("bg-home");
    } else if (location.pathname === "/people") {
      body.classList.add("bg-people");
    }
  }, [location.pathname]);

  return (
    <>
      <div className="App" id="scroll">
        <Navbar />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project" element={<Projects />} />
          <Route path="/people" element={<People />} />
          {/* <Route path="/resume" element={<Resume />} /> */}
          <Route path="*" element={<Navigate to="/"/>} />
        </Routes>
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
