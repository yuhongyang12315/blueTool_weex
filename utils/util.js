const formatTime = date => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()

	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}

//获取距离
function getDistance(distance) {
	var distanceStr = '0米';
	if (distance < 1000) {
		distanceStr = distance + '米';
	} else {
		distanceStr = (distance / 1000.0).toFixed(1) + '千米';
	}
	return distanceStr;
}

//获取时间
function getDuration(duration) {
	var time = '0分钟';
	var m = (duration / 60).toFixed(0);
	console.log(m);
	if (m < 60) {
		return m + '分钟';
	} else if (m % 60 == 0) {
		return (m / 60).toFixed(0) + '小时';
	} else {
		return (m / 60).toFixed(0) + '小时' + m % 60 + '分钟';
	}

	return time;
}
//根据时间戳获取格式化时间
function getTime(time, format) {
	var data = new Date(parseInt(time) * 1000);
	return data.Format(format);
}
//格式化时间
Date.prototype.Format = function (fmt) { //author: meizz 
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + ""));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

//获取地图缩放视角
function getScale(distance) {
	var scale = 16;
	if (distance > 0 && distance < 25) {
		scale = 19;
	} else if (distance >= 25 && distance < 50) {
		scale = 18;
	} else if (distance >= 50 && distance < 100) {
		scale = 17;
	} else if (distance >= 100 && distance < 200) {
		scale = 16;
	} else if (distance >= 200 && distance < 500) {
		scale = 15;
	} else if (distance >= 500 && distance < 1000) {
		scale = 14;
	} else if (distance >= 1000 && distance < 2000) {
		scale = 13;
	} else if (distance >= 2000 && distance < 5000) {
		scale = 12;
	} else if (distance >= 5000 && distance < 10000) {
		scale = 11;
	} else if (distance >= 10000 && distance < 20000) {
		scale = 10;
	} else if (distance >= 20000 && distance < 50000) {
		scale = 9;
	} else if (distance >= 50000 && distance < 100000) {
		scale = 8;
	} else if (distance >= 100000 && distance < 200000) {
		scale = 7;
	} else if (distance >= 200000 && distance < 500000) {
		scale = 6;
	} else if (distance >= 500000 && distance < 1000000) {
		scale = 5;
	} else if (distance >= 1000000 && distance < 2000000) {
		scale = 4;
	} else if (distance >= 2000000 && distance < 5000000) {
		scale = 3;
	} else if (distance >= 5000000 && distance < 10000000) {
		scale = 2;
	} else {
		scale = 1;
	}
	return scale;
}

module.exports = {
	formatTime: formatTime,
	getDistance: getDistance,
	getDuration: getDuration,
	getScale: getScale,
	getTime: getTime,
}
