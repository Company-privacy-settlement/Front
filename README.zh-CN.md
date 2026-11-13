# Core Front

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md)

基于 Next.js 的 NEAR 企业隐私结算文档和钱包界面。**网站及 Docs 默认使用英语**，README 提供英、韩、简体中文。交互式模拟已移除，首页入口改为 Docs 和可配置的测试网工作区。

## 文档

`/docs/` 提供九篇英文指南：Getting started、Architecture、Payments & fees、Invoices & checkout、Groups & capacity、Privacy & evidence、Business verification、SDK & API、Recovery & limits。支持搜索、目录、章节链接、上下篇和移动菜单。内容位于 `src/lib/docs.ts`。旧 `/app/` 地址跳转至相关文档，不再呈现模拟仪表板。

首页、文档和应用统一采用黑白绿色调。标题上方没有装饰标签；页面适配视口高度，在内部阅读区域滚动，表格和代码可在窄屏横向滚动。

## 运行与验证

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

静态输出位于 `out/`，构建无需相邻仓库。浏览器测试覆盖文档、旧链接、发票、公开记录、钱包恢复、KYB 和窄屏。

## 钱包与发票

`/live/` 对独立可信策略对应的 Core API 和索引执行经审核的测试网 FT 钱包调用。托管 Front 需要可访问的 HTTPS API 与准确 CORS 来源。不包含已注资的公开网络部署。

秘密票据和证明由本地 CLI 生成，浏览器导入公开付款计划。加密操作日志不是可支出票据的备份。签名结果不明确时，核实原交易或绑定的最终状态前阻止再次签名；无自动重发或口令恢复。

`/invoices/` 开具收款人 NEP-413 签名请求，`/pay/#invoice=...` 打开结账。v2 每个单位使用独立引用，兼容 v1。核实策略、当前 FullAccess 密钥、证明目的地、确认金额、迟付标记、引用复用和覆盖范围。到期与引用单次使用属于应用规则，并发、迟付和超额付款仍可能发生。查询失败或信任设置变化会清除旧状态并忽略失效响应。

离开前保存签名 JSON。未实现服务端发票收件箱、商户托管、webhook、法币转换或自动退款。链接持有者和 API 可关联付款引用，当前托管仍仅限所有者访问。

## KYB 与协议边界

`/kyb/` 为美国、阿布扎比本土和 ADGM 提供六页示例准备流程。草稿仅驻内存，刷新或离开后清除。不读取或上传文件内容。导出明确设置 `verified: false`、`credentialIssued: false`、`providerSubmission: not_sent`，不产生外部审核、凭证或支付资格。AI 税务/法律准备及申报尚待集成。

本金保留在独立金库，共享 ZK 票据授权一个金库直接支付，无连续本金跳转。收款人、金额、时间、签名者、金库及引用仍然公开。每组固定面额、总计 256 个输出，尚未进行生产安全审计。

浏览器 SDK 与 SHA-256 清单位于 `src/vendor/core-client/`。在 Core 执行 `npm run build:client` 后，在 Front 执行 `npm run sync:core` 更新。

[Contract](https://github.com/Company-privacy-settlement/Contract) · [Core](https://github.com/Company-privacy-settlement/Core) · [Front](https://github.com/Company-privacy-settlement/Front)

导入独立批准的组目录后，可验证各组 API 策略和输出容量，并选择存款或恢复模式。恢复模式禁止导入新存款；日志解锁时会锁定组选择。[组指南](https://github.com/Company-privacy-settlement/Core/blob/main/docs/GROUPS.md)说明详细流程。
