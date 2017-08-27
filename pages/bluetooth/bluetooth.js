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
      services: ['FEE7'],
      allowDuplicatesKey: false,
      interval: 0,
      scanTime: 10,
      closed: function (res) {
        console.log('APP closed', res);
      },
      timeout:function(res){
        console.log('APP timeout', res);
      },
      failed:function(res){
        console.log('APP failed', res);
      },
      started:function(res){
        console.log('APP started', res);
      },
      found:function(res){
        console.log('APP found', res);
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