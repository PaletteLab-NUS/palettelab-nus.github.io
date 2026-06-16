import React from "react";
import { Container, Row, Col } from "react-bootstrap";
// import homeLogo from "../../Assets/home-main.svg";
import homeLogo from "../../Assets/palette-logo-480.webp";
import myImg from "../../Assets/avatar.svg";
import Particle from "../Particle";
import Introduction from "./Introduction";
import Hi from "./Hi";
import Findus from "./Findus";
import News from "./News";

import Type from "./Type";
import Tilt from "react-parallax-tilt";
import Techstack from "../People/Techstack";
import Github from "../People/Github";
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
