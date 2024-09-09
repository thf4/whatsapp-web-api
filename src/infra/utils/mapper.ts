import * as constants from './constants';
import { Settings, Properties } from '../types/types';

function getSettings(properties: Properties | string): Settings {
  const settings: Settings = {
    path: [],
    type: null,
    formatting: undefined,
    nested: null,
    defaultValue: undefined,
    required: true,
  };

  if (typeof properties === 'string') {
    properties = { path: properties };
  }

  for (const property in properties) {
    if (properties.hasOwnProperty(property)) {
      const value = properties[property as keyof Properties];

      switch (property.toLowerCase()) {
        case constants.PATH:
          if (typeof value !== 'string') {
            throw new Error('Invalid path: path is not a string');
          }
          settings.path = value.split(constants.PATH_DELIMITER);
          break;
        case constants.TYPE:
          if (value !== undefined && value !== null) {
            if (!constants.TYPES.includes(value)) {
              throw new Error(`Invalid type ${typeof value}`);
            }
            settings.type = value;
          }
          break;
        case constants.FORMATTING:
          if (value !== undefined && value !== null) {
            if (
              typeof value !== 'function' ||
              constants.TYPES.includes(value as unknown as string)
            ) {
              throw new Error('Error formatting is not a function');
            }
            settings.formatting = value;
          }
          break;
        case constants.NESTED:
          if (value !== undefined && value !== null) {
            if (typeof value !== 'object' || Array.isArray(value)) {
              throw new Error('Error nested is not an object');
            }
            settings.nested = value;
          }
          break;
        case constants.REQUIRED:
          if (value !== undefined && value !== null) {
            if (typeof value !== 'boolean') {
              throw new Error('Error required is not a boolean');
            }
            settings.required = value;
          }
          break;
        case constants.DEFAULT_VALUE:
          if (value !== undefined && value !== null) {
            settings.defaultValue = value;
          }
          break;
        default:
          throw new Error(`Invalid property ${property}`);
      }
    } else {
      throw new Error(`Invalid property ${property}`);
    }
  }

  if (settings.path === null) {
    throw new Error("Path can't be null");
  }

  if (
    settings.type !== null &&
    settings.nested !== null &&
    ![constants.ARRAY, constants.OBJECT].includes(settings.type)
  ) {
    throw new Error(
      'Type must be an Array or an Object when nested property is filled'
    );
  }

  return settings;
}

function getValue(from: any, settings: Settings, root: any): any {
  let value = from;

  if (typeof from !== 'object' || typeof settings !== 'object')
    return undefined;

  if (
    settings.path?.length === 1 &&
    settings.path[0].toUpperCase() === constants.KEY_WORD.EMPTY
  ) {
    return value;
  }

  if (
    settings.path?.length &&
    settings.path[0].toUpperCase() === constants.KEY_WORD.ROOT
  ) {
    return parseProperties(
      root,
      {
        path: settings.path.slice(1).join(constants.PATH_DELIMITER),
        type: settings.type || '',
        formatting: settings.formatting,
        nested: settings.nested,
        required: settings.required,
      },
      root
    );
  }

  for (let i = 0; i < settings.path?.length; i++) {
    if (settings.path[i].toUpperCase() === constants.KEY_WORD.ITEM) {
      continue;
    } else if (value && settings.path[i] in value) {
      value = value[settings.path[i]];
    } else if (Array.isArray(value)) {
      const result = value.map((item: any) =>
        parseProperties(
          item,
          {
            path: settings.path?.slice(1).join(constants.PATH_DELIMITER),
            type: settings.type,
            formatting: settings.formatting,
            nested: settings.nested,
            required: settings.required,
          },
          root
        )
      );
      return Promise.all(result);
    } else if (settings.defaultValue !== undefined) {
      return settings.defaultValue;
    } else if (!settings.required) {
      return undefined;
    } else {
      throw new Error(
        `Invalid path ${settings.path.join(constants.PATH_DELIMITER)} (${
          settings.path[i]
        })`
      );
    }
  }
  return value;
}

function parseProperties(
  from: any,
  properties: Properties,
  root: any,
  index?: number
): any {
  const settings = getSettings(properties);
  let value = getValue(from, settings, root);

  if (value !== undefined && settings.nested !== null) {
    value = main(value, settings.nested, true, root);
  }

  if (settings.formatting && !(value instanceof Promise)) {
    value = settings.formatting(value, index);
  }

  return value !== undefined ? Promise.resolve(value) : undefined;
}

function main(
  from: any,
  template: Record<string, Properties>,
  isRecursive = false,
  root?: any
) {
  root = root || from;
  const to: Record<string, any> | any[] = Array.isArray(from) ? [] : {};
  let ret: any;

  if (!from || !template) return to;

  if (Array.isArray(from)) {
    for (let i = 0; i < from.length; i++) {
      const tempObj: Record<string, any> = {};
      for (const fieldName in template) {
        ret = parseProperties(from[i], template[fieldName], root, i);
        if (ret !== undefined) {
          tempObj[fieldName] = ret;
        }
      }
      if (Object.keys(tempObj).length > 0) {
        to.push(Promise.resolve(tempObj));
      }
    }
    return Promise.all(to as any);
  } else {
    for (const fieldName in template) {
      ret = parseProperties(from, template[fieldName], root);
      if (ret !== undefined) {
        to[fieldName] = ret;
      }
    }
    return Object.keys(to).length > 0
      ? Promise.resolve(to)
      : isRecursive
      ? undefined
      : Promise.resolve({});
  }
}

export const mapper = (from: any, template: Record<string, Properties>) => {
  return main(from, template);
};

export async function convert(prefix: string, data: any, event?: any) {
  try {
    data.event = event || data.event;
    event = data.event.indexOf('message') >= 0 ? 'message' : data.event;

    const mappConfEvent = await config_event(prefix, event);

    Object.assign(mappConfEvent);

    // console.log('mappConfEvent', mappConfEvent);

    if (!mappConfEvent) return data;
    return await mapper(data, mappConfEvent);
  } catch (e) {
    return data;
  }
}

async function config_event(prefix: any, event: any) {
  try {
    const { default: mappConf } = await import(`./${prefix}${event}.js`);
    if (!mappConf) return undefined;
    return mappConf;
  } catch (e) {
    return undefined;
  }
}
