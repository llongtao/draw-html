<template>
  <div id="chat-box">
    <div class="chat">
      <div class="msg" ref="box">
        <div v-for="(item,i) in messageList" :class="[item.type,'msg-item']" :key="i">
          <el-row>
            <el-col :span="6">
              <div class="name">{{item.name}}</div>
            </el-col>
            <el-col :span="18">
              <div class="content">{{item.content}}</div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props:['messageList'],
  computed: {
    ...mapState(["status", "ws", "keyword", "groupId", "nickName"])
  },
  methods: {
    onmessage(msg) {
      this.messageList.unshift(msg);
    }
  }
};
</script>

<style >
#showing {
  background: lightblue;
}
#answer-box {
  margin: 10px 0;
}
.chat {
  text-align: center;
}

.msg {
  width: 300px;
  height: 200px;
  overflow: auto;
  margin-top: 6px;
  padding-top: 5px;
  border: 1px solid rgb(83, 83, 105);
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 6px;
}

.msg-item {
  position: relative;
  overflow: hidden;
}

.content {
  display: inline-block;
  border-radius: 10px;
  background: #3c3d5a;
  color: white;
  float: left;
  padding: 2px 12px;
  margin: 0 0 2px 0;
  max-width: 95%;
  text-align: left;
  box-sizing: border-box;
}
.name {
  display: inline-block;
  border-radius: 4px;
  background: #ebebf0;
  color: rgb(54, 39, 39);
  float: right;
  padding: 2px 2px;
  margin: 0 10px 2px 0;
  max-width: 95%;
  text-align: left;
  box-sizing: border-box;
}
</style>