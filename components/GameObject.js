// https://github.com/Arthraim/HangmanReact

class GameObject {
  constructor(sessionId = null) {
    this.playerId = 'q6112345@gmail.com';
    this.sessionId = sessionId;
  }

  startGame(callback) {
    var requestBody = {
      playerId: this.playerId,
      action: "startGame"
    }
    this.fetchData(requestBody, (responseData) => {
      this.sessionId = responseData.sessionId
      if (callback) {
        callback(responseData)
      }
    })
  }

  giveMeAWord(callback) {
    var requestBody = {
      sessionId: this.sessionId,
      action: "nextWord"
    }
    this.fetchData(requestBody, callback)
  }

  makeAGuess(letter, callback) {
    var requestBody = {
      sessionId: this.sessionId,
      action: "guessWord",
      guess: letter
    }
    this.fetchData(requestBody, callback)
  }

  getYourResult(callback) {
    var requestBody = {
      sessionId: this.sessionId,
      action : "getResult"
    }
    this.fetchData(requestBody, callback)
  }

  submitYourResult(callback) {
    var requestBody = {
      sessionId: this.sessionId,
      action : "submitResult"
    }
    this.fetchData(requestBody, callback)
  }

  // private
  fetchData(requestBody, callback) {
    // url
    var requestUrl = 'https://strikingly-hangman.herokuapp.com/game/on';
    // request
    fetch(requestUrl, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log('responseData',requestBody,responseData)
        if (callback) {
          callback(responseData);
        }
      })
  }
} // end class GameObject

module.exports =  GameObject;
