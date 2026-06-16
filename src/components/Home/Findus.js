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
            <a
              href="https://forms.gle/jhtwNwt2NDhZsEZS9"
              target="_blank"
              rel="noreferrer"
              className="findus-link"
            >
              Get <span className="purple">In Touch</span>
            </a>
          </h1>
          <div className="findus-body">
            <span>
              We are{" "}
              <a
                href="https://forms.gle/jhtwNwt2NDhZsEZS9"
                target="_blank"
                rel="noreferrer"
                className="findus-link"
              >
                <span className="purple">recruiting PhD students</span>
              </a>{" "}
              to join the lab!
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
