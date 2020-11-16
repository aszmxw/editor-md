<template>
  <div id="app">
    <Editormd
      v-bind:content="content"
      ref="Editormd"
      type="editor"
    ></Editormd>
  </div>
</template>

<script>
import Editormd from '@/components/EditorMd'

export default {
  name: 'App',
  components: {
    Editormd
  },
  data() {
    return {
      content: ''
    }
  },
  methods: {
    get_page_content() {
      this.content = `
-  用户表，储存用户信息

|字段|类型|空|默认|注释|
|:----    |:-------    |:--- |-- -|------      |
|uid	  |int(10)     |否	|	 |	           |
|username |varchar(20) |否	|    |	 用户名	|
|groupid  |tinyint(2)   |否	|  2  |	 1为管理员，2为普通用户。此字段保留方便以后扩展	|
|password |varchar(50) |否   |    |	 密码		 |
|cookie_token |varchar(50) |否   |    |	  |
|cookie_token_expire |int(11) |否   |    |	 过期时间		 |
|avatar |varchar(200) |是   |    |	 头像		 |
|avatar_small |varchar(200) |是   |    |	 小头像	 |
|email |varchar(50) |否   |    |	 邮箱		 |
|name     |varchar(15) |是   |    |    昵称     |
|reg_time |int(11)     |否   | 0  |   注册时间  |
|last_login_time |int(11)     |否   | 0  |   最后一次登录时间  |

- 备注：无

`;
    }
  },
  mounted() {
    this.get_page_content()
    // 根据屏幕宽度进行响应(应对移动设备的访问)
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
