# Core Front

[한국어](README.md) · [简体中文](README.zh-CN.md) · [English](README.en.md)

这是介绍 NEAR 隐私企业间结算与员工付款协议的 Next.js 官网和黑客松演示。合约与服务器/SDK 代码分别保存在独立仓库中。

- `/`：协议介绍页，说明分散 vault、共享匿名集、选择性披露及手续费。
- `/app/`：演示控制台、入金/付款、vault 流动性、交易搜索与导出。
- `/app/?view=proofs`：在浏览器中真实验证已记录的 Groth16 证明，并演示收据的选择性披露。

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

## 演示范围

入金与提款是**完全在浏览器内执行的模拟**。尚未连接钱包、EOA 生成/私钥存储、实时链上查询、交易签名/广播或动态付款证明生成。界面不会将合约展示为已部署到测试网。示例企业与人物均为演示数据。

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

演示提供美国/阿布扎比的示例付款流程。真实 KYB/KYC 服务商、AI 税务/法律材料准备、钱包签名及测试网连接属于后续集成范围。代码与界面是未经生产安全审计的黑客松开发成果。

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

运行和构建 Front 不需要同级仓库目录。前端不包含私钥或 proving key，也不会请求外部分析/追踪服务或远程字体。
