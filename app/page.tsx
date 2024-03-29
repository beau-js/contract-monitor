/*
 * @Author: beau beau.js@outlook.com
 * @Date: 2023-10-26 15:39:26
 * @LastEditors: beau beau.js@outlook.com
 * @LastEditTime: 2023-10-27 12:08:54
 * @FilePath: /workspace/contract-monitor-dev/app/page.tsx
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
// app/page.tsx
import { HighGrowthTokenData } from "@/types/cryptoPairs";
import { GET } from "./api/high-growth-token/route";

const Home = async () => {
  const RES = await GET("");
  const DATA: HighGrowthTokenData[] | { msg: string } = await RES.json();

  if ("msg" in DATA)
    return (
      <>
        <h1 className="m-6">符合交易策略币对</h1>
        <p>{DATA.msg}</p>
      </>
    );

  return (
    <div>
      <h1 className="m-6">符合交易策略币对</h1>
      {DATA.map(
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
            <li>资金费率：{lastFundingRate}</li>
            <li>24H合约持仓增长率: {contractPositionGrowth}</li>
            <li>标记价格：{markPrice}</li>
            <li>合约持仓价值: {sumOpenInterestValue}</li>
            <li>数据更新时间: {timestamp}</li>
          </ul>
        )
      )}
    </div>
  );
};

export default Home;
