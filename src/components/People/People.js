import React, { useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import Particle from "../Particle";
import peopleData from "../../data/people.yaml";
import TrajectoryMap from "./TrajectoryMap";
import "./People.css";

function toTeamMembers(authors) {
  // Preserve people.yaml key order (Object.entries insertion order).
  // Do not numeric-sort ids — keys are usually display-name strings.
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
      color: author.color || "#7978D6",
      textColor: author.textColor || "#FFFFFF",
      interests: (author.interests || []).filter(
        (interest) => String(interest || "").trim().length > 0
      ),
      trajectory: author.trajectory || [],
    }))
    .filter((member) => member.category);
}

function resolveTeamImage(image) {
  try {
    return require(`../../assets/team/${image}`);
  } catch (e) {
    console.warn(`Image not found: ${image}`);
    return image;
  }
}

/** Solid colors use `color`; CSS gradients need background-clip on text. */
function interestTextStyle(textColor) {
  const value = String(textColor || "#FFFFFF");
  if (/gradient\(/i.test(value)) {
    return {
      backgroundImage: value,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent",
    };
  }
  return { color: value };
}

function renderCardFront(member, imageSrc) {
  return (
    <>
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
    </>
  );
}

function renderTeamCard(member) {
  const imageSrc = resolveTeamImage(member.image);
  const showFlip = member.category !== "friends";

  if (!showFlip) {
    return (
      <a
        href={member.url}
        target="_blank"
        rel="noopener noreferrer"
        className="team-card-link"
      >
        <div className="team-card-small team-card-simple">
          {renderCardFront(member, imageSrc)}
        </div>
      </a>
    );
  }

  return (
    <a
      href={member.url}
      target="_blank"
      rel="noopener noreferrer"
      className="team-card-link"
    >
      <div className="team-card-flip">
        <div className="team-card-inner">
          <div className="team-card-front team-card-small">
            {renderCardFront(member, imageSrc)}
          </div>
          <div
            className="team-card-back"
            style={{ backgroundColor: member.color }}
          >
            <ul className="team-card-interests">
              {member.interests.map((interest) => (
                <li key={interest} style={interestTextStyle(member.textColor)}>
                  {interest}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </a>
  );
}

function People() {
  const teamMembers = useMemo(() => toTeamMembers(peopleData), []);
  const professors = teamMembers.filter((m) => m.category === "professor");
  const labMembers = teamMembers.filter((m) => m.category === "labMember");
  const collaborators = teamMembers.filter((m) => m.category === "friends");

  const defaultFocusId = professors[0] ? String(professors[0].id) : null;
  const [hoveredPersonId, setHoveredPersonId] = useState(null);
  const [pinnedPersonId, setPinnedPersonId] = useState(null);
  const focusId = hoveredPersonId || pinnedPersonId || defaultFocusId;
  const focusedMember =
    teamMembers.find((m) => String(m.id) === String(focusId)) || professors[0];

  const renderSection = (title, members) => {
    let sectionTitle;
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("lab member")) {
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

          <div className="team-section trajectory-hero-section">
            <div className="trajectory-hero-layout">
              <div className="trajectory-focus-panel">
                {focusedMember && (
                  <>
                    <div
                      className="trajectory-focus-card"
                      key={String(focusedMember.id)}
                    >
                      {renderTeamCard(focusedMember)}
                    </div>
                    {focusedMember.bio && (
                      <div
                        style={{ display: "none" }}
                        className="trajectory-focus-bio"
                        dangerouslySetInnerHTML={{ __html: focusedMember.bio }}
                      />
                    )}
                  </>
                )}
              </div>
              <div className="trajectory-hero-map">
                <TrajectoryMap
                  members={teamMembers}
                  embedded
                  pinnedPersonId={pinnedPersonId}
                  onPersonHover={setHoveredPersonId}
                  onPersonPin={setPinnedPersonId}
                />
              </div>
            </div>
          </div>

          {renderSection("Lab Members", labMembers)}
          {renderSection("Friends of the Lab", collaborators)}
         
          <div className="team-section">
        <h2 className="section-title">Join Us</h2>
        <p>We are actively looking for students and interns to join the Palette Lab. Please fill <a href="https://forms.gle/jhtwNwt2NDhZsEZS9" target="_blank" className="purple">this form</a>.</p>
      </div>
         
           
        </Container>
      </Container>
    </>
  );
}

export default People;
