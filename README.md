微信小程序蓝牙，有点坑，“网络端”的人做“硬件接口”。测试版本：Android微信版本6.5.13，华为荣耀8；IOS微信版本6.5.9，IPHONE5S
	
	一些麻烦事儿
	1)蓝牙设备比较多会把手机卡死，公司能扫描到200+个设备，直接把iphone5S的微信卡死了。
	2)每次硬件操作之间一定加延迟，建议100ms，例如“打开蓝牙”与“开始扫描”间，“连接成功”与“获取服务”等等之类。不使用延迟可能会出现莫名其妙的错误，多见于Android端。
	3)注意JS的异步、并发特性，特别在轮询service下的characteristic。小程序还不支持async，await（代码补全中有这两个关键字，但是编译不过）。
	4)蓝牙的数据读写、advertisData的类型是ArrayBuffer，（引用小程序的注意：vConsole 无法打印出 ArrayBuffer 类型数据）。
	鞋童们请先把二进制数组、十六进制字符串弄明白吧，代码中有转换的方法（复制自github）。
	5)初始化蓝牙适配器(wx.openBluetoothAdapter(OBJECT))、获取本机蓝牙适配器状态(wx.getBluetoothAdapterState(OBJECT))，这两个函数那个先调用不好说，自己玩吧，见下说明。

一些BUG，全部出现在Android端，华为荣耀8、VIVO 7plus测试均存在

	1)蓝牙在扫描过程中，获取本机蓝牙适配器状态(wx.getBluetoothAdapterState(OBJECT))。
	  available\Boolean\蓝牙适配器是否可用，值为true。
	  discovering\Boolean\是否正在搜索设备，值为false。
      https://github.com/FFiot/WX_Bluetooth/issues/1
    2)蓝牙在扫描过程中，再次启动扫描wx.startBluetoothDevicesDiscovery(OBJECT)：fail，errCode=10008。
      https://github.com/FFiot/WX_Bluetooth/issues/2
	
移动设备蓝牙开启\关闭用两种状态

	1)wx.getBluetoothAdapterState(OBJECT)
	关闭状态返回：drrCode:10000,errMsg:"getBluetoothAdapterState:fail"。此时开启蓝牙: wx.onBluetoothAdapterStateChange(CALLBACK)无回调。
	开启状态返回：drrCode:10000,errMsg:"getBluetoothAdapterState:fail"。此时关闭蓝牙: wx.onBluetoothAdapterStateChange(CALLBACK)无回调。

	2)wx.getBluetoothAdapterState(OBJECT)
	关闭状态返回：drrCode:10001,errMsg:"openBluetoothAdapter:fail"。此时开启蓝牙：wx.onBluetoothAdapterStateChange(CALLBACK)有回调。
	开启状态返回：errMsg:"openBluetoothAdapter:ok"。此时开启蓝牙：wx.onBluetoothAdapterStateChange(CALLBACK)有回调。
