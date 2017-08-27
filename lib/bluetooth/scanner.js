const MAX_SCAN_TIMEOUT = 30;

var scanOption = {};

var isStartedSym = false;
var isScanningSym = false;

function getDevices(option) {
  console.log('getDevices');

  setTimeout(() => {
    getBluetoothDevices(option);
  },100);
}

wx.onBluetoothAdapterStateChange(function (res) {
  console.log('wx.onBluetoothAdapterStateChange', res);
  if (res.available === true) {
    if (res.discovering === true) {
      isScanningSym = true;
    } else {
      isScanningSym = false;
      if (isStartedSym === true) {
        console.log('自动启动');
        startScan(scanOption);
      }
    }
  } else {
    if (isScanningSym === true) {
      isScanningSym = false;
      console.log('扫描中蓝牙被关闭');
      if (scanOption.closed) {
        console.log('call scanOption.closed')
        scanOption.closed({ msg: '蓝牙硬件未开启' });
      }
    }
  }
})

function scanTimeout() {
  console.log('scanTimeout()');

  clearTimeout(scanTimeout);
  var isStartedTemp = isStartedSym;
  isStartedSym = false;
  isScanningSym = false;

  stopBluetoothDevicesDiscovery()
    .then((res) => {
      console.log(res);
      if (scanOption.timeout && isStartedTemp === true) {
        console.log('call scanOption.timeout')
        scanOption.timeout({ msg: '蓝牙扫描超时' });
      }
    });
}

function stopScan(option) {
  console.log('stopScan()');

  clearTimeout(scanTimeout);
  isStartedSym = false;
  isScanningSym = false;

  stopBluetoothDevicesDiscovery()
    .then((res) => {
      if (option && option.success) {
        option.success({ msg: '停止扫描成功' });
      }
    });
}

function close() {
  console.log('close()');

  clearTimeout(scanTimeout);
  isStartedSym = false;
  isScanningSym = false;

  stopBluetoothDevicesDiscovery()
    .then((res) => {
      return closeBluetoothAdapter();
    })
    .then((res) => {
      if (option && option.success) {
        option.success({ msg: '关闭蓝牙成功' });
      }
    });
}

function startScan(option) {
  console.log('starScan()', option);

  if (!option) {
    throw new Error("StartScan parameter(option) is undefined!");
  }

  scanOption = option;

  isStartedSym = false;
  isScanningSym = false;

  stopBluetoothDevicesDiscovery()
    .then((res) => {
      console.log('promise step 1:', res);
      return getBluetoothAdapterState();
    })
    .then((res) => {
      isStartedSym = true;
      console.log('promise step 2:', res);
      if (res.msg === '蓝牙适配器未初始化') {
        return openBluetoothAdapter();
      } else {
        return nop(res);
      }
    })
    .then((res) => {
      console.log('promise step 3:', res);
      if (res.msg === '蓝牙未扫描') {
        var optionTemp = scanOption;
        return startBluetoothDevicesDiscovery(optionTemp);
      } else if (res.msg === '蓝牙扫描中') {
        return getBluetoothDevices();
      } else {
        throw new Error({ msg: "蓝牙未知状态" });
      }
    })
    .then((res) => {
      console.log('promise step 4:', res);

      if (res.msg === '获取蓝牙设备成功') {
        onBluetoothDeviceFound(res.devices);
      } else if (res.msg === '启动扫描成功') {
        if (scanOption.started) {
          console.log('call scanOption.started');
          scanOption.started(res);
        }
      }

      if (scanOption.scanTime) {
        console.log('启动定时器 ' + scanOption.scanTime + 's')
        setTimeout(scanTimeout, scanOption.scanTime * 1000);
      } else {
        console.log('启动定时器 ' + MAX_SCAN_TIMEOUT + 's')
        setTimeout(scanTimeout, MAX_SCAN_TIMEOUT * 1000);
      }

    }, (err) => {
      console.log('promise catch:', err);
      if (err.msg === '蓝牙硬件未开启') {
        if (scanOption.closed) {
          console.log('call scanOption.closed')
          scanOption.closed(err);
        }
      } else {
        isStartedSym = false;
        if (scanOption.failed) {
          console.log('call scanOption.failed')
          scanOption.failed(err);
        }
      }
    })
}

function onBluetoothDeviceFound(devices) {
  if (scanOption.found && isStartedSym === true && isScanningSym === true) {
    for (var i = 0; i < devices.length; i++) {
      var device = devices[i];
      device.advertisDataHexString = arrayBufferToHexString(device.advertisData);
      if (scanOption.found && isStartedSym === true && isStartedSym === true) {
        scanOption.found(device);
      }
    }
  }
}

wx.onBluetoothDeviceFound(function (res) {
  onBluetoothDeviceFound(res.devices);
})

