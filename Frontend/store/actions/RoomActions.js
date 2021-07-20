import Room from '../../models/Rooms';
import * as API from '../../constants/APIstore';
import {
  FILL_DATA,
  ADD_MESSAGE_ROOM,
  ADD_ROOM,
  DELETE_ROOM,
  LAST_MESSAGE_READ_INDEX,
  PULL_MESSAGE_STATE,
  UPDATE_NAME_DESC,
  UPDATE_MEMBERS_MESSAGES,
  UPDATE_PROFILE_PIC,
  MARK_READ_MESSAGES,
} from '../../constants/Actions';
import axios from 'axios';
import moment from 'moment';
import {
  UpdatelastMessageReadIndex,
  promptGroup,
  promptMember,
  promptMemberandAdd,
  promptMemberandRemove,
} from '../reducers/Socket';
import { showMessage } from 'react-native-flash-message';

export const addMessage = (roomId, message) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo14');
      const user = getState().user;
      const messageObj = { ...message, timestamp: moment.now() };
      dispatch({
        type: ADD_MESSAGE_ROOM,
        payload: {
          message: messageObj,
          id: roomId,
        },
      });
      if (user.active_room === roomId) {
        dispatch({
          type: LAST_MESSAGE_READ_INDEX,
          payload: {
            id: roomId,
          },
        });
        UpdatelastMessageReadIndex(roomId, user.token);
      }
    } catch (error) {
      showMessage({
        message: `Error`,
        description: `${error}`,
        type: 'danger',
        floating: true,
      });
      console.log(error);
    }
  };
};

export const MarkRead = (roomId, userId) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo13.5');
      dispatch({
        type: MARK_READ_MESSAGES,
        payload: {
          id: roomId,
          userId: userId,
        },
      });
    } catch (error) {
      showMessage({
        message: `Error`,
        description: `${error}`,
        type: 'danger',
        floating: true,
      });
      console.log(error);
    }
  };
};

export const updatelastMessageReadIndex = (roomId) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo13');
      if (roomId) {
        const user = getState().user;
        dispatch({
          type: LAST_MESSAGE_READ_INDEX,
          payload: {
            id: roomId,
          },
        });
        UpdatelastMessageReadIndex(roomId, user.token);
      }
    } catch (error) {
      showMessage({
        message: `Error`,
        description: `${error}`,
        type: 'danger',
        floating: true,
      });
      console.log(error);
    }
  };
};

export const PullMessageState = (roomId, obj) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo12');
      if (roomId) {
        dispatch({
          type: PULL_MESSAGE_STATE,
          payload: {
            id: roomId,
            obj: obj,
          },
        });
      }
    } catch (error) {
      showMessage({
        message: `Error`,
        description: `${error}`,
        type: 'danger',
        floating: true,
      });
      console.log(error);
    }
  };
};

export const fillData = () => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo11');
      var user = getState().user;
      const data = await axios({
        method: 'GET',
        url: API.GETROOMS,
        headers: {
          'auth-token': user.token,
          'Content-Type': 'application/json',
        },
      }).then((res) => res.data);

      if (data) {
        var rooms = [];
        for (const room of data) {
          if (room) {
            var roomName = null;
            var profile_pic = '';
            var description = '';
            var isGroup = false;

            if (!room.name) {
              for (var member of room.members) {
                if (member.id != user.id) {
                  roomName = member.details.name;
                  profile_pic = member.details.profile_pic;
                  description = member.details.status;
                  isGroup = false;
                }
              }
            } else {
              roomName = room.name;
              profile_pic = room.profile_pic;
              description = room.description;
              isGroup = true;
            }

            const messages = room.messages;
            var lastMessage = description;
            var lastTime = room.create_date;
            if (messages[0]) {
              const messageObject = messages.slice(-1)[0];
              if (messageObject.isImage) lastMessage = '📷 Image';
              else lastMessage = messageObject.message_body;

              lastTime = messages.slice(-1)[0].timestamp;
            }
            const readIndex = room.members.find((mem) => mem.id === user.id);
            const NewRoom = new Room(
              room._id,
              roomName,
              description,
              profile_pic,
              messages,
              room.members,
              readIndex.lastMessageReadIndex,
              isGroup,
              room.creator_id,
              room.PullMessage
            );
            NewRoom.updateLastMessage(lastMessage);
            NewRoom.updateLastTime(lastTime);
            NewRoom.updateDark(room.isDark);
            rooms.push(NewRoom);
          }
        }
        dispatch({ type: FILL_DATA, payload: rooms });
      }
    } catch (error) {
      showMessage({
        message: `Error`,
        description: `${error}`,
        type: 'danger',
        floating: true,
      });
      console.log(error);
    }
  };
};

export const updateNameDescription = (roomId, name, description) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo0');
      var user = getState().user;
      const data = await axios({
        method: 'PATCH',
        url: API.PATCHROOM + `/${roomId}`,
        headers: {
          'auth-token': user.token,
          'Content-Type': 'application/json',
        },
        data: {
          name: name,
          description: description,
        },
      }).then((res) => res.data);
      dispatch({
        type: UPDATE_NAME_DESC,
        payload: {
          id: roomId,
          name: name,
          description: description,
        },
      });
    } catch (e) {
      showMessage({
        message: `Error`,
        description: `${e}`,
        type: 'danger',
        floating: true,
      });
      console.log(e);
    }
  };
};

