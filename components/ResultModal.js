'use strict';

import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import Button from 'react-native-button';
import {Actions} from 'react-native-router-flux';

import Modal from 'react-native-modalbox';

class ResultBox extends React.Component {

  constructor() {
    super();
  }

  componentWillMount() {
    this.setState({isOpen: true});
    //window.modalIsOpen = true;
    this.closeModal = this.closeModal.bind(this);

  }

  componentDidMount() {
    //this.props.routeEmitter.once('closeModal', this.closeModal);
  }

  closeModal() {
    this.setState({isOpen: false});
  }

  _submit() {
    this.props.submit()
    this.closeModal();
  }

  _next() {
    this.props.getNextWord();
    this.closeModal();
    //Actions.pop()

  }

  render() {
    return (
      <Modal animationDuration={400}
             swipeThreshold={100}
             style={styles.modal}
             position={"center"}
             isOpen={this.state.isOpen}
             onClosed={Actions.pop}>
        <View>
          <Text style={styles.title}>Scores: {this.props.result.score}</Text>
        </View>
        <View>
          <Text style={{fontSize:12, marginVertical:13}}>
            WordsTried: {this.props.result.totalWordCount}, Correct:{this.props.result.correctWordCount}, WrongGuess:{this.props.result.totalWrongGuessCount}
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button
            containerStyle={[styles.buttonContainer, {borderRightWidth:StyleSheet.hairlineWidth}]}
            //style={styles.button}
            onPress={()=>{this._next()}}>
            Next
          </Button>
          <Button
            containerStyle={styles.buttonContainer}
            //style={[styles.button]}
            onPress={this._submit.bind(this)}>
            Submit
          </Button>
        </View>
      </Modal>
    );
  }
}

var styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
    width: 300,
    borderRadius: 15,
  },
  buttons: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  button: {
    //paddingHorizontal: 15,
  },
  buttonContainer: {
    height: 41,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',

  },
  title: {
    color: "black",
    fontSize: 20,
    marginVertical: 7,
  },
  textInput: {
    marginBottom: 10,
    alignSelf: 'center',
    height: 36,
    width: 250,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    margin: 10,
    fontSize: 15,
  },
});

module.exports = ResultBox;
