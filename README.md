# LX Music 桌面版 · 个人修改版（非官方）

> 基于 [lyswhut/lx-music-desktop](https://github.com/lyswhut/lx-music-desktop) **v2.12.6** 修改。
>
> 本项目是个人学习与技术交流用的**非官方修改版**，与原项目及作者无隶属关系。
> 不提供任何音乐源/音源脚本，不附带音乐文件，请自行准备合法的自定义源。

## 修改内容
优化了基于本人的使用上的体验
## 界面预览

> 建议在这里放 2~3 张截图或 GIF。
> 注意：截图不要包含专辑封面、歌词、个人歌单、账号信息等版权或隐私内容。

## 改动文件

<details>
<summary>点击展开完整清单</summary>

| 文件 | 说明 |
| --- | --- |
| `src/renderer/components/material/OnlineList/usePlay.ts` | 双击歌曲时切换整个播放队列 |
| `src/renderer/views/Search/MusicList/useList.ts` | 搜索结果使用当前页作为临时播放列表 |
| `src/renderer/core/player/action.ts` | 新增稍后播放项的播放处理 |
| `src/renderer/components/common/PlayQueueBtn.vue` | 新增播放队列按钮与面板（主播放条 / 歌词页两种样式） |
| `src/renderer/components/layout/Icons.vue` | 新增播放队列、定位图标 |
| `src/renderer/components/layout/PlayBar/ControlBtns.vue` | 主播放条控制行加入播放队列按钮 |
| `src/renderer/components/layout/PlayBar/MiniWidthProgress.vue` | 移除旧的独立队列按钮 |
| `src/renderer/components/layout/PlayBar/MiddleWidthProgress.vue` | 同上 |
| `src/renderer/components/layout/PlayBar/FullWidthProgress.vue` | 同上 |
| `src/renderer/components/layout/PlayDetail/components/ControlBtns.vue` | 歌词页控制行加入播放队列按钮 |
| `src/renderer/components/layout/PlayDetail/PlayBar.vue` | 移除旧的独立队列按钮 |
| `src/renderer/components/material/OnlineList/index.vue` | 当前播放高亮 + 右下角定位按钮 |
| `src/renderer/views/List/MusicList/index.vue` | 当前播放高亮 + 右下角定位按钮 |
| `src/common/defaultSetting.ts` | 删除 `list.isClickPlayList` 设置 |
| `src/common/types/app_setting.d.ts` | 同步删除设置类型 |
| `src/common/utils/migrateSetting.ts` | 删除旧设置迁移 |
| `src/renderer/views/Setting/components/SettingList.vue` | 删除旧设置界面 |
| `src/renderer/plugins/player/index.ts` | 音频输出设备为空时使用默认设备 |
| `src/renderer/core/useApp/usePlayer/useMediaDevice.ts` | 音频设备选择与兜底 |
| `build-config/runner-dev.js` | 开发模式支持使用外部 Electron 运行时 |
| `src/lang/zh-cn.json`、`zh-tw.json`、`en-us.json`、`ko-kr.json` | 新增播放队列相关文案 |

</details>

## 构建与运行

### 环境要求

- Node.js 22 及以上
- Windows 10 / 11（本项目主要在 Windows 下验证）
- 不需要 Visual Studio（项目自带 better-sqlite3 预编译文件）

### 安装依赖

```powershell
cd "项目目录"

# 1. 跳过安装脚本，避免触发 node-gyp 编译
npm install --ignore-scripts --no-audit --no-fund

# 2. 复制项目自带的 better-sqlite3 预编译文件
node build-config/postinstall.js

# 3. 下载 Electron 本体（国内可使用镜像）
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
node node_modules/electron/install.js
Remove-Item Env:ELECTRON_MIRROR
```

> **不要执行 `npm ci`**：它会重新运行安装脚本并触发原生模块编译，在没有 Visual Studio 的机器上会失败。

### 开发模式

```powershell
npm run dev
```

如果从 CherryStudio 等 Electron 应用的内置终端启动，先清除它注入的环境变量，否则会报 `Cannot read properties of undefined (reading 'getVersion')`：

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
npm run dev
```

### 生产构建

```powershell
# 构建主进程、渲染进程、歌词窗口、脚本
npm run build

# 打包 Windows 安装包（需要打包环境）
npm run pack
```

构建产物在 `dist/`，打包产物在 `build/` 或 `release/`（以实际配置为准），这些目录都不应该提交到 Git。

### 已知问题

- **Windows 下从受限目录运行 Electron 时听不到声音**：部分 Windows 安全策略会阻止 `node_modules` 或某些目录下的 `electron.exe` 访问音频设备，表现为没有音频输出设备、`MediaError code 3`。可将 Electron 运行时放到普通目录，并通过 `LX_ELECTRON_RUNTIME` 指定；也可以安装到常规目录后再运行。`build-config/runner-dev.js` 已支持自动查找外部运行时。
- **开发模式会覆盖 `dist/main.js`**：`npm run dev` 生成的是开发版主进程，会加载 `localhost:9080`。如果要直接运行已构建版本，先执行 `npm run build:main`。

## 目录结构

```text
src/
  common/          公共类型、默认设置、常量
  renderer/        主窗口（Vue 3）
    components/    通用组件与列表组件
    views/         页面（搜索、排行榜、歌单、我的列表、设置等）
    core/          播放器与业务逻辑
  renderer-lyric/  桌面歌词窗口
  renderer-scripts/ 预加载脚本
build-config/      构建与开发脚本
resources/         图标等静态资源
```

## 本项目不包含

- 任何自定义音源 / 音源脚本（API）
- 音乐文件、专辑封面、歌词等版权数据
- 用户数据、Cookie、Token、API 密钥
- `node_modules`、`dist`、`build` 等构建产物

## 许可证与免责声明

本项目基于 [lyswhut/lx-music-desktop](https://github.com/lyswhut/lx-music-desktop) 修改，遵循 **Apache License 2.0**，并继续适用上游 README 中的补充协议；两者冲突时以补充协议为准。

- 本项目仅用于技术学习与交流，**非商业用途**
- 使用过程中产生的版权数据请在 **24 小时内**清除
- 本项目不提供音乐源，不保证任何数据的合法性、准确性
- 本项目为非官方修改版，不代表原项目及作者

完整的 Apache License 2.0 见仓库根目录的 [`LICENSE`](./LICENSE)。

<details>
<summary>上游补充协议原文（继续适用）</summary>

本项目基于 [Apache License 2.0](https://github.com/lyswhut/lx-music-desktop/blob/master/LICENSE) 许可证发行，以下协议是对于 Apache License 2.0 的补充，如有冲突，以以下协议为准。

---

*词语约定：本协议中的“本项目”指 LX Music（洛雪音乐助手）桌面版项目；“使用者”指签署本协议的使用者；“官方音乐平台”指对本项目内置的包括酷我、酷狗、咪咕等音乐源的官方平台统称；“版权数据”指包括但不限于图像、音频、名字等在内的他人拥有所属版权的数据。*

### 一、数据来源

1.1 本项目的各官方平台在线数据来源原理是从其公开服务器中拉取数据（与未登录状态在官方平台 APP 获取的数据相同），经过对数据简单地筛选与合并后进行展示，因此本项目不对数据的合法性、准确性负责。

1.2 本项目本身没有获取某个音频数据的能力，本项目使用的在线音频数据来源来自软件设置内“自定义源”设置所选择的“源”返回的在线链接。例如播放某首歌，本项目所做的只是将希望播放的歌曲名、艺术家等信息传递给“源”，若“源”返回了一个链接，则本项目将认为这就是该歌曲的音频数据而进行使用，至于这是不是正确的音频数据本项目无法校验其准确性，所以使用本项目的过程中可能会出现希望播放的音频与实际播放的音频不对应或者无法播放的问题。

1.3 本项目的非官方平台数据（例如“我的列表”内列表）来自使用者本地系统或者使用者连接的同步服务，本项目不对这些数据的合法性、准确性负责。

### 二、版权数据

2.1 使用本项目的过程中可能会产生版权数据。对于这些版权数据，本项目不拥有它们的所有权。为了避免侵权，使用者务必在 **24 小时内** 清除使用本项目的过程中所产生的版权数据。

### 三、音乐平台别名

3.1 本项目内的官方音乐平台别名为本项目内对官方音乐平台的一个称呼，不包含恶意。如果官方音乐平台觉得不妥，可联系本项目更改或移除。

### 四、资源使用

4.1 本项目内使用的部分包括但不限于字体、图片等资源来源于互联网。如果出现侵权可联系本项目移除。

### 五、免责声明

5.1 由于使用本项目产生的包括由于本协议或由于使用或无法使用本项目而引起的任何性质的任何直接、间接、特殊、偶然或结果性损害（包括但不限于因商誉损失、停工、计算机故障或故障引起的损害赔偿，或任何及所有其他商业损害或损失）由使用者负责。

### 六、使用限制

6.1 本项目完全免费，且开源发布于 GitHub 面向全世界人用作对技术的学习交流。本项目不对项目内的技术可能存在违反当地法律法规的行为作保证。

6.2 **禁止在违反当地法律法规的情况下使用本项目。** 对于使用者在明知或不知当地法律法规不允许的情况下使用本项目所造成的任何违法违规行为由使用者承担，本项目不承担由此造成的任何直接、间接、特殊、偶然或结果性责任。

### 七、版权保护

7.1 音乐平台不易，请尊重版权，支持正版。

### 八、非商业性质

8.1 本项目仅用于对技术可行性的探索及研究，不接受任何商业（包括但不限于广告等）合作及捐赠。

### 九、接受协议

9.1 若你使用了本项目，即代表你接受本协议。

---

若对此有疑问请 mail to: lyswhut+qq.com（请将 `+` 替换为 `@`）

</details>

## 致谢

- 原项目：[lyswhut/lx-music-desktop](https://github.com/lyswhut/lx-music-desktop)
- 以及所有为原项目做出贡献的开发者
