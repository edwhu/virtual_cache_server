import React, {PropTypes, Component} from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import MapMarkerBox from './MapMarkerBox.js'
import {MapMarkerStyle} from '../style/MapMarkerStyle.js';

export default class MapMarker extends Component {
	shouldComponentUpdate = shallowCompare;

	constructor(props) {
		super(props);
	}
	render() {
		//console.log('MapMarker', this.props.data);
		return (
			 <div style={MapMarkerStyle}>
				 	{this.props.text}
					{this.props.$hover ? <MapMarkerBox data={this.props.data} /> : null}
			 </div>
		);
	}
}
