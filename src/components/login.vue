<template>
  <!-- 绘图画布 -->
  <div id="login">
    <el-container>
      <el-header style="padding:60px 30px">
        <el-input size="small" v-model="nickName" placeholder="请输入4个字以内的昵称"></el-input>
      </el-header>
      <el-main>
        <el-button size="small" @click="login">确定</el-button>
      </el-main>
    </el-container>
  </div>
</template>

<script>
// drawing-board.vue文件为绘图画布组件。首先我们定义一个Draw类，里面是所有绘图相关的功能。

export default {
  data() {
    return {
      ws: null,
      nickName: "",
      status: 0
    };
  },
  // 定义好Draw类以后，在ready阶段使用即可：
  methods: {
    login() {
      if (!this.nickName) {
        this.$message("昵称不能为空");
        return;
      }
      if (this.nickName.length > 4) {
        this.$message("昵称不能多于4个字");
        return;
      }
      var that = this;
      window.console.log(process.env.NODE_ENV);
      var baseURL = process.env.VUE_APP_BASE_WS_URL;
      window.console.log(process.env.VUE_APP_BASE_WS_URL);
      var ws = new WebSocket(baseURL + "/drow/" + that.nickName);
      ws.onmessage = msg => {
        var messages = msg.data.split("::");
        var type = messages[0];

        if (type == "err") {
          that.$message(messages[1]);
        } else {
          that.$store.commit("login", {
            name: that.nickName,
            ws: ws
          });
          localStorage.setItem("nickName", that.nickName);
          if (type == "group") {
            window.console.log(messages[1]);
            that.$store.commit("groupChange", JSON.parse(messages[1]).group);
          } else if (type == "status") {
            window.console.log(messages[1]);
            that.$store.commit("changeStatus", messages[1]);
          }
        }
      };
    }
  },
  mounted() {
    this.nickName = localStorage.getItem("nickName");
    if (this.nickName) {
      this.login();
    }
  }
};
</script>

<style >
#canvas {
  background: pink;
  cursor: default;
}
#keyword-box {
  margin: 10px 0;
}
</style>