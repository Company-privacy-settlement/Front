# Core Front — NEAR 企业支付

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md)

Core 的落地页、文档与钱包工具，使用 Next.js 构建。Core 是支持企业间及企业向员工转账的隐私结算开发协议。合约、证明生成、服务器及索引器分别保存在其他仓库。

[服务概览](https://github.com/Company-privacy-settlement/Core/blob/main/docs/SERVICE.md) · [网页 Docs](https://core-private-settlement-0574c4.jiheon6768.chatgpt.site/docs/) · [开发路线图](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ROADMAP.md)

同步 SDK 的 `OrganizationInvoiceClient` 支持按组织加密保存和查询发票及幂等创建。权限表与英文 Docs 已说明发票权限和密钥配置。现有本地发票表单与库不会自动同步到此 API。[Core API 指南](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ORGANIZATION_INVOICES.md)。

Organization → Invoice payments 提供完整组织发票快照搜索、状态/资产/组/日期筛选、CSV/JSON 导出、签名 JSON 保存与最终化索引对账。须独立选择可信策略/API，未检查、失败、过期和不完整观察明确显示。[仪表板指南](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PAYMENT_DASHBOARD.md)。

Organization → Webhooks 管理最终付款回调、签名密钥轮换、尝试/失败历史与版本化重试。Owner/Admin 管理，Operator/Auditor 读取，Viewer 无权加载。浏览器不持久保存签名秘密。[工作器和接收端配置](https://github.com/Company-privacy-settlement/Core/blob/main/docs/WEBHOOKS.md)。

Organization → Payouts 管理员工/承包商付款批次、逐收款人审批和费用、共享加密日志、原目标单独恢复及观察性对账导出。须独立导入可信测试网 FT 策略/API 与不同已充值票据的公开清单。[付款指南](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PAYOUT_BATCHES.md)。

## 工作区

| 路径 | 当前功能 |
| --- | --- |
| `/` | 服务落地页与文档入口 |
| `/docs/` | 十篇英文指南：入门、架构、费用、发票、分组、隐私、KYB、SDK/API、恢复和组织 |
| `/live/` | 独立配置的测试网 FT 结算、逐项钱包审核、加密日志与公开索引活动 |
| `/notes/` | 本地 FT 票据生成、加密备份及重新打开、可选披露根导入与公开存款计划 |
| `/invoices/` | 收款人 NEP-413 签名请求、每支付单位独立引用、可选本地加密发票库 |
| `/pay/#invoice=…` | 签名结账、收款人准备检查、精确提款计划绑定与最终结算对账 |
| `/evidence/` | 私密收据、加密备份、选定字段证明与独立可信根的完整性检查 |
| `/kyb/` | 六步示例流程：概览、企业、人员/所有权、文件、审核、状态 |
| `/organization/` | 通过独立 Organization API 管理组织、成员、邀请、角色、所有权和审计历史 |
| `/app/` | 旧路径重定向至对应 Docs |

网站与网页 Docs 默认使用英文，README 同时提供韩文与简体中文。落地页、Docs 与应用共享黑白绿色调、移动端横向约束与内部滚动。网页指南源文件为 `src/lib/docs.ts`。

**Local proofs** (`/prove/`) 在本地 worker 中生成 FT 提现证明，检查独立材料哈希与策略验证密钥字节，支持取消及下载证明文件验证。[配置与信任模型](https://github.com/Company-privacy-settlement/Core/blob/main/docs/BROWSER_PROVER.md)。[发票结账](https://github.com/Company-privacy-settlement/Core/blob/main/docs/INVOICE_PAYMENTS.md)支持原分组加密票据选择 → 本地证明 → 金额与费用确认 → 逐项钱包授权 → 最终付款确认，并提供所选单位绑定、取消、签名前商户密钥/状态复查与保守恢复。

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

静态输出位于 `out/`。构建会校验内置 Core 浏览器包与类型声明的 SHA-256 清单，无需相邻仓库或 API 密钥。更新 Core 后，先在 Core 执行 `npm run build:client`，再在此执行 `npm run sync:core`。测试覆盖 Docs、移动端布局、发票、收款人准备、证据、票据、钱包恢复、日志及示例 KYB。2026-11-13 完整浏览器运行通过 164 个桌面/移动用例，并使用实际证明材料，详见 [验证范围](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ROADMAP.md)。

## 组织与访问权限

在 Organization 输入独立部署的 Organization API 来源，使用支持 NEP-413 的测试网钱包登录。可创建/选择组织、定向邀请及接受、管理允许的成员角色和查看审计记录。令牌仅在内存中，页面隐藏或 API 来源变化即清除。Owner/Admin/Operator/Viewer/Auditor 权限由服务端检查，与钱包签名、KYB 和托管网站访问范围分开。后端需要独立部署，不内置公开企业服务器。[配置及边界](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ORGANIZATIONS.md)。

[组织数据备份与恢复](https://github.com/Company-privacy-settlement/Core/blob/main/docs/ORGANIZATION_BACKUPS.md)提供一致在线快照、会话/挑战废弃及隔离恢复。必须使用单独审核的当前权限文件才能激活到新的运行数据库；历史所有者、角色和待处理邀请不会自动恢复为权限。

[企业付款审批](https://github.com/Company-privacy-settlement/Core/blob/main/docs/CORPORATE_PAYMENTS.md)分离创建者与另一位 Owner/Admin 审批者，固定付款、额外 0.15% 费用及前置调用。支持的钱包流程在执行前复查当前成员权限与审批，并将每个准确调用仅保留一次。这属于组织 API/SDK/应用策略；现有合约继续支持无许可的固定收款人证明执行。

## 集成 CI

推送和 PR 将当前 Front 提交传入固定 Core 流水线，验证类型/单元/静态构建/全部桌面与移动浏览器、与重建 Core 文件及源清单的 SDK 一致性、固定 Contract 的实际 WASM/Groth16 和开发发布包。CI 启动全新本地服务器；`CORE_E2E_PORT` 可指定测试端口。私有仓库需要只读检出凭据和 Core 复用工作流访问设置。[版本、证据及配置](https://github.com/Company-privacy-settlement/Core/blob/main/docs/CI.md)。不会改变网站访问范围或发布网站。

## 配置结算

1. 运行匹配的 Core 只读 API 与最终化索引。从 API 之外独立获取可信部署策略，核对网络、注册表、代币、面额、费用接收方和验证密钥/WASM 哈希；在 Settlements 导入策略或已批准分组目录。
2. 设置各分组 API 地址并检查已验证容量。托管前端需要可访问的 HTTPS API，并在 CORS 中允许准确的前端来源。不附带已注资的公开测试网分组。
3. 连接兼容的 NEAR 测试网钱包，创建或解锁本地加密操作日志；日志打开期间禁止切换分组。
4. 在 Notes 创建 FT 票据，下载加密备份并重新打开后准备公开存款计划。导入 Settlements，逐项审核注册、存储、代币转账及 gas 调用。
5. 在签名结账中选择付款单位与原分组加密票据，导入可信证明文件及独立材料清单哈希并生成本地证明。确认完整本金、额外 0.15% 提现费用和独立 NEAR 成本，分别授权前置操作及付款，并等待最终确认。Local proofs 与 CLI/公开计划导入仍可使用。

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

**2026-11-14 付款仪表板验证：**包含新增 13 项 Core 和 18 项浏览器用例的 **355 项 Core 测试**与 **182 项桌面/移动浏览器用例**通过，类型、Node/浏览器 SDK 和静态构建也通过。浏览器服务/钱包测试夹具不代表公开网络实际部署。

**2026-11-14 付款 Webhook 验证：**含新增 24 项 Core 和 12 项浏览器用例的 **379 项 Core 测试**与 **194 项桌面/移动浏览器用例**通过，Node/浏览器 SDK、静态构建和编译服务恢复检查通过。使用本地索引/钱包/传输夹具，未向实际商户回调发送消息或部署公开后端。

员工与承包商批量付款验证（**2026-11-14**）：**401 项 Core 测试**、**210 项桌面/移动浏览器用例**通过，其中新增 22 项 Core 和 16 项批量付款浏览器用例。类型检查、Node/浏览器 SDK、静态 Front 构建、编译服务重启/备份/恢复及文档检查均通过。钱包、RPC 和组织服务使用本地测试环境；结果不代表已验证真实资金的公网工资支付或真实移动钱包。
