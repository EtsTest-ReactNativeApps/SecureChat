import React, { Component } from 'react';
import { ListItem, Thumbnail, Body, Text, View, Right } from 'native-base';
import { FlatList, TextInput } from 'react-native';
import { connect } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { DarkTheme } from '../../appStyles';
class AddParticipantScreen extends Component {
  constructor(props) {
    super(props);
    const Allusers = this.getUsers();
    this.state = {
      users: Allusers,
      text: '',
      filteredUsers: Allusers,
    };
  }

  comparator = (a, b) => {
    for (const mem of a.members) {
      if (mem.details) {
        return b.details._id === mem.details._id && !b.blocked;
      }
    }
  };

  getUsers() {
    const { state } = this.props.navigation;
    const members = state.params.members;
    const Allusers = this.props.rooms.filter((room) => {
      return !room.isGroup;
    });
    const users = Allusers.filter(
      (a) => !members.some((b) => this.comparator(a, b))
    );
    return users;
  }

  renderGridItem = (itemData) => {
    const { state } = this.props.navigation;
    return (
      <ListItem
        noBorder={true}
        style={DarkTheme.ListItemStyle}
        avatar
        onPress={async () => {
          for (const memba of itemData.item.members) {
            if (memba.details) await state.params.addMem(memba.details);
          }
          this.props.navigation.goBack();
        }}
      >
        <Thumbnail source={{ uri: itemData.item.profile_pic }} />

        <Body>
          <Text numberOfLines={1} style={DarkTheme.chatListName}>
            {itemData.item.name}
          </Text>
          <Text numberOfLines={1} style={DarkTheme.chatListNote} note>
            {itemData.item.description}
          </Text>
        </Body>
      </ListItem>
    );
  };

  setText = (text) => {
    this.setState({
      text: text,
      filteredUsers: this.state.users.filter((user) => {
        return user.name.toLowerCase().includes(text.toLowerCase());
      }),
    });
  };

  render() {
    const { state } = this.props.navigation;
    return (
      <View style={DarkTheme.ChatInputViewContainer}>
        <View style={DarkTheme.ChatInputView}>
          <MaterialIcons name='search' style={DarkTheme.ChatInputSmile} />
          <TextInput
            value={this.state.text}
            onChangeText={(text) => this.setText(text)}
            style={DarkTheme.ChatInput}
            placeholder='Search'
            placeholderTextColor='grey'
            underlineColorAndroid='transparent'
          ></TextInput>
        </View>

        <FlatList
          keyExtractor={(item) => item.id}
          data={this.state.filteredUsers}
          renderItem={this.renderGridItem}
          numColumns={1}
          style={DarkTheme.FlatListComponent}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    rooms: state.rooms.filter((room) => !room.dark),
    user: state.user,
  };
};

export default connect(mapStateToProps)(AddParticipantScreen);
