import React from 'react';
import { Link } from 'react-router-dom';
const Error = () => {
  return (
    <div className="container">
      <h1>Page does not exist</h1>
      <Link to="/" className="btn">
        Back Home
      </Link>
    </div>
  );
};

export default Error;