import { FC, ReactNode } from "react";

/** FC with children */
export type FCC<T = {}> = FC<
  {
    children?: ReactNode;
  } & T
>;
