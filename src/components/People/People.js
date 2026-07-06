import React from "react";
import { Container } from "react-bootstrap";
import Particle from "../Particle";
import peopleData from "../../data/people.yaml";
import "./People.css";

function toTeamMembers(authors) {
  return Object.entries(authors)
    .map(([key, author]) => ({
      id: author.id ?? key,
      name: author.name || key,
      role: author.description || "",
      description: "",
      image: author.image,
      category: author.category,
      url: author.website,
      bio: author.bio || "",
      hiringNote: author.hiringNote || "",
    }))
    .filter((member) => member.category)
    .sort((a, b) => (a.id || 0) - (b.id || 0));
}

function resolveTeamImage(image) {
  try {
    return require(`../../assets/team/${image}`);
  } catch (e) {
    console.warn(`Image not found: ${image}`);
    return image;
  }
}

function renderTeamCard(member) {
  const imageSrc = resolveTeamImage(member.image);
  return (
    <a
      href={member.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      <div className="team-card-small">
        <div className="team-card-image-small">
          <img src={imageSrc} alt={member.name} className="img-fluid" />
        </div>
        <div className="team-card-body-small">
          <h4>{member.name}</h4>
          <p className="team-role-small">
            <span className="purple">{member.role}</span>
          </p>
          {member.description && (
            <p className="team-description-small">{member.description}</p>
          )}
        </div>
      </div>
    </a>
  );
}

function renderDirectorSection(member) {
  return (
    <div className="team-section">
      <h2 className="section-title">Lab Director</h2>
      <div className="director-layout">
        <div className="director-card-item">{renderTeamCard(member)}</div>
        <div className="director-bio">
          {member.bio && (
            <div dangerouslySetInnerHTML={{ __html: member.bio }} />
          )}
          {member.hiringNote && (
            <div
              className="director-hiring"
              dangerouslySetInnerHTML={{ __html: member.hiringNote }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function People() {
  const teamMembers = toTeamMembers(peopleData);
  const professors = teamMembers.filter((m) => m.category === "professor");
  const labMembers = teamMembers.filter((m) => m.category === "labMember");
  const futureMembers = teamMembers.filter((m) => m.category === "future");
  const collaborators = teamMembers.filter((m) => m.category === "friends");

  const renderSection = (title, members) => {
    let sectionTitle;
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("prof")) {
      sectionTitle = "Lab Director";
    } else if (lowerTitle.includes("future")) {
      sectionTitle = <>Future Lab Members</>;
    } else if (lowerTitle.includes("lab member")) {
      sectionTitle = <>Lab Members</>;
    } else {
      sectionTitle = <>Friends of the Lab :)</>;
    }

    return (
      <div className="team-section">
        <h2 className="section-title">{sectionTitle}</h2>
        <div className="team-row">
          {members.map((member) => (
            <div key={member.id} className="team-card-item">
              {renderTeamCard(member)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Particle />
      <Container fluid className="about-section">
        <Container>
          <h1 className="about-main-title">
            OUR <strong className="purple">TEAM</strong>
          </h1>

          {professors.map((member) => (
            <React.Fragment key={member.id}>
              {renderDirectorSection(member)}
            </React.Fragment>
          ))}
          {renderSection("Lab Members", labMembers)}
          {renderSection("Friends of the Lab", collaborators)}
        </Container>
      </Container>
    </>
  );
}

export default People;
