import React, { useCallback, useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import Particle from "../Particle";
import NewsEntry from "./NewsEntry";
import NewsPhotoModal from "./NewsPhotoModal";
import { buildGallery } from "./newsMedia";
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
  const { photos, entryPhotoOffsets } = useMemo(
    () => buildGallery(sortedNews),
    [sortedNews]
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

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
                photoOffset={entryPhotoOffsets[index]}
                onOpenPhoto={openLightbox}
              />
            ))}
          </div>
        </Container>
      </Container>

      <NewsPhotoModal
        photos={photos}
        index={lightboxIndex}
        show={lightboxOpen}
        onHide={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}

export default News;
