# Core Front

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md)

新发票条款 v2 通过 Payment unit 选择器为每个付款单位提供独立签名引用，旧版 v1 保持共同引用。逐单位下载 action 后在本地生成证明。新付款授权前检查已索引的引用复用；并发或索引延迟仍可能导致复用，实际付款全部计入。需配合更新的 Core API。分散托管采用共享票据和一个付款金库，不是本金连续跳转。收款地址、金额、时间和签名者仍然公开，链接持有者和 API 可以关联引用。参见[隐私模型](https://github.com/Company-privacy-settlement/Core/blob/main/docs/PRIVACY.md)。

刷新中、查询失败或可信部署设置变化时清除发票状态，并忽略已失效请求的迟到响应。新查询成功后才能导入付款计划，原绑定目标的恢复流程保持不变。更新后的 Core 索引直接查询已签名引用集合。参见[审查与回归验证](https://github.com/Company-privacy-settlement/Core/blob/main/docs/REVIEW-2026-11-12.md)。

这是介绍 NEAR 隐私企业间结算与员工付款协议的 Next.js 官网和黑客松演示。合约与服务器/SDK 代码分别保存在独立仓库中。

- `/`：协议介绍页，说明分散 vault、共享匿名集、选择性披露及手续费。
- `/app/`：演示控制台、入金/付款、vault 流动性、交易搜索与导出。
- `/app/?view=proofs`：在浏览器中真实验证已记录的 Groth16 证明，并演示收据的选择性披露。

## 视觉语言

首页与应用统一采用参考 [NEAR 官方网站](https://www.near.org/)的黑白、鲜绿色、常规字重与细边框，保留发票编辑、付款及结算的原有任务结构。首页及应用中标题上方的装饰文字已移除。`src/app/near-theme.css`、`src/app/merchant-theme.css` 和 `src/app/workspace-layout.css` 提供共享配色与工作区布局，KYB 样式位于 `src/app/kyb/kyb.css`。DM Sans 本地托管，`public/core-field.svg` 为原创图形，Core 保持独立品牌与协议。

应用适配动态视口高度，固定导航和页脚，仅滚动正文；付款页也使用单一纵向滚动区域。路由切换重置正文阅读位置，限制滚动向外层页面传递。较小屏幕仍可访问长表单、表格与交易审阅详情。

发票编辑器实时预览实际草稿的标题、收款人、固定票据数量、代币本金和额外费用。可信策略没有代币显示精度，因此金额仍显示为代币最小单位。草稿不保存。付款页分开展示签名账单和付款操作，结算就绪状态来自已验证策略、钱包及本地加密日志，不虚构托管余额。

## 企业验证 / KYB

`/kyb/` 提供六个独立演示页面：概览 → 企业信息 → 代表人及所有权 → 证明文件 → 最终确认 → 验证状态。注册地分别选择美国、阿布扎比大陆或 ADGM。草稿仅在 KYB 工作区内存中保留，刷新或离开即清除。仅使用示例信息；不写入 localStorage、sessionStorage，也不发送到服务器或服务商。

文件步骤仅选择每份不超过 10 MB 的示例 PDF/PNG/JPEG 元数据，不读取或上传正文。演示清单包括四项必需证明和可选资金来源材料，不构成各司法辖区法定要求的判定。身份验证、筛查和服务商审核尚未接入。

企业、所有权和材料完整且确认代理权限后才能准备请求。任何信息更改都会使准备状态及确认失效；更改辖区还会清空注册号、注册机关、地点和文件记录。导出示例 JSON 明确包含 `verified: false`、`credentialIssued: false` 和 `providerSubmission: "not_sent"`。状态页不会签发 KYB 凭证或改变支付资格。官方资料仅供服务商评估参考。

## 本地运行

需要 Node.js 22 或更高版本。

```sh
npm ci
npm run dev
```

打开 http://localhost:3000。`npm run build` 会将 Next.js 静态导出结果写入 `out/`，可部署到静态托管服务。无需 API 密钥或环境变量。

```sh
npm run check
npm test
npx playwright install chromium
npm run build
npm run test:e2e
```

浏览器测试通过临时服务器提供构建后的 `out/`，使用端口 3000，并在桌面及移动端视口下运行。

## 收款人开具发票

`/invoices/` 创建商户 NEP-413 签名请求，`/pay/#invoice=...` 打开结账。导入可信测试网 FT 策略，连接支持消息签名的钱包，设置收款账户、标题/参考、1–32 个固定付款单位和期限。下载签名 JSON 后分享链接，重新打开文件可跟踪付款。API 不保存业务条款。

结账核对本地签名、商户当前 full-access 密钥和独立可信的组策略，仅导入绑定发票根及收款人的提款证明。秘密票据和证明由 Core CLI 生成，逐笔批准钱包操作；最终索引记录决定部分/已付/迟付/超额状态，跳转不代表付款。0.15% 提款费之外还需 NEAR 存储/gas，以及必要时的票据入金费。

不提供换汇、托管商户余额、回调或自动退款。期限与金额上限是应用规则，并发付款或延迟交易仍可能超额/迟付。链接持有者可读取条款，JSON 不是加密备份；共享结账仍受网站访问权限约束。参见 [Core 发票架构](https://github.com/Company-privacy-settlement/Core/blob/main/docs/INVOICES.md)。

## 测试网钱包工作区

`/live/` 在**用户配置的测试网 FT 共享组**中执行经过审核的真实钱包调用，不附带已注资的公开部署。使用 NEAR Connect 0.12.0，密钥由所选钱包保管。代币注册、NEAR 存储预付款、代币付款和绑定原目的地的恢复调用均分别审核并签名。

1. 使用真实 `CORE_POLICY_FILE`、`CORE_RPC_URL` 和精确 Front origin 的 `CORE_ALLOWED_ORIGINS` 启动 Core 只读 API。访问托管 Front 时使用 HTTPS API。
2. 输入 API 地址，导入独立于 API 获得的可信策略文件，核对所有固定值。
3. 连接测试网钱包，使用至少 12 字符的口令创建或解锁本地加密日志。
4. 导入 Core CLI `shared-deposit-args` 或 `shared-spend-args` 生成的**公开 FT 计划 JSON**。秘密票据与证明仍在本地 CLI 生成；日志不能替代秘密票据备份。
5. 审核目的地、代币最小单位金额、附带 NEAR 与额外 gas，逐步签名。刷新直到绑定入金为 `Active` 或提款为 `Complete`。
6. 导出加密日志。钱包响应丢失会阻止再次签名；核实原交易哈希或绑定链上记录后继续。没有自动重发或口令恢复功能。

日志使用 PBKDF2-SHA256 与 AES-256-GCM，并通过 Web Locks 排除并发标签页。解锁后的公开操作元数据位于页面内存，Lock 清除客户端口令。不支持锁 API 时拒绝签名。备份恢复仅允许空存储，防止覆盖已有恢复记录。配置的 API 可观察公开准备与状态请求。

`src/vendor/core-client/` 包含 Core 浏览器包、类型和 SHA-256 清单，构建时核对哈希，因此无需同级仓库即可构建。更新时先在 Core 运行 `npm run build:client`，再在 Front 运行 `npm run sync:core`。参见 [Core 钱包集成指南](https://github.com/Company-privacy-settlement/Core/blob/main/docs/WALLET.md)。

浏览器测试使用标准注入式测试钱包及模拟公开读取；Core 沙箱验证真实 WASM、证明与钱包会话执行。公开测试网部署上的已注资外部钱包验证仍待完成。

验证组策略后，`/live/` 还读取公开索引记录，展示已关联/未关联来源、外层交易成功/失败、检查点时间、自动发现范围与等待状态、事件/收款人过滤及固定分页。公开读取无需钱包或解锁日志。界面核对策略、代币、本金与费用；索引关闭或失败时明确说明，不回退演示数据。设置 Core 的 `CORE_INDEX_DB` 和可选 `CORE_DISCOVERY_START_HEIGHT`。刷新读取数据库，不证明当前最新链、企业完整历史或税务申报。

## 演示范围

`/app/` 的入金与提款是**完全在浏览器内执行的模拟**，余额、企业和人物均为示例数据。真实钱包调用在单独配置的 `/live/` 页面审核并签名。两个界面均不提供 EOA 密钥生成或浏览器动态证明生成。

工作区初始包含 20 NEAR 演示钱包余额、3 张隐私票据，以及三个 vault 合计 12 NEAR 的流动性。存入固定面额 1 NEAR 的票据会增加票据数量和流动性；付款会减少票据数量及选定 vault 的流动性。只有入金占用新的树叶节点。状态保存在 localStorage 中，可通过 Reset demo 重置。示例界面不要求输入真实密钥或真实企业个人信息。

以 1 NEAR 本金为例，手续费在金额之外**额外收取**。

| 操作 | 演示钱包扣款 | 票据/收款人本金 |
| --- | --- | --- |
| 入金 | 1 + 0.0015 协议手续费 + 0.02 存储费用 = **1.0215 NEAR** | **1 NEAR** 票据 |
| 付款/提款 | 0.0015 协议手续费 + 0.02 存储费用 = **0.0215 NEAR** | 隐私余额支出 **1 NEAR**，收款人收到 **1 NEAR** |

真实交易还需另付网络 gas。演示不收取 gas，并将存储费用与协议手续费分开显示。

## 实际验证的内容

- **Groth16**：`public/data/proof-vector.json` 使用 Contract 的跨 vault A→B 测试向量及 Core 的验证密钥。将 Arkworks 小端证明编码转换为 snarkjs 格式后，执行 BN254 配对验证。它验证针对 root、domain、nullifier 等公开输入的数学证明，不识别输入票据。这是**已记录的测试证明**，不是界面模拟付款的证明，使用开发用可信设置。
- **收据完整性**：使用 Web Crypto SHA-256 对 8 个字段构建带独立 salt 的 Merkle commitment，只验证并导出所选字段的 opening。格式与 Core SDK 的 disclosure 模块一致。它只证明字段值与本地 commitment 一致，不认证链上付款、企业身份或税务合规性。每次打开收据都会创建新的示例 commitment。

演示提供美国/阿布扎比的示例付款流程。真实 KYB/KYC 服务商和 AI 税务/法律材料准备仍属于后续集成范围。代码与界面是未经生产安全审计的黑客松开发成果。

## 目录结构

```text
src/app/page.tsx              协议介绍页
src/app/app/page.tsx          演示入口
src/components/dashboard.tsx 控制台及付款/收据流程
src/lib/demo.ts               BigInt 手续费与本地状态转换
src/lib/receipts.ts           选择性披露 commitment
src/lib/proof.ts              已记录的 Groth16 证明验证
public/data                  公开测试向量
public/vendor                自托管验证器与许可证
```

- [Contract](https://github.com/Company-privacy-settlement/Contract)：NEAR Rust 合约、电路及测试向量。
- [Core](https://github.com/Company-privacy-settlement/Core)：服务器/SDK 集成代码、企业凭证/证明数据模型及链集成验证。
- [Front](https://github.com/Company-privacy-settlement/Front)：当前 Next.js 前端。

运行和构建 Front 不需要同级仓库目录。前端不包含私钥或 proving key，不会请求外部分析/追踪服务或远程字体。连接钱包时按需加载 NEAR Connect 的公开钱包清单及服务商界面。
