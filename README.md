# chrome-switchcookies
Chrome插件，可以轻松实现一键切换账号等功能
---
### 打开设置
- 在找不到本地存储时，点击菜单栏图标或者扩展程序列表中的选项可以进入设置
- 已有本地存储时，也可以通过点击图标，点击右上角的文字进入设置

### 添加账户
- 登陆网站，不勾选"记住我" 
- 在搜索栏搜索你想要切换账户的网站地址，选择cookies数量相对多的一条记录
- 填写网站的名称，和该条Cookies代表的账户名称（都是必填）
 
### 添加另一个账户
- 关闭浏览器
- 用另一个账户登陆网站
- 进行添加账户操作

### 切换账户
- 进入该网站，点击插件图标
- 选择该网站
- 选择想要切换的账户

### 注意
- 如果服务器不存储SESSION，或不强制触发SESSION验证，可以直接退出登录，而不用关闭浏览器
- 如果一个网站名，对应多个地址，在添加一个账户时，应把所有地址的cookies都添加到同一账户下，当然这种情况比较少见
- 对于同一网站名下的所有地址，在切换账户时，可以批量切换Cookies，把账户理解为身份，即可实现同时切换多个账户的功能