export const CreateNewRoom = (body) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo9');
      var user = getState().user;
      const room = await axios({
        method: 'POST',
        url: API.ADDNEWROOM,
        headers: {
          'auth-token': user.token,
          'Content-Type': 'application/json',
        },
        data: body,
      }).then((res) => res.data.room);
      await promptGroup(user.token, room._id);
    } catch (e) {
      showMessage({
        message: `Error`,
        description: `${e}`,
        type: 'danger',
        floating: true,
      });
      console.log(e);
    }
  };
};

export const leaveRoom = (roomId, roomName) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo8');
      var user = getState().user;
      const data = await axios({
        method: 'PATCH',
        url: API.LEAVEROOM + `/${roomId}`,
        headers: {
          'auth-token': user.token,
          'Content-Type': 'application/json',
        },
      }).then((res) => res.data);
      promptMember(user.token, roomId);
      showMessage({
        message: `You left ${roomName}`,
        type: 'danger',
        floating: true,
      });
      dispatch({
        type: DELETE_ROOM,
        payload: {
          id: roomId,
        },
      });
    } catch (e) {
      showMessage({
        message: `Error`,
        description: `${e}`,
        type: 'danger',
        floating: true,
      });
      console.log(e);
    }
  };
};

export const ResetRoom = (roomId, members, messages) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo7');
      dispatch({
        type: UPDATE_MEMBERS_MESSAGES,
        payload: {
          id: roomId,
          members: members,
          messages: messages,
        },
      });
    } catch (e) {
      showMessage({
        message: `Error`,
        description: `${e}`,
        type: 'danger',
        floating: true,
      });
      console.log(e);
    }
  };
};

export const RemoveMember = (roomId, member) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo6');
      var user = getState().user;
      const data = await axios({
        method: 'PATCH',
        url: API.REMOVEMEMBER + `/${roomId}`,
        headers: {
          'auth-token': user.token,
          'Content-Type': 'application/json',
        },
        data: {
          member: member,
        },
      }).then((res) => res.data);
      await promptMemberandRemove(user.token, roomId, member);
    } catch (e) {
      showMessage({
        message: `Error`,
        description: `${e}`,
        type: 'danger',
        floating: true,
      });
      console.log(e);
    }
  };
};

export const AddMember = (roomId, member) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo5');
      var user = getState().user;
      const data = await axios({
        method: 'PATCH',
        url: API.ADDMEMBER + `/${roomId}`,
        headers: {
          'auth-token': user.token,
          'Content-Type': 'application/json',
        },
        data: {
          member: member,
        },
      }).then((res) => res.data);
      await promptMemberandAdd(user.token, roomId, member);
    } catch (e) {
      showMessage({
        message: `Error`,
        description: `${e}`,
        type: 'danger',
        floating: true,
      });
      console.log(e);
    }
  };
};

export const addRoom = (room) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo4');
      var user = getState().user;
      var roomName = null;
      var profile_pic = '';
      var description = '';
      var isGroup = false;

      if (!room.name) {
        for (var member of room.members) {
          if (member.id != user.id) {
            roomName = member.details.name;
            profile_pic = member.details.profile_pic;
            description = member.details.status;
            isGroup = false;
          }
        }
      } else {
        roomName = room.name;
        profile_pic = room.profile_pic;
        description = room.description;
        isGroup = true;
      }

      const messages = room.messages;
      var lastMessage = description;
      var lastTime = room.create_date;
      if (messages[0]) {
        const messageObject = messages.slice(-1)[0];
        if (messageObject.isImage) lastMessage = '📷 Image';
        else lastMessage = messageObject.message_body;

        lastTime = messages.slice(-1)[0].timestamp;
      }
      const readIndex = room.members.find((mem) => mem.id === user.id);
      const NewRoom = new Room(
        room._id,
        roomName,
        description,
        profile_pic,
        messages,
        room.members,
        readIndex.lastMessageReadIndex,
        isGroup,
        room.creator_id,
        room.PullMessage
      );
      NewRoom.updateLastMessage(lastMessage);
      NewRoom.updateLastTime(lastTime);
      NewRoom.updateDark(room.isDark);
      dispatch({ type: ADD_ROOM, payload: NewRoom });
    } catch (e) {
      showMessage({
        message: `Error`,
        description: `${e}`,
        type: 'danger',
        floating: true,
      });
      console.log(e);
    }
  };
};

export const removeRoom = (roomId) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo3');
      dispatch({
        type: DELETE_ROOM,
        payload: {
          id: roomId,
        },
      });
    } catch (e) {
      showMessage({
        message: `Error`,
        description: `${e}`,
        type: 'danger',
        floating: true,
      });
      console.log(e);
    }
  };
};

export const updateRoom = (roomId, members) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo2');
      var user = getState().user;
      var roomMembers = members;
      for (var member of roomMembers) {
        const user2 = await axios({
          method: 'GET',
          url: API.USERBASEAPI + `/${member.id}`,
          headers: {
            'auth-token': user.token,
            'Content-Type': 'application/json',
          },
        }).then((res) => res.data);
        delete user2.password;
        member['details'] = user2;
      }
      dispatch({
        type: UPDATE_MEMBERS,
        payload: {
          id: roomId,
          members: roomMembers,
        },
      });
    } catch (e) {
      showMessage({
        message: `Error`,
        description: `${e}`,
        type: 'danger',
        floating: true,
      });
      console.log(e);
    }
  };
};

export const updateRoomProfile = (roomId, url) => {
  return async (dispatch, getState) => {
    try {
      console.log('helloooooooooo1');
      dispatch({
        type: UPDATE_PROFILE_PIC,
        payload: {
          id: roomId,
          profile_pic: url,
        },
      });
    } catch (e) {
      showMessage({
        message: `Error`,
        description: `${e}`,
        type: 'danger',
        floating: true,
      });
      console.log(e);
    }
  };
};
