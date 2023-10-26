/*
 * @Author: beau beau.js@outlook.com
 * @Date: 2023-10-17 13:48:20
 * @LastEditors: beau beau.js@outlook.com
 * @LastEditTime: 2023-10-26 18:45:59
 * @FilePath: /workspace/contract-monitor-dev/app/api/contracts/route.ts
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
import { NextResponse } from "next/server";
import { BinanceMarkPriceData } from "@/types/cryptoPairs";
import { BinanceOpenInterestData } from "@/types/cryptoPairs";
import { HighGrowthTokenData } from "@/types/cryptoPairs";

// GET
export async function GET(request: Request | "") {
  // 封装fetch symbol和资金费率
  const fetchBinanceMarkPriceInfo = async (): Promise<BinanceMarkPriceData[] | string> => {
    try {
      const RES = await fetch(`https://fapi.binance.com/fapi/v1/premiumIndex`, {
        cache: "no-store",
      });

      if (!RES.ok) throw new Error("Fetch Binance Mark Price Failed");

      const DATA = await RES.json();

      if (DATA.length === 0 || DATA.msg) throw new Error(`Invalid symbol`);

      return DATA;
    } catch (error) {
      if (error instanceof Error) return error.message;
      throw error;
    }
  };

  // 封装fetch 合约持仓量数据函数
  const fetchBinanceOpenInterestStatistics = async (
    symbol: string
  ): Promise<BinanceOpenInterestData[] | string> => {
    try {
      const RES = await fetch(
        `https://fapi.binance.com/futures/data/openInterestHist?symbol=${symbol}&period=5m&limit=289`,
        {
          cache: "no-store",
        }
      );

      if (!RES.ok) throw new Error(`Fetch Binance Open Interest Statistics Failed`);

      const DATA = await RES.json();

      if (Array.isArray(DATA) && DATA.length === 0) throw new Error(`Not Found the symbol`);

      if (!Array.isArray(DATA)) throw new Error(`Symbol Is Necessary`);

      return DATA;
    } catch (error) {
      if (error instanceof Error) return error.message;
      throw error;
    }
  };

  // 将时间戳转换成UTC+8时间
  const convertTZ = (timestamp: number, tzString: string) => {
    // 将timestamp转换成Date对象，并乘以1000，因为JavaScript的时间戳是毫秒为单位
    const date = new Date(timestamp);
    // 使用toLocaleString方法，指定时区为tzString，并返回结果
    return date.toLocaleString("zh-CN", { timeZone: tzString });
  };

  const MARK_PRICE_INFO = await fetchBinanceMarkPriceInfo();

  if (typeof MARK_PRICE_INFO === "string")
    return NextResponse.json({ msg: MARK_PRICE_INFO }, { status: 400 });

  // 筛选合约持仓增长量达标的币对
  const HIGH_GROWTH_TOKEN = (
    await Promise.all(
      MARK_PRICE_INFO.map(async ({ symbol, markPrice, lastFundingRate }) => {
        const OPEN_INTEREST_DATA = await fetchBinanceOpenInterestStatistics(symbol);

        if (typeof OPEN_INTEREST_DATA === "string") return null;

        const OLDEST_OPEN_INTEREST_STATISTICS = OPEN_INTEREST_DATA[0];

        const LATEST_OPEN_INTEREST_STATISTICS = OPEN_INTEREST_DATA[OPEN_INTEREST_DATA.length - 1];

        const OPEN_INTEREST_POSITION_GROWTH_RATE =
          (Number(LATEST_OPEN_INTEREST_STATISTICS.sumOpenInterestValue) -
            Number(OLDEST_OPEN_INTEREST_STATISTICS.sumOpenInterestValue)) /
          Number(OLDEST_OPEN_INTEREST_STATISTICS.sumOpenInterestValue);

        if (OPEN_INTEREST_POSITION_GROWTH_RATE < 0.4) return null;

        return {
          symbol,
          markPrice: Number(markPrice).toFixed(4),
          lastFundingRate: (Number(lastFundingRate) * 100).toFixed(4) + "%",
          contractPositionGrowth:
            (Number(OPEN_INTEREST_POSITION_GROWTH_RATE) * 100).toFixed(2) + "%",
          sumOpenInterest: Number(LATEST_OPEN_INTEREST_STATISTICS.sumOpenInterest).toFixed(4),
          sumOpenInterestValue: Number(
            LATEST_OPEN_INTEREST_STATISTICS.sumOpenInterestValue
          ).toFixed(2),
          timestamp: convertTZ(LATEST_OPEN_INTEREST_STATISTICS.timestamp, "Asia/Shanghai"),
        };
      })
    )
  ).filter(Boolean) as HighGrowthTokenData[] | [];

  // 处理没有合约持仓增长量达标的情况
  if (HIGH_GROWTH_TOKEN.length === 0)
    return NextResponse.json(
      { msg: `No Pairs Meet The Contract Position Growth Rate Condition` },
      { status: 204 }
    );

  return NextResponse.json(HIGH_GROWTH_TOKEN as HighGrowthTokenData[], { status: 200 });
}

// POST
