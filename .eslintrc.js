module.exports = {
    "env": {
        "browser": true,
        "jquery": true
    },
    "globals": {
        "echarts": true,
        "XLSX": true,
        "Uint8Array": true,
        "ArrayBuffer": true,
        "FileAnalyze": true,
        "DataMap": true,
        "HeatMap": true,
        "Snap": true,
        "mina": true,
        "transformProvince": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};