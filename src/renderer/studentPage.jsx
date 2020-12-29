import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'
import { makeStyles } from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import RefreshRoundedIcon from '@material-ui/icons/RefreshRounded';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

let studentID;
const ipcRenderer = window.ipcRenderer;
const ColumnName = {
	SNO: "学号",
	SNAME: "姓名",
	SAGE: "年龄",
	SSEX: "性别",
	CNO: "课程号",
	CNAME: "课程名称",
	CCREDIT: "课程学分",
	GRADE: "课程成绩",
	TNAME: "任课教师",
	TTITLE: "教师职称",
	AVG: "平均成绩",
	SUM: "总学分",
	MAX: "最高分",
	MIN: "最低分"
}

/**
 * 个人信息面板
 * @param {Object} props 
 */
function PersonalPanel(props) {
	const { index, ...other } = props;

	const [values, setValues] = React.useState({
		columns: [],
		rows: [[]]
	})

	const RefreshData = (time) => {
		setTimeout(() => {
			ipcRenderer.send('getData', getSql(index));
			ipcRenderer.once('gotData', (_event, result) => {
				setValues({ ...values, columns: formatMetaData(result.metaData), rows: result.rows });
				//console.log("got data");
			});
		}, time);
	}

	useEffect(() => {
		RefreshData(0);
	}, []);

	return (
		<div
			role="personalpanel"
			{...other}
		>
			<Box p={3}>
				<Paper>
					<List>
						{values.columns.map((value, index) => (
							<ListItem key={index}>
								<ListItemText primary={value} secondary={values.rows[0][index]} />
							</ListItem>
						))}
					</List>
				</Paper>
			</Box>
		</div>
	);
}

/**
 * 选课面板
 * @param {Object} props 
 */
