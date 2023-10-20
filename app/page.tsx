/*
 * @Author: pg-beau pg.beau@outlook.com
 * @Date: 2023-07-28 15:43:04
 * @LastEditors: beau beau.js@outlook.com
 * @LastEditTime: 2023-10-21 00:34:24
 * @FilePath: /workspace/contract-monitor-dev/app/page.tsx
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
// app/page.tsx test
const Home = async () => {
  let finalData;

  if (
    Array.isArray(BINANCE_MARK_PRICE_INFO) &&
    BINANCE_MARK_PRICE_INFO.length > 0
  ) {
    if (TOKEN_PAIRS_WITH_HIGH_GROWTH_RATE.length === 0) {
      finalData = 'no data';
    } else {
    }

    if (Array.isArray(finalData)) {
    }
  }

  return (
    <div>
      <h1 className="m-6">符合交易策略代币</h1>

      {Array.isArray(finalData) ? (
        finalData.map(
          ({
            symbol,
            sumOpenInterestValue,
            contractPositionGrowth,
            lastFundingRate,
            timestamp,
          }) => {
            return (
              <ul key={symbol} className="list-none mx-12 my-6">
                <li>{`交易对:${symbol}`}</li>
                <li>{`24H合约持仓增长量: ${contractPositionGrowth}`}</li>
                <li>{`合约持仓价值:${sumOpenInterestValue}`}</li>
                <li>{`资金费率:${lastFundingRate}`}</li>
                <li> {`更新时间:${timestamp}`}</li>
              </ul>
            );
          }
        )
      ) : (
        <li>{finalData}</li>
      )}
    </div>
  );
};

export default Home;
