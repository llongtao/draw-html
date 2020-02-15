<template>
  <div id="selectWord">
    <el-container>
      <el-header style="  pading:'0px 0px' ;height:10px">
        <span>请选词</span>
      </el-header>
      <el-main>
        <el-card
          shadow="always"
          @click.native="select(word.name)"
          v-for=" (word,index) in words"
          :key="index"
        >{{word.name}}</el-card>
      </el-main>
      <el-footer style="  pading:'0px 0px' ;height:160px">
        <chat :messageList="messageList"></chat>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { mapState } from "vuex";
import chat from "./chat.vue";
export default {
  data() {
    return {
      words: []
    };
  },
  components: {
    chat
  },
  computed: {
    ...mapState(["isHost", "nickName", "groupId", "messageList", "ws"])
  },
  mounted() {
    this.wordList();

    const that = this;
    const ws = this.ws;

    ws.onmessage = msg => {
      let pathObj = msg.data.split("::");
      let type = pathObj[0];
      window.console.log(msg.data);
      if (type == "msg") {
        that.messageList.unshift(JSON.parse(pathObj[1]));
      } else if (type == "err") {
        that.$message(type);
      } else if (type == "group") {
        window.console.log(pathObj[1]);
        that.$store.commit("groupChange", JSON.parse(pathObj[1]).group);
      } else if (type == "status") {
        window.console.log(pathObj[1]);
        that.$store.commit("changeStatus", pathObj[1]);
      }
    };
  },
  methods: {
    checkCon() {
      if (!this.ws) {
        location.reload();
      }
    },
    wordList() {
      this.checkCon();
      var that = this;
      this.$axios
        .get(process.env.VUE_APP_BASE_URL + "/game/wordList")
        .then(function(response) {
          window.console.log(response.data);
          that.words = response.data;
        });
    },
    select(word) {
      this.checkCon();
      var that = this;
      this.$axios
        .get(
          process.env.VUE_APP_BASE_URL +
            "/game/selectWord/" +
            this.groupId +
            "/" +
            word
        )
        .then(function(response) {
          window.console.log(response.data);
          if (response.data.succeed == true) {
            that.$store.commit("groupChange", response.data.group);
          } else {
            that.$message(response.data.msg);
          }
        });
    }
  }
};
</script>