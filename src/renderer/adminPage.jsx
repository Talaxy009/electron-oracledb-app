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
import FormControl from "@material-ui/core/FormControl";
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ButtonGrop from '@material-ui/core/ButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import RefreshRoundedIcon from '@material-ui/icons/RefreshRounded';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

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
	TNO: "教师工号",
	TNAME: "教师",
	TTITLE: "教师职称",
	TSALARY: "教师工资",
	AVG: "平均成绩",
	SUM: "总学分",
	MAX: "最高分",
	MIN: "最低分",
	AVGSALARY: "平均月薪",
	MEMBERS: "人数",
	AVGGRADE: "平均成绩",
	MAXGRADE: "最高分",
	MINGRADE: "最低分",
}

const Teachers = [];

const panelStylesTypeA = makeStyles((theme) => ({
	inputrow: {
		'& .MuiTableCell-root': {
			padding: 4,
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
			width: 110,
		},
	},
}))

const panelStylesTypeB = makeStyles((theme) => ({
	inputrow: {
		'& .MuiTableCell-root': {
			padding: 4,
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
			width: 90,
		},
	},
}))

/**
 * 学生管理面板
 * @param {Object} props 
 */
function StudentPanel(props) {
	const classes = panelStylesTypeA();
	const { index, ...other } = props;
	const SEX = ["男", "女"];
	const [values, setValues] = useState({
		columns: [],
		rows: [[]],
		SNO: "",
		SNAME: "",
		SAGE: "",
		SSEX: "",
		student: "",
		grade: [[]],
		open: false,
		editMod: false,
		status: true,
		summaryC: [],
		summaryR: [[]]
	});

	const RefreshData = (i) => {
		if (i) {
			ipcRenderer.send('getData', getSql(7));
			ipcRenderer.once('gotData', (_event, result) => {
				setValues({ ...values, summaryC: formatMetaData(result.metaData), summaryR: result.rows });
				//console.log("gotData");
			});
		} else {
			ipcRenderer.send('getData', getSql(index));
			ipcRenderer.once('gotData', (_event, result) => {
				setValues({ ...values, columns: formatMetaData(result.metaData), rows: result.rows });
				//console.log("got data");
			});
		}
	}

	useEffect(() => {
		RefreshData(0);
	}, [values.open]);

	const handleChange = (prop) => (event) => {
		setValues({ ...values, [prop]: event.target.value });
	};

	const edit = (line) => {
		setValues({
			...values,
			SNO: values.rows[line][0],
			SNAME: values.rows[line][1],
			SAGE: values.rows[line][2],
			SSEX: values.rows[line][3],
			editMod: true
		});
	}

	const drop = (line) => {
		ipcRenderer.send('exeSql', getSql(3, values.rows[line][0]));
		ipcRenderer.send(`exeSql','DROP USER S${values.rows[line][0]}`);
		clearValues();
		commit(500);
	}

	const clearValues = () => {
		ipcRenderer.once('effect', (_event, result) => {
			setValues({
				...values,
				SNO: "",
				SNAME: "",
				SAGE: "",
				SSEX: "",
				open: true,
				editMod: false,
				status: result.rowsAffected
			});
		});
	}

	const editDone = () => {
		ipcRenderer.send('exeSql',
			`UPDATE student SET sname = '${values.SNAME}', sage= ${values.SAGE},ssex='${values.SSEX}' WHERE sno='${values.SNO}'`
		);
		clearValues();
		commit(500);
	}

	const addDone = () => {
		ipcRenderer.send('createUser', values.SNO);
		ipcRenderer.send('exeSql',
			`INSERT INTO student VALUES(${values.SNO},'${values.SNAME}',${values.SAGE},'${values.SSEX}')`
		);
		clearValues();
		commit(500);
	}

	const searchStudent = () => {
		ipcRenderer.send('getData', getSql(6, values.student));
		console.log(values.student);
		ipcRenderer.once('gotData', (_event, result) => {
			setValues({ ...values, grade: result.rows });
		});
	}

	const changeGrade = (line) => (event) => {
		let setG = event.target.value;
		if (setG > 100 || setG < 0) {
			return;
		}
		setValues({
			...values,
			grade: values.grade.map((item, _line) => _line == line ? { ...item, [2]: setG } : item)
		})
	}

	const inDone = () => {
		for (let line = 0; line < values.grade.length; line++) {
			ipcRenderer.send('exeSql',
				`UPDATE sc SET grade='${values.grade[line][2]}' WHERE sno='${values.student}' and cno='${values.grade[line][0]}'`
			);
		}
		setValues({ ...values, open: true });
		commit(250);
	}

	const handleClickClose = (_event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setValues({ ...values, open: false, status: true });
	}

	return (
		<div
			role="studentpanel"
			{...other}
		>
			<Box p={3}>
				<Grid container spacing={4}>
					<Grid item xs={12}>
						<span style={{ fontSize: 32 }}>学生信息</span>
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
											<TableCell align="center">操作</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{values.rows.map((row, index) => (
											<TableRow key={index}>
												{row.map((value, i) => (
													<TableCell align="center" key={i}>{value}</TableCell>
												))}
												<TableCell align="center">
													<ButtonGrop variant="outlined">
														<Button onClick={() => edit(index)}>编辑</Button>
														<Button onClick={() => drop(index)}>删除</Button>
													</ButtonGrop>
												</TableCell>
											</TableRow>
										))}
										<TableRow className={classes.inputrow}>
											<TableCell align="center">
												<TextField
													size="small"
													type="number"
													InputProps={{
														readOnly: values.editMod,
													}}
													value={values.SNO}
													onChange={handleChange('SNO')}
												/>
											</TableCell>
											<TableCell align="center">
												<TextField
													size="small"
													value={values.SNAME}
													onChange={handleChange('SNAME')}
												/>
											</TableCell>
											<TableCell align="center">
												<TextField
													size="small"
													type="number"
													value={values.SAGE}
													onChange={handleChange('SAGE')}
												/>
											</TableCell>
											<TableCell align="center">
												<TextField
													select
													size="small"
													value={values.SSEX}
													onChange={handleChange('SSEX')}
												>
													{SEX.map((v) => (
														<option key={v} value={v}>{v}</option>
													))}
												</TextField>
											</TableCell>
											<TableCell align="center">
												{values.editMod ? (
													<Button onClick={editDone} variant="outlined">完成</Button>
												) : (
														<Button onClick={addDone} variant="outlined">添加</Button>
													)}
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</TableContainer>
						</Paper>
					</Grid>
					<Grid item xs={12}>
						<span style={{ fontSize: 32 }}>成绩录入</span>
						<hr />
					</Grid>
					<Grid item xs={12}>
						<FormControl fullWidth variant="outlined" style={{ margin: 8 }}>
							<InputLabel htmlFor="studentInput">学生学号</InputLabel>
							<OutlinedInput
								id="studentdInput"
								value={values.student}
								onChange={handleChange('student')}
								labelWidth={64}
								endAdornment={
									<InputAdornment position="end">
										<IconButton
											id="search"
											onClick={searchStudent}
										>
											<SearchRoundedIcon />
										</IconButton>
									</InputAdornment>
								}
							/>
						</FormControl>
					</Grid>
					<Grid item xs={12}>
						<TableContainer component={Paper}>
							<Table aria-label={index}>
								<TableHead>
									<TableRow>
										{values.grade.map((value, index) => (
											<TableCell align="center" key={index}>{value[1]}</TableCell>
										))}
										<TableCell align="center">操作</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow>
										{values.grade.map((value, index) => (
											<TableCell align="center" key={value}>
												<TextField
													size="small"
													type="number"
													value={values.grade[index][2]}
													onChange={changeGrade(index)}
												/>
											</TableCell>
										))}
										<TableCell align="center">
											<Button onClick={inDone} variant="outlined">完成</Button>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</TableContainer>
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
				<Snackbar open={values.open} autoHideDuration={6000} onClose={handleClickClose}>
					{values.status ? (
						<MuiAlert onClose={handleClickClose} elevation={6} variant="filled" severity="success">
							修改成功，请刷新页面查看
						</MuiAlert>
					) : (
							<MuiAlert onClose={handleClickClose} elevation={6} variant="filled" severity="error">
								操作失败，请检查
							</MuiAlert>
						)}
				</Snackbar>
			</Box>
		</div>
	);
}

