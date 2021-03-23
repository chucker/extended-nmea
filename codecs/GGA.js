import {
	computeChecksum,
	encodeAltitude,
	encodeDegrees,
	encodeFixed,
	encodeGeoidalSeperation,
	encodeTime,
	encodeValue
} from "../helpers.js";

export const TYPE = 'fix';
export const ID = 'GGA';

/*
                                                     11
       1         2       3 4        5 6 7  8   9  10 |  12 13  14  15
       |         |       | |        | | |  |   |   | |   | |   |   |
$--GGA,hhmmss.ss,llll.ll,a,yyyyy.yy,a,x,xx,x.x,x.x,M,x.x,M,x.x,xxxx*hh
 1) Time (UTC)
 2) Latitude
 3) N or S (North or South)
 4) Longitude
 5) E or W (East or West)
 6) GPS Quality Indicator,
 0 - fix not available,
 1 - GPS fix,
 2 - Differential GPS fix
 7) Number of satellites in view, 00 - 12
 8) Horizontal Dilution of precision
 9) Antenna Altitude above/below mean-sea-level (geoid)
10) Units of antenna altitude, meters
11) Geoidal separation, the difference between the WGS-84 earth
 ellipsoid and mean-sea-level (geoid), "-" means mean-sea-level below ellipsoid
12) Units of geoidal separation, meters
13) Age of differential GPS data, time in seconds since last SC104
 type 1 or 9 update, null field when DGPS is not used
14) Differential reference station ID, 0000-1023
15) Checksum
*/
const FIX_TYPE = ['none', 'fix', 'delta', 'pps', 'rtk', 'frtk', 'estimated', 'manual', 'simulation'];

export function decode(fields) {
	return {
		sentence: ID,
		type: TYPE,
		timestamp: fields[1],
		lat: fields[2],
		latPole: fields[3],
		lon: fields[4],
		lonPole: fields[5],
		fixType: FIX_TYPE[+fields[6]],
		numSat: +fields[7],
		horDilution: +fields[8],
		alt: +fields[9],
		altUnit: fields[10],
		geoidalSep: +fields[11],
		geoidalSepUnit: fields[12],
		differentialAge: +fields[13],
		differentialRefStn: fields[14]
	};
}

export function encode(talker, msg) {
	const result = ['$' + talker + ID];
	result.push(encodeTime(msg.timestamp));
	result.push(encodeDegrees(msg.lat));
	result.push(msg.latPole);
	result.push(encodeDegrees(msg.lon));
	result.push(msg.lonPole);
	result.push(FIX_TYPE.indexOf(msg.fixType).toFixed(0));
	result.push(encodeValue(msg.numSat));
	result.push(encodeFixed(msg.horDilution, 1));
	result.push(encodeAltitude(msg.alt));
	result.push(encodeGeoidalSeperation(msg.geoidalSep));
	result.push(encodeFixed(msg.differentialAge, 2));
	result.push(msg.differentialRefStn);

	const resultMsg = result.join(',');
	return resultMsg + computeChecksum(resultMsg);
}
