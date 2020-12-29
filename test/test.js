const db = require("oracledb");
const config = require("../src/config.json");

function formatMetaData(metaData) {
    var f = new Array;
    for (let index = 0; index < metaData.length; index++) {
        f.push(metaData[index].name);
    }
    return f;
}

function formatData(rows) {
    var f = new Array;
    for (let i = 0; i < rows.length; i++) {
        f[i] = new Array;
        for (let j = 0; j < rows[i].length; j++) {
            f[i].push(rows[i][j]);
        }
    }
    return f;
}

db.getConnection(
    config,
    (err, connection) => {
        if (err) {
            console.error(err.message);
            return;
        }
        connection.execute("SELECT * FROM teacher",
            function (err, result) {
                if (err) {
                    console.error(err.message);
                    return;
                }
                //打印返回的表结构
                console.log(result.metaData);
                //打印返回的行数据
                console.log(result.rows);
            }
        );
    }
);