/**
 * 教师管理面板
 * @param {Object} props 
 */
function TeacherPanel(props) {
	const classes = panelStylesTypeA();
	const { index, ...other } = props;
	const TITLE = ["助讲", "导师", "教授", "辅导员", "系主任"];
	const [values, setValues] = useState({
		columns: [],
		rows: [[]],
		TNO: "",
		TNAME: "",
		TTITLE: "",
		TSALARY: "",
		open: false,
		editMod: false,
		status: true,
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
				//console.log("got data");
			});
		}
	}

	useEffect(() => {
		RefreshData(0);
	}, [values.open]);

	const handleChange = (prop) => (event) => {
		setValues({ ...values, [prop]: event.target.value });
	};

	const edit = (line) => {
		setValues({
			...values,
			TNO: values.rows[line][0],
			TNAME: values.rows[line][1],
			TTITLE: values.rows[line][2],
			TSALARY: values.rows[line][3],
			editMod: true
		});
	}

	const drop = (line) => {
		ipcRenderer.send('exeSql', getSql(4, values.rows[line][0]));
		clearValues();
		commit(500);
	}

	const clearValues = () => {
		ipcRenderer.once('effect', (_event, result) => {
			setValues({
				...values,
				TNO: "",
				TNAME: "",
				TTITLE: "",
				TSALARY: "",
				open: true,
				editMod: false,
				status: result.rowsAffected
			});
		});
	}

	const editDone = () => {
		ipcRenderer.send('exeSql',
			`UPDATE teacher SET tname = '${values.TNAME}', ttitle = '${values.TTITLE}',tsalary=${values.TSALARY} WHERE tno='${values.TNO}'`
		);
		clearValues();
		commit(500);
	}

	const addDone = () => {
		ipcRenderer.send('exeSql',
			`INSERT INTO teacher VALUES('${values.TNO}','${values.TNAME}','${values.TTITLE}',${values.TSALARY})`
		);
		clearValues();
		commit(500);
	}

	const handleClickClose = (_event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setValues({ ...values, open: false, status: true });
	}

	return (
		<div
			role="teacherpanel"
			{...other}
		>
			<Box p={3}>
				<Grid container spacing={4}>
					<Grid item xs={12}>
						<span style={{ fontSize: 32 }}>教师信息</span>
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
											<TableCell align="center">操作</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{values.rows.map((row, index) => (
											<TableRow key={index}>
												{row.map((value, i) => (
													<TableCell align="center" key={i}>{value}</TableCell>
												))}
												<TableCell align="center">
													<ButtonGrop variant="outlined">
														<Button onClick={() => edit(index)}>编辑</Button>
														<Button onClick={() => drop(index)}>删除</Button>
													</ButtonGrop>
												</TableCell>
											</TableRow>
										))}
										<TableRow className={classes.inputrow}>
											<TableCell align="center">
												<TextField
													size="small"
													InputProps={{
														readOnly: values.editMod,
													}}
													value={values.TNO}
													onChange={handleChange('TNO')}
												/>
											</TableCell>
											<TableCell align="center">
												<TextField
													size="small"
													value={values.TNAME}
													onChange={handleChange('TNAME')}
												/>
											</TableCell>
											<TableCell align="center">
												<TextField
													select
													size="small"
													type="number"
													value={values.TTITLE}
													onChange={handleChange('TTITLE')}
												>
													{TITLE.map((v) => (
														<option key={v} value={v}>{v}</option>
													))}
												</TextField>
											</TableCell>
											<TableCell align="center">
												<TextField
													size="small"
													type="number"
													value={values.TSALARY}
													onChange={handleChange('TSALARY')}
												/>
											</TableCell>
											<TableCell align="center">
												{values.editMod ? (
													<Button onClick={editDone} variant="outlined">完成</Button>
												) : (
														<Button onClick={addDone} variant="outlined">添加</Button>
													)}
											</TableCell>
										</TableRow>
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
				<Snackbar open={values.open} autoHideDuration={6000} onClose={handleClickClose}>
					{values.status ? (
						<MuiAlert onClose={handleClickClose} elevation={6} variant="filled" severity="success">
							修改成功，请刷新页面查看
						</MuiAlert>
					) : (
							<MuiAlert onClose={handleClickClose} elevation={6} variant="filled" severity="error">
								操作失败，请检查
							</MuiAlert>
						)}
				</Snackbar>
			</Box>
		</div >
	);
}

