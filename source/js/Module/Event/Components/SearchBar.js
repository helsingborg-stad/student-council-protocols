const SearchBar = ({ updateSearchString, handleKeyUp, clickEvent, searchPlaceholderString, searchAllPostsString }) => (
    <div className="search-field">
        <div className="input-group">
            <input
                type="text"
                id="filter-keyword"
                className="form-control search-input"
                onChange={updateSearchString}
                onKeyUp={handleKeyUp}
                placeholder={searchPlaceholderString}
            />
            <a onClick={clickEvent} class="input-search-submit-icon">
                <i class="fa fa-search"></i>
            </a>
        </div>
        <a class="btn-oval search-submit-btn" onClick={clickEvent}>
            <span className="input-group-addon">
                <i className="fa fa-search fa-search-white" />
                {searchAllPostsString}
            </span>
        </a>
    </div>
);
export default SearchBar;
