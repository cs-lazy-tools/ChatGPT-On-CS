import React from 'react';
import { DotLoader } from 'react-spinners';
import './loader.css';

const FullScreenLoader = () => {
  return (
    <div className="full-screen-loader">
      <DotLoader color="#36d7b7" />
    </div>
  );
};

export default React.memo(FullScreenLoader);
