
const SearchBar = ({ updateSearchString, handleKeyUp, searchSubmitHandler, searchPlaceholderString, searchAllPostsString, searchError }) => (
    <div className="search-field">
        <div className="input-group">
            <input
                type="text"
                id="filter-keyword"
                className={`form-control search-input ${searchError ? 'search-error' : ''}`}
                onChange={updateSearchString}
                onKeyUp={handleKeyUp}
                placeholder={searchPlaceholderString}
            />
            <a onClick={searchSubmitHandler} class="input-search-submit-icon">
                <i class="fa fa-search"></i>
            </a>
        </div>
        <a class="btn-oval search-submit-btn" onClick={searchSubmitHandler}>
            <span className="input-group-addon">
                <i className="fa fa-search fa-search-white" />
                {searchAllPostsString}
            </span>
        </a>
    </div>
);
export default SearchBar;
