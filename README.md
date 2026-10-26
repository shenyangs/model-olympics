# Model Olympics · 模型对决

**同一道题、相同规则、双路并发：看清返回内容，再看规则得分。**

这是一个可在本机运行的结构化 JSON 输出演示。默认不需要 API Key：程序读取两份明确标注的本地固定样例，真实执行同一个判分器，展示 4/4 与 3/4 的差异。可选接入两个真实模型，但本项目目前的交付状态为 **PARTIAL：本地闭环已验证，真实模型推理未验证**。

## 快速开始

需要 **Node.js ^22.12.0 || ^24.0.0 || >=26.0.0、随 Node 安装的 npm（Vitest 5 不支持 Node 23/25）**。本次验证环境为 macOS Apple Silicon、Node.js 26.4.0；Windows/Linux 与最低 Node 版本未实机验证。第一次安装需要网络下载 npm 包；没有可复用浏览器时还需要下载 Chromium 和录像组件 FFmpeg。

进入克隆后的项目目录，依次运行：

```sh
npm run setup
npm run doctor
npm run dev
```

- `setup` 内部执行 `npm ci --cache .npm-cache`，按 `package-lock.json` 安装依赖；再检查浏览器与 FFmpeg，仅下载缺失组件到本项目 `.browser-cache`。不安装操作系统组件、不修改全局设置。macOS 上可只读复用标准 Playwright 缓存中的 Chromium，避免重复大下载。
- `doctor` 检查 Node 版本、直接依赖、浏览器/录像组件及 4206、5206 端口。错误会给出中文恢复命令。**不要求 API Key**。应用运行时端口占用是正常现象，测试前需先停止应用。
- `dev` 同时启动前端与后端。终端会打印中文入口。打开 **http://127.0.0.1:4206**（浏览器地址栏输入），API 健康检查为 **http://127.0.0.1:5206/api/health**。两者仅监听 `127.0.0.1`，不能通过其他设备的局域网地址访问。

只安装应用依赖、不需要录像测试时，可以直接运行：

```sh
npm ci --cache .npm-cache
npm run dev
```

已有依赖但需手动安装匹配的浏览器时：

macOS / Linux（bash、zsh）：

```sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.browser-cache" npx playwright install chromium
```

Windows PowerShell：

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD/.browser-cache"
npx playwright install chromium
```

Windows cmd：

```bat
set "PLAYWRIGHT_BROWSERS_PATH=%CD%\.browser-cache"
npx playwright install chromium
```

推荐直接使用跨平台 `npm run setup`，无需手动设置以上变量。`npm run demo` 也通过 Node 脚本传递环境变量，不依赖 POSIX 赋值语法。不要使用 `--with-deps`：本项目脚本不安装系统组件。Linux 若提示缺少系统共享库，需在已具备 Chromium 运行依赖的环境运行；此环境准备未自动完成。

## 三步体验（零密钥）

1. 点击 **查看共同提示词**，阅读两路完全相同的中文任务和固定映射。
2. 点击 **收起共同提示词**，回到双赛道视图。
3. 点击 **开始对决**，查看样例 A 的 **4/4** 与样例 B 的 **3/4**；后者把 R2 错写为 `hashPassword`，因此 R2 的 `validatePassword` 检查失败。可点击 **再来一轮** 重复运行。

页面始终标注“本地样例 FIXTURE · 无 AI 推理”。样例来自 `fixtures/`，不是模型实际生成内容，也不是历史模型回放。显示的样例耗时仅为真实文件读取与处理耗时，不能拿来比较模型速度；没有真实 usage 数据时显示“未提供”，费用显示“未计价”。短读取可能在屏幕绘制处理中状态前就已结束，不会插入假等待或伪造事件。

页面提供中文空态、加载状态、失败恢复提示、首次操作引导和模式标签。键盘可用 Tab 定位控件、Enter/空格操作按钮，焦点有可见边框；390px 小屏布局经过浏览器测试，原始 JSON 可换行查看。

## 可选：接入真实模型

把 `.env.example` 复制为 `.env`（macOS/Linux：`cp .env.example .env`；PowerShell：`Copy-Item .env.example .env`；cmd：`copy .env.example .env`），填入：

| 配置 | 含义 |
| --- | --- |
| `OPENAI_API_KEY` | 你授权用于本项目的服务密钥，仅后端读取 |
| `OPENAI_BASE_URL` | 可信的 OpenAI 兼容 API 地址，示例为 `https://api.openai.com/v1` |
| `MODEL_A` / `MODEL_B` | 同一接口实际支持的两个不同模型 ID |

重启 `npm run dev`，在 **选择运行模式** 中切换到真实模型。两个模型必须支持 Chat Completions、`temperature: 0` 和 `max_tokens: 400`。启用选项只说明配置存在且 ID 不同，不代表密钥有效或模型兼容。真实请求失败不会降级伪装成样例。

