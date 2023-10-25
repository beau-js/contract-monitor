/*
 * @Author: pg-beau pg.beau@outlook.com
 * @Date: 2023-07-28 15:43:04
 * @LastEditors: beau beau.js@outlook.com
 * @LastEditTime: 2023-10-26 03:01:45
 * @FilePath: /workspace/contract-monitor/app/page.tsx
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */

import prisma from "@/prisma/db";

// app/page.tsx
const Home = async () => {
  const HIGH_GROWTH_TOKEN = await prisma.hightGrowthToken.findMany();

  return (
    <div>
      <h1 className="m-6">符合交易策略币对</h1>
      {HIGH_GROWTH_TOKEN.map(
        ({
          symbol,
          markPrice,
          lastFundingRate,
          contractPositionGrowth,
          sumOpenInterestValue,
          timestamp,
        }) => (
          <ul key={symbol} className="m-6">
            <li>交易对: {symbol}</li>
            <li>标记价格：{markPrice}</li>
            <li>资金费率：{lastFundingRate}</li>
            <li>24H合约持仓增长率: {contractPositionGrowth}</li>
            <li>合约持仓价值: {sumOpenInterestValue}</li>
            <li>数据更新时间: {timestamp}</li>
          </ul>
        )
      )}
    </div>
  );
};

export default Home;
