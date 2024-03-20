// TODO@ следует добавить требуемую бизнесом логику обработки ошибок в полном объеме
// TODO@ при дальшейшей разработке стоит разнести данный компонент: типы TS, класс-хелпер (общие функции), обработчики каждого типа Param = отдельные компоненты 
import { ChangeEvent, Component } from 'react';

type TRecord = Record<string, string | number>;
type TArr = string[];
type TSimpleTypes = string | number;
type TParamValue = TSimpleTypes | TRecord | TArr; // возможные типы структур данных. Расширяемо

interface IParam {
  id: number;
  name: string;
  type: 'string' | 'number' | 'object' | 'array'; // возможные типы параметров. Расширяемо
}

interface IParamValue {
  paramId: number;
  value: TParamValue;
}

interface Model {
  paramValues: IParamValue[];
}

interface IProps {
  params: IParam[];
  model: Model;
}

// ускорим работу, сменив структуру с Array на Map~
type TModelMap = Map<number, TParamValue>;

interface IState {
  modelMap: TModelMap,

  // константы для каждой структуры данных, на случай, когда параметр есть, а значений нет
  DEF_STR_VAL: string,
  DEF_OBJ_VAL: TRecord,
  DEF_AR_VAL: TArr,
}

class ParamEditor extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      modelMap: this.props.model.paramValues.reduce((map, val) => map.set(val.paramId, val.value), new Map()), DEF_STR_VAL: '',
      DEF_OBJ_VAL: {},
      DEF_AR_VAL: [],
    }
  }

  private getMapElById = (id: number) => this.state.modelMap.get(id);
  /**
   * Использовать с осторожностью. Напрямую изменяет стейт
   */
  private setMapElById = (id: number, val: TParamValue) => this.state.modelMap.set(id, val);
  /**
   * Добавит значение по умолчанию, если значения параметра ещё нет в model
   */
  private checkExistValByPar = (id: number, defVal: TArr | TRecord | string) => {
    if (this.getMapElById(id) === undefined) this.setMapElById(id, defVal);
  }

  private getUlStyle = () => ({
    listStyle: 'none', padding: '0', display: 'grid', gap: '10px'
  })
  private getLiStyle = (cnt: number = 2) => ({
    display: 'grid', gap: '20px', gridTemplateColumns: `repeat(${cnt}, 1fr)`, alignItems: 'center'
  })

  /**
   * Находит по id inputs и возвращает объект со значениями, где ключи - исходные id.
   */
  private searchInputValues = (e: React.MouseEvent, id: TRecord) => {
    const parent = (e.target as HTMLElement).closest('li');
    const res = {} as { [key in keyof typeof id]: string };

    for (const [key, value] of Object.entries(id)) {
      const input = parent?.querySelector(`#${value}`) as HTMLInputElement;
      res[key] = input?.value || '';
      if (input) input.value = '';
    }

    return res;
  }

  /**
   * Обновляет стейт model по id параметра и callback обработчика параметра
   */
  private updateMap = <T,>(id: number, callback: (par: T, map: TModelMap) => void) => {
    // IMPORTANT помним, что setState срабатывает 2 раза и опирается на prev
    // баг чётко проявится, если следующие 3 строки прокинуть внутрь setState
    const updMap = new Map(this.state.modelMap);
    const val = updMap.get(id) as T;
    callback(val, updMap);

    this.setState(prev => {
      return { ...prev, modelMap: updMap }
    })
  }

  public getModel(): Model {
    // Обратно переформатируем Map в исходный тип Model
    const model: Model = { paramValues: [] };
    for (const key of this.state.modelMap.keys()) {
      model.paramValues.push({
        paramId: key,
        value: this.getMapElById(key)!,
      })
    }

    return model;
  }

  /**
   * Функция для обработки примитивных value
   */
  private getInput(param: IParam) {
    const inputId = `${param.name}Value`;
    const id = param.id;

    this.checkExistValByPar(id, this.state.DEF_STR_VAL);

    const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
      let value: TParamValue = e.target.value;
      if (param.type === 'number') value = isNaN(Number(value)) ? this.state.DEF_STR_VAL : Number(value);

      this.updateMap<TSimpleTypes>(id, (_, map: TModelMap) => map.set(id, value));
    }

    return (
      <input
        id={inputId}
        value={this.getMapElById(id) as TSimpleTypes}
        type={'string'}
        style={{ height: 'min-content', padding: '5px', fontSize: '16px' }}
        onChange={handleChangeInput}
        placeholder='пока ничего нет' />
    )
  }

  /**
   * Функция для обработки структуры данных вида Ключ - Значение
   */
  private getObjPar<T extends TRecord>(param: IParam) {
    const inputKeyId = 'newObjKeyInput';
    const inputValueId = 'newObjValInput';
    const id = param.id;
    const valParam = this.getMapElById(id) as T;

    this.checkExistValByPar(id, this.state.DEF_OBJ_VAL);

    const handleDelete = (key: string) => {
      this.updateMap<T>(id, (par: T) => delete par[key]);
    };

    const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
      const { key, value } = this.searchInputValues(e, { key: inputKeyId, value: inputValueId });
      if (key.length === 0 || value.length === 0) return;

      this.updateMap<T>(id, (par: T, map: TModelMap) => {
        (par as TRecord)[key] = value;
        map.delete(id);
        map.set(id, { ...par });
      })
    };

    return (
      <ul style={this.getUlStyle()}>
        {Object.keys(valParam).map((key, i) => {
          return (
            <li key={key + i} style={this.getLiStyle(3)}>
              <p style={{ margin: 0 }}>{key}</p>
              <p style={{ margin: 0 }}>{valParam[key]}</p>
              <button onClick={() => handleDelete(key)}>Удалить</button>
            </li>
          )
        })}

        <li key={'newObjVal ' + id} style={this.getLiStyle(3)}>
          <input id={inputKeyId} placeholder='Параметр' type='text' />
          <input id={inputValueId} placeholder='Значение' type='text' />
          <button onClick={handleAdd}>Добавить</button>
        </li>
      </ul>
    )
  }

  /**
   * Функция для обработки структуры данных вида Array
   */
  private getArPar<T extends TArr>(param: IParam) {
    const inputId = 'newArrValInput';
    const id = param.id;

    this.checkExistValByPar(id, this.state.DEF_AR_VAL);

    const handleDelete = (i: number) => {
      this.updateMap<T>(id, (par: T, map: TModelMap) => {
        map.set(id, par.filter((_, k) => k !== i))
      });
    }

    const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
      const { value } = this.searchInputValues(e, { value: inputId });
      if (value.length === 0) return;
      this.updateMap<T>(id, (par: T) => { par.push(value) });
    }

    return (
      <ul style={this.getUlStyle()}>
        {(this.getMapElById(id) as T).map((el, i) => {
          return (
            <li key={el + i} style={this.getLiStyle()}>
              <p style={{ margin: '0' }}>{el}</p>
              <button onClick={() => handleDelete(i)}>Удалить</button>
            </li>
          )
        })}
        <li key={'newArrVal ' + id} style={this.getLiStyle()}>
          <input id={`${inputId}`} placeholder='Значение' type='text' />
          <button onClick={handleAdd}>Добавить</button>
        </li>
      </ul>
    )
  }

  // перебираем возможные типы, по нужде пишем обработчики
  private getValue(param: IParam) {
    switch (param.type) {
      case ('string'):
        return this.getInput(param);
      case ('number'):
        return this.getInput(param);
      case ('object'):
        return this.getObjPar(param);
      case ('array'):
        return this.getArPar(param);
    }
  }

  render() {
    return (
      <div style={{ width: 'min-content', margin: 'auto' }}>
        <h1 style={{ textAlign: 'center' }}>IParam Editor</h1>
        <ul style={this.getUlStyle()}>
          {this.props.params.map(param => {
            return (
              <li style={this.getLiStyle()} key={param.id}>
                <p style={{ fontSize: '20px', fontWeight: '600', margin: '0' }}>{param.name}</p>
                <div>
                  {this.getValue(param)}
                </div>
              </li>
            )
          })}
        </ul>

        {/* Для проверки по месту обработки */}
        <button onClick={() => console.log(this.getModel())} style={{ padding: '10px 5px' }}>
          вывести getModel() в console
        </button>
      </div >
    );
  }
}

export default ParamEditor;
