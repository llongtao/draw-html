<template>
  <!-- 绘图画布 -->
  <div id="draw">
    <el-container @click="shutAll">
      <el-header @click="shutAll" style="   padding:'0px 0px' ;height:10px">
        <span v-if="keyword">
          <el-row>
            <el-col :span="8">
              <div>正在作画</div>
            </el-col>
            <el-col :span="8">
              <div>{{keyword.name}}</div>
            </el-col>
            <el-col :span="8">
              <div>{{total}}s</div>
            </el-col>
          </el-row>
        </span>
      </el-header>
      <el-main>
        <canvas
          id="cav"
          width="300"
          height="350"
          style="border: 1px solid #999;"
          @mousedown="canvasDown($event)"
          @mouseup="canvasUp($event)"
          @mousemove="canvasMove($event)"
          @touchstart="canvasDown($event)"
          @touchend="canvasUp($event)"
          @touchmove="canvasMove($event)"
        ></canvas>
        <el-row @click="shutAll">
          <el-col :span="8">
            <el-button id="btn" size="mini" icon="el-icon-arrow-left" @click="back"></el-button>
          </el-col>
          <el-col :span="8">
            <el-button id="btn" size="mini" @click="clear">清空画布</el-button>
          </el-col>
          <el-col :span="8">
            <el-button id="btn" size="mini " icon="el-icon-arrow-right" @click="go"></el-button>
          </el-col>
        </el-row>

        <chat :messageList="messageList"></chat>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { mapState } from "vuex";
import chat from "./chat.vue";

export default {
  data() {
    return {
      // canvas对象
      context: {},
      // 是否处于绘制状态
      canvasMoveUse: false,
      // 绘制矩形和椭圆时用来保存起始点信息
      beginRec: {
        x: "",
        y: "",
        imageData: ""
      },
      // 储存坐标信息
      drawInfo: [],
      stage_info: {},
      canvas: null,
      path: { beginX: 0, beginY: 0, endX: 0, endY: 0 },
      total: 60,
      down: false,
      drowInfoList: [],
      drowIndex: -1
    };
  },
  components: {
    chat
  },
  computed: {
    ...mapState(["keyword", "ws", "status", "messageList", "picture"])
  },
  // 定义好Draw类以后，在ready阶段使用即可：
  mounted() {
    this.countDown();
    this.initDraw();
    const that = this;
    if (!this.ws) {
      this.$message("连接失败");
      this.$store.commit("logout");
      return;
    }

    // 判断来自服务器的消息并操作
    this.ws.onmessage = msg => {
      var pathObj = msg.data.split("::");
      var type = msg.data.split("::")[0];
      if (type == "err") {
        that.$message(type);
      } else if (type == "msg") {
        that.messageList.unshift(JSON.parse(pathObj[1]));
      } else if (type == "group") {
        window.console.log(pathObj[1]);
        var group = JSON.parse(pathObj[1]).group;
        that.$store.commit("groupChange", group);
      } else if (type == "status") {
        that.$store.commit("changeStatus", pathObj[1]);
      } else if (type == "show") {
        this.open(pathObj[1]);
      }
    };
  },
  methods: {
    checkCon() {
      if (!this.ws) {
        location.reload();
      }
    },
    // 初始化绘制信息
    initDraw() {
      // 初始化画布
      this.canvas = document.getElementById("cav");
      this.context = this.canvas.getContext("2d");
      this.stage_info = this.canvas.getBoundingClientRect();

      this.context.fillStyle = "#fff";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.saveImg();
    },
    // 鼠标按下
    canvasDown(e) {
      this.checkCon();
      if (this.canDraw) {
        var touch;
        if (e.touches) {
          touch = e.touches[0];
        } else {
          touch = e;
        }
        if (!touch) {
          return;
        }
        event.preventDefault();
        this.canvasMoveUse = true;
        window.getSelection()
          ? window.getSelection().removeAllRanges()
          : document.selection.empty();
        this.context.strokeStyle = "#000";
        // 开始新的路径（这一句很关键，你可以注释掉看看有什么不同）
        this.context.beginPath();

        // 记录起点
        this.path.beginX = touch.clientX - this.stage_info.left;
        this.path.beginY = touch.clientY - this.stage_info.top;
        this.context.moveTo(this.path.beginX, this.path.beginY);
      }
    },
    // 鼠标移动时绘制
    canvasMove(e) {
      var touch;
      if (e.touches) {
        touch = e.touches[0];
      } else {
        touch = e;
      }
      if (!touch) {
        return;
      }
      if (this.canvasMoveUse && this.canDraw) {
        // 记录终点
        this.path.endX = touch.clientX - this.stage_info.left;
        this.path.endY = touch.clientY - this.stage_info.top;
        this.context.lineTo(this.path.endX, this.path.endY);
        // 把位图坐标发送到服务器
        this.ws.send(
          "location::" +
            this.path.beginX +
            "::" +
            this.path.beginY +
            "::" +
            this.path.endX +
            "::" +
            this.path.endY
        );

        this.context.stroke();
      }
    },

    // 鼠标抬起
    canvasUp(e) {
      window.console.log(e);
      if (this.canDraw) {
        this.saveImg();
        this.canvasMoveUse = false;
        this.ws.send("stop::");
      }
    },
    // 获取坐标信息
    getInfo() {
      return this.drawInfo;
    },
    canDraw() {
      return this.status == 4;
    },
    clear() {
      if (this.canDraw()) {
        this.context.fillStyle = "#fff";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveImg();
        this.ws.send("clear::");
      }
    },
    open(userId) {
      this.$store.commit("setPicture", this.canvas);
      window.console.log(userId);
      this.$store.commit("showVictory", userId);
    },
    countDown() {
      if (!this.down) {
        this.down = true;
        window.setInterval(() => {
          this.total--;
        }, 1000);
      }
    },
    back() {
      event.preventDefault();
      var index = this.drowIndex - 1;
      if (index < 0) {
        this.drowIndex = 0;
        return
      }
      this.context.putImageData(this.drowInfoList[index], 0, 0);
      this.drowIndex = index;
      this.ws.send("back::" + index);
    },
    go() {
      event.preventDefault();
      var index = this.drowIndex + 1;
      if (index > this.drowInfoList.length - 1) {
        this.drowIndex = this.drowInfoList.length - 1;
        return;
      }
      this.context.putImageData(this.drowInfoList[index], 0, 0);
      this.drowIndex = index;
      this.ws.send("go::" + index);
    },
    saveImg() {
      if (this.drowInfoList) {
        if (this.drowIndex < this.drowInfoList.length - 1) {
          this.drowInfoList.splice(0, this.drowIndex);
        }
      }
      this.drowInfoList.push(this.context.getImageData(0, 0, 300, 350));
      this.drowIndex = this.drowInfoList.length - 1;
    },
    shutAll() {
      event.preventDefault();
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