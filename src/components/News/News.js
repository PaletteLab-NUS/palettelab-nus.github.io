import React, { useMemo } from "react";
import { Container } from "react-bootstrap";
import Particle from "../Particle";
import NewsEntry from "./NewsEntry";
import newsItems from "../../data/news.yaml";
import "./News.css";

function sortByDate(items) {
  return [...items].sort((a, b) => {
    const dateA = new Date(`${a.date || "1970-01-01"}T00:00:00`);
    const dateB = new Date(`${b.date || "1970-01-01"}T00:00:00`);
    return dateB - dateA;
  });
}

function News() {
  const sortedNews = useMemo(() => sortByDate(newsItems), []);

  return (
    <div className="news-page">
      <Particle />
      <Container fluid className="about-section news-section">
        <Container className="news-container">
          <h1 className="about-main-title">
            LAB <strong className="purple">MEMORIES</strong>
          </h1>

          <div className="news-list">
            {sortedNews.map((entry, index) => (
              <NewsEntry
                key={`${entry.date}-${index}`}
                entry={entry}
              />
            ))}
          </div>
        </Container>
      </Container>
    </div>
  );
}

export default News;
