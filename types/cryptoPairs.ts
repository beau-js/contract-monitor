/*
 * @Author: beau beau.js@outlook.com
 * @Date: 2023-10-26 18:39:29
 * @LastEditors: beau beau.js@outlook.com
 * @LastEditTime: 2023-10-26 18:43:11
 * @FilePath: /workspace/contract-monitor-dev/types/cryptoPairs.ts
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
export interface BinanceMarkPriceData {
  symbol: string;
  markPrice: string;
  lastFundingRate: string;
}

export interface BinanceOpenInterestData {
  symbol: string;
  sumOpenInterest: string;
  sumOpenInterestValue: string;
  timestamp: number;
}

export type HighGrowthTokenData = BinanceMarkPriceData &
  BinanceOpenInterestData & { contractPositionGrowth: string; timestamp: string };
