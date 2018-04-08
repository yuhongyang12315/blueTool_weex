const base = getApp().constants;
var that
var temp = []
// 蓝牙通信需要使用的id
// 蓝牙设备 service（服务）Id
var blue_serviceId = ""
// 设备某个服务中的 characteristic（特征值）Id，不同特征值代表不同功能
var characteristicId = ""
Page({
  data: {

    //控制蓝牙状态
    isbluetoothready: false,
    // 蓝牙连接状态
    deviceconnected: false,
    //控制按钮的名称前是否带 loading 图标
    searchingstatus: false,
    //蓝牙notify返回值
    receivedata: '',
    nameString: 'blueNameTest-YHY',
    // 判断是不是开关灯操作
    isOperationLamp: false,
    //判断是开灯还是关灯
    isOpenLamp: true

  },
  onLoad: function () {
    that = this;
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
            // 写入成功回调
            that.whiteSucess()
            console.log('characteristic value comed:')
            console.log(characteristic)
            //解析蓝牙返回数据
            let buffer = characteristic.value
            let dataView = new DataView(buffer)
            console.log("接收字节长度:" + dataView.byteLength)
            var str = ""
            for (var i = 0; i < dataView.byteLength; i++) {
              // str += String.fromCharCode(dataView.getUint8(i))
              str += dataView.getUint8(i).toString(16) + ','
              // console.log(dataView.getUint8(i))
              // console.log(str)
            }
            console.log(parseInt(str, 16))
            str = getNowFormatDate() + "收到数据:" + str;
            console.log(str)
            that.setData({
              receivedata: that.data.receivedata + "\n" + str,
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
        deviceId: that.data.blue_deviceId,
        complete: function (res) {
          console.log(res)
          that.setData({
            deviceconnected: false,
            blue_deviceId: ""
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
        services: ['1000'],
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
      //断开已有蓝牙连接
      wx.notifyBLECharacteristicValueChanged({
        state: false, // 停用notify 功能
        deviceId: that.data.blue_deviceId,
        serviceId: blue_serviceId,
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
            blue_deviceId: "",
            receivedata: ""
          })
        }
      })
    } else {
      wx.showLoading({
        title: '连接蓝牙设备中...',
      })
      //用设备搜索时获取的id尝试连接，如果成功，则该id就为deviceId，
      console.log("deviceId=" + e.currentTarget.id)
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
            //deviceId初始化
            blue_deviceId: e.currentTarget.id
          })

          // 获取serviceId
          wx.getBLEDeviceServices({
            // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
            deviceId: that.data.blue_deviceId,
            success: function (res) {
              console.log("获取servicesId")
              console.log('device services列表:', res.services)
              //蓝牙的服务id列表，serviceId初始化
              // blue_serviceId = '00001000-0000-1000-8000-00805F9B34FB';
              blue_serviceId = res.services[1].uuid
              console.log('获取到servicesId:', res.services[1].uuid)
              // 获取characteristicId
              wx.getBLEDeviceCharacteristics({
                // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                deviceId: that.data.blue_deviceId,
                // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                serviceId: blue_serviceId,
                success: function (res) {
                  console.log('获取characteristicId成功')
                  console.log('device getBLEDeviceCharacteristics:', res.characteristics)
                  // characteristicId = '0000FF02-0000-1000-8000-00805F9B34FB';
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
  openNotifyAction: function () {
    // 启用 notify 功能
    wx.notifyBLECharacteristicValueChanged({
      state: true,
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
      deviceId: that.data.blue_deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: blue_serviceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: '00001002-0000-1000-8000-00805F9B34FB',
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
      deviceId: that.data.blue_deviceId,
      serviceId: blue_serviceId,
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
  AES_encryption: function (e) {
    console.log(this.Int8parse(this.parseCommand('AA0B790000000084')))
    // var rb = base.ble.en("D6010101");
    // console.log("加密后" + rb);

    // this.setData({
    //   rbString: rb,
    // })
  },
  AES_decryption: function (e) {
    // var rb = base.ble.de(this.data.rbString);
    // console.log("解密后" + rb);
    // console.log(rb.length);

    var hex = 'AA0B790000000084'

    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }))

    var buffer = typedArray.buffer
    console.log(buffer)

  },

  //登陆蓝牙，云马lite蓝牙，不需要加密通信，全程命令只需要登陆命令成功，后发送业务命令
  getToken() {
    //手机往模块写入通道（特征值）0001001-0000-1000-8000-00805F9B34FB 
    characteristicId = '00001001-0000-1000-8000-00805F9B34FB'
    //
    // var serviceId = '00001000-0000-1000-8000-00805F9B34FB';
    // "00001002-0000-1000-8000-00805F9B34FB"
    //获取token命令0xAA0x79
    // var unlock = "AA0B790000000000000084";
    //16进制的通信帧  
    // var unlock = "0xAA,0x0b,0x79,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x84";
    //10进制的通信帧   
    // var unlock = '170, 11, 121, 0, 0, 0, 0, 0, 0, 0, 131';
    var value = 'AA,0B,79,00,00,00,00,00,00,00,84'
    that.writeChar(that.data.blue_deviceId, blue_serviceId, characteristicId, value);

    // 通信帧讲解
    // 帧头	帧长	命令	口令	数据	校验
    // 1B	 1B	   1B	  4B	  N字节 1B
    // 帧头占用1个字节，其内容固定为“0xAA”
    // 帧长为整一帧数据的字节长度，即N + 8。
    // 命令占用1个字节（具体值看列表）
    // 口令占用4个字节（默认为0x00,0x00,0x00,0x00）
    // 数据，长度N的取值范围为0~8（具体值看列表）
    // 校验码占用1个字节，其值为前面除帧头外N + 6个字节的校验和。
    //以登陆命令为例
    //帧头 0xAA
    //口令  0x00,0x00,0x00,0x00
    //命令 0x79（121）
    //数据 3个字节
    //帧长 为数据的长度（3）+8=11  为 0x0B
    //校验 为帧长（11）+命令（121）+口令（0）+数据（0）= 131 为 0x84
    // 帧头 帧长 命令	 口令	          数据	       校验
    // 'AA, 0B, 79, 00, 00, 00, 00, 00, 00, 00, 84'
  },
  openLampAction: function (e) {
    if (that.data.isOperationLamp) {
      var characteristicId = '00001001-0000-1000-8000-00805F9B34FB'
      if (that.data.isOpenLamp) {
        // var unlock = '170, 9, 131, 0, 0, 0, 0, 1, 141';
        var value = 'AA,09,83,00,00,00,00,01,8D'
        console.log('开灯')
      } else {
        // var unlock = '170, 9, 131, 0, 0, 0, 0, 0, 141';
        var value = 'AA,09,83,00,00,00,00,00,8c'
        console.log('关灯')
      }
      that.writeChar(that.data.blue_deviceId, blue_serviceId, characteristicId, value);
      that.setData({
        isOperationLamp: false
      })
    } else {
      that.getToken()
      that.setData({
        isOperationLamp: true
      })
      console.log('灯' + e.currentTarget.dataset.typestring)
      if (e.currentTarget.dataset.typestring == 'open') {
        that.setData({
          isOpenLamp: true
        })
      } else {
        that.setData({
          isOpenLamp: false
        })
      }
    }

  },
  bicycleData: function(){
    var characteristicId = '00001002-0000-1000-8000-00805F9B34FB'
    // var unlock = '170, 8, 1, 0, 0, 0, 0, 0, 9';
    var value = 'AA,08,01,00,00,00,00,09'
    that.readChar(that.data.blue_deviceId, blue_serviceId, characteristicId, value);
  },
  //手机与蓝牙模块通信，写入操作
  writeChar: function (mac, svId, charId, value) {
    // 16进制字符串 转 ArrayBuffer 实例：'AA,0B,79,00,00,00,00,00,00,00,84'
    var hex = value
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      // console.log(parseInt(h, 16))
      return parseInt(h, 16)
    }))
    var buffer = typedArray.buffer
    wx.writeBLECharacteristicValue({
      deviceId: mac, // 蓝牙设备 id，参考 device 对象
      serviceId: svId, // 蓝牙特征值对应 service 的 uuid
      characteristicId: charId, // 蓝牙特征值的 uuid
      value: buffer, // 蓝牙设备特征值对应的二进制值
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
  // 写入成功，notify回调
  whiteSucess: function () {
    if (that.data.isOperationLamp) {
      //开关灯
      that.openLampAction()
    } else {

      console.log('无后续处理')
    }

  },
  //清空显示数据
  clearAction: function () {
    that.setData({
      receivedata: ''
    })
  },
  readChar: function (mac, svId, charId) {
    wx.readBLECharacteristicValue({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  [**new**]
      deviceId: mac,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: svId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: charId,
      success: function (res) {

        console.log('获取，成功:', res.errCode)
      },
      fail: function (res) {
        console.log('获取，失败')
        console.log(res)

      }
    })
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
  },
  string2buffer: function (str) {
    // 首先将字符串转为16进制
    let val = ""
    for (let i = 0; i < str.length; i++) {
      if (val === '') {
        val = str.charCodeAt(i).toString(16)
      } else {
        val += ',' + str.charCodeAt(i).toString(16)
      }
    }
    console.log(val)
    // 将16进制转化为ArrayBuffer
    return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    })).buffer
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



