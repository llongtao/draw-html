<template>
  <!-- 猜图画布很简单，只需要定义一个canvas画布，然后接收服务器发送来的坐标并绘制即可。看代码： -->
  <div id="answer-box">
    <el-container>
      <el-header style="  pading:'0px 0px' ;height:10px">
        <span style="font-size:14px" v-if="status == 3 ">等待选词</span>
        <el-row style="font-size:14px" v-if="status == 4 &&keyword">
          <el-col :span="10">
            <div>{{drawName}} 正在作画</div>
          </el-col>
          <el-col :span="4">
            <div>{{keyword.len}}个字</div>
          </el-col>
          <el-col :span="10">
            <div>{{total}}s</div>
          </el-col>
        </el-row>
      </el-header>
      <el-main style="padding:'0px 0px'">
        <canvas id="showing" width="300" height="350" style="border: 1px solid #999;"></canvas>
        <span></span>
        <el-form :inline="true" :model="formInline" @submit.native.prevent class="demo-form-inline">
          <el-form-item>
            <el-input size="small" @keyup.enter.native="send" v-model="formInline.message"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="send">发送</el-button>
          </el-form-item>
        </el-form>
        <chat :messageList="messageList"></chat>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import chat from "./chat.vue";
import { mapState } from "vuex";

export default {
  data() {
    return {
      showDesc: false,
      formInline: {
        message: ""
      },
      total: 60,
      down: true,
      countFlag: false,
      canvas: null,
      drowIndex: -1,
      drowInfoList: [],
      context: null
    };
  },
  components: {
    chat
  },
  computed: {
    ...mapState([
      "status",
      "ws",
      "keyword",
      "groupId",
      "nickName",
      "messageList",
      "drawName",
      "picture",
      "winWord",
      "winWordDesc"
    ])
  },
  mounted() {
    const that = this;
    const ws = this.ws;
    this.canvas = document.getElementById("showing");
    window.console.log("canvas");
    const cxt = this.canvas.getContext("2d");
    this.context = cxt;
    cxt.fillStyle = "#fff";
    cxt.fillRect(0, 0, this.canvas.width, this.canvas.height);

    var drawing = false;
    ws.onmessage = msg => {
      let pathObj = msg.data.split("::");
      cxt.strokeStyle = "#000";
      let type = pathObj[0];
      window.console.log(msg.data);
      if (type == "clear") {
        cxt.fillStyle = "#fff";
        cxt.fillRect(0, 0, this.canvas.width, this.canvas.height);
        that.saveImg();
      } else if (type == "msg") {
        that.messageList.unshift(JSON.parse(pathObj[1]));
      } else if (type == "err") {
        that.$message(type);
      } else if (type == "group") {
        var group = JSON.parse(pathObj[1]).group;
        that.$store.commit("groupChange", group);
      } else if (type == "status") {
        if (pathObj[1] == 4 && this.down) {
          that.total = 60;
          that.countDown();
          that.down = false;
        } else {
          that.down = true;
        }
        that.$store.commit("changeStatus", pathObj[1]);
      } else if (type == "show") {
        that.open(pathObj[1]);
      } else if (type == "location" && !drawing) {
        cxt.beginPath();
        cxt.moveTo(pathObj[1], pathObj[2]);
        drawing = true;
      } else if (type == "location" && drawing) {
        cxt.lineTo(pathObj[3], pathObj[4]);
        cxt.stroke();
      } else if (type == "stop") {
        that.saveImg();
        drawing = false;
      } else if (type == "go") {
        that.go(pathObj[1]);
      } else if (type == "back") {
        that.back(pathObj[1]);
      } else if (type == "img") {
        that.drawImg(pathObj[1]);
      }
    };
  },
  methods: {
    checkCon() {
      if (!this.ws) {
        location.reload();
      }
    },
    drawImg(imgbase64) {
      var that = this;
      var img = new Image();
      img.src = imgbase64;
      img.onload = function() {
        that.context.drawImage(img, 0, 0);
      };
    },
    send() {
      this.checkCon();
      var that = this;
      let ispeed = Math.floor(-that.scrollTop / 5);
      document.documentElement.scrollTop = document.body.scrollTop =
        that.scrollTop + ispeed;

      this.$axios
        .post(process.env.VUE_APP_BASE_URL + "/game/send", {
          message: that.formInline.message,
          groupId: this.groupId,
          userId: this.nickName
        })
        .then(function(response) {
          window.console.log(response.data);
        });
      that.formInline.message = "";
    },
    open(userId) {
      var cav = this.canvas;
      this.$store.commit("setPicture", cav);
      this.$store.commit("showVictory", userId);
      this.upload(cav);
    },
    upload(cav) {
      if(this.drawName == '机器人'){
        return
      }
      this.$axios.post(process.env.VUE_APP_BASE_URL + "/game/saveData", {
        img: cav.toDataURL(),
        keyword: this.winWord,
        keywordDesc: this.winWordDesc,
        userId: this.drawName
      });
    },
    countDown() {
      if (!this.countFlag) {
        this.countFlag = true;
        window.setInterval(() => {
          this.total--;
        }, 1000);
      }
    },
    back(index) {
      if (index >= 0) {
        this.context.putImageData(this.drowInfoList[index], 0, 0);
        this.drowIndex = index;
      }
    },
    go(index) {
      window.console.log(this.drowInfoList);
      window.console.log(index);
      if (index > this.drowInfoList.length - 1) {
        this.drowIndex = this.drowInfoList.length - 1;
        return;
      }
      var d = JSON.stringify(this.drowInfoList[index].data);
      window.console.log(this.drowInfoList[index].data);
      var oriData = new ImageData(
        JSON.parse(d),
        this.drowInfoList[index].width,
        this.drowInfoList[index].height
      );
      window.console.log(d);
      this.context.putImageData(oriData, 0, 0);
      this.drowIndex = index;
    },
    saveImg() {
      if (this.drowInfoList) {
        if (this.drowIndex < this.drowInfoList.length - 1) {
          this.drowInfoList.splice(0, this.drowIndex);
        }
      }
      this.drowInfoList.push(this.context.getImageData(0, 0, 300, 350));
      this.drowIndex = this.drowInfoList.length - 1;
    }
  }
};
</script>

<style >
#answer-box {
  margin: 10px 0;
}
.chat {
  text-align: center;
}
</style>