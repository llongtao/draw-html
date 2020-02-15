import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import ElementUI from 'element-ui';
import axios from 'axios'

axios.defaults.baseURL = process.env.VUE_APP_BASE_URL
Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.use(Vuex)
Vue.prototype.$axios = axios

const store = new Vuex.Store({

  state: {

    ws: null,
    nickName: "",
    status: 0,
    keyword: "",
    isHost: false,
    groupId: "",
    isDraw: false,
    showDesc: false,
    drawName: '',
    messageList: [],
    picture: null,
    showVictoryPage: false,
    winId: '',
    winWord: '',
    winWordDesc: '',
  }

  //改变state中的count数据、
  , mutations: {

    login(state, info) { //调用 this.$store.commit("increment");
      window.console.log(info.name)
      window.console.log(info.ws)
      state.status = 1;
      state.nickName = info.name;
      state.ws = info.ws;
    },

    logout(state) { //调用 this.$store.commit("increment");
      state.status = 0;
      state.nickName = '';
      state.ws = null;
    },
    create(state, id) {
      state.groupId = id;
      state.isHost = true;
      state.status = 2;
      window.console.log(id)
    },
    join(state, id) {
      state.groupId = id;
      state.status = 2;
      state.isHost = false;
    },
    exit(state) {
      state.groupId = "";
      state.status = 1;
      state.isHost = false;
    },
    start(state) {
      state.status = 3
    },
    groupChange(state, group) {
      state.groupId = group.id
      state.status = group.statusCode
      state.isDraw = group.drawId == state.nickName
      state.keyword = group.keyWord
      state.isHost = group.masterId == state.nickName
      state.drawName = group.drawId
    },
    changeStatus(state, status) {
      state.status = status
    },
    setPicture(state, pic) {
      state.picture = pic
    },
    showVictory(state, winId) {
      state.winId = winId
      state.winWord = state.keyword.name
      state.winWordDesc = state.keyword.desc
      state.showVictoryPage = true
    },
    closeVictory(state) {
      state.showVictoryPage = false
    }

  }

})



new Vue({
  el: '#app',
  render: h => h(App),
  store
}).$mount('#app')


