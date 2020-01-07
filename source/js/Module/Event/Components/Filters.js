import React from 'react';

const renderAuthors = (authors, filterHandler, targetAuthorValue) => {
  return (
      <select className="input-select" name="yummie" data-option="authors" onChange={filterHandler} value={targetAuthorValue}>
          {authors.map((author, i) => {
              return (
                  <option value={author} key={i}>{author}</option>
              );
          })}
      </select>
  );
};

const renderSubjects = (allSubjects, filterHandler, targetSubjectValue) => {
  return (
      <select className="input-select" name="yummie" data-option="subjects" onChange={filterHandler} value={targetSubjectValue} selected={targetSubjectValue}>
          {allSubjects.map((subject, i) => {
              return (
                  <option value={subject} key={i}>{subject}</option>
              );
          })}
      </select>
  );
};

const Filters = ({ filterHandler, state, translations }) => {

  const authorClass = (state.targetGroupValue == 'all') ? 'hidden' : '';

  return (
    <div className="filter-content">
      <h3 className="filter-content-title">{translations.filterTitle}</h3>
      <div className="filter-radios">
              <label class="radio-container">
                  <input
                      className="radio-input"
                      type="radio"
                      name="Council" 
                      value="council"
                      data-option="radio"
                      onChange={filterHandler}
                      checked={state.targetGroupValue == "council"}
                      ></input>
                  <span class="radio-btn"></span>
                  <span className="radio-title">{translations.council}</span>
              </label>

              <label class="radio-container">
                  <input
                      className="radio-input"
                      type="radio"
                      name="Politician" 
                      value="politician"
                      data-option="radio"
                      onChange={filterHandler}
                      checked={state.targetGroupValue == "politician"}
                      ></input>
                  <span class="radio-btn"></span>
                  <span className="radio-title">{translations.politician}</span>
              </label>

              <label class="radio-container">
                  <input
                      className="radio-input"
                      type="radio"
                      name="All" 
                      value="all"
                      data-option="radio"
                      onChange={filterHandler}
                      checked={state.targetGroupValue == "all"}
                      ></input>
                  <span class="radio-btn"></span>
                  <span className="radio-title">{translations.all}</span>
              </label>
      </div>

      <div className="filter-selects">
          <div className={`author-select ${authorClass}`}>
              <span className="authors-label">{translations.writtenBy}</span>
              {state.authors.length > 0 ? renderAuthors(state.authors, filterHandler, state.targetAuthorValue) : ''}
          </div>
          <div className="subject-select">
              <span className="subjects-label">{translations.subject}</span>
              {state.allSubjects.length > 0 ? renderSubjects(state.allSubjects, filterHandler, state.targetSubjectValue) : ''}
          </div>
      </div>
  </div>
  );
};
export default Filters;
