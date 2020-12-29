const { app, BrowserWindow, ipcMain } = require('electron');
const DataBase = require("oracledb");
const config = require("../config.json");

var DBC = null;
var win = null;
var studentPage = null;
var adminPage = null;

app.on('ready', () => {
    win = CreateWindows('../../dist/index.html', 600, 500);
    win.on('closed', () => {
        win = null;
    });
});;

ipcMain.on('exeSql', (event, sql) => {
    DBC.execute(sql,
        (err, result) => {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log("Execute Sql successed")
            event.reply('effect', result);
        }
    );
});

ipcMain.on('getData', (event, sql) => {
    DBC.execute(sql,
        (err, result) => {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log("Get data successed")
            event.reply('gotData', result);
        }
    );
});

ipcMain.on('getTeachers', (event) => {
    DBC.execute('select tname from teacher',
        (err, result) => {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log("Get data successed")
            event.reply('gotTeachers', result);
        }
    );
});

ipcMain.on('createUser', (_event, userId) => {
    DBC.execute(`CREATE user S${userId} IDENTIFIED BY pwd${userId}`,
        (err) => {
            if (err) {
                console.error(err.message);
                return;
            }
            DBC.execute(`grant CONNECT,RESOURCE to S${userId}`);
            DBC.execute(`grant SELECT any table to S${userId}`);
            DBC.execute(`grant UPDATE any table to S${userId}`);
            DBC.execute(`grant DELETE any table to S${userId}`);
            DBC.execute(`grant INSERT any table to S${userId}`);
        });
});

ipcMain.on('syncLogin', (event) => {
    event.reply('syncLogin', config.user);
});

ipcMain.on('openStudentPage', (event, user, password) => {
    config.user = user;
    config.password = password;
    DataBase.getConnection(
        config,
        (err, connection) => {
            if (err) {
                console.error(err.message);
                event.reply('login', err.message);
                return;
            } else {
                DBC = connection;
                event.reply('login', '登录成功!');
                console.log(`Student: ${user} login successed!`);
                setTimeout(() => {
                    studentPage = CreateWindows('../../dist/studentPage.html', 1060, 600);
                    studentPage.on('closed', () => {
                        DBC.close;
                        console.log(`Student: ${user} logout`);
                        studentPage = null;
                    });
                }, 1000);
            }
        }
    );
})

ipcMain.on('openAdminPage', (event, user, password) => {
    config.user = user;
    config.password = password;
    DataBase.getConnection(
        config,
        (err, connection) => {
            if (err) {
                console.error(err.message);
                event.reply('login', err.message);
                return;
            } else {
                DBC = connection;
                event.reply('login', '登录成功!');
                console.log(`Admin: ${user} login successed!`);
                setTimeout(() => {
                    adminPage = CreateWindows('../../dist/adminPage.html', 1060, 600);
                    adminPage.on('closed', () => {
                        DBC.close;
                        console.log(`Admin: ${user} logout`);
                        adminPage = null;
                    });
                }, 1000);
            }
        }
    );
})

app.on('window-all-closed', () => {
    app.quit();
})

/**
 * 新建窗口
 * @param {String} FileDir
 * @param {Number} WindowsWidth
 * @param {Number} WindowsHight
 * @returns {BrowserWindow}
 */
function CreateWindows(FileDir, WindowsWidth, WindowsHight) {
    let page = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            preload: __dirname + '/preload.js'
        },
        width: WindowsWidth,
        height: WindowsHight,
        minWidth: WindowsWidth,
        minHeight: WindowsHight
    });
    page.loadFile(FileDir);
    return page;
}