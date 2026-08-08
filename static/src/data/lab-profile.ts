export const facultyBio = {
  summary: 'Yarui Peng is a Youth Chief Professor in the School of Integrated Circuits at Southeast University and a recipient of a national young-talent award. He received his B.S. degree from Tsinghua University in 2012 and his M.S. and Ph.D. degrees in Electrical and Computer Engineering from the Georgia Institute of Technology in 2014 and 2016, respectively. From 2017 to 2025, he was an assistant professor at the University of Arkansas, first in Computer Science and Computer Engineering and later in Electrical Engineering and Computer Science. He joined Southeast University in September 2025.',
  research: 'He leads the Energy-Efficient Electronics and Design Automation (E3DA) Lab, which develops design automation algorithms and tools for 2.5D and 3D integrated circuits, advanced packaging, heterogeneous chiplet integration, and power electronics. The lab brings VLSI design automation ideas into power electronics and develops open-source EDA tools for wide-bandgap semiconductor package layout and optimization. His work has appeared in leading venues including TCAD, DAC, ICCAD, TPEL, TCPMT, and TNANO.',
  honors: 'He received the NSF CAREER Award in 2021 for contributions to chiplet design automation. His work has also received paper and session awards, including recognition at SRC TECHCON, ICPT, and EDAPS.'
};

export const researchOverview = {
  introduction: 'The E3DA Lab develops efficient design automation methods for energy-efficient electronics and advanced integrated systems. Based at the School of Integrated Circuits at Southeast University, the lab connects algorithms, physical design, multiphysics analysis, and open software tools across circuits, packages, and systems. Our work continues to grow through academic collaboration with Georgia Tech and the University of Arkansas, alongside other university and industry partners.',
  areas: [
    {
      id: 'EDA4Chiplet',
      title: 'EDA4Chiplet',
      description: 'Design automation for chiplets and advanced packaging, including chiplet-package co-design, cross-boundary timing optimization, physical implementation, parasitic extraction, and unified 2.5D/3D design flows.',
      images: [{ src: '/img/research/eda4chiplet/holistic-2d-2-5d-test-chip.jpg', alt: 'Holistic 2D and 2.5D chiplet-package design test chip' }]
    },
    {
      id: 'EDA4Power',
      title: 'EDA4Power',
      description: 'EDA methods for power electronics and advanced power-module packaging, including wide-bandgap devices, automated layout synthesis, thermal and electrical co-optimization, reliability, and PowerSynth-based design automation.',
      images: [
        { src: '/img/research/eda4power/2-5d-full-bridge-module.jpg', alt: '2.5D full-bridge power module with a custom silicon-carbide package' },
        { src: '/img/research/eda4power/3d-half-bridge-module.jpg', alt: '3D half-bridge power module with a custom silicon-carbide package' }
      ]
    },
    {
      id: 'EDA4HI',
      title: 'EDA4HI',
      description: 'EDA for heterogeneous integration: combining logic, memory, sensors, and power devices across materials and process technologies while jointly addressing signal integrity, power delivery, thermal behavior, and scalable 2.5D/3D packaging.',
      images: []
    }
  ],
  current: 'The Southeast University program expands these directions through the School of Integrated Circuits, with an emphasis on cross-disciplinary collaboration among VLSI, packaging, power electronics, algorithms, and software design. Earlier work with Georgia Tech and the University of Arkansas remains part of the lab’s active academic collaboration network.'
};

export const teachingOverview = {
  introduction: 'At Southeast University, the lab is developing bilingual undergraduate and graduate courses that connect integrated circuits, electronic design automation, advanced packaging, algorithms, and computer engineering.',
  currentCourses: [
    {
      term: 'Spring 2026',
      level: 'Graduate and Ph.D.',
      title: 'Chiplet Design Automation Algorithms',
      href: 'https://365.kdocs.cn/l/cb7cNcvZ08Mm'
    },
    {
      term: 'Fall 2026',
      level: 'Undergraduate elective',
      title: 'Computer Architecture',
      href: 'https://365.kdocs.cn/l/ckax6pv2cqI6'
    }
  ],
  history: 'During his University of Arkansas appointment, Professor Peng taught seven courses spanning digital circuits, computer architecture, algorithms, programming, EDA algorithms, EDA laboratory design, and integrated circuit design. This experience covered undergraduate through graduate instruction across electrical engineering, computer engineering, and computer science.'
};
