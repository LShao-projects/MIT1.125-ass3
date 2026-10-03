# Common Ground：本地第一版

这是 MIT 1.125 Assignment 3 的欧盟 AI 数据中心研究网站。当前只在本地运行，尚未发布。

## 打开网站

预览地址：http://127.0.0.1:5173/

依赖与本地数据库已经准备好。之后重新启动：

```sh
cd /Users/milasmac/Desktop/MIT1.125/MIT1.125-ass3/website
npm run dev -- --hostname 127.0.0.1
```

需要 Node.js 22.13 或更新版本。启动脚本也会自动寻找此电脑的 Codex Node 24 运行环境。

## 填写两个 Key

编辑 `website/.dev.vars`，填写已有的两个空位：

```dotenv
OPENAI_API_KEY=在本地填写你的OpenAI密钥
EMBER_API_KEY=在本地填写你的Ember密钥
OPENAI_MODEL=gpt-4.1-mini
EDITOR_USER_IDS=local_seedy
```

数据提供商名称为 **Ember**。保存后停止并重新运行开发服务器。不要把 Key 发进聊天，也不要放入 React 组件、公开环境变量或数据文件。`.dev.vars` 已被 Git 忽略；`.dev.vars.example` 只保留空白模板。以后部署时需在托管平台的服务端 secrets 中配置，不能上传这个本地文件。

OpenAI 调用由服务器发起，使用 Responses API、受控数据查询、来源与人工核实记录读取、计算工具，返回来源引用。页面只知道是否配置成功。每个注册用户每天最多 20 次请求；这只是应用限额，仍应在自己的 OpenAI 项目中设置适当的用量控制。尚未进行真实付费调用，模型访问权限需用你的账号验证。

## 页面与跨页问答

| 页面 | 第一版功能 |
| --- | --- |
| Explore Europe | EU27 真实边界地图、数据覆盖状态、国家简报；默认德国、法国、瑞典 |
| Compare countries | 同时比较 3–5 国，统一电价口径、电力结构、排放强度、Epoch 案例和缺失项 |
| Initial design | 容量假设、供电示意、故障及 48 小时断电讨论、需求与治理草案 |
| Costs & scenarios | 自建、租赁、混合方案 × 基准、电网延期、利用率减半；10 年现金流、敏感性、保存和导出 |
| Evidence library | 原始来源、定义、检索时间、人工核实表单、编辑者数据刷新及日志 |
| 每页右下角 Adviser | 跨页保留对话，发送当前页、国家、情景和最近对话；受控计算和真实来源引用 |

## 本地登录与人工核实

未登录时首先显示登录入口，登录并完成注册后进入工作区。已登录的用户继续使用现有会话。数据与共享设计接口也要求注册身份。使用本地模拟登录进入预览。此身份仅用于开发测试，不代表真实 ChatGPT 认证。首次使用需填写应用注册资料。QA 检查已创建名为 Local preview tester 的本地测试资料。

`local_seedy` 在本地开发模式中被列为 editor，因此可以保存共享设计、刷新数据、记录人工核实。正式发布前必须换成真实认证用户 ID，并验证 viewer/editor 权限。

人工核实默认没有完成。请亲自打开原文，确认具体主张、段落或表格、单位与适用范围，再在来源抽屉中填写核实记录并勾选声明。不能把网站已有一条数据当成人工核实。刷新来源后，旧记录保留为历史核实，需重新检查新版本。

## 数据与边界

- Eurostat：固定 2025-S2、非居民年用电 ≥150,000 MWh、EUR/kWh、排除可抵扣税费；当前快照 17 国有正值，其余保留不可用状态。它是国家参考价格，不是场址电价报价。
- Ember：2024 年 EU27 电力数据。Key 配置后可刷新同一年度的需求、总发电量和发电排放强度；电力结构暂保留档案快照，并在来源说明中标明。
- Epoch AI：已有数据中心和历史 GPU 集群记录，仅作为案例与硬件背景；记录数不等于国家数据中心总量。
- 德国、法国、瑞典的官方文件提供待核实的政策或项目证据。原始链接与限制见 Evidence library 和 `data/DATA_NOTES.md`。

成本、融资、利用率、等效 GPU 功率等是可编辑的教学假设。当前没有供应商报价、成员用量承诺、场址并网协议，也没有足够依据给出最终投资推荐。尚待完成真实人工核实、真实 Key 联调、正式认证、报告与交付材料；本地原型不等于完整作业已交付。

