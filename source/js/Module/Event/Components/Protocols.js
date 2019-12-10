import SearchBar from './SearchBar';
import ReactPaginate from 'react-paginate';

import Card from './Card';
import Filters from './Filters';
import ShowAsList from './ShowAsList';
import SearchingOverlay from './SearchingOverlay';
import ProtocolsButtons from './ProtocolsButtons';

class Protocols extends React.Component {
    constructor(props) {
        super(props);

        const {
            showAsList
        } = reactData.translations;

        this.state = {
            searching: true,
            pageCount: null,
            protocolsPerPage: 4,
            totalProtocols: '...',
            selectedPage: 0,
            offset: 0,
            protocolTruncateSize: 100,
            protocols: [],
            filteredProtocols: [],
            users: [],
            authors: [],
            allSubjects: [],
            searchString: '',
            dataOption: 'radio',
            targetGroupValue: 'council',
            targetAuthorValue: this.translatedString('All councils'),
            targetSubjectValue: this.translatedString('All subjects'),
            targetOrderValue: 'latest',
            showAs: 'cards',
            showAsText: showAsList
        };

        this.paginateRef = React.createRef();
    }

    getDate = () => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        d.setHours(0, 0, 0);
        d.setMilliseconds(0);
        
        return d.toISOString();
    }

    getParams = () => {
        return (window.location.search.indexOf('subject') !== -1) ? window.location.search.split('=')[1] : null;
    }

    getFetchUrl = () => {

        const { 
            searchString,
            targetGroupValue, 
            targetAuthorValue, 
            targetSubjectValue,
            targetOrderValue,
            protocolsPerPage, 
            offset
        } = this.state;

        const date = this.getDate();
        const params = this.getParams();

        const baseUrl = `${reactData.site_url}/wp-json/wp/v2/protocol`;
        const wpNonce = `?_wpnonce=${reactData.nonce}`;
        const perPage = `&per_page=${protocolsPerPage}`;
        const offSet = `&offset=${offset}`;

        const filteredGroupValue = this.filterTargetValue(targetGroupValue);
        const filteredAuthorValue = this.filterTargetValue(targetAuthorValue);
        const filteredSubjectValue = this.filterTargetValue(targetSubjectValue);
        const filteredOrderValue = this.filterTargetValue(targetOrderValue);

        const searchQuery = searchString ? `&search=${searchString}` : ''; 
        const targetQuery = filteredGroupValue ? `&filter[protocol_target_groups]=${filteredGroupValue}` : '';
        const authorQuery = filteredAuthorValue ? `&filter[meta_query][0][key]=name_of_council_or_politician&filter[meta_query][0][value]=${filteredAuthorValue}` : '';
        const subjectQuery = (filteredSubjectValue || params) ? `&filter[meta_query][1][key]=subjects&filter[meta_query][1][value]=${params ? params : filteredSubjectValue}&filter[meta_query][1][compare]=LIKE` : '';
        const visitQuery = (filteredOrderValue == 'viewed') ? `&after=${date}&filter[orderby]=meta_value_num&filter[meta_key]=number_of_visits` : '';

        let url;

        if (params) {
            url = baseUrl + wpNonce + perPage + offSet + subjectQuery;
        } else {
            url = baseUrl + wpNonce + perPage + offSet + visitQuery + searchQuery + targetQuery + authorQuery + subjectQuery;
        }

        return url;

    }

    componentDidMount() {
        this.getAllUsers();
    }

    getAllUsers = () => {
        const url = `https://single.local/wp-json/wp/v2/users`;

        fetch(url).then(response => {
            return response.json();
        }).then(res => {
            this.setState({
                allAuthors: [{
                    politicians: res.politicians,
                    schools: res.schools
                }]
            }, () => {
                this.getAllProtocols();
            })
        }).catch(err => {
            console.log(err);
        });
    }

    
    getAllProtocols = () => {

        this.setState({
            searching:true
        });

        const {
            targetGroupValue,
            targetSubjectValue
        } = this.state;

        const url = this.getFetchUrl();

        fetch(url).then(response => {
            return response.json()
            .then(data => {
                return  {
                    'data': data,
                    'x-wp-total': response.headers.get('X-WP-Total'),
                    'x-wp-totalPages': response.headers.get('X-WP-TotalPages'),
                };
            })
        }).then(res => {

            if (res.data.length > 0) {

                const mappedSubjects = res.data[0].metadata.data.allSubjects.map(subject => subject.value);
                const params = this.getParams();
                
                // Clear Params
                window.history.pushState({}, document.title, '/protocol');

                this.setState({
                    targetGroupValue: params ? 'all' : targetGroupValue,
                    targetSubjectValue: params ? params : targetSubjectValue,
                    protocols: res.data,
                    filteredProtocols: res.data,
                    councilProtocols: this.filterProtocols(res.data, 'council'),
                    politicianProtocols: this.filterProtocols(res.data, 'politician'),
                    allSubjects: [this.translatedString('All subjects'), ...mappedSubjects],
                    pageCount: res['x-wp-totalPages'],
                    totalProtocols: res['x-wp-total'],
                    searching: false,
                    authors: this.checkAuthors(),
                })
            } else {
                this.setState({
                    protocols: res.data,
                    filteredProtocols: res.data,
                    searching: false
                })
            }
        }).catch(err => {
            console.log(err);
        })
    }

    setProtocols = () => {
        this.setState({
            filteredProtocols: this.filterAllProtocols(),
            targetAuthorValue: this.checkAuthorTargetValue(),
            authors: this.checkAuthors()
        });
    }

    filterTargetValue = targetValue => {
        return (targetValue.toLowerCase().indexOf('all') === -1) ? targetValue : null;
    }

    filterProtocols = (protocols, targetGroupValue) => {
        return protocols.filter(protocol => protocol.metadata.data.target_group[0] == targetGroupValue);
    }

    filterHandler = (e) => {
        e.persist();
        const dataOption = e.target.getAttribute('data-option');
        switch(dataOption) {
            case 'radio':
                this.paginateRef.current.state.selected = 0
                this.setState({
                    targetGroupValue: e.target.value,
                    targetAuthorValue: this.checkAuthorTargetValue(),
                    offset: 0,
                    selectedPage: 0
                }, () => {
                    this.getAllProtocols();
                })
            break;

            case 'authors':
                this.paginateRef.current.state.selected = 0
                this.setState({
                    targetAuthorValue: e.target.value,
                    authors: this.checkAuthors(),
                    offset: 0,
                    selectedPage: 0
                }, () => {
                    this.getAllProtocols();
                })
            break;

            case 'subjects':
                this.paginateRef.current.state.selected = 0
                this.setState({
                    targetSubjectValue: e.target.value,
                    offset: 0,
                    selectedPage: 0
                }, () => {
                    this.getAllProtocols();
                })
            break;
        }
    }


    /**
     * Search string change handler
     * @param e
     */
    updateSearchString = e => {
        this.setState({
            searchString: e.target.value,
        });
    };

    handleKeyUp = e => {
        e.persist();
        if (e.keyCode === 13) {
            this.searchSubmit(e);
        }
        if (!e.target.value) {
            this.getAllProtocols();
        }
    }

    /**
     * Submit form handler
     * @param e
     */
    searchSubmit = e => {
        e.preventDefault();
        e.persist();
        this.paginateRef.current.state.selected = 0
        this.setState({
            targetGroupValue: 'all',
            targetAuthorValue: 'Alla ...',
            targetSubjectValue: this.translatedString('All subjects')
        }, () => this.getAllProtocols());
    
    };

    handlePageClick = data => {
        let selectedPage = data.selected;
        let offset = Math.ceil(selectedPage * this.state.protocolsPerPage);

        this.setState({ offset, selectedPage }, () => this.getAllProtocols());
    }


    buttonClick = e => {
        e.persist();
        e.preventDefault();
        const dataButton = e.target.getAttribute('data-button');
        this.setState({
            targetOrderValue: dataButton
        }, () => this.getAllProtocols());
    }

    showAsHandler = e => {
        e.persist();
        e.preventDefault();

        const {
            showAsCards,
            showAsList
        } = reactData.translations;

        const showAsValue = e.target.getAttribute('data-showAs');

        switch (showAsValue) {
            case 'cards':
                this.setState({
                    showAs: 'list',
                    showAsText: showAsCards,
                    protocolTruncateSize: 350
                });
            break;

            case 'list':
                this.setState({
                    showAs: 'cards',
                    showAsText: showAsList,
                    protocolTruncateSize: 100
                });
            break;

            default:
                this.setState({
                    showAs: 'cards',
                    showAsText: showAsList,
                    protocolTruncateSize: 100
                });
        }
    }

    checkAuthors = () => {
        const { allAuthors, targetGroupValue } = this.state;

        if (targetGroupValue == "all") {
            let authorCollection = [...allAuthors[0].schools, ...allAuthors[0].politicians].sort();
            return ['Alla ...', ...authorCollection];
        } else {
            const authors = (targetGroupValue == "council") ? allAuthors[0].schools : allAuthors[0].politicians;
            return [this.translatedString(`All ${targetGroupValue}s`), ...authors];
        }
    }

    checkAuthorTargetValue = () => {
        const { targetGroupValue } = this.state;
        let targetAuthorValue;

        switch(targetGroupValue) {
            case 'all':
                targetAuthorValue = 'Alla ...';
            break;

            case 'council':
                targetAuthorValue = this.translatedString('All councils');
            break;

            case 'politician':
                targetAuthorValue = this.translatedString('All politicians');
            break;
        }

        return targetAuthorValue;
    }

    translatedString = (string) => {

        const {
            allCouncils,
            allPoliticians,
            allSubjectsText,
        } = reactData.translations;

        switch(string) {
            case 'All councils':
                return allCouncils;
            break;

            case 'All politicians':
                return allPoliticians;
            break;

            case 'All subjects':
                return allSubjectsText;
            break;
        }
    }

    render() {
        const {
            filteredProtocols,
            pageCount,
            selectedPage,
        } = this.state;

        const {
            pageTitle,
            searchPlaceholder,
            searchAllPosts,
            previous,
            next
        } = reactData.translations;

        return (
            <div>
                <div className="container">
                    <h1 className="protocols-title">{pageTitle}</h1>
                    <SearchBar updateSearchString={this.updateSearchString} handleKeyUp={this.handleKeyUp} clickEvent={this.searchSubmit} searchPlaceholderString={searchPlaceholder} searchAllPostsString={searchAllPosts}/>
                    <Filters state={this.state} filterHandler={this.filterHandler} translations={reactData.translations}/>
                    <ShowAsList translations={reactData.translations} state={this.state} showAsHandler={this.showAsHandler}/>
                </div>
                <div className="protocols">
                    <SearchingOverlay searching={this.state.searching}/>
                    <div className="container">
                        <ProtocolsButtons translations={reactData.translations} buttonClick={this.buttonClick} state={this.state}/>
                        <Card protocols={filteredProtocols} translations={reactData.translations} state={this.state} />
                    </div>
                </div>
                <ReactPaginate
                    ref={this.paginateRef}
                    previousLabel={previous}
                    nextLabel={next}
                    breakLabel={'...'}
                    breakClassName={'break-me'}
                    pageCount={pageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    forceSelected={selectedPage}
                    onPageChange={this.handlePageClick}
                    containerClassName={'pagination'}
                    subContainerClassName={'pages pagination'}
                    activeClassName={'active'}
                    />
            </div>
        );
    }
}

export default Protocols;
