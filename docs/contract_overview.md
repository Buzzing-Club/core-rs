# Buzzing 协议合约概述

## 简介
Buzzing 协议是一个建立在 Solana 区块链上的去中心化预测市场协议。它允许用户创建和参与预测市场，管理流动性池，并实施各种投资策略。

## 核心组件

### 1. 市场系统
协议由几个关键组件组成，这些组件共同工作以创建一个完整的预测市场生态系统：

#### Market
- **用途**：作为协议的主要管理账户
- **字段**：
  - `admin`：管理员的公钥
  - `next_id`：用于生成唯一话题ID的计数器，表示下一个话题id
  - `bump`：PDA bump seed

#### Oracle
- **用途**：管理价格数据和市场信息
- **字段**：
  - `admin`：管理员的公钥，区别于market
  - `bump`：PDA bump seed

### 2. 金库系统
金库管理协议的财库和代币操作：

#### Vault
- **用途**：管理协议的财库、代币铸造和资金分配
- **字段**：
  - `admin`：管理员的公钥
  - `usdc_mint`：USDC代币铸造地址
  - `usdb_mint`：协议原生稳定币铸造地址
  - `total_all_principal`：总存入本金
  - `total_all_interest`：总产生利息
  - `available_funds`：总可用资金（本金+利息）
  - `remaining_funds`：当前可用于提现的资金
  - `guarantee_funds`：代币铸造的抵押资金
  - `last_settle_ts`：上次结算时间戳
  - `fee`：协议手续费（100 = 1%）
  - `bump`：PDA bump seed

### 3. 预测市场系统

#### Topic
- **用途**：代表一个预测市场话题
- **字段**：
  - `topic_id`：话题的唯一标识符
  - `creator`：创建者的公钥
  - `yes_mint`：YES代币铸造地址
  - `no_mint`：NO代币铸造地址
  - `yes_pool`：YES代币流动性池
  - `no_pool`：NO代币流动性池
  - `toltal_token`：铸造的总代币数量
  - `initial_price`：市场的初始价格
  - `is_ended`：市场是否已结束
  - `winning_token`：获胜代币（YES/NO）
  - `bump`：PDA bump seed
  - `topic_ipfs_hash`：话题元数据的IPFS哈希

#### LiquidityPool
- **用途**：管理交易流动性池
- **字段**：
  - `usdb_mint`：USDB代币铸造地址
  - `token_mint`：关联代币铸造地址
  - `usdb_reserve`：USDB代币储备
  - `token_reserve`：关联代币储备
  - `tick_lower`：价格下限
  - `tick_upper`：价格上限
  - `current_price`：当前价格
  - `active`：池是否激活

### 4. 投资策略系统

#### StrategyState
- **用途**：管理投资策略
- **字段**：
  - `id`：策略ID
  - `used_principal_percent`：本金使用百分比（例如，20 = 20%）
  - `apr`：年化利率（例如，300 = 3%）
  - `total_principal`：策略中的总本金
  - `total_interest`：产生的总利息
  - `total_user`：策略中的总用户数
  - `last_update_ts`：上次更新时间戳
  - `active`：策略是否激活
  - `bump`：PDA bump seed

#### Receipt
- **用途**：追踪用户投资
- **字段**：
  - `user`：用户的公钥
  - `strategy_id`：关联策略ID
  - `principal`：投资本金
  - `interest`：产生利息
  - `last_settle_ts`：上次结算时间戳
  - `bump`：PDA bump seed

#### GlobalStrategyRegistry
- **用途**：管理所有可用策略
- **字段**：
  - `admin`：管理员的公钥
  - `bump`：PDA bump seed
  - `strategy_ids`：活跃策略ID列表

## 主要功能

1. **市场管理**
   - `initialize_market`：初始化协议
   - `initialize_oracle`：设置价格数据源

2. **预测市场操作**
   - `create_topic`：创建新的预测市场
   - `end_topic`：关闭预测市场
   - `redeem`：兑换获胜代币
   - `close_pools`：关闭流动性池

3. **交易操作**
   - `swap_usdc_usdb`：USDC和USDB之间的兑换
   - `yes_swap`：YES代币交易
   - `no_swap`：NO代币交易

4. **投资操作**
   - `deposit`：向策略存入资金
   - `withdraw`：从策略提取资金
   - `add_strategy`：添加新的投资策略
   - `toggle_strategy`：启用/禁用策略
   - `update_strategy_apr`：更新策略年化收益率
   - `update_global_strategy_registry`：更新策略注册表

## 安全特性

1. **基于PDA的账户**：大多数账户使用程序派生地址（PDA）进行安全的账户管理
2. **管理员控制**：关键操作需要管理员授权
3. **手续费管理**：协议手续费可配置
4. **抵押要求**：代币铸造需要抵押
5. **策略控制**：策略可以启用/禁用，其参数可以更新

## 代币系统

1. **USDB**：协议的原生稳定币
2. **YES/NO代币**：预测市场结果代币
3. **USDC集成**：支持USDC的存入和提取

该协议为预测市场、流动性管理和投资策略提供了一个全面的框架，同时保持了安全性和灵活性。