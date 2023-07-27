/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-07-20 14:43:45
 * @LastEditors: pg-beau pg.beau@outlook.com
 * @LastEditTime: 2023-07-27 14:45:20
 * @FilePath: /WorkSpace/trading-straregy/app/api/larkRobotInteraction/route.js
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */

// /app/api/larkRobotInteraction/route.js
import { NextResponse } from 'next/server';
// import cron from 'node-cron';

// cron.schedule('01,16,31,46 * * * *', async () => {
//   const date = new Date();
//   const hongKongTime = date.toLocaleString('zh-CN', { timeZone: 'Asia/Hong_Kong' });
//   console.log(`Current Hong Kong time: ${hongKongTime}`);
//   await POST();
// });

export async function POST(request) {
  const getBinanceFundingRateData = async () => {
    try {
      const res = await fetch(`https://fapi.binance.com/fapi/v1/premiumIndex`);
      const data = await res.json();
      return data;
    } catch (error) {
      console.log(error);
      setTimeout(getBinanceFundingRateData, 60000);
    }
  };

  const getBinanceOpenInterestStatistics = async (symbol) => {
    try {
      const res = await fetch(
        `https://fapi.binance.com/futures/data/openInterestHist?symbol=${symbol}&period=5m&limit=288`
      );
      const data = await res.json();
      return data;
    } catch (error) {
      console.log(error);
      setTimeout(getBinanceFundingRateData, 60000);
    }
  };

  const convertTZ = (timestamp, tzString) => {
    // 将timestamp转换成Date对象，并乘以1000，因为JavaScript的时间戳是毫秒为单位
    const date = new Date(timestamp);
    // 使用toLocaleString方法，指定时区为tzString，并返回结果
    return date.toLocaleString('zh-CN', { timeZone: tzString });
  };

  //获取资金费率所有数据
  const binanceFundingRateData = await getBinanceFundingRateData();

  const filterFundingRateData = binanceFundingRateData.filter(
    ({ lastFundingRate }) => Math.abs(Number(lastFundingRate)) >= 0.001
  );

  // 筛选符合条件的资金费率币种
  if (filterFundingRateData.length === 0) {
    return NextResponse.json({ msg: `No Tokens Meet The Funding Rate Alarm` });
  }

  // 筛选出同时符合资金费率和合约持仓增长量的币种
  const filterData = (
    await Promise.all(
      filterFundingRateData.map(async ({ symbol, lastFundingRate }) => {
        const openInterestStatisticsData = await getBinanceOpenInterestStatistics(symbol);

        const firstSumOpenInterestValue = Number(openInterestStatisticsData[0].sumOpenInterestValue);
        const lastSumOpenInterestValue = Number(
          openInterestStatisticsData[openInterestStatisticsData.length - 1].sumOpenInterestValue
        );

        const contractPositionGrowth =
          (lastSumOpenInterestValue - firstSumOpenInterestValue) / firstSumOpenInterestValue;

        const contractPositionGrowthPercentage = (contractPositionGrowth * 100).toFixed(2) + '%';

        if (contractPositionGrowth >= 0.4) {
          return {
            symbol,
            lastFundingRate: (lastFundingRate * 100).toFixed(4) + '%',
            openInterestStatistics: Number(
              openInterestStatisticsData[openInterestStatisticsData.length - 1].sumOpenInterestValue
            ).toFixed(2),
            contractPositionGrowth: contractPositionGrowthPercentage,
            timestamp: convertTZ(
              openInterestStatisticsData[openInterestStatisticsData.length - 1].timestamp,
              'Asia/Shanghai'
            ),
          };
        }
      })
    )
  ).filter(Boolean);

  if (filterData.length === 0) {
    return NextResponse.json({ msg: `No Tokens Meet The 24h Contract Position Growth Conditions` });
  }

  const strFilterData = filterData.map(
    ({ symbol, lastFundingRate, contractPositionGrowth, openInterestStatistics, timestamp }) => {
      return `
        代币名称: ${symbol};
        资金费率: ${lastFundingRate};
        24H合约增长量: ${contractPositionGrowth};
        合约持仓市值: ${openInterestStatistics};
        更新时间: ${timestamp}
        `;
    }
  );

  const LarkData = {
    msg_type: 'text',
    content: {
      text: `行情警报:
        ${JSON.parse(JSON.stringify(strFilterData)).join('')}`,
    },
  };

  const postLarkRes = await fetch(process.env.LARK_HOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(LarkData),
  });

  const postLarkData = await postLarkRes.json();

  return NextResponse.json(postLarkData);
}
