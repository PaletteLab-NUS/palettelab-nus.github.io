import React, { useCallback, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

function NewsPhotoModal({ photos, index, show, onHide, onNavigate }) {
  const photo = photos[index];
  const hasMultiple = photos.length > 1;

  const goToPrevious = useCallback(() => {
    onNavigate((index - 1 + photos.length) % photos.length);
  }, [index, onNavigate, photos.length]);

  const goToNext = useCallback(() => {
    onNavigate((index + 1) % photos.length);
  }, [index, onNavigate, photos.length]);

  useEffect(() => {
    if (!show) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onHide();
      } else if (event.key === "ArrowLeft" && hasMultiple) {
        goToPrevious();
      } else if (event.key === "ArrowRight" && hasMultiple) {
        goToNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [show, hasMultiple, goToPrevious, goToNext, onHide]);

  if (!show || !photo) {
    return null;
  }

  return (
    <div
      className="news-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onHide}
    >
      <div
        className="news-lightbox-content"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="news-lightbox-close"
          onClick={onHide}
          aria-label="Close photo viewer"
        >
          <FaTimes />
        </button>

        {hasMultiple && (
          <button
            type="button"
            className="news-lightbox-nav news-lightbox-prev"
            onClick={goToPrevious}
            aria-label="Previous photo"
          >
            <FaChevronLeft />
          </button>
        )}

        <figure className="news-lightbox-figure">
          <img
            src={photo.src}
            alt={photo.caption || `Photo ${index + 1} of ${photos.length}`}
            className="news-lightbox-image"
          />
          {photo.caption && (
            <figcaption className="news-lightbox-caption">
              {photo.caption}
            </figcaption>
          )}
          {hasMultiple && (
            <p className="news-lightbox-counter">
              {index + 1} / {photos.length}
            </p>
          )}
        </figure>

        {hasMultiple && (
          <button
            type="button"
            className="news-lightbox-nav news-lightbox-next"
            onClick={goToNext}
            aria-label="Next photo"
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </div>
  );
}

export default NewsPhotoModal;