/**
 * 课程管理面板
 * @param {Object} props 
 */
function CoursePanel(props) {
	const classes = panelStylesTypeB();
	const { index, ...other } = props;
	const [values, setValues] = useState({
		columns: [],
		rows: [[]],
		CNO: "",
		CNAME: "",
		CCREDIT: "",
		TNO: "",
		TNAME: "",
		open: false,
		editMod: false,
		status: true,
		summaryC: [],
		summaryR: [[]]
	});

	const RefreshData = (i) => {
		if (i) {
			ipcRenderer.send('getData', getSql(9));
			ipcRenderer.once('gotData', (_event, result) => {
				setValues({ ...values, summaryC: formatMetaData(result.metaData), summaryR: result.rows });
				//console.log("gotData");
			});
		} else {
			ipcRenderer.send('getData', getSql(index));
			ipcRenderer.once('gotData', (_event, result) => {
				setValues({ ...values, columns: formatMetaData(result.metaData), rows: result.rows });
				//console.log("got data");
			});

		}
	}

	useEffect(() => {
		RefreshData(0);
	}, [values.open]);

	const handleChange = (prop) => (event) => {
		setValues({ ...values, [prop]: event.target.value });
	};

	const edit = (line) => {
		setValues({
			...values,
			CNO: values.rows[line][0],
			CNAME: values.rows[line][1],
			CCREDIT: values.rows[line][2],
			TNO: values.rows[line][3],
			TNAME: values.rows[line][4],
			editMod: true
		});
	}

	const drop = (line) => {
		ipcRenderer.send('exeSql', getSql(5, values.rows[line][0]));
		clearValues();
		commit(500);
	}

	const clearValues = () => {
		ipcRenderer.once('effect', (_event, result) => {
			setValues({
				...values,
				CNO: "",
				CNAME: "",
				CCREDIT: "",
				TNO: "",
				TNAME: "",
				open: true,
				editMod: false,
				status: result.rowsAffected
			});
		});
	}

	const editDone = () => {
		ipcRenderer.send('exeSql',
			`UPDATE course SET CNAME = '${values.CNAME}', CCREDIT = ${values.CCREDIT}, TNO = (SELECT tno from teacher where tname='${values.TNAME}') WHERE CNO = '${values.CNO}'`
		);
		clearValues();
		commit(500);
	}

	const addDone = () => {
		ipcRenderer.send('exeSql',
			`INSERT INTO course VALUES(${values.CNO},'${values.CNAME}',${values.CCREDIT}, (SELECT tno from teacher where tname='${values.TNAME}'))`
		);
		clearValues();
		commit(500);
	}

	const handleClickClose = (_event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setValues({ ...values, open: false, status: true });
	}

	return (
		<div
			role="coursepanel"
			{...other}
		>
			<Box p={3}>
				<Grid container spacing={4}>
					<Grid item xs={12}>
						<span style={{ fontSize: 32 }}>课程信息</span>
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
											<TableCell align="center">操作</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{values.rows.map((row, index) => (
											<TableRow key={index}>
												{row.map((value, i) => (
													<TableCell align="center" key={i}>{value}</TableCell>
												))}
												<TableCell align="center">
													<ButtonGrop variant="outlined">
														<Button onClick={() => edit(index)}>编辑</Button>
														<Button onClick={() => drop(index)}>删除</Button>
													</ButtonGrop>
												</TableCell>
											</TableRow>
										))}
										<TableRow className={classes.inputrow}>
											<TableCell align="center">
												<TextField
													size="small"
													type="number"
													InputProps={{
														readOnly: values.editMod,
													}}
													value={values.CNO}
													onChange={handleChange('CNO')}
												/>
											</TableCell>
											<TableCell align="center">
												<TextField
													size="small"
													value={values.CNAME}
													onChange={handleChange('CNAME')}
												/>
											</TableCell>
											<TableCell align="center">
												<TextField
													size="small"
													type="number"
													value={values.CCREDIT}
													onChange={handleChange('CCREDIT')}
												/>
											</TableCell>
											<TableCell align="center">
												<TextField
													select
													size="small"
													value={values.TNAME}
													onChange={handleChange('TNAME')}
												>
													{Teachers.map((v) => (
														<option key={v} value={v}>{v}</option>
													))}
												</TextField>
											</TableCell>
											<TableCell align="center">
												{values.editMod ? (
													<Button onClick={editDone} variant="outlined">完成</Button>
												) : (
														<Button onClick={addDone} variant="outlined">添加</Button>
													)}
											</TableCell>
										</TableRow>
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
								<Table aria-label="SummaryPanel">
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
				<Snackbar open={values.open} autoHideDuration={6000} onClose={handleClickClose}>
					{values.status ? (
						<MuiAlert onClose={handleClickClose} elevation={6} variant="filled" severity="success">
							修改成功，请刷新页面查看
						</MuiAlert>
					) : (
							<MuiAlert onClose={handleClickClose} elevation={6} variant="filled" severity="error">
								操作失败，请检查
							</MuiAlert>
						)}
				</Snackbar>
			</Box>
		</div>
	);
}

