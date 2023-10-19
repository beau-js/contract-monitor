/*
 * @Author: pg-beau pg.beau@outlook.com
 * @Date: 2023-07-28 15:43:04
 * @LastEditors: beau beau.js@outlook.com
 * @LastEditTime: 2023-10-18 20:26:09
 * @FilePath: /workspace/contract-monitor-dev/app/page.tsx
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
// app/page.tsx
const Home = async () => {
  interface BinanceData {
    symbol: string;
    lastFundingRate: string;
    sumOpenInterest: string;
    sumOpenInterestValue: string;
    timestamp: string;
    contractPositionGrowth: number;
  }

  interface PostLarkData {
    msg_type: string;
    content: {
      text: string;
    };
  }

  const fetchBinanceMarkPriceInfo = async (
    symbol: string,
    retries: number
  ): Promise<BinanceData[] | BinanceData | undefined> => {
    try {
      const results = await fetch(
        `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`,
        {
          next: { revalidate: 60 },
        }
      );
      if (results.ok) {
        const data = await results.json();
        return data;
      }

      throw new Error('Fetch Binance Mark Price Failed');
    } catch (error) {
      // 如果还有重试次数，延迟一秒再次调用自身
      if (retries > 0) {
        console.log(`${retries}:${error}`);
        setTimeout(() => {
          return fetchBinanceMarkPriceInfo(symbol, retries - 1);
        }, 1000);
      } else {
        // 如果没有重试次数，抛出异常
        console.log(error);
        throw error;
      }
    }
  };

  const fetchBinanceOpenInterestStatistics = async (
    symbol: string,
    retries: number
  ): Promise<BinanceData[] | undefined> => {
    try {
      const results = await fetch(
        `https://fapi.binance.com/futures/data/openInterestHist?symbol=${symbol}&period=5m&limit=289`,
        {
          next: { revalidate: 60 },
        }
      );
      if (results.ok) {
        const data = await results.json();
        return data;
      }
      throw new Error(`Fetch Binance Open Interest Statistics Failed`);
    } catch (error) {
      if (retries > 0) {
        console.log(`${retries}:${error}`);
        setTimeout(() => {
          return fetchBinanceOpenInterestStatistics(symbol, retries - 1);
        }, 1000);
      } else {
        // 如果没有重试次数，抛出异常
        throw error;
      }
    }
  };

  const postLarkHandler = async (
    data: PostLarkData,
    retries: number
  ): Promise<PostLarkData[] | undefined> => {
    try {
      const res = await fetch(process.env.LARK_HOOK_URL_DEV as string, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const postLarkData = await res.json();
        return postLarkData;
      }
      throw new Error(`Post Data to Lark Failed`);
    } catch (error) {
      if (retries > 0) {
        console.log(`${retries}:${error}`);
        setTimeout(() => {
          return postLarkHandler(data, retries - 1);
        }, 1000);
      } else {
        // 如果没有重试次数，抛出异常
        throw error;
      }
    }
  };

  const convertTZ = (timestamp: string, tzString: string) => {
    // 将timestamp转换成Date对象，并乘以1000，因为JavaScript的时间戳是毫秒为单位
    const date = new Date(timestamp);
    // 使用toLocaleString方法，指定时区为tzString，并返回结果
    return date.toLocaleString('zh-CN', { timeZone: tzString });
  };

  const BINANCE_MARK_PRICE_INFO = (await fetchBinanceMarkPriceInfo(
    '',
    3
  )) as BinanceData[];

  let finalData;

  if (
    Array.isArray(BINANCE_MARK_PRICE_INFO) &&
    BINANCE_MARK_PRICE_INFO.length > 0
  ) {
    const TOKEN_PAIRS_WITH_HIGH_GROWTH_RATE = (
      await Promise.all(
        BINANCE_MARK_PRICE_INFO.map(async ({ symbol, lastFundingRate }) => {
          const DATA = await fetchBinanceOpenInterestStatistics(symbol, 3);
          if (Array.isArray(DATA) && DATA.length > 0) {
            const OLDEST_OPEN_INTEREST_STATISTICS = DATA[0];

            const LATEST_OPEN_INTEREST_STATISTICS = DATA[DATA.length - 1];

            const OPEN_INTEREST_POSITION_GROWTH_RATE =
              (Number(LATEST_OPEN_INTEREST_STATISTICS?.sumOpenInterestValue) -
                Number(OLDEST_OPEN_INTEREST_STATISTICS?.sumOpenInterestValue)) /
              Number(OLDEST_OPEN_INTEREST_STATISTICS?.sumOpenInterestValue);

            if (OPEN_INTEREST_POSITION_GROWTH_RATE >= 0.4) {
              return {
                ...LATEST_OPEN_INTEREST_STATISTICS,
                contractPositionGrowth: OPEN_INTEREST_POSITION_GROWTH_RATE,
                lastFundingRate,
              };
            } else {
              return null;
            }
          }
        })
      )
    ).filter((item): item is BinanceData => Boolean(item));

    if (TOKEN_PAIRS_WITH_HIGH_GROWTH_RATE.length === 0) {
      finalData = 'no data';
    } else {
      finalData = await Promise.all(
        TOKEN_PAIRS_WITH_HIGH_GROWTH_RATE.map(
          async ({
            symbol,
            lastFundingRate,
            sumOpenInterestValue,
            contractPositionGrowth,
            timestamp,
          }) => {
            return {
              symbol,
              sumOpenInterestValue: Number(sumOpenInterestValue).toFixed(4),
              contractPositionGrowth:
                (contractPositionGrowth * 100).toFixed(2) + '%',
              lastFundingRate: (Number(lastFundingRate) * 100).toFixed(2) + '%',
              timestamp: convertTZ(timestamp, 'Asia/Shanghai'),
            };
          }
        )
      );
    }

    if (Array.isArray(finalData)) {
      const LARK_DATA = finalData.map(
        ({
          symbol,
          contractPositionGrowth,
          sumOpenInterestValue,
          lastFundingRate,
          timestamp,
        }) => {
          return `
          交易币对：${symbol}
          24H合约持仓量: ${contractPositionGrowth}
          合约持仓价值: ${sumOpenInterestValue}
          资金费率: ${lastFundingRate}
          更新时间：${timestamp}
          `;
        }
      );

      const POST_LARK_DATA = {
        msg_type: 'text',
        content: {
          text: `行情警报:
              ${JSON.parse(JSON.stringify(LARK_DATA)).join('')}`,
        },
      };
      const DATA = await postLarkHandler(POST_LARK_DATA, 3);
      console.log(DATA);
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
