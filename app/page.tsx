/*
 * @Author: pg-beau pg.beau@outlook.com
 * @Date: 2023-07-28 15:43:04
 * @LastEditors: pg-beau pg.beau@outlook.com
 * @LastEditTime: 2023-07-28 20:01:01
 * @FilePath: /WorkSpace/trading-straregy/app/page.tsx
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
'use client';

import { useEffect, useState } from 'react';

const Home = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`api/larkRobotInteraction`, {
      method: `POST`,
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  console.log(data);

  return (
    <div>
      <h1 className="m-6">符合交易策略代币</h1>
      {data.map(({ symbol, lastFundingRate, openInterestStatistics, contractPositionGrowth, timestamp }) => (
        <ul key={symbol} className="list-none mx-12 my-6">
          <li>代币：{symbol}</li>
          <li>资金费率：{lastFundingRate}</li>
          <li>24H合约持仓增长量: {contractPositionGrowth}</li>
          <li>合约市值：{openInterestStatistics}</li>
          <li>更新时间：{timestamp}</li>
        </ul>
      ))}
    </div>
  );
};

export default Home;
