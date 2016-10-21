// https://github.com/Arthraim/HangmanReact

class API {
  constructor(sessionId = null) {
    this.playerId = 'q6112345@gmail.com';
    this.sessionId = sessionId;
  }

  async startGame() {
    let requestBody = {
      playerId: this.playerId,
      action: "startGame"
    }
    let responseData = await this.fetchData(requestBody);
    this.sessionId = responseData.sessionId;
    return responseData

  }

  async giveMeAWord() {
    let requestBody = {
      sessionId: this.sessionId,
      action: "nextWord"
    }
    return await this.fetchData(requestBody)
  }

  async makeAGuess(letter) {
    let requestBody = {
      sessionId: this.sessionId,
      action: "guessWord",
      guess: letter
    }
    return await this.fetchData(requestBody)
  }

  getPamer(url, options) {
    return url + '?' + Object.keys(aoptions).map(key => key + '=' + encodeURIComponent(options[key])).join('&');
  }

  async get(url) {
    let response = await fetch(url);
    let responseJson = await response.json();
    //console.log('get responseJson',responseJson)
    return responseJson;
  }

  async getYourResult() {
    let requestBody = {
      sessionId: this.sessionId,
      action : "getResult"
    }
    return await this.fetchData(requestBody)
  }

  async submitYourResult() {
    let requestBody = {
      sessionId: this.sessionId,
      action : "submitResult"
    }
    return await this.fetchData(requestBody)
  }

  async fetchData(options) {
    let requestUrl = 'https://strikingly-hangman.herokuapp.com/game/on';
    let response = await fetch(requestUrl, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });
    let responseData = await response.json()
    console.log('responseData',options, responseData)
    return responseData;
  }
}

module.exports =  API;
