import styled from "styled-components";
import { FOOTER_H, HEADER_H } from "../config";
import { FC, ReactNode } from "react";

const LayoutContainer = styled.div`
  min-height: calc(100vh - ${HEADER_H}px - ${FOOTER_H}px);
  display: flex;
  flex-direction: column;
`;

const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
  return <LayoutContainer>{children}</LayoutContainer>;
};

export default Layout;
