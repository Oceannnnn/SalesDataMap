$(function() {

	$('body').height($(window).height());

	// 菜单
	var speed = 250,
		easing = mina.easeinout;
	Array.prototype.slice.call(document.querySelectorAll('#grid > .con')).forEach(function(el) {
		var s = Snap(el.querySelector('svg')),
			path = s.select('path'),
			pathConfig = {
				from: path.attr('d'),
				to: el.getAttribute('data-path-hover')
			};
		$(el).mouseenter(function() {
			$(this).siblings('.con').each(function() {
				var s = Snap(this.querySelector('svg')),
					path = s.select('path');
				path.animate({
					'path': pathConfig.from
				}, speed, easing);
			});
			path.animate({
				'path': pathConfig.to
			}, speed, easing);
		});
	});

	$('.con').mouseenter(function() {
		$(this).addClass('on').siblings('.con').removeClass('on');
	});

	var width = $('body').width();
	$('.left-side').css('width', width + 'px');
	$(window).resize(function() {
		$('body').height($(window).height());
		$('.left-side').css('width', $('body').width() + 'px');
	});
	//  返回首页
	$('.a-home').click(function() {
		$('.left-side').fadeOut(600);
	});
	$('.uploader input[type=file]').change(function() {
		$('.uploader input[type=text]').val($(this).val());
		$('.btn_create').removeAttr('disabled');
	});

	var myChart, fileAnalyze;
	// 选择文件按钮事件
	$('#file-selector').bind('change', function() {
		fileAnalyze = new FileAnalyze(this.files[0]);
	});

	// $.when等待解析完毕后开始构建图表
	$('.btn_create').click(function() {
		fileUpLoad();
	});
	// 上传格式判断
	function fileUpLoad() {
		var path = $('.uploader input[type=file]').val(),
			txt = '';
		if(path == '') {
			txt = '请选择上传Excel文件!';
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
		} else {
			var reg = /^.*\.(?:xls|xlsx)$/i;
			if(!reg.test(path)) { //校验不通过
				txt = '请上传excel格式的文件!';
				window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
				return;
			}
			createBtnHandler();
		}
	}

	function createBtnHandler(callback) {
		$.when(fileAnalyze.analyze()).done(function(data) {
			if(data.length > 0 && data[0].hasOwnProperty('项目')) {
				myChart = new DataMap('echart', data, $('#chart-title').val());
				$('.zhu-active').show();
			} else if(data.length > 1 && data[0].hasOwnProperty('数据')) {
				myChart = new HeatMap('echart', data, $('#chart-title').val());
				$('.zhu-active').hide();
			} else {
				var txt = '文件内容格式有误，请修改后重试！';
				window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
				return;
			}
			$('.left-side').fadeIn(600);
			myChart.init();
			if(typeof callback == 'function') callback();
		});
	}

	// 重新选择文件 
	$('#re-file').click(function() {
		$('#file-selector').click();
		$('#file-selector').unbind('change');
		$('#file-selector').bind('change', function() {
			fileAnalyze = new FileAnalyze(this.files[0]);
			fileUpLoad();
		});
	});

	//  修改题目
	$('.a-revise').click(function() {
		var txt = '请输入题目：';
		window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.input, {
			onOk: function(v) {
				if(v != '') {
					myChart.setChartTitle(v);
				}
			}
		});
		$(".inputBox").val(myChart.title);
	});

	// 显示表格
	$('.a-table').click(function() {
		$('.box-table').fadeIn();
		myChart.generateTable('.am-table div');
    })
	// 表格失焦修改图表
	$('.am-table div').delegate('input', 'focus', function() {
		var row = $(this).attr('data-row');
		var column = $(this).attr('data-column');
		// 数据类型校验
		$(this).blur(function() {
			if($('.num-err').length > 0 || $('.null-err').length > 0) {
				$('.a-save').removeAttr('disabled', 'disabled');
				$('.num-err').remove();
				$('.null-err').remove();
			}
			if($(this).val() == '') {
				$('.a-save').attr('disabled', 'disabled');
				$('.footer').prepend('<span class="null-err" style="color:red;font-size:14px;">* 单元格内容不能为空!</span>');
				return;
			}
			if(!isNaN(Number.parseInt(myChart.originData[row][column])) && isNaN(Number($(this).val()))) {
				$('.a-save').attr('disabled', 'disabled');
				$('.footer').prepend('<span class="num-err" style="color:red;font-size:14px;">* 请输入正确的数字!</span>');
				return;
			}
			myChart.syncChart(row, column, $(this).val());
		});
	}).delegate('input', 'change', function() {
        window.isTableChanged = true;
    });
	// 隐藏
	$('.remove-icon').click(function() {
		$('.box-table').hide(500);
		myChart.fileData = JSON.parse(JSON.stringify(myChart.originData));
		myChart.syncChart();
		myChart.generateTable('.am-table div');
	});
	// 撤销
	$('.a-cancel').click(function() {
		myChart.fileData = JSON.parse(JSON.stringify(myChart.originData));
		myChart.syncChart();
		myChart.generateTable('.am-table div');
	});
    //  保存
	$('.a-save').click(function() {
        if(window.isTableChanged){
            myChart.originData = JSON.parse(JSON.stringify(myChart.fileData));
            var txt = '保存成功！';
            window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
        }
	});

	// 切换图表类型
	$('.a-change').click(function() {
		var thisText = $(this).find('.back').text();
		switch(thisText) {
			case '柱图':
				$(this).find('i').addClass('icon-bingtu').removeClass('icon-zhuzhuangtu');
				$(this).find('.back').text('饼图');
				break;
			case '饼图':
				$(this).find('i').addClass('icon-zhuzhuangtu').removeClass('icon-bingtu');
				$(this).find('.back').text('柱图');
				break;
			default:
				break;
		}
		myChart.toggleCharts();
	});

	// 导出Excel
	$('#download-file').click(function() {
		fileAnalyze.downloadExl(myChart.originData, myChart.title);
	});
	// nav
	$('.three-d span.front').mouseenter(function() {
		$(this).stop().slideUp().parents('li').siblings('li').find('span.front').stop().slideDown();
	});
	$('#nav').mouseleave(function() {
		$(this).find('span.front').stop().slideDown();
	});
	// 中英文切换
	$('#toggle-lang').click(function() {
		myChart.toggleLang();
	});
	// file内容清除 
	$('#show input[name="file"]').attr('value', '');
	// 保存图片
	$('#download-png').click(function() {
		var uA = window.navigator.userAgent,
			isIE = /msie\s|trident\/|edge\//i.test(uA) && !!(document.uniqueID || document.documentMode || window.ActiveXObject || window.MSInputMethodContext);
		var imgURL = myChart.charts.getDataURL({
			type: 'png'
		});
		// var mime_type = 'image/png';
		var aTag = document.createElement('a');
		var imgName = myChart.title == '' ? 'unname' : myChart.title;
		aTag.href = imgURL;
		aTag.download = imgName + '.png';
		document.body.appendChild(aTag);
		if(isIE) {
			// 兼容IE11无法触发下载的问题
			var imgBlob = (function(dataurl) {
				var arr = dataurl.split(','),
					mime = 'image/png',
					bstr = atob(arr[1]),
					n = bstr.length,
					u8arr = new Uint8Array(n);
				while(n--) {
					u8arr[n] = bstr.charCodeAt(n);
				}
				return new Blob([u8arr], {
					type: mime
				});
			}(imgURL));
			navigator.msSaveBlob(imgBlob, imgName + '.png');
		} else {
			aTag.click();
		}
		// 触发下载后再释放链接
		aTag.addEventListener('click', function() {
			URL.revokeObjectURL(imgURL);
			document.body.removeChild(aTag);
		});
	});
});