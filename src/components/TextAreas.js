import React, { Component } from 'react';

export default class TextAreas extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div>
				<textarea readOnly
				value={JSON.stringify(this.props.data[0],null,4)} rows="30" cols="50"></textarea>
				<textarea readOnly
				value={JSON.stringify(this.props.data[1],null,4)} rows="30" cols="50"></textarea>
			</div>
		);
	}
}
