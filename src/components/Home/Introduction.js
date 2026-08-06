import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Tilt from "react-parallax-tilt";
import homeLogo from "../../assets/palette-logo-480.webp";
import homeLogo_blue from "../../assets/palette-logo-480-blue-test.png";
import homeLogo_green from "../../assets/palette-logo-480-green-test.png";
import homeLogo_pink from "../../assets/palette-logo-480-pink-test.png";
// import homeLogo_lite from "../../assets/palette-logo-lite.webp";
// import homeLogo_basic from "../../assets/palette-logo-basic.webp";
// import homeLogo_skin from "../../assets/palette-logo-skin.webp";
function Introduction() {
  return (
    <Container fluid className="home-about-section" id="about">
      <Container>
        <Row>
          <Col md={9} className="home-about-description">
            <h1 className="home-heading">
              LET'S <span className="purple"> INTRODUCE </span> OURSELVES!
            </h1>
            <p className="home-about-body">
              Our lab explores questions around how computational tools can support people
              in developing their own domain expertise whether that is in
              <i>
                <b className="purple">
                  {" "}
                  Creativity, Accessibility, Education, Healthcare, Sustainability, etc. {" "}
                </b>
              </i>

              <br />
              <br />
              Like an artist’s palette, where the different colors of paint come together and mix,
              the work in our lab aims to bring together, to center,
              and to design for diverse perspectives and needs.

              <br />
              <br />
              Our research asks:
              <br />
              <br />
              <i>
                <b className="purple">
                  {" "}
                  Q1. What should — and shouldn’t — AI be doing to support human creativity?
                </b>
              </i>
              <br />
              <br />
              <i>
                <b className="purple">
                  {" "}
                  Q2. How can systems scaffold, rather than substitute, the development of expertise?
                </b>
              </i>
              <br />
              <br />
              <i>
                <b className="purple">
                  {" "}
                  Q3. Which perspectives and disciplines remain underrepresented in how we design and study AI tools? {" "}
                </b>
              </i>
              <br />
              <br />

            </p>
          </Col>
          <Col md={3} className="myAvtar">
            <div className="intro-avatars">
              <div className="intro-avatar-item">
                <Tilt>
                  <img
                    src={homeLogo_blue}
                    className="img-fluid intro-avatar-img"
                    alt="Palette Lab blue mascot"
                  />
                </Tilt>
              </div>
              <div className="intro-avatar-item">
                <Tilt>
                  <img
                    src={homeLogo_green}
                    className="img-fluid intro-avatar-img"
                    alt="Palette Lab green mascot"
                  />
                </Tilt>
              </div>
              <div className="intro-avatar-item">
                <Tilt>
                  <img
                    src={homeLogo_pink}
                    className="img-fluid intro-avatar-img"
                    alt="Palette Lab pink mascot"
                  />
                </Tilt>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
export default Introduction;
