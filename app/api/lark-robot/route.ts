/*
 * @Author: beau beau.js@outlook.com
 * @Date: 2023-10-26 19:21:11
 * @LastEditors: beau beau.js@outlook.com
 * @LastEditTime: 2023-10-26 21:18:09
 * @FilePath: /workspace/contract-monitor/app/api/lark-robot/route.ts
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
import { NextRequest, NextResponse } from "next/server";
import { GET as getHighGrowthToken } from "@/app/api/high-growth-token/route";
import { HighGrowthTokenData } from "@/types/cryptoPairs";

export async function GET(request: NextRequest) {
  // 验证secret
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.BEAU_SECRET_TOKEN)
    return NextResponse.json({ msg: "Invalid Secret Token" });

  interface PostLarkData {
    msg_type: string;
    content: {
      text: string;
    };
  }

  // 封装 fetch lark机器人
  const postLarkHandler = async (data: PostLarkData) => {
    try {
      const RES = await fetch(process.env.LARK_HOOK_URL as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!RES.ok) throw new Error("Post Data to Lark Failed");

      const DATA = await RES.json();
      return DATA;
    } catch (error) {
      if (error instanceof Error) return error.message;
      throw error;
    }
  };

  const RES = await getHighGrowthToken(request);
  const HIGH_GROWTH_TOKEN: HighGrowthTokenData[] | { msg: string } = await RES.json();

  if (!Array.isArray(HIGH_GROWTH_TOKEN)) return NextResponse.json(HIGH_GROWTH_TOKEN);

  // 转换成易读的格式
  const LARK_DATA = HIGH_GROWTH_TOKEN.map(
    ({
      symbol,
      markPrice,
      lastFundingRate,
      contractPositionGrowth,
      sumOpenInterestValue,
      timestamp,
    }) => {
      return `
        交易币对：${symbol}
        资金费率: ${lastFundingRate}
        24H合约持仓增长量: ${contractPositionGrowth}
        标记价格：${markPrice}
        合约持仓价值: ${sumOpenInterestValue}
        更新时间：${timestamp}
        `;
    }
  );
  // 向lark机器人post数据
  const POST_LARK_DATA = {
    msg_type: "text",
    content: {
      text: `行情警报:
          ${JSON.parse(JSON.stringify(LARK_DATA)).join("")}`,
    },
  };
  const DATA = await postLarkHandler(POST_LARK_DATA);

  return NextResponse.json(DATA);
}
