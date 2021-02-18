export const UPDATE_EMAIL = "UPDATE_EMAIL";
export const UPDATE_NAME = "UPDATE_NAME";
export const UPDATE_PASSWORD = "UPDATE_PASSWORD";
export const UPDATE_ALERT = "UPDATE_ALERT";
export const UPDATE_ISAUTH = "UPDATE_ISAUTH";
export const UPDATE_TOKEN = "UPDATE_TOKEN";
export const UPDATE_ID = "UPDATE_ID";
export const LOGIN = "LOGIN";
export const SIGNUP = "SIGNUP";
export const UPDATE_PIC = "UPDATE_PIC";
export const SWITCH_MODE = "SWITCH_MODE";
export const UPDATE_ACTIVE_ROOM = "UPDATE_ACTIVE_ROOM";
import axios from "axios";
import * as API from "../../constants/APIstore";

export const updateMode = (mode) => {
  return {
    type: SWITCH_MODE,
    payload: mode,
  };
};

export const updateProfile = (profile_pic) => {
  return {
    type: UPDATE_PIC,
    payload: profile_pic,
  };
};

export const updateIsAuth = (isauth) => {
  return {
    type: UPDATE_ISAUTH,
    payload: isauth,
  };
};

export const updateAlert = (alert) => {
  return {
    type: UPDATE_ALERT,
    payload: alert,
  };
};

export const updateId = (id) => {
  return {
    type: UPDATE_ID,
    payload: id,
  };
};

export const updatetoken = (token) => {
  return {
    type: UPDATE_TOKEN,
    payload: token,
  };
};

export const updateEmail = (email) => {
  return {
    type: UPDATE_EMAIL,
    payload: email,
  };
};

export const updateName = (name) => {
  return {
    type: UPDATE_NAME,
    payload: name,
  };
};

export const updatePassword = (password) => {
  return {
    type: UPDATE_PASSWORD,
    payload: password,
  };
};

export const login = () => {
  return async (dispatch, getState) => {
    var user = getState().user;
    const data = await axios({
      method: "POST",
      url: API.LOGINAPI,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        email: user.email,
        password: user.password,
      },
    })
      .then((res) => res.data)
      .then((data) => {
        user.name = data.name;
        user.token = data.token;
        user.isauth = true;
        user.id = data.user;
        user.profile_pic = data.profile_pic;
        dispatch({ type: LOGIN, payload: user });
      })
      .catch((e) => {
        try {
          dispatch({ type: UPDATE_ALERT, payload: e.response.data });
        } catch (e) {
          console.log(e);
        }
      });
  };
};

export const signup = () => {
  return async (dispatch, getState) => {
    const { name, email, password } = getState().user;
    const data = await axios({
      method: "POST",
      url: API.SIGNUPAPI,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        name: name,
        email: email,
        password: password,
      },
    })
      .then((res) => res.data)
      .then((data) => {
        alert("Account created successfully , Login to continue");
        dispatch({ type: UPDATE_ISAUTH, payload: true });
      })
      .catch((e) => {
        try {
          dispatch({ type: UPDATE_ALERT, payload: e.response.data });
        } catch (e) {
          console.log(e);
        }
      });
  };
};
