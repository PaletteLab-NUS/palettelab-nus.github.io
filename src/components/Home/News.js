import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function News() {
  return (
     <Container fluid className="home-about-section" id="about">
       <Container>
         <Row>
           <Col md={12} className="home-about-description">
             <h1 className="home-heading">
            <span className="purple"> Meet Us </span>
            </h1>
            <p className="home-news-body">
             Watch the introduction video of everyone in the Palette Lab!
           </p>
            <div className="home-news-video">
              <iframe
                title="Palette Lab Introduction"
                src="https://www.youtube.com/embed/6AfX7b6uCaI?si=Xe3Nq1HV_lziuIbo"
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
