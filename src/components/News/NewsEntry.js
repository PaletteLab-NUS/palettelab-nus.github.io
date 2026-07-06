import React, { useMemo, useState } from "react";
import { FaExternalLinkAlt, FaPlay } from "react-icons/fa";
import NewsPhotoModal from "./NewsPhotoModal";

const newsImages = require.context(
  "../../assets/events",
  false,
  /\.(png|jpe?g|webp|gif)$/i
);

function resolveLocalPhoto(path) {
  if (!path) return null;

  try {
    return newsImages(`./${path}`);
  } catch (e) {
    console.warn(`News photo not found: ${path}`);
    return null;
  }
}

function normalizePhotoItem(item, index) {
  if (typeof item === "string") {
    return {
      id: `photo-${index}`,
      src: resolveLocalPhoto(item),
      caption: "",
    };
  }

  const { path, url, caption = "" } = item || {};
  const src = url || resolveLocalPhoto(path);

  return {
    id: `${path || url || "photo"}-${index}`,
    src,
    caption,
  };
}

function normalizePhotos(entry) {
  const rawPhotos = entry.photos || entry.photo || [];

  return rawPhotos
    .map((item, index) => normalizePhotoItem(item, index))
    .filter((photo) => photo.src);
}

function buildMediaItems(entry) {
  const items = [];

  (entry.video || []).forEach((videoUrl, index) => {
    items.push({
      id: `video-${videoUrl}-${index}`,
      type: "video",
      videoUrl,
      embedUrl: getYouTubeEmbedUrl(videoUrl),
    });
  });

  normalizePhotos(entry).forEach((photo, photoIndex) => {
    items.push({
      ...photo,
      type: "photo",
      photoIndex,
    });
  });

  return items;
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }

      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/]+)/);
      if (shortsMatch) {
        return `https://www.youtube.com/embed/${shortsMatch[1]}`;
      }
    }
  } catch (e) {
    return null;
  }

  return null;
}

function formatDate(dateString) {
  if (!dateString) return null;

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function NewsEntry({ entry }) {
  const photos = useMemo(() => normalizePhotos(entry), [entry]);
  const mediaItems = useMemo(() => buildMediaItems(entry), [entry]);
  const links = entry.link || [];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <article className="news-entry">
      <time className="news-date" dateTime={entry.date}>
        {formatDate(entry.date)}
      </time>

      <div className="news-content">
        <p className="news-about">{entry.about?.trim()}</p>

        {mediaItems.length > 0 && (
          <div className="news-media news-media-grid">
            {mediaItems.map((item) => {
              if (item.type === "video" && item.embedUrl) {
                return (
                  <div
                    key={item.id}
                    className="news-media-item news-media-tile news-video"
                  >
                    <iframe
                      title="News video"
                      src={item.embedUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              }

              if (item.type === "video") {
                return (
                  <a
                    key={item.id}
                    href={item.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-media-item news-media-tile news-video-fallback"
                  >
                    <span className="news-action-icon">
                      <FaPlay />
                    </span>
                    Watch video
                  </a>
                );
              }

              return (
                <figure
                  key={item.id}
                  className="news-media-item news-media-tile news-photo-figure"
                >
                  <button
                    type="button"
                    className="news-photo-button"
                    onClick={() => openLightbox(item.photoIndex)}
                    aria-label={
                      item.caption
                        ? `View photo: ${item.caption}`
                        : `View photo ${item.photoIndex + 1}`
                    }
                  >
                    <img src={item.src} alt="" className="news-photo" />
                  </button>
                </figure>
              );
            })}
          </div>
        )}

        {links.length > 0 && (
          <div className="news-actions">
            {links.map(({ label, url }) => (
              <a
                key={`${label}-${url}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-action"
              >
                <span className="news-action-icon">
                  <FaExternalLinkAlt />
                </span>
                {label}
              </a>
            ))}
          </div>
        )}
      </div>

      <NewsPhotoModal
        photos={photos}
        index={lightboxIndex}
        show={lightboxOpen}
        onHide={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </article>
  );
}

export default NewsEntry;
