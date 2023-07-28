/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-07-20 14:43:45
 * @LastEditors: pg-beau pg.beau@outlook.com
 * @LastEditTime: 2023-07-28 20:01:39
 * @FilePath: /WorkSpace/trading-straregy/app/api/larkRobotInteraction/route.ts
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */

// /app/api/larkRobotInteraction/route.js
import { NextResponse } from 'next/server';

interface BinanceFundingRateData {
  symbol: string;
  lastFundingRate: string;
}

export async function GET() {
  const getBinanceFundingRateData = async () => {
    try {
      const res = await fetch(`https://fapi.binance.com/fapi/v1/premiumIndex`, { next: { revalidate: 60 } });
      const data = await res.json();
      return data;
    } catch (error) {
      console.log(error);
      setTimeout(getBinanceFundingRateData, 60000);
    }
  };

  const getBinanceOpenInterestStatistics = async (symbol: string) => {
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

  const convertTZ = (timestamp: string, tzString: string) => {
    // 将timestamp转换成Date对象，并乘以1000，因为JavaScript的时间戳是毫秒为单位
    const date = new Date(timestamp);
    // 使用toLocaleString方法，指定时区为tzString，并返回结果
    return date.toLocaleString('zh-CN', { timeZone: tzString });
  };

  //获取资金费率所有数据
  const binanceFundingRateData: BinanceFundingRateData[] = await getBinanceFundingRateData();

  const filterFundingRateData = binanceFundingRateData.filter(
    ({ lastFundingRate }) => Math.abs(Number(lastFundingRate)) >= 0.001
  );

  // 筛选符合条件的资金费率币种
  if (!Array.isArray(filterFundingRateData) || filterFundingRateData.length === 0) {
    return NextResponse.json({ msg: `No Tokens Meet The Funding Rate Alarm` });
  }

  // 筛选出同时符合资金费率和合约持仓增长量的币种

  const filterData = (
    await Promise.all(
      filterFundingRateData.map(async ({ symbol, lastFundingRate }) => {
        const openInterestStatisticsData = await getBinanceOpenInterestStatistics(symbol);

        const firstSumOpenInterestValue = openInterestStatisticsData[0];
        const lastSumOpenInterestValue = openInterestStatisticsData[openInterestStatisticsData.length - 1];

        const contractPositionGrowth =
          (Number(lastSumOpenInterestValue.sumOpenInterestValue) -
            Number(firstSumOpenInterestValue.sumOpenInterestValue)) /
          Number(firstSumOpenInterestValue.sumOpenInterestValue);

        const contractPositionGrowthPercentage = (contractPositionGrowth * 100).toFixed(2) + '%';

        if (contractPositionGrowth >= 0.4) {
          return {
            symbol,
            lastFundingRate: (Number(lastFundingRate) * 100).toFixed(4) + '%',
            openInterestStatistics: Number(
              openInterestStatisticsData[openInterestStatisticsData.length - 1].sumOpenInterestValue
            ).toFixed(2),
            contractPositionGrowth: contractPositionGrowthPercentage,
            timestamp: convertTZ(
              openInterestStatisticsData[openInterestStatisticsData.length - 1].timestamp,
              'Asia/Shanghai'
            ),
          };
        } else {
          return null;
        }
      })
    )
  ).filter(Boolean);

  if (Array.isArray(filterData) && filterData.length > 0) {
    return NextResponse.json(filterData);
  } else {
    return NextResponse.json({ msg: `No Tokens Meet The 24h Contract Position Growth Conditions` });
  }
}

export async function POST(request: Request) {
  const getFilterResponse = await GET();
  const getFilterData = await getFilterResponse.json();

  if (Array.isArray(getFilterData) && getFilterData.length > 0) {
    const strFilterData = getFilterData.map((item) => {
      return `
          代币名称: ${item.symbol};
          资金费率: ${item.lastFundingRate};
          24H合约增长量: ${item.contractPositionGrowth};
          合约持仓市值: ${item.openInterestStatistics};
          更新时间: ${item.timestamp}
          `;
    });

    const LarkData = {
      msg_type: 'text',
      content: {
        text: `行情警报:
          ${JSON.parse(JSON.stringify(strFilterData)).join('')}`,
      },
    };

    try {
      const postLarkRes = await fetch(process.env.LARK_HOOK_URL as string, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(LarkData),
      });

      const postLarkData = await postLarkRes.json();
      console.log(postLarkData);

      return NextResponse.json(getFilterData);
    } catch (error) {
      console.log(error);
    }
  } else {
    return getFilterData;
  }
}
