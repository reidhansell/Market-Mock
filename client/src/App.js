import logo from './logo.svg';
import './App.css';

/* Example request to Express
fetch('/api')
  .then(response => response.text())
  .then(message => {
    // The message from your Express app will appear here
    console.log(message);
  });
*/

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
