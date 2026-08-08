export type CurrentStudent = {
  name: string;
  e3daId: string;
  githubUsername: string;
};

// Keep this public roster separate from the private Personnel workbook.
export const currentStudents: CurrentStudent[] = [
  { name: 'Mehran Sanjabiasasi', e3daId: 'mehrans', githubUsername: 'mehrans' },
  { name: 'Zhuo Zhang', e3daId: 'zzhang', githubUsername: 'zzhang' },
  { name: 'Zongsheng Song', e3daId: 'zssong', githubUsername: 'zssong' },
  { name: 'Zhenyang Ma', e3daId: 'zhyma', githubUsername: 'zhyma' },
  { name: 'Bowen Wu', e3daId: 'bwwu', githubUsername: 'bwwu' },
  { name: 'Xinbo Zhou', e3daId: 'xbzhou', githubUsername: 'xbzhou' },
];