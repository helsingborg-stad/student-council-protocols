// Polyfills
import 'es6-promise';
import 'isomorphic-fetch';
// Components
import Protocols from './Components/Protocols';

const element = document.getElementsByClassName('react-root')[0];

ReactDOM.render(
    <Protocols/>,
    element
);