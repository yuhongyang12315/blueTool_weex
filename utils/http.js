var token = 'moyu_c_open_token';//本地token值
var musername = 'musername';//姓名
var admin_id = 'admin_id';//标识
var mianJurisdiction = 'mianJurisdiction';//权限数组

var toast_short = 2000;//弹窗时间短
var toast_long = 3000;//弹窗时间长

var API_SERVER = 'https://t2.uma.com/v2/';
// var API_SERVER = 'https://mofisher-wapp.uma.com/v2/';
var sucCode = 2000;//请求成功code
var loginFailCode = 1015;//登录异常code
var loginTimeout= 1016;//登录超时
var userNoLoginCode = 1011;//用户未登录


/**
 * GET请求
 */
function httpGet(req) {
	wx.getStorage({
		key: token,
		success: function (res) {
			var token = res.data;
			if (token != null) {
				logReqUrl(req);
				wx.request({
					url: API_SERVER + req.url + '?_tk=' + token + '&' + req.param,
					complete: function (msg) {
						req.complete(msg);
					},
					success: function (result) {
						if (result.statusCode == 200) {//接口调用返回伟200的时候才代表成功
							// req.success(result);
							if (result.data.code == sucCode) {
								//成功直接将数据返回给页面
								req.success(result);
							} else if (result.data.code == loginFailCode) {
								//登录异常时重启应用到登录页面进行登录
								wx.showToast({
									title: '登录失效',
									duration: toast_short
								})
								//延时执行页面跳转 为了提示登录成功 好看
								setTimeout(function () {
									wx.reLaunch({
										url: '../login/login',
									})
								}, toast_short);
							} else {
								//弹窗提示不友好，自己做记录出来
								// wx.showModal({
								// 	title: '错误提示',
								// 	content: '错误码：' + result.data.code + ' / ' + '错误信息：' + result.data.sucinfo,
								// 	showCancel: false,
								// 	confirmText: '我知道了',
								// })

								console.log(result);
								//其他的code码返回到页面自行处理
								if (result.data.sucinfo == null || result.data.sucinfo == '' || result.data.sucinfo == undefined) {
									var code;
									if (result.data.code == undefined) {
										code = '未知';
									} else {
										code = result.data.code;
									}
									result = {
										data: {
											sucinfo: '请求错误：' + code,
										}
									}
								}
								req.fail(result);
							}
						} else {
							//弹窗提示不友好，自己做记录出来最好
							wx.showModal({
								title: '错误提示',
								content: '错误码：' + result.statusCode + ' / ' + '错误信息：' + result.errMsg,
								showCancel: false,
								confirmText: '我知道了',
							})
							console.log('http : ' + '错误码：' + result.statusCode + ' / ' + '错误信息：' + result.errMsg);
						}
					},
					fail: function (e) {
						req.fail(e);
					}
				})
			} else {
				//获取不到本地token需要重新去登录
				wx.showToast({
					title: '登录失效',
					duration: toast_short
				})
				//延时执行页面跳转 为了提示登录成功 好看
				setTimeout(function () {
					wx.reLaunch({
						url: '../login/login',
					})
				}, toast_short);
			}
		},
		fail: function (e) {
			//获取不到本地token需要重新去登录
			wx.showToast({
				title: '登录失效',
				duration: toast_short
			})
			//延时执行页面跳转 为了提示登录成功 好看
			setTimeout(function () {
				wx.reLaunch({
					url: '../login/login',
				})
			}, toast_short);
		}
	})
};

/**
 * POST请求
 */
function httpPost(req) {
	var showLoading = false;//是否需要显示loading
	wx.getStorage({
		key: token,
		success: function (res) {
			var token = res.data;
			if (token != null) {
        req.param['user_id'] = '' + token;//在这里赋值token
				// req.param['timestamp'] = '' + Date.parse(new Date());;//随机时间戳 防止缓存
				logReqUrl(req);

				//是否显示loading
				if (req.loading != null && req.loading != '' && req.loading != undefined && req.loading != 'undefined') {
					wx.showLoading({
						title: req.loading,
					})
					showLoading = true;
				}

				wx.request({
					url: API_SERVER + req.url,
					data: req.param,
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					method: 'POST',
					complete: function (msg) {
						if (showLoading) {
							wx.hideLoading();
						}
						req.complete(msg);
					},
					success: function (result) {
						if (result.statusCode == 200) {//接口调用返回伟200的时候才代表成功
							// req.success(result);
							if (result.data.code == sucCode) {
								//成功直接将数据返回给页面
								req.success(result);
              } else if (result.data.code == loginFailCode || result.data.code == loginTimeout) {
								wx.removeStorage({
									key: token,
								})
								//登录异常时重启应用到登录页面进行登录
								wx.showToast({
									title: '登录失效',
									duration: toast_short
								})
								//延时执行页面跳转 为了提示登录成功 好看
								setTimeout(function () {
									wx.reLaunch({
										url: '../login/login',
									})
								}, toast_short);
							} else {
								//弹窗提示不友好，自己做记录出来
								wx.showModal({
									title: '错误提示',
									content: '错误码：' + result.data.code + ' / ' + '错误信息：' + result.data.sucinfo,
									showCancel: false,
									confirmText: '我知道了',
								})
								//其他的code码返回到页面自行处理
								console.log(result);
								if (result.data.sucinfo == null || result.data.sucinfo == '' || result.data.sucinfo == undefined) {
									var code;
									if (result.data.code == undefined) {
										code = '未知';
									} else {
										code = result.data.code;
									}
									result = {
										data: {
											sucinfo: '请求错误：' + code,
										}
									}
								}
								req.fail(result);
							}
						} else {
							console.log(result);
							//弹窗提示不友好，自己做记录出来最好
							wx.showModal({
								title: '错误提示',
								content: '请求错误（错误码：' + result.statusCode + ' / ' + '错误信息：' + result.errMsg + '）',
								showCancel: false,
								confirmText: '我知道了',
							})
							console.log('请求错误 : ' + '错误码：' + result.statusCode + ' / ' + '错误信息：' + result.errMsg);
						}
					},
					fail: function (e) {
						//将接口调用不成功信息返回给页面
						req.fail(e);
					}
				})
			} else {
				//获取不到本地token需要重新去登录
				wx.showToast({
					title: '登录失效',
					duration: toast_short
				})
				//延时执行页面跳转 为了提示登录成功 好看
				setTimeout(function () {
					wx.reLaunch({
						url: '../login/login',
					})
				}, toast_short);
			}
		},
		fail: function (e) {
			//获取不到本地token需要重新去登录
			wx.showToast({
				title: '登录失效',
				duration: toast_short
			})
			//延时执行页面跳转 为了提示登录成功 好看
			setTimeout(function () {
				wx.reLaunch({
					url: '../login/login',
				})
			}, toast_short);
		}
	})
};

