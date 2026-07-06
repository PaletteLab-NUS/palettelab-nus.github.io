import React, { useState } from "react";
import {
  FaFilePdf,
  FaCode,
  FaPlay,
  FaExternalLinkAlt,
  FaBook,
  FaLink,
} from "react-icons/fa";
import { SiArxiv } from "react-icons/si";

const publicationImages = require.context(
  "../../assets/pub",
  false,
  /\.(png|jpe?g|webp|gif)$/i
);

function isRemoteImageUrl(value) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function resolveThumbnail(thumbnail) {
  if (!thumbnail) return null;

  if (isRemoteImageUrl(thumbnail)) {
    return thumbnail;
  }

  const filename = thumbnail.replace(/^.*\//, "");

  try {
    return publicationImages(`./${filename}`);
  } catch (e) {
    console.warn(`Publication thumbnail not found: ${thumbnail}`);
    return null;
  }
}

function buildAuthorIndex(authors) {
  const index = new Map();

  Object.entries(authors).forEach(([key, author]) => {
    index.set(key, author);
    if (author.name) {
      index.set(author.name, author);
    }
  });

  return index;
}

const LAB_CATEGORIES = new Set(["professor", "labMember", "future"]);

function isLabMember(author) {
  return LAB_CATEGORIES.has(author?.category);
}

function renderAuthors(authorNames, authorIndex) {
  if (!authorNames || authorNames.length === 0) return null;

  return authorNames.map((key, index) => {
    const author = authorIndex.get(key);
    const displayName = key;
    const labMember = isLabMember(author);

    return (
      <React.Fragment key={`${key}-${index}`}>
        {labMember ? (
          <span className="pub-author-lab">
            {author.website ? (
              <a
                href={author.website}
                target="_blank"
                rel="noopener noreferrer"
                className="pub-author-link"
                title={author.description || undefined}
              >
                {displayName}
              </a>
            ) : (
              displayName
            )}
          </span>
        ) : (
          <span className="pub-author-external">{displayName}</span>
        )}
        {index < authorNames.length - 1 && (
          <span className="pub-author-separator">,</span>
        )}
      </React.Fragment>
    );
  });
}

function formatVenueLine(publication) {
  const venue = publication.venue
    ? publication.venue.startsWith("Proceedings")
      ? `In ${publication.venue}`
      : publication.venue
    : null;

  if (venue && publication.location) {
    return `${venue} | ${publication.location}`;
  }

  if (venue) return venue;
  if (publication.location) return publication.location;
  if (publication.year) return String(publication.year);
  return null;
}

function PublicationEntry({ publication, authorIndex }) {
  const [expanded, setExpanded] = useState(false);
  const thumbnail = resolveThumbnail(publication.thumbnail);
  const venueLine = formatVenueLine(publication);
  const hasDetails =
    publication.abstract || publication.award || publication.bibtex;

  const links = [
    publication.website && {
      key: "website",
      href: publication.website,
      label: "Website",
      icon: <FaLink />,
    },
    publication.doi && {
      key: "doi",
      href: publication.doi,
      label: "DOI",
      icon: <FaExternalLinkAlt />,
    },
    publication.arxiv && {
      key: "arxiv",
      href: publication.arxiv,
      label: "arXiv",
      icon: <SiArxiv />,
    },
     publication.pdf && {
      key: "pdf",
      href: publication.pdf,
      label: "PDF",
      icon: <FaFilePdf />,
    },
    publication.video && {
      key: "video",
      href: publication.video,
      label: "Video",
      icon: <FaPlay />,
    },
    publication.demo && {
      key: "demo",
      href: publication.demo,
      label: "Demo",
      icon: <FaExternalLinkAlt />,
    },
    publication.github && {
      key: "github",
      href: publication.github,
      label: "Code",
      icon: <FaCode />,
    },
  ].filter(Boolean);

  return (
    <article className="publication-entry">
      <div className="publication-thumbnail-wrap">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={`${publication.title} preview`}
            className="publication-thumbnail"
          />
        ) : (
          <div className="publication-thumbnail publication-thumbnail-placeholder" />
        )}
      </div>

      <div className="publication-content">
        <span className="publication-venue-short">{publication.venue_short}</span>
        <h3 className="publication-title">{publication.title}</h3>

        {publication.authors?.length > 0 && (
          <p className="publication-authors">
            {renderAuthors(publication.authors, authorIndex)}
          </p>
        )}

        {venueLine && <p className="publication-venue">{venueLine}</p>}

        {publication.award && (
          <p className="publication-award">
            <span className="publication-award-badge">{publication.award}</span>
          </p>
        )}

        <div className="publication-actions">
          {hasDetails && (
            <button
              type="button"
              className="publication-action publication-action-toggle"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
            >
              {expanded ? "Hide Details" : "Show Details"}
              <span className="publication-action-caret">
                {expanded ? "▾" : "▸"}
              </span>
            </button>
          )}

          {links.map(({ key, href, label, icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="publication-action"
            >
              <span className="publication-action-icon">{icon}</span>
              {label}
            </a>
          ))}

        </div>

        {expanded && hasDetails && (
          <div className="publication-details">
            {publication.abstract && (
              <p className="publication-abstract">{publication.abstract}</p>
            )}
            {publication.bibtex && (
              <pre className="publication-bibtex">{publication.bibtex}</pre>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default PublicationEntry;
export { buildAuthorIndex };
