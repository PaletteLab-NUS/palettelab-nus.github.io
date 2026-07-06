import React, { useMemo } from "react";
import { Container } from "react-bootstrap";
import Particle from "../Particle";
import PublicationEntry, { buildAuthorIndex } from "./PublicationEntry";
import publications from "../../data/publications.yaml";
import people from "../../data/people.yaml";
import "./Publications.css";

function groupByYear(items) {
  const sorted = [...items].sort((a, b) => (b.year || 0) - (a.year || 0));
  const groups = new Map();

  sorted.forEach((publication) => {
    const year = publication.year || "Other";
    if (!groups.has(year)) {
      groups.set(year, []);
    }
    groups.get(year).push(publication);
  });

  return groups;
}

function Publications() {
  const publicationsByYear = groupByYear(publications);
  const authorIndex = useMemo(() => buildAuthorIndex(people), []);

  return (
    <div className="publications-page">
      <Particle />
      <Container fluid className="about-section publications-section">
        <Container className="publications-container">
          <h1 className="about-main-title">
            OUR <strong className="purple">PUBLICATIONS</strong>
          </h1>
          <p className="publications-intro">
           
          </p>

          {Array.from(publicationsByYear.entries()).map(([year, yearPublications]) => (
            <section key={year} className="publications-year-group">
              <h2 className="publications-year-heading">{year}</h2>
              <div className="publications-list">
                {yearPublications.map((publication, index) => (
                  <PublicationEntry
                    key={`${publication.title}-${year}-${index}`}
                    publication={publication}
                    authorIndex={authorIndex}
                  />
                ))}
              </div>
            </section>
          ))}
        </Container>
      </Container>
    </div>
  );
}

export default Publications;
