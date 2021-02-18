import React from "react";
import { Container } from "native-base";
import ChatHeader from "../components/ChatHeader";
import ChatBubbles from "../components/ChatBubbles";
import ChatFooter from "../components/ChatFooter";
import { connect } from "react-redux";
import {
  addMessage,
  updatelastMessageReadIndex,
} from "../store/actions/RoomActions";
import { SendMessage } from "../store/reducers/Socket";
import { bindActionCreators } from "redux";
import { socket } from "../store/reducers/Socket";

class PresentChatScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      room: this.getRoom(),
    };
  }

  componentWillUnmount = async () => {
    const { state } = this.props.navigation;
    this.props.updatelastMessageReadIndex(this.state.room.id);
    state.params.UpdateActiveRoom(null);
  };

  getRoom = () => {
    const { state } = this.props.navigation;
    return (OpenRoom = this.props.rooms.find(
      (room) => room.id === state.params.id
    ));
  };

  componentDidMount = () => {
    socket.on("recieveMessage", (message, roomId) => {
      this.setState({ room: this.getRoom() });
    });
  };

  updateState = async (message) => {
    const { state } = this.props.navigation;
    this.setState({ room: this.getRoom() });
    await this.props.addMessage(this.state.room.id, message);
    state.params.UpdateComponent();
  };

  sendMessage(message) {
    SendMessage(this.state.room.id, this.props.user.token, message);
    const messageObject = {
      sender_id: this.props.user.id,
      message_body: message,
    };
    this.updateState(messageObject);
  }

  render() {
    const { state } = this.props.navigation;
    return (
      <Container style={state.params.appStyles.ChatMainContainer}>
        <ChatHeader
          {...this.props}
          room={this.state.room}
          appStyles={state.params.appStyles}
        />
        <ChatBubbles
          {...this.props}
          messages={this.state.room.messages}
          userId={this.props.user.id}
          appStyles={state.params.appStyles}
        />
        <ChatFooter
          {...this.props}
          onSend={this.sendMessage.bind(this)}
          appStyles={state.params.appStyles}
        />
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    { addMessage, updatelastMessageReadIndex },
    dispatch
  );
};

const mapStateToProps = (state) => {
  return {
    rooms: state.room.rooms,
    user: state.user,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PresentChatScreen);
