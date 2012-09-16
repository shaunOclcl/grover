var istanbul = require('istanbul');
var path = require('path');
var Table = require('cli-table');
var util = require('../lib/index');
var coverageInfo = {};
var coverageType = 'yuitest';

var options;

exports.options = function(o) {
    options = o;
};

var set = function(json) {
    var d = {}, i;
    for (i in json) {
        d[i] = json[i];
        delete d[i].code;
    }

    for (i in json) {
        coverageInfo[i] = coverageInfo[i] || {};
        coverageInfo[i].path = i;
        coverageInfo[i].calledLines = coverageInfo[i].calledLines || 0;
        coverageInfo[i].coveredLines = coverageInfo[i].coveredLines || 0;
        coverageInfo[i].calledFunctions = coverageInfo[i].calledFunctions || 0;
        coverageInfo[i].coveredFunctions = coverageInfo[i].coveredFunctions || 0;

        coverageInfo[i].calledLines += json[i].calledLines;
        coverageInfo[i].coveredLines += json[i].coveredLines;
        coverageInfo[i].calledFunctions += json[i].calledFunctions;
        coverageInfo[i].coveredFunctions += json[i].coveredFunctions;
    }
};

exports.set = set;

var printYUITestReport = function() {
    var items = [],
        table = new Table({
            head: ['path', 'lines', '%', 'functions', '%' ],
            colAligns: [ 'left', 'center', 'right', 'center', 'right'  ],
            style: {
                'padding-left': 2,
                'padding-right': 2,
                head: ['blue']
            }
        });
    Object.keys(coverageInfo).forEach(function(item) {
        items.push(coverageInfo[item]);
    });

    items.sort(function(a, b) {
        if (!a.path || !b.path) {
            return 0;
        }    
        var an = a.path.toLowerCase(),
            bn = b.path.toLowerCase(),
            ret = 0; 

        if (an < bn) {
            ret = -1;
        }    
        if (an > bn) {
            ret =  1; 
        }
        return ret;
    });

    items.forEach(function(row) {
        var err,
            percentLine = Math.floor((row.calledLines / row.coveredLines) * 100),
            percentFunction = Math.floor((row.calledFunctions / row.coveredFunctions) * 100),
            cell = [
                row.path,
                row.calledLines + '/' + row.coveredLines,
                percentLine + '%',
                row.calledFunctions + '/' + row.coveredFunctions,
                percentFunction + '%',
            ];

        if (percentLine <= options.coverageWarn) {
            err = true;
            cell[1] = String(cell[1]).red;
            cell[2] = String(cell[2]).red;
        }
        if (percentFunction <= options.coverageWarn) {
            err = true;
            cell[3] = String(cell[3]).red;
            cell[4] = String(cell[4]).red;
        }
        if (err) {
            cell[0] = util.bad.red + ' ' + cell[0];
        } else {
            cell[0] = util.good.green + ' ' + cell[0];
        }
        table.push(cell);
    });
    console.log(table.toString());
};

var printIstanbulReport = function() {
};

var report = function() {
    if (coverageType === 'istanbul') {
        printIstanbulReport();   
    } else {
        printYUITestReport();
    }
};

exports.report = report;


var getYUIStatus = function(coverage) {
    var cov = {
        lines: 0,
        hit: 0,
        miss: 0,
        percent: 0
    }, i, str;
    for (i in coverage) {
        cov.lines = cov.lines + coverage[i].coveredLines;
        cov.miss = cov.miss + (coverage[i].coveredLines - coverage[i].calledLines);
        cov.hit = cov.hit + coverage[i].calledLines;
    }
    cov.percent = Math.floor((cov.hit / cov.lines) * 100);

    str = (' ' + cov.percent + '%').blue;
    return str;
};

var getIstanbulStatus = function() {
};


var status = function(json) {
    var out;
    if (json.coverageType && json.coverageType === 'istanbul') {
        coverageType = 'istanbul';
        out = getIstanbulStatus(json);
    } else {
        out = getYUIStatus(json);
    }
    return out;
};

exports.status = status;