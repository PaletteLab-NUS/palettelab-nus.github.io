import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { AiFillInstagram } from "react-icons/ai";
import { FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { ReactComponent as BlueskyIcon } from "../assets/icons/bluesky-brands-solid-full.svg";

const socialLinks = [
  {
    href: "https://www.instagram.com/palettelab_nus/",
    label: "Instagram",
    icon: <AiFillInstagram />,
  },
  {
    href: "https://www.youtube.com/@palette-lab",
    label: "YouTube",
    icon: <FaYoutube />,
  },
  {
    href: "https://bsky.app/profile/palettelab.bsky.social",
    label: "Bluesky",
    icon: <BlueskyIcon className="footer-bluesky-icon" />,
  },
  {
    href: "https://www.linkedin.com/company/nus-palette-lab",
    label: "LinkedIn",
    icon: <FaLinkedinIn />,
  },
];

function Footer() {
  return (
    <footer>
      <Container fluid className="footer">
        <Container>
          <Row className="footer-row">
            <Col xs={12} md={8} className="footer-address-col">
              <h4 className="footer-label">Address</h4>
              <a
                href="https://www.onemap.gov.sg/minimap/minimap.html?mapStyle=Default&zoomLevel=17&latLng=1.29455254815536,103.775715192725&popupWidth=200&showPopup=false"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-address-link"
              >
                Smart Systems Institute, Innovation 4.0, #06-01, 3 Research Link,
                Singapore 117602
              </a>
            </Col>
            <Col xs={12} md={4} className="footer-links-col">
              <h4 className="footer-label">Links</h4>
              <ul className="footer-icons">
                {socialLinks.map(({ href, label, icon }) => (
                  <li key={label} className="footer-icon-item">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                    >
                      {icon}
                    </a>
                  </li>
                ))}
              </ul>
            </Col>
          </Row>
        </Container>
      </Container>
    </footer>
  );
}

export default Footer;
