import React from 'react';
import {View, Text, StyleSheet, AsyncStorage} from "react-native";
import Button from "react-native-button";
import {Actions} from "react-native-router-flux";
import GiftedSpinner from 'react-native-gifted-spinner';
import GameObject from './API'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  roundButtonContainer: {
    padding: 10,
    borderRadius: 5,
    marginTop: 8,
  },
  infoBackground: {
    backgroundColor: '#5bc0de',
  },
  successBackground: {
    backgroundColor: '#5cb85c',
  },
  warningBackground:{
    backgroundColor: '#f0ad4e',
  },
  whiteColor: {
    color: 'white',
  },


});

class Launch extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isLoading: true,
        isResumable: false
      }
      this.startNewGame = this.startNewGame.bind(this);
      this.resumeGame = this.resumeGame.bind(this);
      this._loadSessionId = this._loadSessionId.bind(this);
    }

  componentWillMount() {
    this._loadSessionId()
  }

  async _loadSessionId() {
    let sessionId = await AsyncStorage.getItem('sessionId');
    if (sessionId) {
      this.setState({isResumable: true})
    }
    this.setState({isLoading: false})
  }


  startNewGame() {
    Actions.game({reloadSessionId:this._loadSessionId})
  }

  async resumeGame() {
    let sessionId = await AsyncStorage.getItem('sessionId');
    Actions.game({reloadSessionId:this._loadSessionId, sessionId:sessionId})
  }

  renderLoading() {
    return (
      <GiftedSpinner size="large"/>
    )
  }

  renderButtons() {
    return (
      <View>
        {this.state.isResumable && <Button containerStyle={[styles.roundButtonContainer, styles.successBackground]}
                                           style={styles.whiteColor}
                                           onPress={this.resumeGame}>Resume</Button>}
        <Button containerStyle={[styles.roundButtonContainer, styles.infoBackground]}
                style={styles.whiteColor }
                onPress={this.startNewGame}>Start
          New Game</Button>
      </View>

    )
  }

  render(){
      return (
      <View style={styles.container}>
        {this.state.isLoading
          ?
          this.renderLoading()
          :
          this.renderButtons()
        }
      </View>
    );
  }

}

module.exports = Launch;