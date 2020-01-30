import React from 'react';

const ProtocolsButtons = ({ translations, orderButtonClick, state }) => {

  const viewedClass = (state.targetOrderValue == 'viewed') ? 'btn-active' : '';
  const latestClass = (state.targetOrderValue == 'latest') ? 'btn-active' : '';

  return (
    <div className="protocols-btn-field">
      <a href={`${window.location.origin}/create-protocol`} className="btn-oval new-protocol-btn"><i class="pricon pricon-plus"></i><span>{translations.writeNewPost}</span></a>

      <div className="order-btns">
          <a href="" className={`btn-square ${latestClass}`} onClick={orderButtonClick} data-order="latest">{translations.latest}</a>
          <a href="" className={`btn-square ${viewedClass}`} onClick={orderButtonClick} data-order="viewed">{translations.mostViewed}</a>
      </div>
    </div>
  );
};

export default ProtocolsButtons;
