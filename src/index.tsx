import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import {
  createBrowserRouter as createRouter,
  RouterProvider,
} from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import HomePage from "./pages";
import ErrorPage from "./pages/error";

const router = createRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
