import React from "react";
import { Container } from "react-bootstrap";
import Particle from "../Particle";
import jane from "./teamData/jane.json";
import bekzat from "./teamData/bekzat.json";
import bella from "./teamData/bella.json";
import feifei from "./teamData/feifei.json";
import kevin from "./teamData/kevin.json";
import jin from "./teamData/jin.json";
import xiyuan from "./teamData/xiyuan.json";
import thuyen from "./teamData/thuyen.json";
import shelly from "./teamData/shelly.json";
import sixing from "./teamData/sixing.json";
import jiayu from "./teamData/jiayu.json";
import danilo from "./teamData/danilo.json";
import gabriella from "./teamData/gabriella.json";
import fuling from "./teamData/fuling.json";
import mingyi from "./teamData/mingyi.json";
import mengyi from "./teamData/mengyi.json";
import yize from "./teamData/yize.json";
import tianqi from "./teamData/tianqi.json";


import "./People.css";

function People() {
  const professors = [jane];
  const labMembers = [bekzat, bella, feifei, kevin, jin,xiyuan, thuyen];
  const futureMembers = [shelly, sixing, jiayu, danilo, gabriella, fuling];
  const collaborators = [mingyi, mengyi, yize, tianqi];

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
      <h2 className="section-title">
        {sectionTitle}
      </h2>
      <div className="team-row">
        {members.map((member) => {
          let imageSrc = member.image;
          try {
            // 尝试用 require 导入图片文件
            imageSrc = require(`./teamImage/${member.image.split('/').pop()}`);
          } catch (e) {
            // 如果失败，使用原始路径
            console.warn(`Image not found: ${member.image}`);
          }
          return (
            <div key={member.id} className="team-card-item">
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
                    <p className="team-description-small">{member.description}</p>
                  </div>
                </div>
              </a>
            </div>
          );
        })}
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

          {renderSection("Prof", professors)}
          {renderSection("Lab Members", labMembers)}
          {renderSection("Future Lab Members", futureMembers)}
          {renderSection("Friends of the Lab", collaborators)}
        </Container>
      </Container>
    </>
  );
}

export default People;
