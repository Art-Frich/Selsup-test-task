export const model = {
  "paramValues": [
    {
      "paramId": 1,
      "value": "повседневное",
    },
    {
      "paramId": 2,
      "value": "макси",
    },
    {
      paramId: 5,
      value: {
        'type-C': 1,
        'type-A': '2x3.2'
      }
    },
    {
      paramId: 6,
      value: ['быстрая стирка', 'деликатная стирка', 'шерсть', 'цветное']
    }

  ]
}

interface IParam {
  id: number;
  name: string;
  type: 'string' | 'number' | 'object' | 'array';
}

export const params: IParam[] = [
  {
    id: 1,
    name: "Назначение",
    type: 'string'
  },
  {
    id: 2,
    name: "Длина",
    type: 'string'
  },
  {
    id: 3,
    name: 'Вес',
    type: 'number',
  },
  {
    id: 4,
    name: 'бренд',
    type: 'string',
  },
  {
    id: 5,
    name: 'интерфейсы',
    type: 'object',
  },
  {
    id: 6,
    name: 'режимы работы',
    type: 'array',
  }
]
