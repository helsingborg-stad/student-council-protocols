import React from 'react';

const ShowAsList = ({ showAsHandler, state, translations }) => (
  <div className="show-list-wrap">
      <span>{`${translations.found} ${state.totalProtocols} ${translations.protocols}`}</span>
      <a href="" className="show-list" data-showAs={state.showAs} onClick={showAsHandler}>{state.showAsText}</a>
  </div>
);

export default ShowAsList;
