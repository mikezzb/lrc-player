import { FCC } from "../types/view";
import styled from "styled-components";
import { FOOTER_H, HEADER_H } from "../config";

const LayoutContainer = styled.div`
  min-height: calc(100vh - ${HEADER_H}px - ${FOOTER_H}px);
  display: flex;
  flex-direction: column;
`;

const Layout: FCC = ({ children }) => {
  return <LayoutContainer>{children}</LayoutContainer>;
};

export default Layout;
