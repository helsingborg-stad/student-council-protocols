import React from 'react';

const editBtn = (protocol, authenticated) => {
  if (authenticated) {
      return (
          <a href={`${protocol.link}#modal-edit-post`} class="card-edit-btn">
              <i class="pricon pricon-pen pricon-pen-white"></i>
          </a>
      )
  }
}

const commentLink = (protocol, authenticated, comments) => {
  if (authenticated) {
    return (
      <a href={`${protocol.link}#comments`} className="card-small-text card-comments-link">{comments} ({protocol.metadata.data.commentsCount})</a>
    );
  }
}

const truncate = (text, size) => {
  return text.length > size ? text.slice(0, size - 1) + '...' : text;
}

const Card = ({ protocols, translations, state }) => {

  const {
    noProtocolsFound,
    comments
  } = translations;

  const {
    showAs,
    protocolTruncateSize,
    authenticated
  } = state;

  const gridClass = (showAs == 'cards') ? 'grid-sm-6 grid-md-4 grid-lg-3' : '';
  const cardClass = (showAs == 'cards') ? '' : 'card-as-list';

  if (protocols.length > 0) {
    return (
        <div className="grid grid--columns">
            {protocols.map((protocol, i) => {
                return (
                    <div className={`u-flex grid-xs-12 ${gridClass}`} key={i}>
                        <a href={protocol.link} className={`card ${cardClass}`} data-id={protocol.id}>
                            <div className="card-body">
                                <h4 className="card-title">{truncate(protocol.metadata.data.title, 75)}</h4>
                                
                                {editBtn(protocol, authenticated)}
                                <div className="card-info">
                                    <span className="card-small-text">{protocol.metadata.data.name_of_council_or_politician}</span>
                                    <br></br>
                                    <time className="card-small-text">{protocol.date.split('T')[0]}</time>
                                    {commentLink(protocol, authenticated, comments)}
                                </div>
                                <p class="card-paragraph">
                                    {truncate(protocol.metadata.data.content, protocolTruncateSize)}
                                </p>
                            </div>
                        </a>
                    </div>
                );
            })}
        </div>
    );
  } else {
      return (
        <div className="grid grid--columns">
            <div className="u-flex grid-xs-12 grid-md-4">
              <h4>{noProtocolsFound}</h4>
            </div>
        </div>
      );
    }
};
export default Card;
