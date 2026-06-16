import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Tilt from "react-parallax-tilt";

function News() {
  return (
     <Container fluid className="home-about-section" id="about">
      <Container>
        <Row>
          <Col md={12} className="home-about-description">
            <h1 className="home-heading">
              <span className="purple"> NEWS </span>
            </h1>
            <p className="news-body">
              Palette Lab is heading to CHI 2026! See you in Barcelona! 🇪🇸
            </p>
              <div className="news-video">
                <iframe
                  title="Palette Lab CHI 2026"
                  src="https://www.youtube.com/embed/5vBJtzax438"
                  allow="autoplay"
                  allowFullScreen
                />
              </div>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
export default News;
