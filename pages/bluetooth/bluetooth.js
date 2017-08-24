Page({
  data: {
  },
  getStatus: function (e) {
    console.log('wx.getBluetoothAdapterState');
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log(res);
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
  open: function (e) {
    console.log('wx.openBluetoothAdapter');
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log(res);
      },
      fail: (err) => {
        console.log(err);
      }
    });
  },
  startScan: function (e) {
    console.log('startBluetoothDevicesDiscovery');
    wx.startBluetoothDevicesDiscovery({
      services: ['FEE7'],
      allowDuplicatesKey: false,
      interval: 0,
      success: (res) => {
        console.log(res);
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
  stopScan: function (e) {
    console.log('stopBluetoothDevicesDiscovery');
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res);
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
  getDevices: function (e) {
    console.log('getBluetoothDevices');
    wx.getBluetoothDevices({
      success: (res) => {
        console.log(res);
      }, fail: (err) => {
        console.log(err);
      }
    })
  },
  close: function (e) {
    console.log('closeBluetoothAdapter');
      wx.closeBluetoothAdapter({
        success: (res) => {
          console.log(res);
        },
        fail: (err) => {
          console.log(err);
        }
      })
  }
})
wx.onBluetoothAdapterStateChange(function (res) {
  console.log(`adapterState changed, now is`, res);
})

wx.onBluetoothDeviceFound(function (res) {
  console.log('new device list has founded');
  for (var i = 0; i < res.devices.length; i++){
    var device = res.devices[i];
    device.advertisDataStr = arrayBufferToHexString(device.advertisData);
    console.log(device);
  }
})

var arrayBufferToHexString = function (buffer) {
  let bufferType = Object.prototype.toString.call(buffer)
  if (buffer != '[object ArrayBuffer]') {
    return
  }
  let dataView = new DataView(buffer)

  var hexStr = '';
  for (var i = 0; i < dataView.byteLength; i++) {
    var str = dataView.getUint8(i)
    var hex = (str & 0xff).toString(16);
    hex = (hex.length === 1) ? '0' + hex : hex;
    hexStr += hex;
  }

  return hexStr.toUpperCase();
}

var hexStringToArrayBuffer = function (str) {
  if (!str) {
    return new ArrayBuffer(0);
  }

  var buffer = new ArrayBuffer(16);
  let dataView = new DataView(buffer)

  let ind = 0;
  for (var i = 0, len = str.length; i < len; i += 2) {
    let code = parseInt(str.substr(i, 2), 16)
    dataView.setUint8(ind, code)
    ind++
  }

  return buffer;
}