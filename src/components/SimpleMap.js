import React, {PropTypes, Component} from 'react';
import shallowCompare from 'react-addons-shallow-compare';

import GoogleMap from 'google-map-react';
import MapMarker from './MapMarker.js';
import {SimpleMapStyle} from '../style/SimpleMapStyle.js'

const API_KEY = 'AIzaSyCkxJlKBChQSWZnA2W-9AXH1swCLI_cIC0';

export default class SimpleMapPage extends Component {
	static defaultProps = {
		center: {lng: -118.2802813, lat: 34.0290102},
		zoom: 0,
		gamepipe: {lng: -118.2802813, lat: 34.0290102}
	};

	shouldComponentUpdate = shallowCompare;

	constructor(props) {
		super(props);
	}

	render() {
		let markerArray = [];
		if(this.props.markers.length !== 0
			&& this.props.markers[0] !== 'loading data')
		{
			//console.log(this.props.markers);
			markerArray= this.props.markers[0].map(function(m){
				//console.log(m);
				return <MapMarker key={m['_id']}
					lng={m.loc[0]} lat={m.loc[1]}  text={m.name} />
			});
		}
		return (
			<div style={SimpleMapStyle}  >
				<GoogleMap
					bootstrapURLKeys={{key:API_KEY, language:'en'}}
					defaultCenter={this.props.center}
					defaultZoom={this.props.zoom}>
					<MapMarker {...this.props.gamepipe} text={'A'} /* road circle */ />
					{markerArray}
				</GoogleMap>
			</div>
		);
	}
}
