var startCmd = false;
var isWorking = false;
var isBusy = false;

var scanOption = {};

var DebugEn = true;
function debug(str) {
  if (DebugEn) {
    console.log(str);
  }
}

function getDevices(option) {
  debug('getDevices');

  getBluetoothDevices()
    .then((res) => {
      if (option.success) {
        option.success(res.devices);
      }
    }, (err) => {
      if (option.fail) {
        option.fail(err);
      }
    })
}

function isScanning() {
  return isWorking;
}

wx.onBluetoothAdapterStateChange(function (res) {
  debug('wx.onBluetoothAdapterStateChange');
  debug(res);
  if (res.available === true) {
    if (res.discovering === true) {
      debug('设置 isWorking = true');
      isWorking = true;
    } else {
      debug('设置 isWorking = false');
      isWorking = false;

      if (startCmd === true) {
        debug('自动启动 startScan()');
        startScan(scanOption);
      }
    }
  } else {
    debug('设置 isWorking = false');
    isWorking = false;
  }
})

function startScan(option) {
  debug('starScan');

  scanOption = option;

  startCmd = true;

  getBluetoothAdapterState()
    .then((res) => {
      debug(res);
      if (res.msg === '蓝牙适配器未初始化') {
        return openBluetoothAdapter();
      } else {
        return nop(res);
      }
    })
    .then((res) => {
      debug(res);
      if (res.msg === '蓝牙未扫描') {
        return startBluetoothDevicesDiscovery();
      } else if (res.msg === '蓝牙扫描中') {
        return getBluetoothDevices();
      } else {
        throw ({ errMsg: "蓝牙未知状态" });
      }
    })
    .then((res) => {
      debug(res);
    }, (err) => {
      debug(err);
    })
}

function stopScan() {
  debug('stopScan');

  debug('设置 isBusy = true');
  isBusy = true;

  stopBluetoothDevicesDiscovery()
    .then((res) => {
      debug('设置 startCmd = false');
      startCmd = false;
      debug('设置 isWorking = false');
      isWorking = false
      debug('设置 isBusy = false');
      isBusy = false;
    });
}

function close() {
  debug('close');

  debug('设置 isBusy = true');
  isBusy = true;

  stopBluetoothDevicesDiscovery()
    .then((res) => {
      return closeBluetoothAdapter();
    })
    .then((res) => {
      debug('设置 startCmd = false');
      startCmd = false;
      debug('设置 isWorking = false');
      isWorking = false;
      debug('设置 isBusy = false');
      isBusy = false;
    });
}

function onBluetoothDeviceFound(devices) {
  if (scanOption.found) {
    for (var i = 0; i < devices.length; i++) {
      var device = devices[i];
      device.advertisDataStr = arrayBufferToHexString(device.advertisData);
      if (startCmd === true) {
        scanOption.found(device);
      }
    }
  }
}

wx.onBluetoothDeviceFound(function (res) {
  onBluetoothDeviceFound(res.devices);
})

function getBluetoothAdapterState() {
  return delay(100).then(() => {
    debug('getBluetoothAdapterState');
    return new Promise((resolve, reject) => {
      debug('wx.getBluetoothAdapterState');
      wx.getBluetoothAdapterState({
        success: (res) => {
          debug(res);
          if (res.available === true) {
            if (res.discovering === true) {
              resolve({ msg: '蓝牙扫描中' });
            } else {
              resolve({ msg: '蓝牙未扫描' });
            }
          } else {
            debug('蓝牙硬件未开启');
            reject({ errMsg: '蓝牙硬件未开启' });
          }
        },
        fail: (err) => {
          debug(err);
          if (err.errCode === 10000) {
            debug('蓝牙适配器未初始化');
            resolve({ msg: '蓝牙适配器未初始化' });
          } else if (err.errCode === 10001) {
            debug('蓝牙硬件未开启');
            reject({ errMsg: '蓝牙硬件未开启' });
          } else {
            reject(err);
          }
        }
      })
    });
  });
}

