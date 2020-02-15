<template>
  <div class="dialog" v-show="showVictoryPage">
    <div class="dialog-container">
      <div class="dialog-title" >恭喜 {{winId}} 猜对了，答案是 {{winWord}}</div>
      <div class="dialog-body">
        <el-image v-if="picture" id="img" class="img" :src="picture.toDataURL('image/jpeg')" />
      </div>
      <div class="dialog-foot">
        <el-row class>
          <el-col :span="12">
            <el-button
              type="primary"
              style="background:#909399 ;border:none"
              size="mini"
              icon="el-icon-download"
              @click="save"
            ></el-button>
          </el-col>
          <el-col :span="12">
            <el-button type="primary" @click="confirm" size="mini">确定</el-button>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
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
      "showVictoryPage",
      "winId",
      "winWord"
    ])
  },
  props: {
    value: {},
    // 类型包括 defalut 默认， danger 危险， confirm 确认，
    type: {
      type: String,
      default: "default"
    },
    title: {
      type: String,
      default: ""
    },
    cancelText: {
      type: String,
      default: "取消"
    },
    dangerText: {
      type: String,
      default: "删除"
    },
    confirmText: {
      type: String,
      default: "确认"
    }
  },
  data() {
    return {
      showMask: false
    };
  },
  methods: {
    closeMask() {
      this.$store.commit("closeVictory");
    },
    save() {
      if (this.isWeixn()) {
        this.$message("微信客户端需要长按图片下载");
        return;
      }

      var imgUrl = this.picture.toDataURL("image/jpeg");
      // 如果浏览器支持msSaveOrOpenBlob方法（也就是使用IE浏览器的时候），那么调用该方法去下载图片
      if (window.navigator.msSaveOrOpenBlob) {
        let bstr = atob(imgUrl.split(",")[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        let blob = new Blob([u8arr]);
        window.navigator.msSaveOrOpenBlob(
          blob,
          this.winWord + "." + "jpg"
        );
      } else {
        // 这里就按照chrome等新版浏览器来处理
        let a = document.createElement("a");
        a.href = imgUrl;
        a.setAttribute("download", this.winWord);
        a.click();
      }
    },
    isWeixn() {
      var ua = navigator.userAgent.toLowerCase();
      if (ua.match(/MicroMessenger/i) == "micromessenger") {
        return true;
      } else {
        return false;
      }
    },
    confirm() {
      this.closeMask();
    }
  },
  mounted() {},
  watch: {}
};
</script>
<style  scoped>
.dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
}
.dialog-container {
  width: 330px;
  height: 460px;
  background: #ffffff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 8px;
  position: relative;
}

.dialog-title {
  width: 100%;
  height: 50px;
  font-size: 14px;
  color: #696969;
  font-weight: 600;
  padding: 16px 50px 0 20px;
  box-sizing: border-box;
}

.dialog-foot {
  padding: 10px 0 0 0;
}
.img {
  border: 1px solid rgb(83, 83, 105);
}
</style>