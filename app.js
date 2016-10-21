import React, {
  Component,
} from 'react';
import {
  AppRegistry,
  Navigator,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Alert,
  Platform,
  BackAndroid,
  ToastAndroid,
} from 'react-native';
import {
  Scene,
  Reducer,
  Router,
  Switch,
  Modal,
  Actions,
  ActionConst,
} from 'react-native-router-flux';
import Launch from './components/Launch'
import Game from './components/Game'
import ResultModal from './components/ResultModal'

const reducerCreate = params => {
  const defaultReducer = new Reducer(params);
  return (state, action) => {
    //console.log('ACTION:', action);
    return defaultReducer(state, action);
  };
};


const getSceneStyle = (/* NavigationSceneRendererProps */ props, computedProps) => {
  const style = {
    flex: 1,
    backgroundColor: '#fff',
    shadowColor: null,
    shadowOffset: null,
    shadowOpacity: null,
    shadowRadius: null,
  };
  if (computedProps.isActive) {
    style.marginTop = computedProps.hideNavBar ? 0 : 64;
    style.marginBottom = computedProps.hideTabBar ? 0 : 50;
  }
  return style;
};



export default class App extends Component {

  constructor(props) {
    super(props);

  }

  componentWillMount() {
    BackAndroid.addEventListener('hardwareBackPress', ()=> {
      try {
        Actions.pop();
        //if (window.modalIsOpen===true) {
        //  this.emitter.emit("closeModal");
        //} else {
        //}
        return true;
      }
      catch (err) {
        ToastAndroid.show("Cannot pop.", ToastAndroid.SHORT);
        return true;
      }
    });
  }

  render() {

    return (
      <Router createReducer={reducerCreate} getSceneStyle={getSceneStyle}>
        <Scene key="modal" component={Modal}>
          <Scene key="root" hideNavBar hideTabBar>
            <Scene key='launch'  component={Launch} initial/>
            <Scene key='game'  component={Game}/>
          </Scene>
          <Scene key="resultModal" component={ResultModal}/>
        </Scene>
      </Router>
    )

  }

}


AppRegistry.registerComponent('HangmanReactNative', () => App);
