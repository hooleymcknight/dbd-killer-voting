import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import VotingApp from './votingApp.jsx';

function render() {
    const root = createRoot(document.getElementById('app-content'));
    root.render(<VotingApp></VotingApp>);
}

render();