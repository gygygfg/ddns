# 动态DNS更新工具

这是一个用于自动检测公网IP变化并更新3322.net动态DNS记录的Node.js工具。

## 功能特性

- 自动检测本机公网IP地址变化
- 支持3322.net动态DNS服务
- 定时检查IP变化（默认10分钟）
- 通过路由器管理界面获取公网IP
- 自动更新DNS记录

## 系统要求

- Node.js 14.0 或更高版本
- Linux系统（需要访问网络接口）
- 路由器管理权限

## 安装

1. 克隆或下载项目文件
2. 安装依赖：

```bash
npm install
```

## 配置

### 1. 修改账号信息
在 `app.js` 文件中修改以下配置：

```javascript
// 账号数据
const hostname = 'bxsr.f3322.net';  // 你的动态域名
const username = "gygygfg";         // 3322.net用户名
const password = "6ygv7uhb";        // 3322.net密码
```

### 2. 修改路由器配置
在 `get_public_ip()` 函数中，需要根据你的网络环境修改：

```javascript
// 获取局域网IP
let ip = execSync('ip addr show enp1s0 | grep "scope global dynamic noprefixroute"', { encoding: 'buffer' }).toString()
```

- `enp1s0`: 需要改为你的网络接口名称
- `bxsrlmjs1970ZHAN`: 需要改为你的路由器登录密码

### 3. 调整检查间隔
默认每10分钟检查一次IP变化，可以在代码中修改：

```javascript
// 每隔10分钟执行一次
setInterval(() => {
    // 检查逻辑...
}, 10 * 60 * 1000);  // 10分钟 = 10 * 60 * 1000毫秒
```

## 使用方法

### 运行程序

```bash
node app.js
```

程序启动后会：
1. 首次检查当前DNS记录
2. 获取当前公网IP
3. 如果IP有变化，自动更新DNS记录
4. 每10分钟重复检查一次

### 日志输出

程序会在控制台输出运行日志：
- 当前DNS记录的IP地址
- 检测到的公网IP地址
- DNS更新状态
- 错误信息（如果有）

日志文件：
- `output.log`: 标准输出日志
- `error.log`: 错误日志

## 工作原理

1. **获取公网IP**: 通过访问路由器管理界面获取真实的公网IP地址
2. **DNS查询**: 查询当前动态域名解析的IP地址
3. **IP比对**: 比较公网IP和DNS记录的IP
4. **DNS更新**: 如果IP不同，通过3322.net API更新DNS记录
5. **定时检查**: 定期重复上述过程

## 依赖项

- `axios`: HTTP客户端，用于调用3322.net API
- `puppeteer`: 浏览器自动化，用于访问路由器管理界面

## 故障排除

### 常见问题

1. **无法获取网络接口信息**
   - 检查网络接口名称是否正确
   - 确保有权限执行 `ip addr` 命令

2. **无法访问路由器管理界面**
   - 检查路由器IP地址是否正确
   - 确认路由器登录密码
   - 确保网络连接正常

3. **DNS更新失败**
   - 检查3322.net账号密码是否正确
   - 确认域名所有权
   - 检查网络连接

4. **Puppeteer启动失败**
   - 确保系统已安装必要的依赖库
   - 尝试安装Chromium：`apt-get install chromium-browser`

### 调试模式

如果需要查看浏览器操作过程，可以取消注释以下代码：

```javascript
const browser = await puppeteer.launch({
    headless: false // 取消注释以查看浏览器界面
});
```

## 安全注意事项

1. **敏感信息保护**
   - 不要将包含密码的代码提交到公共仓库
   - 考虑使用环境变量存储敏感信息

2. **文件权限**
   - 确保只有授权用户可以访问配置文件
   - 定期检查日志文件内容

3. **网络访问**
   - 确保程序运行在安全的网络环境中
   - 定期更新依赖包以修复安全漏洞

## 扩展功能

### 支持其他DNS服务商

可以通过修改 `updateDyndns()` 函数来支持其他动态DNS服务商，如：
- DynDNS
- No-IP
- DuckDNS

### 邮件通知

可以添加邮件通知功能，在IP变化时发送通知邮件。

### Web界面

可以添加简单的Web界面来查看状态和修改配置。

## 许可证

本项目仅供学习和个人使用。使用前请确保遵守3322.net的服务条款。

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 支持

如有问题，请：
1. 查看 `error.log` 文件中的错误信息
2. 检查网络连接和配置
3. 在项目中提交Issue