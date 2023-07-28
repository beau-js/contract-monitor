/*
 * @Author: pg-beau pg.beau@outlook.com
 * @Date: 2023-07-28 15:43:04
 * @LastEditors: pg-beau pg.beau@outlook.com
 * @LastEditTime: 2023-07-28 15:58:51
 * @FilePath: /WorkSpace/trading-straregy/app/page.tsx
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
'use client';
import { useEffect, useState } from 'react';

const Home = () => {
  const [data, setData] = useState('No Data');

  useEffect(() => {
    fetch(`api/larkRobotInteraction`, {
      method: `POST`,
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return <div>{data}</div>;
};

export default Home;
