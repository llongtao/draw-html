<template>
  <div id="app" style="width: 340px; height: 550px; margin: auto">
    <victory v-model="showVictoryPage" type="danger" title="我是标题" dangerText="Delete"></victory>
    <login v-if=" status==0 "></login>
    <groupList v-if=" status==1 "></groupList>
    <group v-if=" status==2 "></group>
    <select-word v-if="status == 3 && isDraw"></select-word>
    <drawing v-if="status == 4 && isDraw"></drawing>
    <showing v-if="(status == 3 || status == 4) && !isDraw"></showing>
    <chat v-if="status == 3 || status == 4"></chat>
  </div>
</template>

<script>
import showing from "./components/showing-board.vue";
import drawing from "./components/drawing-board.vue";
import login from "./components/login.vue";
import groupList from "./components/groupList.vue";
import group from "./components/group.vue";
import selectWord from "./components/selectWord.vue";
import victory from "./components/victory.vue";
import { mapState } from "vuex";
import axios from "axios";

export default {
  name: "app",
  components: {
    showing,
    drawing,
    login,
    groupList,
    group,
    selectWord,
    victory
  },
  data() {
    return {
      player: "",
      role: 0,
      word: "",
      sendVal: false,
      showV: null
    };
  },
  computed: {
    ...mapState(["status", "name", "isDraw", "showVictoryPage", "picture"])
  },
  methods: {
    draw() {
      this.player = 1;
    },
    guess() {
      this.player = 2;
    },
    replay() {
      this.player = 0;
      location.reload();
    },
    getUrl() {
      var fullurl = window.location.href;
      var tmp = fullurl;
      var endIndex = tmp.indexOf("?");
      if (endIndex > 0) {
        tmp = tmp.substring(0, endIndex);
      }

      return tmp;
    },
    getConfig() {
      var that = this;
      return new Promise((resolve, reject) => {
        axios
          .post(process.env.VUE_APP_BASE_URL + "/game/getWeChatAuth", {
            url: this.getUrl()
          })
          .then(response => {
            var data = response.data;
            var appId = data.appId;
            var nonceStr = data.nonceStr;
            // var jsapi_ticket = res.jsapi_ticket;
            var timestamp = data.timestamp;
            var signature = data.signature;

            that.$wx.config({
              debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
              appId: appId, // 必填，公众号的唯一标识
              timestamp: timestamp, // 必填，生成签名的时间戳
              nonceStr: nonceStr, // 必填，生成签名的随机串
              signature: signature, // 必填，签名，见附录1
              jsApiList: [
                "checkJsApi",
                "updateAppMessageShareData",
                "updateTimelineShareData",
                "onMenuShareAppMessage",
                "onMenuShareQQ"
              ] // 必填，需要使用的JS接口列表，所有JS接口列表 见附录2
            });
            that.$wx.error(function(res) {
              window.console.log(JSON.stringify(res));
              window.console.log(JSON.stringify(reject));
            });
            resolve();
          });
      });
    }
  },
  mounted() {
    //this.getConfig();
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  font-size: 14px;
}
</style>
