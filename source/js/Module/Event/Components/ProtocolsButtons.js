import React from 'react';

const ProtocolsButtons = ({ translations, buttonClick, state }) => {

  const viewedClass = (state.targetOrderValue == 'viewed') ? 'btn-active' : '';
  const latestClass = (state.targetOrderValue == 'latest') ? 'btn-active' : '';

  return (
    <div className="protocols-btn-field">
      <a href={`${window.location.origin}/create-protocol`} className="btn-oval new-protocol-btn"><i class="pricon pricon-plus"></i><span>{translations.writeNewProtocol}</span></a>

      <div className="order-btns">
          <a href="" className={`btn-square ${latestClass}`} onClick={buttonClick} data-button="latest">{translations.latest}</a>
          <a href="" className={`btn-square ${viewedClass}`} onClick={buttonClick} data-button="viewed">{translations.mostViewed}</a>
      </div>
    </div>
  );
};

export default ProtocolsButtons;
