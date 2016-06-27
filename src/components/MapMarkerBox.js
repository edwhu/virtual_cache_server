import React, { Component } from 'react';
import {MapMarkerBoxStyle} from '../style/MapMarkerBoxStyle.js'
export default class MapMarkerBox extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		const cache = this.props.data.cache
			.map(function(x){
				return {name:x.name, size:x.size};
			});
		return (
		<div style={MapMarkerBoxStyle}>
			<table>
				<tbody>
					<tr>
						<td>name</td>
						<td>{this.props.data.name}</td>
					</tr>
					<tr>
						<td>loc</td>
						<td>{this.props.data.loc.toString()}</td>
					</tr>
					<tr>
						<td>cache</td>
						<td>{JSON.stringify(cache, null, '\t')}</td>
					</tr>
					<tr>
						<td>time</td>
						<td>{this.props.data.time}</td>
					</tr>
				</tbody>
			</table>
		</div>
		);
	}
}