每轮只发出两次请求，不重试；每路最多 400 输出 token，20 秒超时，服务同时只接收一轮。**这不是费用上限**，真实调用可能收费。没有价格配置，费用不作估算。原始输出仅作为文本呈现，绝不执行生成代码。使用服务返回的 usage 计数，无 usage 时显示未提供。

## 主要依赖与目录

所有直接依赖均固定版本，并由锁文件固定传递依赖；`npm ci` 会校验一致性。已移除未使用的图标库和 Anthropic SDK。

| 依赖 | 用途 |
| --- | --- |
| React、React DOM | 中文交互界面与状态展示 |
| Vite、React 插件 | 本地前端开发服务与生产静态资源构建 |
| TypeScript、`@types/*` | 源码类型检查；Node、Express、React 类型声明 |
| Express | 仅本机可访问的配置、健康检查和对决 API |
| OpenAI SDK | 可选 OpenAI 兼容服务的真实请求适配器 |
| Zod | 严格 JSON 输出结构校验 |
| tsx、concurrently | 开发时运行 TypeScript 后端，并发管理前后端进程 |
| Vitest | 判分、并发、超时、脱敏及诊断脚本测试 |
| Playwright、Chromium、FFmpeg | 真实浏览器自动操作、截图、录像；不是运行网页的必需依赖 |

`src/` 是前端，`server/` 是适配器和判分器，`fixtures/` 是人工固定样例，`scripts/` 是安装/诊断/演示脚本，`tests/` 是自动化测试。无需父目录、兄弟项目或外部字体/图片。MIT 许可证原文见 `LICENSE`。

## 验证与真实证据

先停止 `npm run dev`（对应终端按 Ctrl+C），测试会独立启动服务：

```sh
npm run build
npm run test
npm run e2e
npm run demo
npm run doctor
```

本次中文版本实际执行结果记录于 `status.json`；本地日志在 `artifacts/zh-*.log`。验证覆盖判分、非法 JSON、并发启动、超时隔离、错误脱敏、中文页面真实 API 数据流、重复运行、键盘操作、小屏横向溢出、网络失败提示及 1440×810 演示画面。**没有将接口错误或未验证推理当成模型成功结果**。

- 中文结果截图：`artifacts/zh-demo-results.png`
- 中文小屏截图：`artifacts/zh-mobile.png`
- 独立演示录像：`artifacts/playwright/demo/demo-record-a-real-fixture-showdown/video.webm`
- 缺依赖诊断：`artifacts/zh-doctor-missing.log`，通过 `node scripts/doctor.mjs --dependency-dir artifacts/不存在的依赖目录` 验证预期退出码 1，不改动实际依赖目录。

日志、录像、截图和缓存不提交 Git；独立克隆后运行测试即可重建。此次 `setup` 确实执行了锁文件依赖重装，复用已有 macOS Chromium 和项目 FFmpeg，没有重复下载浏览器。**全新机器从零下载浏览器、Windows/Linux 执行、最低 Node 版本、真实模型调用仍未验证**。历史浏览器/FFmpeg 缺失失败日志也保留在本地 artifacts 中。

## 常见故障与恢复

| 现象 | 处理方式 |
| --- | --- |
| 页面无法打开或提示无法连接后端 | 保持 `npm run dev` 终端运行；检查上面的精确地址；执行 `npm run doctor`。服务恢复后刷新页面 |
| 4206 / 5206 被占用、EADDRINUSE | 在之前启动应用的终端按 Ctrl+C；不要盲目结束其他程序。测试与开发服务不能同时使用相同端口 |
| 模块缺失、锁文件安装失败 | 在项目目录重跑 `npm run setup`，检查网络和 Node 版本；不要删除锁文件来绕过一致性检查 |
| 浏览器或 FFmpeg 缺失 | 重跑 `npm run setup`；网络失败时保留日志，网络恢复后重试。不需要删除整个缓存 |
| 出现 npm 安装脚本策略警告 | 检查本机 npm 的安装策略。当前环境警告未阻止构建；本项目不会替你修改全局策略，仍以实际 build 结果为准 |
| 真实模型报错或超时 | 检查 `.env` 的服务、密钥、模型 ID 和参数兼容性后重启；也可切回本地样例。错误不显示密钥或服务原始异常 |
| doctor 提示端口占用，但网页能用 | 应用正在运行时属正常情况；停止后再进行独立测试或空闲端口诊断 |

## 能力边界

这是一场**单次展示，不是科学模型排名**；仅一个固定结构化输出题目，不是代码执行或单元测试代码基准。四项检查为严格结构（含完整且不重复的需求 ID）以及三个精确函数映射。Markdown 代码围栏不算合法 JSON，部分得分只是检查项计数。

不包含账户、云部署、持久历史、多轮采样、流式 token 展示或 Docker 执行。请求只允许选择样例/真实模式，体积受限，不能提交任意路径或提示词。真实请求使用服务器单调时钟计时，包含网络开销。仅适用于本机可信环境；不要直接公开暴露此开发服务。
