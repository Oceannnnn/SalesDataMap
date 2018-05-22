/** 
 * Author: Percy 
 * Date: 2016-12-25
 * Time: 12:00 
 */  
/**
 * FileReader共有4种读取方法：
 * 1.readAsArrayBuffer(file)：将文件读取为ArrayBuffer。
 * 2.readAsBinaryString(file)：将文件读取为二进制字符串
 * 3.readAsDataURL(file)：将文件读取为Data URL
 * 4.readAsText(file, [encoding])：将文件读取为文本，encoding缺省值为'UTF-8'
 */

/**
 * 文件解析类, 将excel文件解析成JSON格式
 * 
 * @param {any} file 被解析文件
 * @param {boolean} rABS 是否将文件读取为二进制字符串,可选(默认为false)
 */
function FileAnalyze(file, rABS){
    this.file = file;
    this.rABS = false;
    if(rABS){
        this.rABS = rABS;
    }
}

FileAnalyze.prototype = {
    constructor: FileAnalyze,

    // 解析文件
    analyze: function(){
        var wb, fileData;
        var dtd = $.Deferred();
        var reader = new FileReader();

        // IE
        if (!FileReader.prototype.readAsBinaryString) {
            FileReader.prototype.readAsBinaryString = function (fileData) {
                var binary = '';
                var pt = this;
                var reader = new FileReader();      
                reader.onload = function () {
                    var bytes = new Uint8Array(reader.result);
                    var length = bytes.byteLength;
                    for (var i = 0; i < length; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    //pt.result  - readonly so assign binary
                    pt.content = binary;
                    $(pt).trigger('onload');
                };
                reader.readAsArrayBuffer(fileData);
            };
        }

        if(this.rABS) {
            reader.readAsArrayBuffer(this.file);
        } else { 
            reader.readAsBinaryString(this.file);
        }
        reader.onload = function(e) {
            // var data = e.target.result;
            var data;
            if(!e){
                data = reader.content;
            }else{
                data = e.target.result; 
            } 
            if(this.rABS) {
                //手动转化 
                wb = XLSX.read(btoa(this.fixdata(data)), {type: 'base64'});
            } else {
                wb = XLSX.read(data, {
                    type: 'binary'
                });
            }
            //wb.SheetNames[0]是获取Sheets中第一个Sheet的名字,wb.Sheets[Sheet名]获取第一个Sheet的数据
            fileData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            // 改变promise状态并传入data
            dtd.resolve(fileData);
        };
        return dtd.promise();
    },
    
    // 文件流转BinaryString
    fixdata: function(data){
        var o = '',
            l = 0,
            w = 10240;
        for(; l < data.byteLength / w; ++l){ 
            o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
        }
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return o;
    },

    // 导出Excel
    downloadExl: function(data, title, type) {
        var uA = window.navigator.userAgent,
            isIE = /msie\s|trident\/|edge\//i.test(uA) && !!(document.uniqueID || document.documentMode || window.ActiveXObject || window.MSInputMethodContext);
        var _this = this;
        var json = [];
        $.extend(json, data);
        var tmpdata = json[0];
        json.unshift({});
        var keyMap = []; //获取keys
        for (var k in tmpdata) {
            keyMap.push(k);
            json[0][k] = k;
        }
        tmpdata = [];//用来保存转换好的json 
        json.map(function(v, i){
            return keyMap.map(function(k, j){
                return $.extend({}, {
                    v: v[k],
                    position: (j > 25 ? _this.getCharCol(j) : String.fromCharCode(65 + j)) + (i + 1)
                });
            });
        }).reduce(function(prev, next){
            return prev.concat(next);
        }).forEach(function(v){
            return tmpdata[v.position] = {
                v: v.v
            };
        });
        var outputPos = Object.keys(tmpdata); //设置区域,比如表格从A1到D10
        var tmpWB = {
            SheetNames: ['Sheet1'], //保存的表标题
            Sheets: {
                'Sheet1': $.extend({},
                    tmpdata, //内容
                    {
                        '!ref': outputPos[0] + ':' + outputPos[outputPos.length - 1] //设置填充区域
                    })
            }
        };
        var tmpDown = new Blob([_this.s2ab(XLSX.write(tmpWB, 
            {bookType: (type == undefined ? 'xlsx':type),bookSST: false, type: 'binary'}//这里的数据是用来定义导出的格式类型
        ))], {
            type: ''
        }); //创建二进制对象写入转换好的字节流
        var href = URL.createObjectURL(tmpDown); //创建对象超链接
        document.getElementById('hf').href = href; //绑定a标签
        document.getElementById('hf').download = title==''?'未命名.xlsx':title+'.xlsx'; //文件名
        if(isIE){
            // 兼容IE11无法触发下载的问题
            navigator.msSaveBlob(tmpDown, title==''?'未命名.xlsx':title+'.xlsx');
        }else{
            document.getElementById('hf').click();
        }
        setTimeout(function() { //延时释放
            URL.revokeObjectURL(tmpDown); //用URL.revokeObjectURL()来释放这个object URL
        }, 100);
    },

    // 字符串转字符流
    s2ab: function(s){ 
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    },

    // 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
    getCharCol: function(n) {
        var s = '',m = 0;
        while (n > 0) {
            m = n % 26 + 1;
            s = String.fromCharCode(m + 64) + s;
            n = (n - m) / 26;
        }
        return s;
    }
};
