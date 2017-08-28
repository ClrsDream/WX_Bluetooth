var scanner = require('../../lib/bluetooth/scanner')
var divices = [];

Page({
  data: {
    items: []
  },
  onLoad() {
  },
  getStatus: function (e) {
  },
  open: function (e) {
  },
  startScan: function (e) {
    var that = this;

    divices = [];
    that.setData({
      items: divices
    })

    scanner.startScan({
      services: ['FEE7'],
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
        })
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
  }
})