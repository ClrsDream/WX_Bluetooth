var connectDeviceID;

function create(deviceId) {
  console.log('create()', deviceId);
  if (!deviceId) {
    throw new Error("Connect parameter(option) is undefined!");
  }
  connectDeviceID = deviceId;

  createBLEConnection(connectDeviceID)
    .then((res) => {
      console.log('promise step 1:', res);
      getBLEDeviceServices(connectDeviceID);
    })
    .then((res) => {
      console.log('promise step 1:', res);
    }, (err) => {
      console.log(err);
    });
}

function createBLEConnection(deviceId) {
  console.log('createBLEConnection');
  return delay(100).then(function () {
    return new Promise((resolve, reject) => {
      wx.createBLEConnection({
        deviceId: deviceId,
        success: (res) => {
          console.log(res);
          console.log('连接蓝牙成功');
          resolve({ msg: '连接蓝牙成功' });
        },
        fail: (err) => {
          console.log(err);
          console.log('连接蓝牙失败');
          resolve({ msg: '连接蓝牙失败' });
        }
      })
    });
  });
}

function getBLEDeviceServices(deviceId) {
  console.log('getBLEDeviceServices');
  return delay(100).then(function () {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceServices({
        deviceId: deviceId,
        success: (res) => {
          console.log(res);
          console.log('获取服务成功');
          resolve({ msg: '获取服务成功' });
        },
        fail: (err) => {
          console.log(err);
          console.log('获取服务失败');
          resolve({ msg: '获取服务失败' });
        }
      })
    });
  });
}

module.exports = {
  create: create
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