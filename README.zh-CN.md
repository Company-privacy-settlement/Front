# Core Front — NEAR 企业支付

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md)

Core 的落地页、文档与钱包工具，使用 Next.js 构建。Core 是支持企业间及企业向员工转账的隐私结算开发协议。合约、证明生成、服务器及索引器分别保存在其他仓库。

[服务概览](https://github.com/Company-privacy-settlement/Core/blob/main/docs/SERVICE.md) · [网页 Docs](https://core-private-settlement-0574c4.jiheon6768.chatgpt.site/docs/) · [开发路线图](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ROADMAP.md)

## 工作区

| 路径 | 当前功能 |
| --- | --- |
| `/` | 服务落地页与文档入口 |
| `/docs/` | 九篇英文指南：入门、架构、费用、发票、分组、隐私、KYB、SDK/API、恢复 |
| `/live/` | 独立配置的测试网 FT 结算、逐项钱包审核、加密日志与公开索引活动 |
| `/notes/` | 本地 FT 票据生成、加密备份及重新打开、可选披露根导入与公开存款计划 |
| `/invoices/` | 收款人 NEP-413 签名请求、每支付单位独立引用、可选本地加密发票库 |
| `/pay/#invoice=…` | 签名结账、收款人准备检查、精确提款计划绑定与最终结算对账 |
| `/evidence/` | 私密收据、加密备份、选定字段证明与独立可信根的完整性检查 |
| `/kyb/` | 六步示例流程：概览、企业、人员/所有权、文件、审核、状态 |
| `/app/` | 旧路径重定向至对应 Docs |

网站与网页 Docs 默认使用英文，README 同时提供韩文与简体中文。落地页、Docs 与应用共享黑白绿色调、移动端横向约束与内部滚动。网页指南源文件为 `src/lib/docs.ts`。

## 运行与验证

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run dev
```

```sh
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

静态输出位于 `out/`。构建会校验内置 Core 浏览器包与类型声明的 SHA-256 清单，无需相邻仓库或 API 密钥。更新 Core 后，先在 Core 执行 `npm run build:client`，再在此执行 `npm run sync:core`。测试覆盖 Docs、移动端布局、发票、收款人准备、证据、票据、钱包恢复、日志及示例 KYB。2026-11-13 记录的完整浏览器测试通过 98 项，详见 [验证范围](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ROADMAP.md)。

## 配置结算

1. 运行匹配的 Core 只读 API 与最终化索引。从 API 之外独立获取可信部署策略，核对网络、注册表、代币、面额、费用接收方和验证密钥/WASM 哈希；在 Settlements 导入策略或已批准分组目录。
2. 设置各分组 API 地址并检查已验证容量。托管前端需要可访问的 HTTPS API，并在 CORS 中允许准确的前端来源。不附带已注资的公开测试网分组。
3. 连接兼容的 NEAR 测试网钱包，创建或解锁本地加密操作日志；日志打开期间禁止切换分组。
4. 在 Notes 创建 FT 票据，下载加密备份并重新打开后准备公开存款计划。导入 Settlements，逐项审核注册、存储、代币转账及 gas 调用。
5. 使用票据原始分组，在 Core CLI 生成新的 Groth16 支出证明；尚无浏览器证明生成。导入公开提款计划，核对准确收款人与引用，并依据最终化状态确认支付。

分组使用固定面额及**总计 256 个输出**。存款和私密转移消耗输出，提款不会恢复容量。已满或停用分组仅支持原分组恢复。原生 NEAR v2 通过 Contract/Core CLI 使用；浏览器目前执行测试网 FT 分组。

## 支付、发票与证据

存款与提款各**额外收取本金的 0.15%**，按代币最小单位向下取整。面额为 1 USDC 时存入 1.0015 USDC，另付提款费 0.0015 USDC，收款人获得完整 1 USDC。NEAR 存储、账户激活、代币注册及 gas 单独计算。[费用详情](https://github.com/Company-privacy-settlement/Core/blob/main/docs/SERVICE.md#fees)。

新 v2 发票为每个支付单位签署独立引用，仍可读取 v1。结账检查商户当前 FullAccess 密钥、独立可信策略、收款准备、准确证明目的地及索引中的部分/已付/逾期/超额总额。有效期、单位上限与引用复用是应用规则，并非合约预留。并发付款可能超额；钱包批准或跳转并不能证明支付完成。

签名条款保留在客户端 JSON 或链接持有者可见的 URL 片段。可选发票库按商户/网络加密，支持备份、恢复及不可变请求合并。没有服务器发票收件箱、Webhook、自动退款或法币兑换。当前托管站点仅所有者可访问，结账链接也受此限制。

证据收据仅验证选定字段相对于独立可信根的完整性，不证明陈述真实、支付最终性、身份或税务认可。Notes 仅导入已验证披露根用于公开存款准备。**任意收据根不能替换发票已签名的每单位支付引用。** 将发票与业务证据结合需要单独设计承诺格式。[证据指南](https://github.com/Company-privacy-settlement/Core/blob/main/docs/BROWSER_RECEIPTS.md)。

## 数据所有权与恢复

票据及完整收据位于内存和下载的加密文件中，不持久保存在浏览器。日志和可选发票库使用独立的加密浏览器存储。清除浏览器数据前请导出备份；不提供口令恢复。日志不等于票据备份。

私密工作区在页面隐藏或历史缓存恢复时锁定，清空私密视图并取消待处理任务。已经打开的钱包请求无法撤销。保存的签名意图会阻止再次发送，直到显式核对原交易或绑定的最终状态；不会自动重发。跨标签页互斥保护更新。

## 企业验证与边界

KYB 目前仅为美国、阿布扎比大陆或 ADGM 的示例资料流程。草稿仅在内存中，刷新或离开 KYB 布局即清除。不会读取或上传文件内容。准备结果明确标记 `verified: false`、`credentialIssued: false`、`providerSubmission: not_sent`。没有真实服务商审核或支付资格签发。美国州/联邦与 ADGM/大陆税务法律准备、确定性规则计算及 AI 草稿属于后续集成。

本金保存在独立金库，由共享票据授权一个有余额的金库直接支付，不会依次穿过多个金库。公开签名者、收款人、金额、时间、金库及引用仍可关联活动；增加金库本身不保证匿名性。协议与单机开发设置尚无生产安全审计。[隐私](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PRIVACY.md) · [服务边界](https://github.com/Company-privacy-settlement/Core/blob/main/docs/SERVICE.md#current-boundaries)。

## 仓库

- [Core](https://github.com/Company-privacy-settlement/Core)：浏览器/Node SDK、证明 CLI、只读 API、索引与证据。
- [Contract](https://github.com/Company-privacy-settlement/Contract)：合约、电路、向量与 WASM 构建。
- [Front](https://github.com/Company-privacy-settlement/Front)：落地页、Docs 与钱包界面。

没有外部分析或远程字体请求。钱包连接按需加载 NEAR Connect 清单及服务商接口。
