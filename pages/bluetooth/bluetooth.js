var scanner = require('../../lib/bluetooth/scanner')
var connecter = require('../../lib/bluetooth/connecter')

var divices = [];
var selectedDeviceid;

const deviceOption = {
  '0001': {
    '36F5': { 'write': true },
    '36F6': { 'notify': true }
  }
}

Page({
  data: {
    items: []
  },
  onLoad() {
  },
  startScan: function (e) {
    var that = this;

    divices = [];
    that.setData({
      items: divices
    })

    scanner.startScan({
      services: ['0001'],
      allowDuplicatesKey: false,
      interval: 0,
      scanTime: 10,
      closed: function (res) {
        console.log('APP closed', res);
      },
      timeout: function (res) {
        console.log('APP timeout', res);
        console.log(divices.length);
        that.setData({
          items: divices
        })
      },
      failed: function (res) {
        console.log('APP failed', res);
      },
      started: function (res) {
        console.log('APP started', res);
      },
      found: function (device) {
        console.log('APP found', device);
        divices.push(device);
        that.setData({
          items: divices
        });
        if (device.advertisDataHexString.indexOf('0101') === 0) {
          console.log('deviceId', device.deviceId);
          selectedDeviceid = device.deviceId;
          scanner.stopScan({
            success: (res) => {
              device.deviceOption = deviceOption;
              connecter.create(device);
            }
          });
        }
      }
    });
  },
  getDevices: function (e) {
    scanner.getDevices({
      success: function (res) {
        console.log(res)
      }
    })
  },
  stopScan: function (e) {
    scanner.stopScan();
  },
  close: function (e) {
    scanner.close();
  },
  radioChange: function (e) {
    console.log('radio发生change事件', e);
    selectedDeviceid = e.detail.value;
  },
  connect: function (e) {
    connecter.create({
      deviceId: selectedDeviceid,
      deviceOption: deviceOption
    });
    console.log(selectedDeviceid);
  }
})