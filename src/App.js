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

const PAGE_META = {
  "/": {
    title: "Palette Lab | NUS",
    description: "Website of NUS Palette Lab",
    bodyClass: "bg-home",
  },
  "/people": {
    title: "Team | Palette Lab",
    description: "Meet the researchers, students, and collaborators of NUS Palette Lab.",
    bodyClass: "bg-people",
  },
  "/publications": {
    title: "Pub | Palette Lab",
    description: "Explore research publications from NUS Palette Lab.",
    bodyClass: "bg-publications",
  },
  "/memories": {
    title: "Memories | Palette Lab",
    description: "Browse highlights and memories from NUS Palette Lab.",
    bodyClass: "bg-memories",
  },
};

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    const normalizedPath = location.pathname.replace(/\/+$/, "") || "/";
    const { title, description, bodyClass } =
      PAGE_META[normalizedPath] ?? PAGE_META["/"];
    const body = document.body;
    const descriptionMeta = document.querySelector('meta[name="description"]');

    document.title = title;
    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", description);
    }
    body.classList.remove(
      "bg-home",
      "bg-people",
      "bg-publications",
      "bg-memories"
    );
    body.classList.add(bodyClass);
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
