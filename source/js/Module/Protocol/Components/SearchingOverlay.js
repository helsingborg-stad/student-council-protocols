import React from 'react';

const SearchingOverlay = ({ searching }) => {
  const searchingClass = !searching ? 'hidden' : '';

  return (
    <div className={`searching ${searchingClass}`}>
      <div className={`overlay ${searchingClass}`}></div>
      <div className={`loading loading-blue ${searchingClass}`}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
      </div>
    </div>
  );
};

export default SearchingOverlay;
