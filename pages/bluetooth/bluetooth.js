var scanner = require('../../lib/bluetooth/scanner')

Page({
  data: {
  },
  getStatus: function (e) {
  },
  open: function (e) {
  },
  startScan: function (e) {
    scanner.startScan({});
  },
  getDevices: function (e) {
    scanner.getBluetoothDevices();
  },
  stopScan: function (e) {
    scanner.stopScan();
  },
  close: function (e) {
    scanner.close();
  }
})