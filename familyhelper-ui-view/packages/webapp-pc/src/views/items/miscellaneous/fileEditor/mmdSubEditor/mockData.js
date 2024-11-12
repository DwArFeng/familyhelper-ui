// mockData.js
import MmdNode from '@/views/items/miscellaneous/fileEditor/mmdSubEditor/MmdNode.vue';

const endpoints = [
  {
    id: 'right',
    orientation: [1, 0],
    pos: [0, 0.5],
  },
  {
    id: 'left',
    orientation: [-1, 0],
    pos: [0, 0.5],
  },
];

export default {
  nodes: [
    {
      id: '1',
      top: 40,
      left: 20,
      endpoints,
      render: MmdNode,
      editable: true,
      mmdData: {
        label: 'root',
        noteEnabled: true,
        note: '',
        imageEnabled: true,
        image: '',
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000',
        fontWeight: 'bold',
        fontStyle: 'italic',
      },
    },
    {
      id: '2',
      top: 40,
      left: 200,
      endpoints,
      render: MmdNode,
      editable: true,
      mmdData: {
        label: 'title-1',
        noteEnabled: true,
        note: '',
        imageEnabled: true,
        image: '',
        backgroundColor: '#FFFFFF',
        foregroundColor: '#999999',
        fontWeight: 'normal',
        fontStyle: 'normal',
      },
    },
  ],
};
