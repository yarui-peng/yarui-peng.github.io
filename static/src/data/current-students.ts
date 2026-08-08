export type CurrentStudent = {
  name: string;
  e3daId: string;
  githubUsername: string;
  email: string;
  degree: 'Ph.D.' | 'MS' | 'BS';
  entryYear: string;
};

// Keep this public roster separate from the private Personnel workbook.
export const currentStudents: CurrentStudent[] = [
  { name: 'Mehran Sanjabiasasi', e3daId: 'mehrans', githubUsername: 'mehrans', email: 'mehran.sanjabi@outlook.com', degree: 'Ph.D.', entryYear: '2024' },
  { name: 'Zhuo Zhang', e3daId: 'zzhang', githubUsername: 'zzhang', email: 'zhuo-zhang@hotmail.com', degree: 'MS', entryYear: '2025' },
  { name: 'Zongsheng Song', e3daId: 'zssong', githubUsername: 'zssong', email: 'zs-song@outlook.com', degree: 'MS', entryYear: '2025' },
  { name: 'Zhenyang Ma', e3daId: 'zhyma', githubUsername: 'zhyma', email: 'zhenyang.ma@outlook.com', degree: 'MS', entryYear: '2025' },
  { name: 'Bowen Wu', e3daId: 'bwwu', githubUsername: 'bwwu', email: 'b-wu@outlook.com', degree: 'MS', entryYear: '2025' },
  { name: 'Xinbo Zhou', e3daId: 'xbzhou', githubUsername: 'xbzhou', email: 'xinbo.zhou@hotmail.com', degree: 'MS', entryYear: '2025' },
];