/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-07-19 18:08:29
 * @LastEditors: pg-beau pg.beau@outlook.com
 * @LastEditTime: 2023-07-28 13:29:56
 * @FilePath: /WorkSpace/trading-straregy/app/page.tsx
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */

// /app/page.jsx

'use client';

import { useEffect } from 'react';

const Home = () => {
  // const headers = new Headers();
  // headers.set('Content-Type', 'application/json');
  // headers.set('authorization', `Bearer ${process.env.BEARER_TOKEN}`);

  const alarmHandler = async () => {
    const response = await fetch(`/api/larkRobotInteraction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: process.env.BEARER_TOKEN }),
    });

    const data = await response.json();
    console.log(data);
  };

  useEffect(() => {
    alarmHandler();
  }, []);

  return <div>alarm</div>;
};

export default Home;
