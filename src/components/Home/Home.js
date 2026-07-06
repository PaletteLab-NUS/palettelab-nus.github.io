import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import homeLogo from "../../assets/palette-logo-480.webp";
import Particle from "../Particle";
import Introduction from "./Introduction";
import Hi from "./Hi";
import Findus from "./Findus";
import News from "./News";

import Type from "./Type";
import Tilt from "react-parallax-tilt";
import {
  AiFillGithub,
  AiOutlineTwitter,
  AiFillInstagram,
} from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";

function Home() {
  return (
    <section>
      <Particle />
      <Hi />
      <Introduction />
      <News />
      <Findus />
    </section>
  );
}

export default Home;
