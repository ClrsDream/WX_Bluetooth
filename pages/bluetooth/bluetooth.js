var scanner = require('../../lib/bluetooth/scanner')

Page({
  data: {
  },
  getStatus: function (e) {
  },
  open: function (e) {
  },
  startScan: function (e) {
    scanner.startScan({
      services: ['FEE6'],
      allowDuplicatesKey: false,
      interval: 0,
      timeout: 10,
      timeoutCallback: function (res) {
        console.log('APP timeoutCallback', res);
      },
      started: function (res) {
        console.log('APP started', res);
      },
      failed: function (err) {
        console.log('APP failed', res);
      },
      closed: function (err) {
        console.log('APP closed', res);
      },
      found: function (device) {
        console.log('APP found', device);
      },
    });
  },
  getDevices: function (e) {
    // scanner.getBluetoothDevices({});
  },
  stopScan: function (e) {
    scanner.stopScan();
  },
  close: function (e) {
    scanner.close();
  }
})