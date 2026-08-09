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
import seo from "./seo.json";

const PAGE_META = Object.fromEntries(
  seo.routes.map((route) => [
    route.path,
    {
      title: route.title,
      description: route.description,
      bodyClass: route.bodyClass,
      canonical: route.path === "/" ? `${seo.siteUrl}/` : `${seo.siteUrl}${route.path}`,
    },
  ])
);

function upsertLinkRel(rel, href) {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function setMetaBySelector(selector, content) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute("content", content);
}

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    const normalizedPath = location.pathname.replace(/\/+$/, "") || "/";
    const { title, description, bodyClass, canonical } =
      PAGE_META[normalizedPath] ?? PAGE_META["/"];
    const body = document.body;

    document.title = title;
    setMetaBySelector('meta[name="description"]', description);
    setMetaBySelector('meta[itemprop="description"]', description);
    setMetaBySelector('meta[property="og:title"]', title);
    setMetaBySelector('meta[property="og:description"]', description);
    setMetaBySelector('meta[property="og:url"]', canonical);
    setMetaBySelector('meta[name="twitter:title"]', title);
    setMetaBySelector('meta[name="twitter:description"]', description);
    upsertLinkRel("canonical", canonical);

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
