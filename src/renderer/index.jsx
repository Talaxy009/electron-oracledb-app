import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

const ipcRenderer = window.ipcRenderer;

function App() {
  const [values, setValues] = React.useState({
    user: "",
    password: "",
    status: "",
    showPassword: false,
    open: false,
  });

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleClickClose = (_event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setValues({ ...values, open: false });
  };

  const openStudentPage = useCallback(() => {
    let type = values.user.slice(0, 1);
    if (type == "S" || type == "s") {
      ipcRenderer.send("openStudentPage", values.user, values.password);
      ipcRenderer.once("login", (_event, result) => {
        setValues({ ...values, status: result, open: true });
      });
    } else {
      setValues({
        ...values,
        status: "该账号非学生账号，请使用管理端登录",
        open: true,
      });
    }
  });

  const openAdminPage = useCallback(() => {
    let type = values.user.slice(0, 1);
    if (type == "S" || type == "s") {
      setValues({
        ...values,
        status: "该账号为学生账号，请使用学生端登录",
        open: true,
      });
    } else {
      ipcRenderer.send("openAdminPage", values.user, values.password);
      ipcRenderer.once("login", (_event, result) => {
        setValues({ ...values, status: result, open: true });
      });
    }
  });

  return (
    <Container maxWidth="md">
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <span style={{ fontSize: 32 }}>请登录</span>
          <hr />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" style={{ margin: 8 }}>
            <InputLabel htmlFor="userInput">账号</InputLabel>
            <OutlinedInput
              id="userInput"
              value={values.id}
              onChange={handleChange("user")}
              labelWidth={32}
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" style={{ margin: 8 }}>
            <InputLabel htmlFor="passwordInput">密码</InputLabel>
            <OutlinedInput
              id="passwordInput"
              type={values.showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleChange("password")}
              labelWidth={32}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    id="showPassword"
                    aria-label="显示密码"
                    onClick={handleClickShowPassword}
                  >
                    {values.showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={openStudentPage}
            style={{ margin: 8 }}
          >
            学生登录
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={openAdminPage}
            style={{ margin: 8 }}
          >
            管理登录
          </Button>
          <Snackbar
            open={values.open}
            autoHideDuration={6000}
            onClose={handleClickClose}
          >
            {values.status === "登录成功!" ? (
              <MuiAlert
                onClose={handleClickClose}
                elevation={6}
                variant="filled"
                severity="success"
              >
                {values.status}
              </MuiAlert>
            ) : (
              <MuiAlert
                onClose={handleClickClose}
                elevation={6}
                variant="filled"
                severity="error"
              >
                {values.status}
              </MuiAlert>
            )}
          </Snackbar>
        </Grid>
      </Grid>
    </Container>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
