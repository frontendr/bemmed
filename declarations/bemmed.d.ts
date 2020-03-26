declare type elementPart = string | number;
declare type modifierPart = string | number | Object;

export default class BEM {
  private b?: String;
  private e?: String;
  private m?: String;

  constructor(block: string, element?: string, modifier?: string);

  static propTypes: {
    bem: (props: any, propName: string, componentName: string) => void | Error;
    className: (props: any, propName: string, componentName: string) => void | Error;
    element: (props: any, propName: string, componentName: string) => void | Error;
    modifier: (props: any, propName: string, componentName: string) => void | Error;
  };

  static propType: typeof BEM.propTypes.className;

  public concat(...items: Array<BEM | BEMList | string>): BEMList;

  public element(element: string, ...modifiers: modifierPart[]): BEM;

  public elem: typeof BEM.prototype.element;

  public modifier(...modifiers: modifierPart[]): BEM | BEMList;

  public mod: typeof BEM.prototype.modifier;

  public elements(...elements: elementPart[]): BEMList;

  public withElem(...elements: elementPart[]): BEMList;

  public withMod(...modifiers: modifierPart[]): BEMList;

  public toString(): string;
}

export const BEMType: typeof BEM.propType;

export class BEMList extends Array {}

declare type BEMOptions = {
  elementSeparator?: string;
  modifierSeparator?: string;
};

export function setup(options?: BEMOptions): BEM;
