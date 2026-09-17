import React, { useMemo } from "react";
import { FaExternalLinkAlt, FaPlay } from "react-icons/fa";
import {
  formatDate,
  getYouTubeEmbedUrl,
  normalizePhotos,
} from "./newsMedia";

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

function NewsEntry({ entry, photoOffset = 0, onOpenPhoto }) {
  const mediaItems = useMemo(() => buildMediaItems(entry), [entry]);
  const links = entry.link || [];

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
                    onClick={() => onOpenPhoto(photoOffset + item.photoIndex)}
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
    </article>
  );
}

export default NewsEntry;