/**
 * POST请求 因为登录不需要判断本地token 所以独立出来
 */
function httpLogin(req) {
	var showLoading = false;//是否需要显示loading
	// req.param['timestamp'] = '' + Date.parse(new Date());;//随机时间戳 防止缓存

	logReqUrl(req);
	//是否显示loading
	if (req.loading != null && req.loading != '' && req.loading != undefined && req.loading != 'undefined') {
		wx.showLoading({
			title: req.loading,
		})
		showLoading = true;
	}

	wx.request({
		url: API_SERVER + req.url,
		data: req.param,
		header: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		method: 'POST',
		complete: function (msg) {
			if (showLoading) {
				wx.hideLoading();
			}
			req.complete(msg);
		},
		success: function (result) {
      console.log(result)
			if (result.statusCode == 200) {//接口调用返回伟200的时候才代表成功
				// req.success(result);
				if (result.data.code == sucCode) {
					//成功直接将数据返回给页面
					req.success(result);
				} else if (result.data.code == loginFailCode || result.data.code == userNoLoginCode) {
          
					wx.removeStorage({
						key: token,
					})
					//登录异常时重启应用到登录页面进行登录
					wx.showToast({
						title: '登录失效',
						duration: toast_short
					})
					//延时执行页面跳转 为了提示登录成功 好看
					// setTimeout(function () {
					// 	wx.reLaunch({
					// 		url: '../login/login',
					// 	})
					// }, toast_short);
				} else {
					//弹窗提示不友好，自己做记录出来
					wx.showModal({
						title: '错误提示',
						content: '错误码：' + result.data.code + ' / ' + '错误信息：' + result.data.sucinfo,
						showCancel: false,
						confirmText: '我知道了',
					})
					console.log(result);
					//其他的code码返回到页面自行处理
					if (result.data.sucinfo == null || result.data.sucinfo == '' || result.data.sucinfo == undefined) {
						var code;
						if (result.data.code == undefined) {
							code = '未知';
						} else {
							code = result.data.code;
						}
						result = {
							data: {
								sucinfo: '请求错误：' + code,
							}
						}
					}
					req.fail(result);
				}
			} else {
				//弹窗提示不友好，自己做记录出来最好
				wx.showModal({
					title: '错误提示',
					content: '请求错误（错误码：' + result.statusCode + ' / ' + '错误信息：' + result.errMsg + '）',
					showCancel: false,
					confirmText: '我知道了',
				})
				console.log('请求错误 : ' + '错误码：' + result.statusCode + ' / ' + '错误信息：' + result.errMsg);
			}
		},
		fail: function (e) {
			//将接口调用不成功信息返回给页面
			req.fail(e);
		}
	})
};

//打印请求
function logReqUrl(req) {
	//显示请求路径
	var url = '请求路径: ' + API_SERVER + req.url;
	var paramCount = count(req.param);
	if (paramCount > 0) {
		url += '?';
	}
	var i = 0;
	for (var item in req.param) {//用javascript的for/in循环遍历对象的属性 
		if (i != (paramCount - 1)) {//不是最后一个才加上&
			url += item + "=" + req.param[item] + '&';
		} else {
			url += item + "=" + req.param[item];
		}

		i++;
	}
	console.log(url);
}


/*获取对象、数组的长度、元素个数
   *@param obj 要计算长度的元素，可以为object、array、string
  */
function count(obj) {
	var objType = typeof obj;
	if (objType == "string") {
		return obj.length;
	} else if (objType == "object") {
		var objLen = 0;
		for (var i in obj) {
			objLen++;
		}
		return objLen;
	}
	return false;
}

// 导出模块
module.exports = {
	get: httpGet,
	post: httpPost,
	login: httpLogin,
	toast_short: toast_short,
	toast_long: toast_long,
	token: token,
	API_SERVER: API_SERVER,
}