## 本轮验证结果

11 项模型及服务端单元测试、13 项本地 API 检查通过；TypeScript 和生产构建通过。已检查桌面与 390px 手机布局、参数变化、登录、无 Key 提示。测试没有填写任何人工核实记录，也没有发起付费 AI 调用。

当前本地 Worker 向 Eurostat 发起的外部请求返回运行时错误；同一公开地址通过命令行可读取，解析器也能解析该响应。因此在线刷新链路还需要继续排查。失败日志已落库，原有 27 国快照保留，可继续使用地图、比较和计算功能。Ember 与 OpenAI 的真实连接需填入 Key 后联调，尚不能声称已验证成功。

## 检查与维护

```sh
npm test
npm run typecheck
npm run build
npm run test:local
```

最后一个命令要求开发服务器正在运行；只在回环地址测试，会使用本地测试身份、暂时修改后还原共享 PUE，不会生成虚假的人工核实，也不会调用付费模型。

本地 D1 数据保存在 `.wrangler/state`。现有数据库已执行 `drizzle/0000`、`0001`、`0002` 三个迁移，请勿重复执行。若在新电脑初始化，先安装依赖、构建，再依次运行下列命令（每个 SQL 文件仅一次）：

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_messy_enchantress.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_clever_katie_power.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_wet_wendell_rand.sql
```

新数据库首次访问 `/api/data` 会导入有来源的研究快照。项目保留 Sites 的托管兼容结构；目前没有创建远程资源或发布网站。

## 本轮交互修订

- 字体：正文 17px，表格 16px，辅助说明通常 14–15px；图表数字同步放大。
- Explore：固定国家比较与筛选区，等面积地图保持横纵比例，悬停或键盘聚焦显示数据。鼠标点击不显示默认蓝框，键盘保留细描边提示。
- Compare：电价仍是同一半年度的跨国对比；能源构成改成三个共用 0–100% 标尺的分组条形图，并显示百分比。
- Initial Design：单页连续阅读；同一系统图切换正常、单部件故障及 48 小时停电。
- Costs：国家、供给方式、压力情景与模型参数集中在左侧，右侧显示当前选择及结果。
- Adviser：从独立页面改为每页浮动面板；对话在站内切页时保留，当前页与最近八条对话由服务端验证后作为上下文。
- Evidence：保留来源表与人工核实记录。作业 Step 11 明确要求 Evidence 筛选表，Step 13 要求至少三条人工核实来源。人工判断仍由学生完成。

与作业示例的差异：按用户本轮要求，本站采用登录后才能进入的流程。原文 Step 22 的“未登录时公共设计可见”用例因此不再成立；提交前须决定是否恢复公开概览或说明此差异。Step 11 的独立 Adviser 页面改为全站面板，问答、引用、身份提示和初步设计限制仍保留。

## 紧凑工作区与当前登录状态

全站使用顶部导航和同一左侧输入栏。地图随可用高度缩放；桌面打开 Adviser 会预留右栏并缩小内容区域，窄屏改为独立问答视图，关闭即可回到页面。成本年表、完整情景矩阵和背景说明按需展开。EU27 使用相同国旗与国家显示逻辑。

本地认证是 Sites starter 的模拟身份，按钮会进入共享测试账号。这个账号已在接口测试中注册，因此不重复要求填写资料。它用于测试访问控制流程，不验证真实用户身份，也不能用于不同真实用户的数据隔离。正式身份认证及发布后的不同用户隔离仍待验证。未部署云端网站。

数据库实际位于 `website/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/` 中的 SQLite 文件，逻辑绑定为 DB，Drizzle 是数据库访问层。重启应用不会清空此目录。九张业务表为 users、countries、sources、cases、designs、verifications、refreshes、scenarios、adviser_usage；schema 在 db/schema.ts，迁移在 drizzle/。本轮只读检查为国家27、来源8、案例6、共享设计1、测试用户1、刷新日志3、人工核实0、保存情景0、AI用量0；这些数量会随真实使用变化。

设施区是 Epoch AI 快照的六条精选记录，按所选国家过滤。德国 Jupiter、法国 Jean Zay、瑞典 Berzelius 属于 GPU 集群样本；瑞典 EcoDataCenter 2、芬兰 Nebius Mantsala、葡萄牙 Sines 属于数据中心样本。不是可购场址清单或全国普查；未收录某国案例时显示明确空状态，不据此判断该国没有数据中心。
