<template>
  <div id="groupList">
    <el-container>
      <el-header style="padding:20px 10px ;height:160px">
        <el-row style="margin:10px 0px ">
          <el-col :span="4">
            <div class>
              <el-avatar
                size="small"
                src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
              ></el-avatar>
            </div>
          </el-col>
          <el-col :span="12" style="padding:1px 0px ; text-align: left; font-size: 18px;">
            <div>{{nickName}}</div>
          </el-col>
          <el-col :span="8">
            <div>
              <el-button size="mini" @click="logout">退出</el-button>
            </div>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-form
          :inline="true"
          lable-width="0px"
          size="small"
          :model="formInline"
          class="demo-form-inline"
        >
          <el-form-item label="编号">
            <el-input
              label-width="50%"
              style="width: 120px"
              v-model="formInline.searchId"
              placeholder="编号"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="search">查询</el-button>
          </el-form-item>
        </el-form>
      </el-header>
      <el-main style=" text-align:center margin: auto">
        <div class="grid-content bg-purple-dark">
          <div>
            <el-table
              :data="tableData"
              size="small"
              stripe
              style=" text-align:center width: 50% vertical-align:middle margin:0px auto"
            >
              <el-table-column min-width="45%" prop="id" label="编号"></el-table-column>
              <el-table-column min-width="45%" prop="masterId" label="房主"></el-table-column>
              <el-table-column min-width="45%" prop="peopleNum" label="人数"></el-table-column>
              <el-table-column
                min-width="45%"
                prop="gameStatus"
                :formatter="getStatusName"
                label="状态"
              ></el-table-column>
              <el-table-column label>
                <template slot-scope="scope">
                  <el-button size="mini" @click="join(scope.$index, scope.row)">加入</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-main>
      <el-footer>
        <el-button size="small" @click="createGroup">创建房间</el-button>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      tableData: [],
      formInline: {
        searchId: ""
      }
    };
  },
  computed: {
    ...mapState(["status", "name", "ws", "nickName"])
  },
  methods: {
    checkCon() {
      if (!this.ws) {
        location.reload();
      }
    },
    join(index, row) {
      this.checkCon()
      window.console.log(index);
      var that = this;
      this.$axios
        .post(
          process.env.VUE_APP_BASE_URL +
            "/group/join?userId=" +
            that.$store.state.nickName +
            "&groupId=" +
            row.id
        )
        .then(function(response) {
          window.console.log(response.data);
          if (response.data.succeed == true) {
            that.$store.commit("groupChange", response.data.group);
          } else {
            that.$message(response.data.msg);
          }
        });
    },
    search() {
      this.checkCon()
      var that = this;
      this.$axios
        .get(
          process.env.VUE_APP_BASE_URL +
            "/group/list?id=" +
            this.formInline.searchId
        )
        .then(function(response) {
          window.console.log(response.data);
          that.tableData = response.data;
        });
    },
    createGroup() {
      this.checkCon()
      var that = this;
      this.$axios
        .post(
          process.env.VUE_APP_BASE_URL +
            "/group/create?id=" +
            that.$store.state.nickName
        )
        .then(function(response) {
          window.console.log(response.data);
          if (response.data.succeed) {
            that.$store.commit("create", response.data.id);
          }
        });
    },
    getStatusName(row) {
      if (row.statusCode == "2") {
        return "等待";
      }
      if (row.statusCode == "3" || row.statusCode == "4") {
        return "进行中";
      }
    },
    logout() {
      localStorage.setItem("nickName", "");
      location.reload();
    }
  },
  mounted() {
    this.checkCon();
    var that = this;
    this.search();
    this.ws.onmessage = msg => {
      var messages = msg.data.split("::");
      if (messages[0] == "groupListChange") {
        that.search();
      }
    };
    this.ws.onclose = () => {
      location.reload();
    };
  }
};
</script>