function getBluetoothAdapterState() {
  console.log('getBluetoothAdapterState');
  return delay(100).then(() => {
    return new Promise((resolve, reject) => {
      console.log('wx.getBluetoothAdapterState');
      wx.getBluetoothAdapterState({
        success: (res) => {
          console.log(res);
          if (res.available === true) {
            if (res.discovering === true) {
              resolve({ msg: '蓝牙扫描中' });
            } else {
              resolve({ msg: '蓝牙未扫描' });
            }
          } else {
            console.log('蓝牙硬件未开启');
            reject({ msg: '蓝牙硬件未开启' });
          }
        },
        fail: (err) => {
          console.log(err);
          if (err.errCode === 10000) {
            console.log('蓝牙适配器未初始化');
            resolve({ msg: '蓝牙适配器未初始化' });
          } else if (err.errCode === 10001) {
            console.log('蓝牙硬件未开启');
            reject({ msg: '蓝牙硬件未开启' });
          } else {
            reject(err);
          }
        }
      })
    });
  });
}

function openBluetoothAdapter() {
  console.log('openBluetoothAdapter');
  return delay(100).then(() => {
    return new Promise((resolve, reject) => {
      console.log('wx.openBluetoothAdapter');
      wx.openBluetoothAdapter({
        success: (res) => {
          console.log(res);
          console.log('蓝牙适配器初始化成功');
          resolve({ msg: '蓝牙未扫描' });
        },
        fail: (err) => {
          console.log(err);
          if (err.errCode === 10001) {
            console.log('蓝牙硬件未开启');
            reject({ msg: '蓝牙硬件未开启' });
          } else {
            reject(err);
          }
        }
      });
    })
  });
}

function getBluetoothDevices() {
  console.log('getBluetoothDevices');
  return delay(100).then(() => {
    return new Promise((resolve, reject) => {
      wx.getBluetoothDevices({
        success: (res) => {
          console.log(res);
          console.log('获取蓝牙设备成功');
          resolve({ res: '获取蓝牙设备成功' });
        }, fail: (err) => {
          console.log(err);
          console.log('获取蓝牙设备失败');
          resolve({ msg: '获取蓝牙设备失败' });
        }
      })
    })
  });
}

function startBluetoothDevicesDiscovery(option) {
  console.log('startBluetoothDevicesDiscovery');
  return delay(100).then(() => {
    return new Promise((resolve, reject) => {
      console.log('wx.startBluetoothDevicesDiscovery');
      option.success = function (res) {
        console.log(res);
        console.log('启动扫描成功');
        resolve({ msg: '启动扫描成功' });
      }
      option.fail = function (err) {
        console.log(err);
        console.log('启动扫描失败');
        reject({ msg: '启动扫描失败' });
      }
      wx.startBluetoothDevicesDiscovery(option);
    })
  })
}

function stopBluetoothDevicesDiscovery() {
  console.log('stopBluetoothDevicesDiscovery');
  return delay(100).then(() => {
    return new Promise((resolve, reject) => {
      wx.stopBluetoothDevicesDiscovery({
        complete: function (res) {
          console.log('停止扫描成功');
          resolve({ msg: '停止扫描成功' });
        }
      })
    });
  });
}

function closeBluetoothAdapter() {
  console.log('closeBluetoothAdapter');
  return delay(100).then(function () {
    return new Promise((resolve, reject) => {
      wx.closeBluetoothAdapter({
        complete: (res) => {
          console.log('关闭蓝牙成功');
          resolve({ msg: '关闭蓝牙成功' });
        }
      })
    });
  });
}

module.exports = {
  startScan: startScan,           //启动扫描
  stopScan: stopScan,             //停止扫描
  getDevices: getDevices,         //获取设备
  close: close                    //关闭蓝牙
}

function delay(ms, res) {
  return new Promise(function (resolve, reject) {
    console.log('启动延迟 ' + ms + 'ms');
    setTimeout(function () {
      console.log('结束延迟 ' + ms + 'ms');
      resolve(res);
    }, ms);
  });
}

function nop(res) {
  return new Promise(function (resolve, reject) {
    console.log('开始空指令');
    setTimeout(function () {
      console.log('结束空指令');
      resolve(res);
    }, 0);
  });
}

var arrayBufferToHexString = function (buffer) {
  let bufferType = Object.prototype.toString.call(buffer);
  if (buffer != '[object ArrayBuffer]') {
    return;
  }
  let dataView = new DataView(buffer);

  var hexStr = '';
  for (var i = 0; i < dataView.byteLength; i++) {
    var str = dataView.getUint8(i);
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
  let dataView = new DataView(buffer);

  let ind = 0;
  for (var i = 0, len = str.length; i < len; i += 2) {
    let code = parseInt(str.substr(i, 2), 16);
    dataView.setUint8(ind, code);
    ind++;
  }

  return buffer;
}