function openBluetoothAdapter() {
  return delay(100).then(() => {
    debug('openBluetoothAdapter');
    return new Promise((resolve, reject) => {
      debug('wx.openBluetoothAdapter');
      wx.openBluetoothAdapter({
        success: (res) => {
          debug(res);
          debug('蓝牙适配器初始化成功');
          resolve({ msg: '蓝牙未扫描' });
        },
        fail: (err) => {
          if (err.errCode === 10001) {
            debug('蓝牙硬件未开启');
            reject({ errMsg: '蓝牙硬件未开启' });
          } else {
            reject(err);
          }
        }
      });
    })
  });
}

function getBluetoothDevices() {
  return delay(100).then(() => {
    debug('getBluetoothDevices');
    return new Promise((resolve, reject) => {
      wx.getBluetoothDevices({
        success: (res) => {
          debug('获取蓝牙设备成功');
          debug(res);
          resolve({ res: '获取蓝牙设备成功' });
        }, fail: (err) => {
          debug('获取蓝牙设备失败');
          debug(err);
          reject({ errMsg: '获取蓝牙设备失败' });
        }
      })
    })
  });
}

function startBluetoothDevicesDiscovery() {
  return delay(100).then(() => {
    debug('startBluetoothDevicesDiscovery');
    return new Promise((resolve, reject) => {
      debug('wx.startBluetoothDevicesDiscovery');
      wx.startBluetoothDevicesDiscovery({
        services: ['FEE6'],
        allowDuplicatesKey: true,
        interval: 0,
        success: (res) => {
          debug(res);
          debug('启动扫描成功');
          resolve({ msg: '启动扫描成功' });
        },
        fail: (err) => {
          debug(err);
          debug('启动扫描失败');
          reject({ errMsg: '启动扫描失败' });
        }
      })
    })
  })
}

function scanTimeOut() {
  debug('timeOut');

  debug('设置 isBusy = true');
  isBusy = true;

  clearTimeout(scanTimeOut);
  stopBluetoothDevicesDiscovery()
    .then((res) => {
      debug('设置 startCmd = false');
      startCmd = false;
      debug('设置 isWorking = false');
      isWorking = false
      debug('设置 isBusy = false');
      isBusy = false;
      if (scanOption.fail) {
        scanOption.fail({ msg: '蓝牙扫描超时' });
      }
    });
}

function stopBluetoothDevicesDiscovery() {
  return delay(100).then(() => {
    debug('stopBluetoothDevicesDiscovery');
    return new Promise((resolve, reject) => {
      wx.stopBluetoothDevicesDiscovery({
        complete: function (res) {
          debug('停止扫描成功');
          resolve({ msg: '停止扫描成功' });
        }
      })
    });
  });
}

function closeBluetoothAdapter() {
  return delay(100).then(function () {
    debug('closeBluetoothAdapter');
    return new Promise((resolve, reject) => {
      wx.closeBluetoothAdapter({
        complete: (res) => {
          debug('关闭蓝牙成功');
          resolve({ msg: '关闭蓝牙成功' });
        }
      })
    });
  });
}

function delay(ms, res) {
  return new Promise(function (resolve, reject) {
    debug('启动延迟 ' + ms + 'ms');
    setTimeout(function () {
      debug('结束延迟 ' + ms + 'ms');
      resolve(res);
    }, ms);
  });
}

function nop(res) {
  return new Promise(function (resolve, reject) {
    debug('开始空指令');
    setTimeout(function () {
      debug('结束空指令');
      resolve(res);
    }, 0);
  });
}

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

module.exports = {
  startScan: startScan,           //启动扫描
  stopScan: stopScan,             //停止扫描
  isScanning: isScanning,         //查询扫描状态
  getDevices: getDevices,         //获取设备
  close: close,                   //关闭蓝牙
  getBluetoothAdapterState: getBluetoothAdapterState,
  openBluetoothAdapter: openBluetoothAdapter,
  startBluetoothDevicesDiscovery: startBluetoothDevicesDiscovery,
  stopBluetoothDevicesDiscovery: stopBluetoothDevicesDiscovery,
  getBluetoothDevices: getBluetoothDevices,
  closeBluetoothAdapter: closeBluetoothAdapter
}