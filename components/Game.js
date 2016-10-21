import React, {Component} from 'react';
import {View, Text, StyleSheet, AsyncStorage, TouchableOpacity, Dimensions} from "react-native";
import Button from "react-native-button";
import {Actions} from "react-native-router-flux";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import API from './API'

const allLetters = [];
for (var i = 65; i < 91; i++) {
  allLetters.push(
    String.fromCharCode(i)
  );
}


const viewport = Dimensions.get('window');
const screenWidth = viewport.width;
const screenHeight = viewport.height;


export default class Game extends Component {
    constructor(props) {
      super(props);
      this.state = {
        word: '',
        numberOfWordsToGuess: 80,
        numberOfGuessAllowedForEachWord: 10,
        wrongGuessCountOfCurrentWord: 0,
        totalWordCount: 0,
        correctWordCount: 0,
        totalWrongGuessCount: 0,
        score: 0,
        attemptedLetters: [],

      };
      this.prepareGame = this.prepareGame.bind(this);
      this.getNextWord = this.getNextWord.bind(this);
      this.submit = this.submit.bind(this);
      this.getYourResult = this.getYourResult.bind(this);
      this.showResult = this.showResult.bind(this);
      this.onKeyPress = this.onKeyPress.bind(this);
    }

  componentWillMount() {
    this.prepareGame()

  }
  async prepareGame() {

    this.HgApi = new API(this.props.sessionId);
    if (!this.props.sessionId) {
      let responseData = await this.HgApi.startGame();
      AsyncStorage.setItem('sessionId', responseData.sessionId);
      this.setState(responseData.data);
      this.getNextWord();
    } else {
      let responseData = await this.HgApi.getYourResult();
      this.setState(responseData.data);
      this.getNextWord();

    }

  }
  async backToLaunch() {
    await this.props.reloadSessionId()
    Actions.pop()
  }
  async getNextWord(){
    let responseData = await this.HgApi.giveMeAWord();
    if (responseData.message ==  "Game already over") {
      AsyncStorage.removeItem('sessionId');
      this.backToLaunch();
      return
    }
    this.setState(responseData.data);
    this.setState({attemptedLetters:[]})
  }
  async getYourResult(){
    let responseData = await this.HgApi.getYourResult()
    this.setState(responseData.data);
    this.showResult()
  }
  async submit(){
    await this.HgApi.submitYourResult();
    await AsyncStorage.removeItem('sessionId');
    this.backToLaunch()

  }
  showResult() {
    Actions.resultModal({result: this.state, getNextWord: this.getNextWord, submit: this.submit})
  }

  onKeyPress(letter) {
    // https://github.com/Arthraim/HangmanReact
    console.log('onPress', letter)
    if (this.state.attemptedLetters.indexOf(letter) > -1) {
      console.log('you have guessed', letter)
      return;
    }
    this.HgApi.makeAGuess(letter, (responseData) => {
      var array = this.state.attemptedLetters
      array.push(letter)
      this.setState({attemptedLetters: array})
      this.setState(responseData.data)
      // reach limit of guess times for single word
      if (this.state.wrongGuessCountOfCurrentWord > 0
        && this.state.numberOfGuessAllowedForEachWord > 0
        && (this.state.wrongGuessCountOfCurrentWord == this.state.numberOfGuessAllowedForEachWord /*wrong*/
        || !this.state.word.includes('*') /*right*/)) {
        // udpate score
        this.getYourResult()
        // get next word
        //this.getNextWord()
        // reach limit of words
        if (this.state.numberOfWordsToGuess > 0
          && this.state.totalWordCount > 0
          && this.state.numberOfWordsToGuess == this.state.totalWordCount) {
          // udpate score
          this.getYourResult()
        }
      }
    })
  }

  renderKeyBoard() {
    return (
      <View style={styles.keyboard}>
        {
          allLetters.map((letter)=> {
            if (this.state.attemptedLetters.indexOf(letter) > -1) {
              return (
                <View
                  key={letter}
                  style={{width: 45,height: 45,backgroundColor: 'white',justifyContent: 'center',alignItems: 'center',margin: 5,}}>
                  <Text>{letter}</Text>
                </View>
              )
            } else {
              return (
                <TouchableOpacity key={letter}
                                  style={styles.key}
                                  onPress={() => this.onKeyPress(letter)}>
                  <Text>{letter}</Text>
                </TouchableOpacity>
              )
            }
          })
        }
      </View>
    )
  }

  render() {
    return (
      <View style={{flex:1,flexDirection:'column', marginTop:30, justifyContent:'center'}}>

        <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', marginHorizontal: 10}}>
          <TouchableOpacity onPress={()=>this.backToLaunch()}>
            <View style={{flexDirection:'row'}}>
              <FontAwesome name="arrow-left" size={20}/>
            </View>
          </TouchableOpacity>
          <View style={{flexDirection:'row'}}>
            <FontAwesome name="heart" size={20}/>
            <Text style={{fontSize:15}}> x{this.state.numberOfGuessAllowedForEachWord - this.state.wrongGuessCountOfCurrentWord}</Text>
          </View>
          <TouchableOpacity
            onPress={this.showResult}>
            <View style={{flexDirection:'row'}}>
              <FontAwesome name="check-circle" size={20}/>
              <Text style={{fontSize:15}}> x{this.state.correctWordCount}</Text>
            </View>
          </TouchableOpacity>

        </View>
        <View style={{flex:2,justifyContent: 'center',alignItems: 'center',}}>
          {/*this.renderWord()*/}
          <Text style={styles.word}>{this.state.word}</Text>

        </View>
        <View style={{flex:3}}>
          {this.renderKeyBoard()}
        </View>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  word: {
    fontSize: 50,
  },
  key: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'gray',
    width: 45,
    height: 45,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  keyDiabled: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'gray',
    width: 45,
    height: 45,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  keyboard: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
    marginHorizontal: 10,
    flexWrap: 'wrap'
  },
});
