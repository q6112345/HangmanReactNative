import React, {Component} from 'react';
import {View, Text, StyleSheet, AsyncStorage, TouchableOpacity, Dimensions, Alert} from "react-native";
import Button from "react-native-button";
import {Actions} from "react-native-router-flux";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import GiftedSpinner from 'react-native-gifted-spinner';
import Toast from 'react-native-root-toast';
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
        isLoading: true

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
  showToast(msg){
    Toast.show(msg, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.CENTER,
    });

  }


  getFrequency(string) {
    var freq = {};
    for (var i=0; i<string.length;i++) {
      var character = string.charAt(i);
      if (freq[character]) {
        freq[character]++;
      } else {
        freq[character] = 1;
      }
    }

    return freq;
  };

  async getGoldenKey() {
    let qeury = this.state.word.replace(/\*/g,'?');
    try {
      let result = await this.HgApi.get(`https://api.datamuse.com/words?sp=${qeury}`);
    } catch (e) {
      console.log('Network Error', e)
      alert('Network Error')
    }
    let resultArray = result.map((item)=>item.word)
    //let resultArray = ["cancel", "faucet", "parcel", "cancer", "lancet", "faeces", "saucer", "lancer", "dancer", "fasces", "jaycee", "marcel", "fauces", "dances", "falcer", "sauced", "carcel", "farced", "calces", "danced", "calced", "lanced", "lances", "sauces", "fascet", "talced", "farces", "mancer", "dancey", "sarcel", "carcer", "hances", "kaycee", "falces", "darcel", "nances", "darcey", "garces", "nancey", "eamcet", "rances", "tancer", "balcer", "nancee", "yancey"];
    let missedLetters = this.state.attemptedLetters.filter((letter)=>this.state.word.indexOf(letter)===-1)
    let hittingLetters = this.state.attemptedLetters.filter((letter)=>missedLetters.indexOf(letter)===-1)
    //console.log('resultArray',resultArray)
    //console.log('missedLetters',missedLetters)
    //console.log('hittingLetters',hittingLetters)
    let sugguestedWords = resultArray.filter((word)=> {
      let notExistMissedLetter = true;
      for (let letter of missedLetters) {
        if (word.indexOf(letter.toLowerCase())!==-1) {
          notExistMissedLetter = false;
          break;
        }
      }
      return notExistMissedLetter
    });
    let allSugguestedWordsString = sugguestedWords.join('')
    let letterFrequence = this.getFrequency(allSugguestedWordsString)
    var letterOccuccencyDescArray = [];
    for (let letter in letterFrequence) {
      if (hittingLetters.indexOf(letter.toUpperCase()) !== -1) {
        continue;
      }
      letterOccuccencyDescArray.push({
        letter: letter,
        count: letterFrequence[letter],
        //words: []
      })
      letterOccuccencyDescArray.sort(
        function (a, b) {
          return b.count - a.count
        }
      )
    }

    console.log('sugguestedWords',sugguestedWords)
    console.log('letterOccuccencyDescArray',letterOccuccencyDescArray);
    let sugguestLetters = letterOccuccencyDescArray.splice(0,5);
    Alert.alert('Suggest Letters',JSON.stringify(sugguestLetters));

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
    this.setState({isLoading:true})
    try {
      let responseData = await this.HgApi.giveMeAWord();
    } catch (e) {
      console.log('Network Error', e)
      alert('Network Error')
    }
    if (responseData.message ==  "Game already over") {
      AsyncStorage.removeItem('sessionId');
      this.backToLaunch();
      return
    }
    this.setState(responseData.data);
    this.setState({attemptedLetters:[]})
    this.setState({isLoading:false})
  }
  async getYourResult(){
    try {
      let responseData = await this.HgApi.getYourResult()
    } catch (e) {
      console.log('Network Error', e)
      alert('Network Error')
    }

    this.setState(responseData.data);
  }
  async submit(){
    try {
      await this.HgApi.submitYourResult();
    } catch (e) {
      console.log('Network Error', e)
      alert('Network Error')
    }

    await AsyncStorage.removeItem('sessionId');
    this.backToLaunch()

  }
  async showResult() {
    await this.getYourResult()
    Actions.resultModal({result: this.state, getNextWord: this.getNextWord, submit: this.submit})
  }

  async onKeyPress(letter) {
    // https://github.com/Arthraim/HangmanReact
    console.log('onPress', letter)
    if (this.state.isLoading) {
      this.showToast('Please wait the result before do next guess')
      return
    }
    this.setState({isLoading:true})

    if (this.state.attemptedLetters.indexOf(letter) > -1) {
      return;
    }
    try {
      let responseData = await this.HgApi.makeAGuess(letter)
    } catch (e) {
      console.log('Network Error', e)
      alert('Network Error')
    }
    let array = this.state.attemptedLetters
    array.push(letter)
    this.setState({attemptedLetters: array})
    this.setState(responseData.data)
    this.setState({isLoading:false})
    if (this.state.wrongGuessCountOfCurrentWord > 0
      && this.state.numberOfGuessAllowedForEachWord > 0
      && (this.state.wrongGuessCountOfCurrentWord == this.state.numberOfGuessAllowedForEachWord /*wrong*/
      || !this.state.word.includes('*') /*right*/)) {
      this.showResult()
    }


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
          {
            this.state.isLoading
              ?
              <View>
                <GiftedSpinner/>
              </View>
              :
            <View style={{flexDirection:'row'}}>
              <FontAwesome name="heart" size={20}/>
              <Text style={{fontSize:15}}> x{this.state.numberOfGuessAllowedForEachWord - this.state.wrongGuessCountOfCurrentWord}</Text>
            </View>
          }
          <TouchableOpacity
            onPress={this.showResult}>
            <View style={{flexDirection:'row'}}>
              <FontAwesome name="check-circle" size={20}/>
              <Text style={{fontSize:15}}> x{this.state.correctWordCount}</Text>
            </View>
          </TouchableOpacity>

        </View>
          <View style={{flex:2,justifyContent: 'center',alignItems: 'center',}}>
            <TouchableOpacity
              onPress={this.getGoldenKey.bind(this)}>
              <Text style={styles.word}>{this.state.word}</Text>
            </TouchableOpacity>
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