/**
 * 获取SQL语句
 * @param {Number} index
 * @param {String} set
 */
function getSql(index, set) {
	switch (index) {
		//获取基本信息
		case 0:
			return `SELECT * from student`;
		case 1:
			return `SELECT * from teacher`;
		case 2:
			return `SELECT course.*, teacher.tname,teacher.ttitle from course JOIN teacher on course.tno = teacher.tno`;
		//修改信息页
		case 3:
			return `DELETE student where sno='${set}'`;
		case 4:
			return `DELETE teacher where tno='${set}'`;
		case 5:
			return `DELETE course where cno='${set}'`;
		//成绩录入
		case 6:
			return `SELECT sc.cno, course.cname, sc.grade FROM sc JOIN course ON sc.cno = course.cno WHERE sno='${set}'`;
		//统计信息
		case 7:
			return `SELECT * FROM StudentSummary`;
		case 8:
			return `SELECT * FROM TeacherSummary`;
		case 9:
			return `SELECT * FROM CourseSummary`;
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

const appStyles = makeStyles((theme) => ({
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
		width: '100%',
	},
}));

/**
 * 主页面
 */
function App() {
	const classes = appStyles();
	const [value, setValue] = React.useState(0);

	useEffect(() => {
		ipcRenderer.send('getTeachers');
		ipcRenderer.once('gotTeachers', (_event, result) => {
			Teachers.length = 0;
			result.rows.map((value) => {
				Teachers.push(value[0]);
			});
		})
	}, [value == 2])

	const handleChange = (_event, newValue) => {
		setValue(newValue);
		//console.log(value);
	};

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
				<Tab label="学生管理" />
				<Tab label="教师管理" />
				<Tab label="课程管理" />
			</Tabs>
			{value == 0 && (<StudentPanel index={0} className={classes.panel} />)}
			{value == 1 && (<TeacherPanel index={1} className={classes.panel} />)}
			{value == 2 && (<CoursePanel index={2} className={classes.panel} />)}
		</div>
	);
}

ReactDOM.render(<App />, document.getElementById('root'))
