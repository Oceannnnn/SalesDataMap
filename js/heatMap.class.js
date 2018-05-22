/**
 * Author: Percy
 * Date: 2016-12-27
 * Time: 11:18
 */
/**
 * 热力图图表类
 * 
 * @param {string} id 图表容器id
 * @param {any} fileData Excel解析后的原始数据
 * @param {string} title 图表标题
 */
function HeatMap(id, fileData, title) {
	this.fileData = JSON.parse(JSON.stringify(fileData));
	this.originData = JSON.parse(JSON.stringify(fileData));
	this.title = title ? title : '';
	this.charts = echarts.init(document.getElementById(id));
}

/**
 * 构造方法
 *
 * @prop {any} charts echarts实例
 * @prop {Array<any>} fileData Excel解析后的原始数据
 * 例子: [
 *          {
 *              广东: '15687087',
 *              浙江: '2560100'
 *          }
 *       ]
 * @prop {any} geoCoordMap 地图各省份坐标集合
 * 例子: {
 *          上海: [121.472644, 31.231706],
 *          云南: [102.712251, 25.040609],
 *       }
 * @prop {Array<any>} mapData 地图图表数据
 * 例子: [
 *          {
 *              name: '广东',
 *              value: '183153798'
 *          },
 *          {
 *              name: '浙江',
 *              value: '62297480'
 *          }
 *       ]
 */
HeatMap.prototype = {
	constructor: DataMap,

	charts: {},
	title: '',
	fileData: [],
	originData: [],
	geoCoordMap: {},
	mapData: [],
	isEn: false,

	// 初始配置
	baseOptions: {},
	setBaseOptions: function() {
		var _this = this;
		this.baseOptions = {
			title: {
				zlevel:5,
				show: true,
				text: [_this.title],
				subtext: (function() {
					if(_this.title == '') {
						return '';
					}
					var temp = 0;
					_this.mapData.map(function(x) {
						temp += parseInt(x.value);
					});
					return '总量： ' + temp;
				})(),
				left: 'center',
				top: '3%',
				textStyle: {
					fontSize: 24,
					fontWeight: 'normal'
				},
				subtextStyle: {
					color: '#999',
					fontSize: 16
				}
			},
			visualMap: {
				min: 0,
				max: (function() {
					var temp = _this.mapData.map(function(x) {
						return x.value;
					});
					return Math.max.apply(null, temp);
				})(),
				left: 'left',
				bottom: '4%',
				seriesIndex: 0,
				text: ['高', '低'],
				calculable: true,
				itemWidth: 30,
				itemHeight: 250
			},
			series: [{
				name: 'chinaMap',
				type: 'map',
				mapType: 'china',
				label: {
					normal: {
						show: true,
						formatter: function(val) {
							for(var i in _this.fileData){
								if(val.name == _this.fileData[i]['省份']){
									if(_this.isEn == true) {
										return transformProvince(val.name) + ': ' + _this.fileData[i]['数据'];
									} else {
										return val.name + ': ' + _this.fileData[i]['数据'];
									}
									break;
								}
							}
							return '';
						},
						fontSize: 16
					},
					emphasis: {
						show: false
					}
				},
				top: '1%',
				bottom: '8%',
				itemStyle: {
					normal: {
						areaColor: '#9ddaf1',
						borderColor: '#333'
					}
				},
				data: this.mapData,
				zlevel: 3
			}]
		};
		// 初次加载
		if(this.baseOptions && typeof this.baseOptions === 'object') {
			this.charts.setOption(this.baseOptions, true);
		}
	},

	// 生成地图数据
	parseMapData: function() {
		var result = [];
		// for(var key in this.fileData[0]) {
		// 	result.push({
		// 		'name': key,
		// 		'value': this.fileData[0][key]
		// 	});
		// }
		// 转置
		for(var i in this.fileData){
			result.push({
				'name': this.fileData[i]['省份'],
				'value': Number(this.fileData[i]['数据'])
			});
		}
		console.log(result);
		this.mapData = result;
	},

	// 修改图表标题
	setChartTitle: function(newTitle) {
		var _this = this,
			text = _this.title,
			op = this.charts.getOption();
		if(newTitle) {
			_this.title = newTitle;
			text = newTitle;
			op.title[op.title.length - 1].text = text;
			op.title[op.title.length - 1].subtext = (function() {
				if(text == '') {
					return '';
				}
				var temp = 0;
				_this.mapData.map(function(x) {
					temp += parseInt(x.value);
				});
				return '总量： ' + temp;
			})();
		} else {
			op.title.push({
				text: text,
				subtext: (function() {
					if(_this.title == '') {
						return '';
					}
					var temp = 0;
					_this.mapData.map(function(x) {
						temp += parseInt(x.value);
					});
					return '总量： ' + temp;
				})(),
				left: 'center',
				top: '3%',
				textStyle: {
					fontSize: 24,
					fontWeight: 'normal'
				},
				subtextStyle: {
					color: '#999',
					fontSize: 20
				}
			});
		}
		this.charts.setOption(op);
	},

	// 生成表格
	generateTable: function(selector) {
		var tbContainer = $(selector);
		var thead = '<tr>',
			tbody = '';
		for(var th in this.fileData[0]) {
			thead += ('<th>' + th + '</th>');
		}
		thead += '</tr>';
		for(var i in this.fileData) {
			tbody += '<tr>';
			for(var j in this.fileData[i]) {
				tbody += ('<td><input type="text" data-row="' + i + '" data-column="' + j + '" value="' + this.fileData[i][j] + '"></td>');
			}
			tbody += '</tr>';
		}
		var tbStr = '<table>' + thead + tbody + '</table>';
		tbContainer.html(tbStr);
	},

	// 表格内容修改
	syncChart: function(i, j, newData) {
		if(i && j && newData) {
			this.fileData[i][j] = newData;
		}
		this.parseMapData();
		this.setBaseOptions();
		this.charts.setOption(this.baseOptions);
	},

	// 省份标题英语
	toggleLang: function() {
		this.isEn ? this.isEn = false : this.isEn = true;
		this.charts.setOption(this.charts.getOption());
	},

	// 初始化图表
	init: function() {
		var _this = this;
		echarts.getMap('china').geoJson.features.forEach(function(v) {
			var name = v.properties.name;
			var x = v.properties.cp[0];
			var y = v.properties.cp[1];
			_this.geoCoordMap[name] = [x, y];
		});

		// 获取热力图数据格式
		this.parseMapData();

		// 初始化配置
		this.setBaseOptions();

		this.charts.setOption(this.baseOptions, true);

		// 图表大小跟随窗口变化
		window.onresize = function() {
			_this.charts.resize();
		};

		return this.charts;
	}

};
