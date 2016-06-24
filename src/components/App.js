import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import fetch from 'isomorphic-fetch'

import TextAreas from './TextAreas.js'
import SimpleMap from './SimpleMap.js'

const API_URL = 'http://localhost:3000/db'
//this should get the Database information on load and then populate the
//textareas and google map.
class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data:['loading data', 'loading data']
		};
		fetch(API_URL, {
			method:'GET'
		})
		.then(response => {
			return response.json();
		})
		.then(json => {
			return this.setState({data:json})
		})
		.catch(err => {
			console.error(err);
		});
	}
	render() {
		return (
			<div>
				<TextAreas readOnly data={this.state.data}/>
				<SimpleMap markers={this.state.data} />
			</div>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
