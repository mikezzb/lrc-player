import { FC } from "react";
import { useRouteError } from "react-router-dom";

const ErrorPage: FC = () => {
  const error = useRouteError() as any;

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
};

export default ErrorPage;
