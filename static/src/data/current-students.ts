export type CurrentStudent = {
  name: string;
  e3daId: string;
  websiteUrl: string;
  imagePath: string;
  email: string;
  degree: 'Ph.D.' | 'MS' | 'BS';
  entryYear: string;
};

// Keep this public roster separate from the private Personnel workbook.
export const currentStudents: CurrentStudent[] = [
  { name: 'Mehran Sanjabiasasi', e3daId: 'mehrans', websiteUrl: 'https://Msanjabi.github.io/', imagePath: '/img/people/current/mehrans.jpg', email: 'mehran.sanjabi@outlook.com', degree: 'Ph.D.', entryYear: '2024' },
  { name: 'Zhuo Zhang', e3daId: 'zzhang', websiteUrl: 'https://zhuo-zh.github.io/', imagePath: '/img/people/current/zzhang.png', email: 'zhuo-zhang@hotmail.com', degree: 'MS', entryYear: '2025' },
  { name: 'Zongsheng Song', e3daId: 'zssong', websiteUrl: 'https://zongshengsong.github.io/', imagePath: '/img/people/current/zssong.jpg', email: 'zs-song@outlook.com', degree: 'MS', entryYear: '2025' },
  { name: 'Zhenyang Ma', e3daId: 'zhyma', websiteUrl: 'https://zhy-Ma.github.io/', imagePath: '/img/people/current/zhyma.png', email: 'zhenyang.ma@outlook.com', degree: 'MS', entryYear: '2025' },
  { name: 'Bowen Wu', e3daId: 'bwwu', websiteUrl: 'https://SynoFutis.github.io/', imagePath: '/img/people/current/bwwu.jpg', email: 'b-wu@outlook.com', degree: 'MS', entryYear: '2025' },
  { name: 'Xinbo Zhou', e3daId: 'xbzhou', websiteUrl: 'https://jorychou.github.io/', imagePath: '/img/people/current/xbzhou.png', email: 'xinbo.zhou@hotmail.com', degree: 'MS', entryYear: '2025' },
];