var connectDeviceID;

//连接参数
//deviceID
//services
//characteristics

var connectOption = {
  deviceId: '010203040506',
  deviceOption: {
    '0001': {
      '36F5': { 'write': true },
      '36F6': { 'notify': true }
    }
  }
};

function create(option) {
  console.log('create()', option);
  if (!option) {
    throw new Error("Connect parameter(option) is undefined!");
  }
  connectOption = option;
  
  getConnectedBluetoothDevices(connectOption.deviceId)
    .then((res) => {
      console.log('promise step 1:', res);
      if (res.msg === '连接蓝牙成功') {
        return nop(res);
      } else if (res.msg === '蓝牙未连接') {
        return createBLEConnection(connectOption.deviceId);
      } else {
        throw new Error({ msg: "蓝牙未知状态" });
      }
    })
    .then((res) => {
      console.log('promise step 2:', res);
      if (res.msg === '连接蓝牙成功') {
        return getBLEDeviceServices(connectOption.deviceId);
      } else {
        throw new Error({ msg: "蓝牙未知状态" });
      }
    })
    .then((res)=>{
      console.log('promise step 3:', res);
      if (res.msg === '获取服务成功') {
        for (var i in res.services){
          var uuid = get16bitUUID(res.services[i].uuid);
          if (searchJSON(connectOption.deviceOption, uuid)){
            return getBLEDeviceCharacteristics(connectOption.deviceId, res.services[i].uuid);
          }
        }
      } else {
        throw new Error({ msg: "蓝牙未知状态" });
      }
    })
    .then((res) =>{
      console.log('promise step 4:', res);
      if(res.msg === '获取属性成功'){
        for (var i in res.characteristics){
          var temp = searchJSON(connectOption.deviceOption,
            get16bitUUID(res.serviceId),
            get16bitUUID(res.characteristics[i].uuid),
            'notify');
          if (temp === true){
            return notifyBLECharacteristicValueChange(connectOption.deviceId, res.serviceId, res.characteristics[i].uuid);
          }
        }
      }else{
        throw new Error({ msg: "蓝牙未知状态" });
      }
    })
    .catch((res) => {
      console.log('promise catch:', res);
    });
}

function getConnectedBluetoothDevices(deviceId) {
  return delay(100).then(function () {
    console.log('getConnectedBluetoothDevices', deviceId);
    return new Promise((resolve, reject) => {
      wx.getConnectedBluetoothDevices({
        success: (res) => {
          console.log(res);
          for (var i = 0; i < res.devices.length; i++) {
            console.log(res.devices[i].deviceId, deviceId);
            if (res.devices[i].deviceId === deviceId) {
              resolve({ msg: '连接蓝牙成功' });
              return;
            }
          }
          resolve({ msg: '蓝牙未连接' });
        },
        fail: (err) => {
          console.log(res);
          reject({ msg: '连接蓝牙失败' });
        }
      })
    });
  });
}

function createBLEConnection(deviceId) {
  return delay(100).then(function () {
    console.log('createBLEConnection', deviceId);
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
  return delay(100).then(function () {
    console.log('getBLEDeviceServices', deviceId);
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceServices({
        deviceId: deviceId,
        success: (res) => {
          console.log(res);
          console.log('获取服务成功');
          res.msg = '获取服务成功';
          resolve(res);
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

function getBLEDeviceCharacteristics(deviceId,serviceId) {
  return delay(100).then(function () {
    console.log('getBLEDeviceCharacteristics', deviceId);
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceCharacteristics({
        deviceId: deviceId,
        serviceId: serviceId,
        success: (res) => {
          console.log(res);
          console.log('获取属性成功');
          res.serviceId = serviceId;
          res.msg = '获取属性成功';
          resolve(res);
        },
        fail: (err) => {
          console.log(err);
          console.log('获取属性失败');
          resolve({ msg: '获取属性失败' });
        }
      })
    });
  });
}

function notifyBLECharacteristicValueChange(deviceId, serviceId, characteristicId) {
  return delay(100).then(function () {
    console.log('notifyBLECharacteristicValueChange', deviceId);
    return new Promise((resolve, reject) => {
      wx.notifyBLECharacteristicValueChange({
        deviceId: deviceId,
        serviceId: serviceId,
        characteristicId: characteristicId,
        state:true,
        success: (res) => {
          console.log(res);
          console.log('启用notify成功');
          resolve({ msg: '启用notify成功'});
        },
        fail: (err) => {
          console.log(err);
          console.log('启用notify失败');
          resolve({ msg: '启用notify失败' });
        }
      })
    });
  });
}

module.exports = {
  create: create
}

function get16bitUUID(uuid){
  return uuid.substring(4, 8).toUpperCase() ;
}

function searchJSON() {
  console.log(arguments);
  var temp = arguments[0];
  for (var i = 1; i < arguments.length && temp; i++) {
    temp = temp[arguments[i]];
  }
  return temp;
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