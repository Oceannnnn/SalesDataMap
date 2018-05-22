/**
 * Author: Percy
 * Date: 2016-12-25
 * Time: 12:00
 */
/**
 * 地图图表类, 生成带饼图或柱状图的中国地图
 * 
 * @param {string} id 图表容器id
 * @param {any} fileData Excel解析后的原始数据
 */
function DataMap(id, fileData, title) {
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
 *              项目: '凯越',
 *              广东: '15687087',
 *              浙江: '2560100'
 *          },
 *          {
 *              项目: '福克斯',
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
 * @prop {any} pieData 饼图图表数据
 * 例子: {
 *          上海: [
 *                  {name: '凯越', value: '19948650'},
 *                  {name: '思域', value: '36367531'}
 *                ],
 *          云南: [
 *                  {name: '凯越', value: '10616834'},
 *                  {name: '思域', value: '29655747'}
 *                ],
 *       }
 * @prop {any} pieRadius 饼图半径集合
 * 例子: {
 *          上海: '65.80',
 *          北京: '49.71'
 *       }
 * @prop {any} barData 柱状图图表数据
 * 例子: {
 *          上海: ['19948650', '36367531', '30383776'],
 *          云南: ['17548280', '24145352', '10616834']
 *       }
 */
DataMap.prototype = {
	constructor: DataMap,

	charts: {},
	title: '',
	fileData: [],
	originData: [],
	geoCoordMap: {},
	mapData: [],
	pieData: {},
	pieRadius: {},
	barData: {},

	// 初始配置
	baseOptions: {},
	setBaseOptions: function() {
		var _this = this;
		this.baseOptions = {
			title: [],
			// 设置图例
			legend: {
				show: true,
				type: 'scroll',
				orient: 'vertical',
				left: '9%',
				bottom: '7%',
				itemWidth: 30,
				itemHeight: 20,
				height: 200,
				data: this.barData['项目']
			},
			tooltip: {
				trigger: 'item',
				formatter: function(params) {
					if(params.value) {
						return params.name + '<br/>所有项目总数据: ' + params.value;
					}
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
				itemHeight: 250,
				inRange: {
					color: ['#D3EDFF', '#7CCAFF', '#24A7FF'],
					symbolSize: [30, 100]
				}
			},
			series: [{
				name: 'chinaMap',
				type: 'map',
				mapType: 'china',
				label: {
					normal: {
						show: false
					},
					emphasis: {
						show: true
					}
				},
				top: '1%',
				bottom: '8%',
				showLegendSymbol: false,
				itemStyle: {
					normal: {
						// areaColor: '#9ddaf1',
						areaColor: 'rgba(188, 188, 188, 0.1)',
						borderColor: '#999'
					},
				},
				data: this.mapData,
				zlevel: 3
			}],
			color:['#509BD5','#62B6E2','#E04B45','#70A756','#CBCE4D','#F0B63B','#DA442C','#F1D243'] 
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
		// 	if(key == '项目') {
		// 		continue;
		// 	}
		// 	var sum = 0;
		// 	for(var i = 0; i < this.fileData.length; i++) {
		// 		sum += Number(this.fileData[i][key]);
		// 	}
		// 	result.push({
		// 		'name': key,
		// 		'value': sum
		// 	});
		// }
		// 转置
		for(var i in this.fileData) {
			var sum = 0;
			for(var key in this.fileData[0]){
				if(key == '项目'){
					continue;
				}
				sum += Number(this.fileData[i][key]);
			}
			result.push({
				'name': this.fileData[i]['项目'],
				'value': sum
			});
		}
		this.mapData = result;
	},
	// 生成饼图数据
	parsePieData: function() {
		var result = {};
		// for(var key in this.fileData[0]) {
		// 	if(key == '项目') {
		// 		continue;
		// 	}
		// 	for(var i = 0; i < this.fileData.length; i++) {
		// 		if(!Array.isArray(result[key])) {
		// 			result[key] = [];
		// 		}
		// 		result[key].push({
		// 			'name': this.fileData[i]['项目'],
		// 			'value': this.fileData[i][key]
		// 		});
		// 	}
		// }
		// 转置
		for(var i in this.fileData){
			result[this.fileData[i]['项目']] = [];
			for(var key in this.fileData[i]){
				if(key == '项目'){
					continue;
				}
				result[this.fileData[i]['项目']].push({
					'name': key,
					'value': this.fileData[i][key]
				});
			}
		}
		this.pieData = result;
	},
	// 根据地区所有项目总数据生成饼图半径
	convertPieRadius: function() {
		var _this = this;
		var temp = this.mapData.map(function(x) {
			return x.value;
		});
		var rate = 70 / Math.max.apply(null, temp);
		var result = {};
		temp.map(function(x, i) {
			result[_this.mapData[i].name] = (rate * x).toFixed(2);
		});
		this.pieRadius = result;
	},
	// 生成柱状图数据
	parseBarData: function() {
		var result = {'项目': []};
		// for(var i = 0; i < this.fileData.length; i++) {
		// 	for(var key in this.fileData[i]) {
		// 		if(!Array.isArray(result[key])) {
		// 			result[key] = [];
		// 		}
		// 		result[key].push(this.fileData[i][key]);
		// 	}
		// }
		// 转置
		for(var item in this.fileData[0]){
			if(item == '项目'){
				continue;
			}
			result['项目'].push(item);
		}
		for(var i in this.fileData){
			for(var key in this.fileData[i]){
				if(key == '项目'){
					result[this.fileData[i][key]] = [];
					continue;
				}
				result[this.fileData[i]['项目']].push(this.fileData[i][key]);
			}
		}
		this.barData = result;
	},
	// 生成饼图
	addPie: function() {
		var _this = this;
		// 获取半径
		this.convertPieRadius();
		// 设置圆心标题
		this.baseOptions.title = (function() {
			var result = [];
			for(var key in _this.pieData) {
				if(_this.pieData.hasOwnProperty(key)) {
					var geoCoord = _this.geoCoordMap[key];
					var p = _this.charts.convertToPixel({
						seriesName: 'chinaMap'
					}, geoCoord);
					result.push({
						text: key,
						zlevel: 100,
						textStyle: {
							fontSize: 12,
							fontFamily: '宋体'
						},
						left: p[0] - 17,
						top: p[1] - 12
					});
				}
			}
			return result;
		})();
		/**
		 * 设置饼图可拖拽
		 * 饼图本身不可被拖拽，而自定义图形可以拖拽并绑定拖拽事件
		 * 利用不可见的自定义图形覆盖于饼图之上且令饼图跟随其移动来实现拖拽
		 */
		this.baseOptions.graphic = echarts.util.map(this.mapData, function(item, dataIndex) {
			var geoCoord = _this.geoCoordMap[item.name];
			var p = _this.charts.convertToPixel({
				seriesName: 'chinaMap'
			}, geoCoord);
			return {
				type: 'circle',
				position: p,
				shape: {
					cx: 0,
					cy: 0,
					r: _this.pieRadius[item.name] <= 40 ? 40 : _this.pieRadius[item.name]
				},
				invisible: true,
				draggable: true,
				ondrag: echarts.util.curry(function(dataIndex) {
					var op = _this.charts.getOption();
					var ops = op.series;
					var opt = op.title;
					// 标题位置跟随
					opt[dataIndex].left = this.position[0] - 17;
					opt[dataIndex].top = this.position[1] - 12;
					// 饼图位置跟随
					ops[dataIndex + 1].center = this.position;
					_this.charts.setOption({
						title: opt,
						series: ops
					});
				}, dataIndex),
				zlevel: 6
			};
		});
		// 添加数据
		var pieValueFormatter = function(value) {
			return value.percent.toFixed(0) + '%';
		};
		for(var key in this.pieData) {
			if(this.pieData.hasOwnProperty(key)) {
				var outerRadius = this.pieRadius[key];
				var radius = [13, outerRadius <= 40 ? 40 : outerRadius];
				var geoCoord = this.geoCoordMap[key];
				if(geoCoord) {
					var p = this.charts.convertToPixel({
						seriesName: 'chinaMap'
					}, geoCoord);
					this.baseOptions.series.push({
						name: key,
						type: 'pie',
						radius: radius,
						center: p,
						data: this.pieData[key],
						zlevel: 4,
						label: {
							normal: {
								show: true,
								position: 'inside',
								formatter: pieValueFormatter,
								fontSize: 12
							},
						},
						labelLine: {
							normal: {
								show: false
							}
						},
						animation: false,
						silent: true,
						itemStyle: {
							mormal: {
								opacity: 1
							}
						}
					});
				}
			}
		}
	},
	// 生成柱状图
	addBar: function() {
		var _this = this;
		// 设置柱状图标题
		this.baseOptions.title = (function() {
			var result = [];
			for(var key in _this.pieData) {
				if(_this.pieData.hasOwnProperty(key)) {
					var geoCoord = _this.geoCoordMap[key];
					var p = _this.charts.convertToPixel({
						seriesName: 'chinaMap'
					}, geoCoord);
					result.push({
						text: key,
						zlevel: 100,
						textStyle: {
							fontSize: 12,
							fontFamily: '宋体'
						},
						left: p[0] - 12,
						top: p[1]
					});
				}
			}
			return result;
		})();
		this.baseOptions.xAxis = [];
		this.baseOptions.yAxis = [];
		this.baseOptions.grid = [];
		// 添加数据
		for(var idx in this.barData) {
			if(idx == '项目') {
				continue;
			}
			var geoCoord = this.geoCoordMap[idx];
			var coord = this.charts.convertToPixel({
				seriesIndex: 0
			}, geoCoord);
			this.baseOptions.xAxis.push({
				id: idx,
				animation: false,
				gridId: idx,
				type: 'category',
				nameLocation: 'middle',
				nameGap: 3,
				splitLine: {
					show: false
				},
				axisTick: {
					show: false
				},
				axisLabel: {
					show: false
				},
				axisLine: {
					onZero: false,
					lineStyle: {
						color: '#666'
					}
				},
				data: [],
				zlevel: 8
			});
			this.baseOptions.yAxis.push({
				id: idx,
				gridId: idx,
				animation: false,
				splitLine: {
					show: false
				},
				axisTick: {
					show: false
				},
				axisLabel: {
					show: false
				},
				axisLine: {
					show: false,
					lineStyle: {
						color: '#1C70B6'
					}
				},
				zlevel: 8
			});
			this.baseOptions.grid.push({
				id: idx,
				width: 50,
				height: 60,
				left: coord[0] - 20,
				top: coord[1] - 60,
				right: 0,
				buttom: 0,
				zlevel: 8,
			});
			for(var i = 0; i < this.barData[idx].length; i++) {
				this.baseOptions.series.push({
					type: 'bar',
					name: this.barData['项目'][i],
					xAxisId: idx,
					yAxisId: idx,
					barGap: 0,
					barCategoryGap: 0,
					data: [this.barData[idx][i]],
					zlevel: 8,
					animation: false,
				});
			}

		}

		// 设置柱状图和标题可拖拽
		this.baseOptions.graphic = echarts.util.map(this.mapData, function(item, dataIndex) {
			var geoCoord = _this.geoCoordMap[item.name];
			var p = _this.charts.convertToPixel({
				seriesName: 'chinaMap'
			}, geoCoord);
			return {
				type: 'rect',
				position: p,
				shape: {
					x: -20,
					y: -60,
					width: 60,
					height: 60
				},
				invisible: true,
				draggable: true,
				ondrag: echarts.util.curry(function(dataIndex) {
					var op = _this.charts.getOption();
					var ops = op.grid;
					var opt = op.title;
					opt[dataIndex].left = this.position[0] - 12;
					opt[dataIndex].top = this.position[1];
					ops[dataIndex].left = this.position[0] - 20;
					ops[dataIndex].top = this.position[1] - 60;
					_this.charts.setOption({
						title: opt,
						grid: ops
					});
				}, dataIndex),
				zlevel: 9
			};
		});
	},

	// 获取各种类型图表数据 
	getEachChartsData: function() {
		this.parseBarData();
		this.parseMapData();
		this.parsePieData();
	},

	// 切换图表类型
	toggleCharts: function() {
		// 当前图表类型
		var curCharts = this.charts.getOption().series[1].type;
		// 重置初始配置
		this.setBaseOptions();

		switch(curCharts) {
			case 'pie':
				this.addBar();
				break;
			case 'bar':
				this.addPie();
				break;
			default:
				break;
		}
		this.charts.setOption(this.baseOptions, true);
		this.setChartTitle();
	},

	// 饼图圆心标题英语
	toggleLang: function() {
		var _this = this;
		var op = this.charts.getOption();
		if(_this.pieData.hasOwnProperty(op.title[0].text)) {
			for(var i = 0; i < op.title.length - 1; i++) {
				op.title[i].text = ' ' + transformProvince(op.title[i].text);
			}
		} else {
			var j = 0;
			for(var key in _this.pieData) {
				op.title[j].text = key;
				j++;
			}
		}

		this.charts.setOption(op, true);
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
				zlevel: 100,
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
					fontSize: 16
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
		for(var i = 0; i < this.fileData.length; i++) {
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
		var _this = this;
		if(i && j && newData) {
			this.fileData[i][j] = newData;
		}
		this.getEachChartsData();
		var op = this.charts.getOption();
		if(op.series[1].type == 'pie') {
			this.setBaseOptions();
			this.addPie();
		} else if(op.series[1].type == 'bar') {
			this.setBaseOptions();
			this.addBar();
		}
		this.baseOptions.title.push({
			zlevel: 100,
			text: _this.title,
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
		this.charts.setOption(this.baseOptions);
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

		// 获取各种图表数据格式
		this.getEachChartsData();

		// 初始化配置
		this.setBaseOptions();

		// 添加饼图数据
		this.addPie();

		this.charts.setOption(this.baseOptions, true);

		this.setChartTitle();

		// 图表大小跟随窗口变化
		window.onresize = function() {
			_this.charts.resize();
		};

		return this.charts;
	}

};

/**
 * 将省份中文转换为英文简称
 * 
 * @param {string} cnname 
 */
function transformProvince(cnname) {
	var result;
	switch(cnname) {
		case '上海':
			result = 'SH';
			break;
		case '云南':
			result = 'YN';
			break;
		case '内蒙古':
			result = 'NM';
			break;
		case '北京':
			result = 'BJ';
			break;
		case '台湾':
			result = 'TW';
			break;
		case '吉林':
			result = 'JL';
			break;
		case '四川':
			result = 'SC';
			break;
		case '天津':
			result = 'TJ';
			break;
		case '宁夏':
			result = 'NX';
			break;
		case '安徽':
			result = 'AH';
			break;
		case '山东':
			result = 'SD';
			break;
		case '山西':
			result = 'SX';
			break;
		case '广东':
			result = 'GD';
			break;
		case '广西':
			result = 'GX';
			break;
		case '新疆':
			result = 'SJ';
			break;
		case '江苏':
			result = 'JS';
			break;
		case '江西':
			result = 'JX';
			break;
		case '河北':
			result = 'HB';
			break;
		case '河南':
			result = 'HN';
			break;
		case '浙江':
			result = 'ZJ';
			break;
		case '海南':
			result = 'HN';
			break;
		case '澳门':
			result = 'MO';
			break;
		case '甘肃':
			result = 'GS';
			break;
		case '福建':
			result = 'FJ';
			break;
		case '西藏':
			result = 'XZ';
			break;
		case '贵州':
			result = 'GZ';
			break;
		case '辽宁':
			result = 'LN';
			break;
		case '重庆':
			result = 'CQ';
			break;
		case '陕西':
			result = 'SX';
			break;
		case '青海':
			result = 'QH';
			break;
		case '香港':
			result = 'HK';
			break;
		case '黑龙江':
			result = 'HL';
			break;
		default:
			break;
	}
	return result;
}
