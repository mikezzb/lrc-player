import { FC } from "react";
import "./index.scss";
import Layout from "../components/Layout";
import LrcPlayer from "../components/LrcPlayer";
import styled from "styled-components";

const Header = styled.header`
  display: flex;
  background: var(--surface);
  padding: 20px 30px;
  color: white;
`;
const Logo = styled.span`
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 22px;
  letter-spacing: 2px;
  cursor: pointer;
`;

const HomePage: FC = () => {
  return (
    <Layout>
      <Header>
        <Logo>Lrc Player</Logo>
      </Header>
      <LrcPlayer />
    </Layout>
  );
};

export default HomePage;
