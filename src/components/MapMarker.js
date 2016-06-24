import React, {PropTypes, Component} from 'react';
import shallowCompare from 'react-addons-shallow-compare';

import {MapMarkerStyle} from '../style/MapMarkerStyles.js';

export default class MyGreatPlace extends Component {
	static propTypes = {
		text: PropTypes.string
	};

	shouldComponentUpdate = shallowCompare;

	constructor(props) {
		super(props);;
	}

	render() {
		return (
			 <div style={MapMarkerStyle}>
					{this.props.text}
			 </div>
		);
	}
}