function CoursePanel(props) {
	const { index, ...other } = props;


	const [values, setValues] = React.useState({
		columns: [],
		rows: [[]],
		newCourse: [[]],
		open: false
	});
	const RefreshData = (i) => {
		if (i) {
			ipcRenderer.send('getData', getSql(5));
			ipcRenderer.once('gotData', (_event, result) => {
				setValues({ ...values, newCourse: result.rows });
				//console.log("got data");
			});
		} else {
			ipcRenderer.send('getData', getSql(index));
			ipcRenderer.once('gotData', (_event, result) => {
				setValues({ ...values, columns: formatMetaData(result.metaData), rows: result.rows });
			})
		}
	}

	useEffect(() => {
		RefreshData(0);
	}, [values.open]);

	const selectCourse = (line) => {
		ipcRenderer.send('exeSql', getSql(6, values.newCourse[line][0]));
		commit(500);
		setValues({ ...values, open: true });
		console.log(values.open);
	}

	const dropCourse = (line) => {
		ipcRenderer.send('exeSql', getSql(7, values.rows[line][0]));
		commit(500);
		setValues({ ...values, open: true });
		console.log(values.open);
	}

	const handleClickClose = (_event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setValues({ ...values, open: false });
	}

	return (
		<div
			role="coursepanel"
			{...other}
		>
			<Box p={3}>
				<Grid container spacing={4}>
					<Grid item xs={12}>
						<span style={{ fontSize: 32 }}>已选课程</span>
						<hr />
					</Grid>
					<Grid item xs={12}>
						<TableContainer component={Paper}>
							<Table aria-label={index}>
								<TableHead>
									<TableRow>
										{values.columns.map((value, index) => (
											<TableCell align="center" key={index}>{value}</TableCell>
										))}
										<TableCell align="center">
											操作
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{values.rows.map((row, index) => (
										<TableRow key={index}>
											{row.map((value, i) => (
												<TableCell align="center" key={i}>{value}</TableCell>
											))}
											<TableCell align="center">
												<Button
													variant="outlined"
													onClick={() => dropCourse(index)}
												>
													退课
													</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Grid>
					<Grid item xs={12}>
						<div style={{ display: "flex" }}>
							<span style={{ fontSize: 32 }}>可选课程</span>
							<IconButton
								onClick={() => RefreshData(1)}
								style={{ height: 48 }}>
								<RefreshRoundedIcon />
							</IconButton>
						</div>
						<hr />
					</Grid>
					<Grid item xs={12}>
						<TableContainer component={Paper}>
							<Table aria-label={index}>
								<TableHead>
									<TableRow>
										{values.columns.map((value, index) => (
											<TableCell align="center" key={index}>{value}</TableCell>
										))}
										<TableCell align="center">
											操作
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{values.newCourse.map((row, index) => (
										<TableRow key={index}>
											{row.map((value, i) => (
												<TableCell align="center" key={i}>{value}</TableCell>
											))}
											<TableCell align="center">
												<Button
													variant="outlined"
													onClick={() => selectCourse(index)}
												>
													选课
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Grid>
					<Snackbar open={values.open} autoHideDuration={6000} onClose={handleClickClose}>
						<MuiAlert onClose={handleClickClose} elevation={6} variant="filled" severity="success">
							操作成功，请刷新页面
						</MuiAlert>
					</Snackbar>
				</Grid>
			</Box>
		</div >
	);
}

/**
 * 成绩面板
 * @param {Object} props 
 */
function ScorePanel(props) {
	const { index, ...other } = props;

	const [values, setValues] = React.useState({
		columns: [],
		rows: [[]],
		summaryC: [],
		summaryR: [[]]
	});

	const RefreshData = (i) => {
		if (i) {
			ipcRenderer.send('getData', getSql(8));
			ipcRenderer.once('gotData', (_event, result) => {
				setValues({ ...values, summaryC: formatMetaData(result.metaData), summaryR: result.rows });
				//console.log("gotData");
			});
		} else {
			ipcRenderer.send('getData', getSql(index));
			ipcRenderer.once('gotData', (_event, result) => {
				setValues({ ...values, columns: formatMetaData(result.metaData), rows: result.rows });
			})
		}
	}

	useEffect(() => {
		RefreshData(0);
	}, []);

	return (
		<div
			role="scorepanel"
			{...other}
		>
			<Box p={3}>
				<Grid container spacing={4}>
					<Grid item xs={12}>
						<span style={{ fontSize: 32 }}>各科成绩</span>
						<hr />
					</Grid>
					<Grid item xs={12}>
						<Paper>
							<TableContainer>
								<Table aria-label={index}>
									<TableHead>
										<TableRow>
											{values.columns.map((value, index) => (
												<TableCell align="center" key={index}>{value}</TableCell>
											))}
										</TableRow>
									</TableHead>
									<TableBody>
										{values.rows.map((row, index) => (
											<TableRow key={index}>
												{row.map((value, i) => (
													<TableCell align="center" key={i}>{value}</TableCell>
												))}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</Paper>
					</Grid>
					<Grid item xs={12}>
						<div style={{ display: "flex" }}>
							<span style={{ fontSize: 32 }}>统计</span>
							<IconButton
								onClick={() => RefreshData(1)}
								style={{ height: 48 }}>
								<RefreshRoundedIcon />
							</IconButton>
						</div>
						<hr />
					</Grid>
					<Grid item xs={12}>
						<Paper>
							<TableContainer>
								<Table aria-label={index}>
									<TableHead>
										<TableRow>
											{values.summaryC.map((value, index) => (
												<TableCell align="center" key={index}>{value}</TableCell>
											))}
										</TableRow>
									</TableHead>
									<TableBody>
										{values.summaryR.map((row, index) => (
											<TableRow key={index}>
												{row.map((value, i) => (
													<TableCell align="center" key={i}>{value}</TableCell>
												))}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</Paper>
					</Grid>
				</Grid>
			</Box>
		</div >
	);
}

/**
 * 修改信息面板
 * @param {Object} props 
 */
function EditPanel(props) {
	const { index, ...other } = props;
	const SEX = ["男", "女"];
	const [values, setValues] = useState({
		columns: [],
		SNAME: "",
		SAGE: "",
		SSEX: "",
		PASSWORD: "",
		OPEN: false
	});

	const RefreshData = (time) => {
		setTimeout(() => {
			ipcRenderer.send('getData', getSql(index));
			ipcRenderer.once('gotData', (_event, result) => {
				setValues({
					...values,
					columns: formatMetaData(result.metaData),
					rows: result.rows,
					SNAME: result.rows[0][1],
					SAGE: result.rows[0][2],
					SSEX: result.rows[0][3]
				});
				//console.log("got data");
			});
		}, time);
	}

	useEffect(() => {
		RefreshData(0);
	}, []);

	const handleChange = (prop) => (event) => {
		setValues({ ...values, [prop]: event.target.value });
	};

	const handleClick = () => {
		ipcRenderer.send('exeSql',
			`UPDATE DBLESSON.student SET sname = '${values.SNAME}', sage = ${values.SAGE}, ssex = '${values.SSEX}' WHERE sno='${studentID}'`
		);
		if (values.PASSWORD != "") {
			ipcRenderer.send('exeSql', getSql(4, values.PASSWORD));
		}
		commit(500);
		setValues({ ...values, OPEN: true });
	}

	const handleClickClose = (_event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setValues({ ...values, OPEN: false });
	}

	return (
		<div
			role="editpanel"
			{...other}
		>
			<Box p={3}>
				<Paper>
					<Grid container spacing={4} style={{ width: "100%", padding: 16 }}>
						<Grid item xs={6}>
							<TextField
								fullWidth
								label={values.columns[0]}
								value={studentID}
								InputProps={{
									readOnly: true,
								}}
								variant="outlined"
								helperText="不可修改"
								style={{ margin: 8 }}
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								fullWidth
								value={values.SNAME}
								label={values.columns[1]}
								variant="outlined"
								onChange={handleChange('SNAME')}
								style={{ margin: 8 }}
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								fullWidth
								type="number"
								value={values.SAGE}
								label={values.columns[2]}
								variant="outlined"
								onChange={handleChange('SAGE')}
								style={{ margin: 8 }}
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								select
								fullWidth
								value={values.SSEX}
								label={values.columns[3]}
								variant="outlined"
								onChange={handleChange('SSEX')}
								style={{ margin: 8 }}
							>
								{SEX.map((v) => (
									<option key={v} value={v}>{v}</option>
								))}
							</TextField>
						</Grid>
						<Grid item xs={6}>
							<TextField
								fullWidth
								label="新密码"
								variant="outlined"
								value={values.PASSWORD}
								onChange={handleChange('PASSWORD')}
								style={{ margin: 8 }}
							/>
						</Grid>
						<Grid item xs={6} style={{ position: "relative" }}>
							<Button
								variant="contained"
								color="secondary"
								style={{ position: "absolute", right: 0, bottom: 0 }}
								onClick={handleClick}
							>
								确认修改
								</Button>
						</Grid>
						<Snackbar open={values.OPEN} autoHideDuration={6000} onClose={handleClickClose}>
							<MuiAlert onClose={handleClickClose} elevation={6} variant="filled" severity="success">
								修改成功，请刷新页面查看
								</MuiAlert>
						</Snackbar>
					</Grid>
				</Paper>
			</Box>
		</div>
	);
}

/**
 * 获取SQL语句
 * @param {Number}} index 
 * @param {String} set 
 */
function getSql(index, set) {
	switch (index) {
		//获取基本信息
		case 0:
			return `SELECT * from DBLESSON.student WHERE sno='${studentID}'`;
		case 1:
			return `SELECT course.cno, course.cname, course.ccredit, teacher.tname, teacher.ttitle from DBLESSON.course JOIN DBLESSON.teacher on course.tno = teacher.tno WHERE course.cno in (SELECT cno from DBLESSON.sc WHERE sno='${studentID}')`;
		case 2:
			return `SELECT course.cno, course.cname, course.ccredit, sc.grade from DBLESSON.sc JOIN DBLESSON.course ON sc.cno = course.cno WHERE sno='${studentID}'`;
		case 3:
			return `SELECT * from DBLESSON.student WHERE sno='${studentID}'`;
		//修改信息页
		case 4:
			return `alter user S${studentID} identified by ${set}`;
		//选课页
		case 5:
			return `SELECT course.cno, course.cname, course.ccredit, teacher.tname, teacher.ttitle from DBLESSON.course JOIN DBLESSON.teacher on course.tno = teacher.tno WHERE course.cno not in (SELECT cno from DBLESSON.sc WHERE sno='${studentID}')`;
		case 6:
			return `INSERT INTO DBLESSON.sc VALUES(${studentID},${set},0)`;
		case 7:
			return `DELETE DBLESSON.sc where cno='${set}' and sno='${studentID}'`;
		case 8:
			return `SELECT sum,avg,max,min FROM DBLESSON.StudentSummary where sno='${studentID}'`;
	}
}

/**
 * 提交修改
 * @param {Number} time 
 */
function commit(time) {
	setTimeout(() => {
		ipcRenderer.send('exeSql', 'COMMIT');
	}, time);
}

/**
 * 格式化并翻译列表名
 * @param {Array} metaData 
 */
function formatMetaData(metaData) {
	var f = new Array;
	for (let index = 0; index < metaData.length; index++) {
		f.push(ColumnName[metaData[index].name]);
	}
	return f;
}

/**
 * 格式化元组数据
 * @param {Array} rows 
 */
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

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
		backgroundColor: theme.palette.background.paper,
		display: 'flex',
		height: "100%",
	},
	tabs: {
		borderRight: `1px solid ${theme.palette.divider}`,
	},
	panel: {
		width: '75%',
	},
}));

/**
 * 主页面
 */
function App() {
	const classes = useStyles();
	const [value, setValue] = React.useState(0);

	const handleChange = (_event, newValue) => {
		setValue(newValue);
		//console.log(value);
	};

	useEffect(() => {
		ipcRenderer.send('syncLogin');
		ipcRenderer.once('syncLogin', (_event, user = "") => {
			studentID = user.slice(1);
		});
	}, [])

	return (
		<div className={classes.root}>
			<Tabs
				orientation="vertical"
				variant="scrollable"
				value={value}
				onChange={handleChange}
				aria-label="Vertical tabs"
				className={classes.tabs}
			>
				<Tab label="个人信息" />
				<Tab label="选课信息" />
				<Tab label="成绩查询" />
				<Tab label="修改信息" />
			</Tabs>
			{value == 0 && (<PersonalPanel index={0} className={classes.panel} />)}
			{value == 1 && (<CoursePanel index={1} className={classes.panel} />)}
			{value == 2 && (<ScorePanel index={2} className={classes.panel} />)}
			{value == 3 && (<EditPanel index={3} className={classes.panel} />)}
		</div>
	);
}

ReactDOM.render(<App />, document.getElementById('root'))