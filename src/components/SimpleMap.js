import React, {PropTypes, Component} from 'react';
import shallowCompare from 'react-addons-shallow-compare';

import GoogleMap from 'google-map-react';
import MapMarker from './MapMarker.js';
import {SimpleMapStyle} from '../style/SimpleMapStyle.js'

// const API_KEY = 'AIzaSyCkxJlKBChQSWZnA2W-9AXH1swCLI_cIC0';
const API_KEY = require('../../env.js').API_KEY;

export default class SimpleMapPage extends Component {
	static defaultProps = {
		center: {lng: -118.2802813, lat: 34.0290102},
		zoom: 0,
	};

	shouldComponentUpdate = shallowCompare;

	constructor(props) {
		super(props);
	}

	render() {
		let markerArray = null;
		if(this.props.markers.length !== 0
			&& this.props.markers[0] !== 'loading data')
		{
			//console.log("marker array",this.props.markers);
			markerArray= this.props.markers[0].map(m => <MapMarker key={m['_id']}
					lng={m.loc[0]} lat={m.loc[1]} data={m}/>
			);
		}
		return (
			<div style={SimpleMapStyle}  >
				<GoogleMap
					bootstrapURLKeys={{key:API_KEY, language:'en'}}
					defaultCenter={this.props.center}
					defaultZoom={this.props.zoom}>
					{markerArray}
				</GoogleMap>
			</div>
		);
	}
}
