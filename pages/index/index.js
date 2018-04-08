const base = getApp().constants;
var that
var temp = []
var serviceId = "0000ffe0-0000-1000-8000-00805f9b34fb"
var characteristicId = "0000ffe1-0000-1000-8000-00805f9b34fb"
Page({
  data: {
    isbluetoothready: false,
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: false,
    loading: false,
    searchingstatus: false,
    receivedata: '',
    onreceiving: false,
    nameString: 'blueNameTest-YHY'
  },
  onLoad: function () {
    that = this;
    // var str = "A13";
    // // var code = str.charCodeAt();
    // console.log(str.length)
    // console.log(str.charAt(0))
    // wx.showToast({
    //     title: '连接成功',
    //     icon: 'success',
    //     duration: 2000
    // })
    // let buffer = new ArrayBuffer(16)
    // let dataView = new DataView(buffer)
    // dataView.setUint8(1, 6)
    //console.log(dataView.getUint8(1))
  },
  switchBlueTooth: function () {
    var that = this

    that.setData({
      isbluetoothready: !that.data.isbluetoothready,
    })

    if (that.data.isbluetoothready) {
      wx.openBluetoothAdapter({
        success: function (res) {
          console.log("初始化蓝牙适配器成功")
          //蓝牙适配器状态发生变化会回调该方法(监听蓝牙适配器状态变化事件)
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log("蓝牙适配器状态变化", res)
            that.setData({
              isbluetoothready: res.available,
              searchingstatus: res.discovering
            })
          })
          //寻找到新设备的回调（监听寻找到新设备的事件）
          wx.onBluetoothDeviceFound(function (devices) {
            console.log(devices.devices[0])
            console.log('发现新蓝牙设备')
            temp.push(devices.devices[0])
            console.log('设备id' + devices.devices[0].deviceId)
            console.log('设备name' + devices.devices[0].name)
            that.setData({
              devices: temp
            })

          })
          //notify启动成功后，会回调这个方法（监听低功耗蓝牙设备的特征值变化。必须先启用notify接口才能接收到设备推送的notification。）
          wx.onBLECharacteristicValueChange(function (characteristic) {
            console.log('characteristic value comed:')
            let buffer = characteristic.value
            let dataView = new DataView(buffer)
            console.log("接收字节长度:" + dataView.byteLength)
            var str = ""
            for (var i = 0; i < dataView.byteLength; i++) {
              str += String.fromCharCode(dataView.getUint8(i))
            }
            str = getNowFormatDate() + "收到数据:" + str;
            that.setData({
              receivedata: that.data.receivedata + "\n" + str,
              onreceiving: true
            })
          })
        },
        fail: function (res) {
          console.log("初始化蓝牙适配器失败")
          wx.showModal({
            title: '提示',
            content: '请检查手机蓝牙是否打开',
            success: function (res) {
              that.setData({
                isbluetoothready: false,
                searchingstatus: false
              })
            }
          })
        }
      })
    } else {
      // 清空设备列表数组
      temp = []
      // 断开与低功耗蓝牙设备的连接
      wx.closeBLEConnection({
        deviceId: that.data.connectedDeviceId,
        complete: function (res) {
          console.log(res)
          that.setData({
            deviceconnected: false,
            connectedDeviceId: ""
          })
        }
      })
      // 关闭蓝牙模块，使其进入未初始化状态。
      wx.closeBluetoothAdapter({
        success: function (res) {
          console.log(res)
          that.setData({
            isbluetoothready: false,
            deviceconnected: false,
            devices: [],
            searchingstatus: false,
            receivedata: ''
          })
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '请检查手机蓝牙是否打开',
            success: function (res) {
              that.setData({
                isbluetoothready: false
              })
            }
          })
        }
      })
    }
  },
  //开始搜索附近蓝牙设备
  searchbluetooth: function () {
    temp = []
    var that = this
    if (!that.data.searchingstatus) {
      var that = this
      wx.startBluetoothDevicesDiscovery({
        // 目的地2.0主服务 UUID 为FF12
        services: ['FF12'],
        success: function (res) {
          console.log("开始搜索附近蓝牙设备")
          console.log(res)
          that.setData({
            searchingstatus: !that.data.searchingstatus
          })
        }
      })
    } else {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("停止蓝牙搜索")
          console.log(res)
        }
      })
    }
  },
  //设备连接
  connectTO: function (e) {
    var that = this
    if (that.data.deviceconnected) {
      wx.notifyBLECharacteristicValueChanged({
        state: false, // 停用notify 功能
        deviceId: that.data.connectedDeviceId,
        serviceId: serviceId,
        characteristicId: characteristicId,
        success: function (res) {
          console.log("停用notify 功能")
        }
      })
      wx.closeBLEConnection({
        deviceId: e.currentTarget.id,
        complete: function (res) {
          console.log("断开设备")
          console.log(res)
          that.setData({
            deviceconnected: false,
            connectedDeviceId: "",
            receivedata: ""
          })
        }
      })
    } else {
      wx.showLoading({
        title: '连接蓝牙设备中...',
      })
      // 用设备搜索时获取的id尝试连接，如果成功，则该id就为deviceId，
      wx.createBLEConnection({
        deviceId: e.currentTarget.id,
        success: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '连接成功',
            icon: 'success',
            duration: 1000
          })
          console.log("连接设备成功,设备deviceId=" + e.currentTarget.id)
          console.log(res)
          that.setData({
            deviceconnected: true,
            connectedDeviceId: e.currentTarget.id
          })

          // 获取serviceId
          wx.getBLEDeviceServices({
            // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
            deviceId: that.data.connectedDeviceId,
            success: function (res) {
              console.log("获取servicesId失败")
              console.log('device services:', res.services)
              serviceId = '0000FF12-0000-1000-8000-00805F9B34FB';

              // 获取characteristicId
              wx.getBLEDeviceCharacteristics({
                // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                deviceId: that.data.connectedDeviceId,
                // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                serviceId: serviceId,
                success: function (res) {
                  console.log('获取characteristicId成功')
                  console.log('device getBLEDeviceCharacteristics:', res.characteristics)
                  characteristicId = '0000FF02-0000-1000-8000-00805F9B34FB';
                  //启用notify

                }, fail: function (res) {
                  console.log(res)
                  console.log("获取characteristicId失败")
                }
              })

            }, fail: function (res) {
              console.log(res)
              console.log("获取servicesId失败")
            }
          })


        },
        fail: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '连接设备失败',
            icon: 'success',
            duration: 1000
          })
          console.log("连接设备失败")
          console.log(res)
          that.setData({
            connected: false
          })
        }
      })
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("停止蓝牙搜索")
          console.log(res)
        }
      })
    }
  },
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value.senddata)
    var senddata = e.detail.value.senddata;
    var that = this
    let buffer = new ArrayBuffer(senddata.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < senddata.length; i++) {
      dataView.setUint8(i, senddata.charAt(i).charCodeAt())
    }
    wx.writeBLECharacteristicValue({
      deviceId: that.data.connectedDeviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: buffer,
      success: function (res) {
        console.log(res)
        console.log('writeBLECharacteristicValue success', res.errMsg)
      }
    })
  },
  formReset: function () {
    console.log('form发生了reset事件')
  },
  clearAction: function () {

    this.setData({
      receivedata: ''
    })
  },
  openNotifyAction: function () {
    // 启用 notify 功能
    wx.notifyBLECharacteristicValueChanged({
      state: true,
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: serviceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: '0000FF02-0000-1000-8000-00805F9B34FB',
      success: function (res) {
        console.log(res)
        console.log("启用notify成功")
      },
      fail: function (res) {
        console.log(res)
        console.log("启用notify失败")
      }
    })
  },
  closeNotifyAction: function () {
    wx.notifyBLECharacteristicValueChanged({
      state: false, // 停用notify 功能
      deviceId: that.data.connectedDeviceId,
      serviceId: serviceId,
      characteristicId: '0000FF02-0000-1000-8000-00805F9B34FB',
      success: function (res) {
        console.log("停用notify 功能")
      }
    })
  },
  //输入框
  inputAction: function (e) {
    console.log(e.detail.value)
    this.setData({
      nameString: e.detail.value
    })
  },
  //写入操作
  writeEditAction: function (e) {
    console.log(e.currentTarget.dataset.readorwrite)
    if (e.currentTarget.dataset.readorwrite == "writename") {
      characteristicId = '0000FF06-0000-1000-8000-00805F9B34FB'
    }
    if (e.currentTarget.dataset.readorwrite == "writecommand") {
      characteristicId = '0000FF01-0000-1000-8000-00805F9B34FB'
    }

    that = this;
    var senddata = that.data.nameString
    //处理需要发送的字符串，转为二进制发送给蓝牙
    let buffer = new ArrayBuffer(senddata.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < senddata.length; i++) {
      dataView.setUint8(i, senddata.charAt(i).charCodeAt())
    }
    wx.writeBLECharacteristicValue({
      deviceId: that.data.connectedDeviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: buffer,
      success: function (res) {
        console.log('修改成功')
        console.log(res)
      },
      fail: function (res) {
        console.log('修改失败')
        console.log(res)
      }
    })

  },
  //读取操作
  readAction: function (e) {

    if (e.currentTarget.dataset.readorwrite == "readparameter") {
      characteristicId = '0000FF04-0000-1000-8000-00805F9B34FB'
    }
    if (e.currentTarget.dataset.readorwrite == "readname") {
      characteristicId = '0000FF06-0000-1000-8000-00805F9B34FB'
    }
    if (e.currentTarget.dataset.readorwrite == "readpower") {
      characteristicId = '0000FF05-0000-1000-8000-00805F9B34FB'
    }

    that = this;
    wx.readBLECharacteristicValue({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  [**new**]
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: serviceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: characteristicId,
      success: function (res) {

        console.log('获取，成功:', res.errCode)
      },
      fail: function (res) {
        console.log('获取，失败')
        console.log(res)

      }
    })

  },
  AES_encryption: function (e) {

    var rb = base.ble.en(this.data.nameString);
    console.log("加密后" + rb);

    this.setData({
      rbString: rb,
    })
  },
  AES_decryption: function (e) {
    var rb = base.ble.de(this.data.rbString);
    console.log("解密后" + rb);
  },
  //写入特征值
  writeChar: function (mac, serviceId, charId, value) {

    var senddata = value
    //处理需要发送的字符串，转为二进制发送给蓝牙
    let buffer = new ArrayBuffer(senddata.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < senddata.length; i++) {
      dataView.setUint8(i, senddata.charAt(i).charCodeAt())
    }
    wx.writeBLECharacteristicValue({
      deviceId: mac, // 蓝牙设备 id，参考 device 对象
      serviceId: serviceId, // 蓝牙特征值对应 service 的 uuid
      characteristicId: charId, // 蓝牙特征值的 uuid
      value: buffer, // 蓝牙设备特征值对应的值，16进制字符串
      success: (res) => {
        console.log("写入成功");
        wx.showToast({
          content: '写入成功', // 文字内容
        });
      },
      fail: (e) => {
        console.log("写入失败");
        wx.showToast({
          content: '写入失败', // 文字内容
        });
      }
    });
  },

  getToken() {
    characteristicId = '0000FF01-0000-1000-8000-00805F9B34FB'
    var deviceId = that.data.connectedDeviceId
    //获取token命令
    var unlock = "D6010101";
   
    var rb = base.ble.en(unlock);
    console.log("加密后" + rb);
    // console.log("解密后" + base.ble.de(rb));
    that.writeChar(deviceId, serviceId, characteristicId, rb);
  },

  unlockClick() {
    if (token == undefined || token == null || token == "") {
      console.log("token 为空")
    } else {
      //开锁命令
      var unlock = "050106303030303030" + token;
      console.log(unlock);

      var rb = base.ble.en(unlock);
      console.log("加密后的开锁指令" + rb);
      // console.log("解密后" + base.ble.de(rb));
      that.writeChar(deviceId, serviceId, writeChar.characteristicId, rb);
    }
  },

  //解析读取返回值
  parseReadValue: function (value) {
    var deValue = base.ble.de(value);//解析后的value
    var valueBytes = that.parseValue2Bytes(deValue);
    console.log("解析设备返回特征值：" + deValue);
    //0602为token特征
    if (base.ble.startWiths(deValue, "0602")) {
      // token = that.parseToken(valueBytes);
      token = deValue.substr(6, 8);
      console.log("token: " + token);
    } else if (base.ble.startWiths(deValue, "05020100")) {
      wx.alert({
        title: '开锁成功', // alert 框的标题
      });
    }
  },

  parseToken: function (valueBytes) {
    var token = new Int8Array(4);
    token[0] = valueBytes[3];
    token[1] = valueBytes[4];
    token[2] = valueBytes[5];
    token[3] = valueBytes[6];
    return token;
  },

  //将读特征值解析成byte
  parseValue2Bytes: function (value) {
    var bytes = new Int8Array(16);
    for (var i = 0; i < value.length; i += 2) {
      bytes[i] = parseInt(value.substr(i, 2), 16);

    }
    console.log("解析到的bytes: " + bytes);
    return bytes;
  }

})

//处理接收数据
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + date.getHours() + seperator2 + date.getMinutes()
    + seperator2 + date.getSeconds();
  return currentdate;
}


