<template>
  <div id="group">
    <el-container>
      <el-header style="padding:10px 10px ;height:80px">
        <div style="padding:10px 20px">房间号:{{groupId}}</div>
        <el-button v-if="isHost" @click="start">开始游戏</el-button>
        <span v-if="!isHost">等待房主开始游戏</span>
      </el-header>
      <el-main>
        <el-table :data="tableData" size="mini" stripe>
          <el-table-column prop="name" label="玩家"></el-table-column>
          <el-table-column prop="isMaster" :formatter="getRole" label></el-table-column>
          <el-table-column width="80%" label>
            <template slot-scope="scope">
              <el-button v-if="scope.row.name == nickName" size="mini" @click="exit">退出</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <!-- <el-footer>
        <el-button size="small"  icon="el-icon-user" @click="shareToFriends"></el-button>
        <el-button size="small"  icon="el-icon-orange" @click="shareToFriendsCircle"></el-button>
      </el-footer>-->
    </el-container>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      tableData: []
    };
  },
  computed: {
    ...mapState(["isHost", "nickName", "groupId", "ws"])
  },
  methods: {
    checkCon() {
      if (!this.ws) {
        location.reload();
      }
    },
    search() {
      this.checkCon();
      var that = this;
      this.$axios
        .get(process.env.VUE_APP_BASE_URL + "/group/" + that.groupId)
        .then(function(response) {
          window.console.log(response.data);
          that.tableData = response.data.memberList;
        });
    },
    start() {
      this.checkCon();
      var that = this;
      this.$axios
        .get(process.env.VUE_APP_BASE_URL + "/game/start/" + that.groupId)
        .then(function(response) {
          window.console.log(response.data);
          if (response.data.succeed == true) {
            //that.$store.commit("start");
          } else {
            that.$message(response.data.msg);
          }
        });
    },
    getRole(row) {
      return row.isMaster ? "房主" : "已加入";
    },
    exit() {
      this.checkCon();
      var that = this;
      this.$axios
        .get(process.env.VUE_APP_BASE_URL + "/group/exit/" + that.nickName)
        .then(function(response) {
          window.console.log(response.data);
          if (response.data.succeed == true) {
            that.$store.commit("exit");
          } else {
            that.$message(response.data.msg);
          }
        });
    },
    getLink() {
      var url = window.location.href;
      if (url.endsWith("/")) {
        url = url.substring(0, url.length - 1);
      }
      return url + "?group=" + this.groupId;
    }
  },
  mounted() {
    this.checkCon();
    var that = this;
    this.search();

    var ws = this.ws;
    ws.onmessage = msg => {
      var messages = msg.data.split("::");
      window.console.log("===>" + messages[0]);
      if (messages[0] == "err") {
        that.$message(messages[1]);
      } else if (messages[0] == "group") {
        window.console.log(messages[1]);
        that.tableData = JSON.parse(messages[1]).memberList;
        that.$store.commit("groupChange", JSON.parse(messages[1]).group);
      } else if (messages[0] == "status") {
        window.console.log(messages[1]);
        that.$store.commit("changeStatus", messages[1]);
      }
    };
    ws.onclose = () => {
      location.reload();
    };
  }
};
</script>