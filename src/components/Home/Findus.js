import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  AiFillGithub,
  AiOutlineTwitter,
  AiFillInstagram,
  AiFillEdit,
} from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { FaWpforms } from "react-icons/fa";

function Findus() {
  return (
    <Container>
      <Row style={{ paddingTop: "50px", paddingBottom: "80px" }}>
        <Col md={12} className="home-about-social">
          <h1>
            
              Get <span className="purple">In Touch</span>
      
          </h1>
          <div className="findus-body">
            <span>
              If you are interested in joining the lab, please fill out {" "}
              <a
                href="https://forms.gle/jhtwNwt2NDhZsEZS9"
                target="_blank"
                rel="noreferrer"
                className="findus-link"
                style={{ cursor: "pointer" }}
              >
                <span className="purple" style={{ cursor: "pointer" }}>this form</span>
              </a>.
              
            </span>
            {/* <a
              href="https://forms.gle/jhtwNwt2NDhZsEZS9"
              target="_blank"
              rel="noreferrer"
              className="icon-colour home-social-icons findus-icon"
            >
              <FaWpforms />
            </a> */}
          </div>

        </Col>
      </Row>
    </Container>
  );
}
export default Findus;
