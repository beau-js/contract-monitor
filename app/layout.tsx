/*
 * @Author: pg-beau pg.beau@outlook.com
 * @Date: 2023-07-27 14:09:31
 * @LastEditors: pg-beau pg.beau@outlook.com
 * @LastEditTime: 2023-07-28 16:59:41
 * @FilePath: /WorkSpace/trading-straregy/app/layout.tsx
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
import 'tailwindcss/tailwind.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
