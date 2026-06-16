import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import myImg from "../../Assets/avatar.svg";
import Tilt from "react-parallax-tilt";
import homeLogo from "../../Assets/palette-logo-480-shadow.png";

import Type from "./Type";


function Hi() {
  return (
    <section className="home-hero" id="home">
      <Container className="home-content">
        <Row className="home-hero-row">
          <Col md={7} className="home-header">
            <h1 className="heading">Hi there!</h1>

            <h1 className="heading-name">
              This is <strong className="main-name">Palette&nbsp;Lab</strong>
            </h1>

            <div className="home-typewriter">
              <Type />
            </div>
          </Col>

          <Col md={5} className="home-hero-image">
            <Tilt>
              <img
                src={homeLogo}
                alt="Palette Lab logo"
                className="img-fluid home-hero-logo"
              />
            </Tilt>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
export default Hi;
