// Grabbed the source code from the link below.
// visit https://maketintsandshades.com

import { Tuple } from '@mantine/core';
import { EmptyStr } from '@src/static/string';

type RGB = {
  red: number;
  green: number;
  blue: number;
};

function parseColorValues(colorValues: string) {
  let colorValuesArray = colorValues.match(/\b[0-9A-Fa-f]{3}\b|[0-9A-Fa-f]{6}\b/g);
  if (colorValuesArray) {
    colorValuesArray = colorValuesArray.map((item) => {
      if (item.length === 3) return item.split(EmptyStr).reduce((acc, it) => acc + it + it, EmptyStr);
      return item;
    }) as RegExpMatchArray;
  }

  return colorValuesArray; // this could be null if there are no matches
}

// pad a hexadecimal string with zeros if it needs it
function pad(number: number, length: number) {
  let str = EmptyStr + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

// convert a hex string into an object with red, green, blue numeric properties
// '501214' => { red: 80, green: 18, blue: 20 }
function hexToRGB(colorValue: string) {
  return {
    red: parseInt(colorValue.substr(0, 2), 16),
    green: parseInt(colorValue.substr(2, 2), 16),
    blue: parseInt(colorValue.substr(4, 2), 16),
  };
}

// convert an integer to a 2-char hex string
// for sanity, round it and ensure it is between 0 and 255
// 43 => '2b'
function intToHex(rgbint: number) {
  return pad(Math.min(Math.max(Math.round(rgbint), 0), 255).toString(16) as any, 2);
}

// convert one of our rgb color objects to a full hex color string
// { red: 80, green: 18, blue: 20 } => '501214'
function rgbToHex(rgb: RGB) {
  return intToHex(rgb.red) + intToHex(rgb.green) + intToHex(rgb.blue);
}

// shade one of our rgb color objects to a distance of i*10%
// ({ red: 80, green: 18, blue: 20 }, 1) => { red: 72, green: 16, blue: 18 }
function rgbShade(rgb: RGB, i: number) {
  return {
    red: rgb.red * (1 - 0.1 * i),
    green: rgb.green * (1 - 0.1 * i),
    blue: rgb.blue * (1 - 0.1 * i),
  };
}

// tint one of our rgb color objects to a distance of i*10%
// ({ red: 80, green: 18, blue: 20 }, 1) => { red: 98, green: 42, blue: 44 }
function rgbTint(rgb: RGB, i: number) {
  return {
    red: rgb.red + (255 - rgb.red) * i * 0.1,
    green: rgb.green + (255 - rgb.green) * i * 0.1,
    blue: rgb.blue + (255 - rgb.blue) * i * 0.1,
  };
}

// take a hex color string and produce a list of 10 tints or shades of that color
// shadeOrTint should be either `rgbShade` or `rgbTint`, as defined above
// this allows us to use `calculate` for both shade and tint
function calculate(
  colorValue: string,
  shadeOrTint: (
    rgb: RGB,
    i: number
  ) => {
    red: number;
    green: number;
    blue: number;
  }
) {
  const color = hexToRGB(colorValue);
  const shadeValues: string[] = [];

  for (let i = 0; i < 10; i++) {
    shadeValues[i] = rgbToHex(shadeOrTint(color, i));
  }
  return shadeValues;
}

// given a color value, return an array of ten shades in 10% increments
function calculateShades(colorValue: string) {
  return calculate(colorValue, rgbShade).concat('000000');
}

// given a color value, return an array of ten tints in 10% increments
function calculateTints(colorValue: string) {
  return calculate(colorValue, rgbTint).concat('ffffff');
}

export function createTintsAndShades(value: string) {
  const parsedColorsArray = parseColorValues(value)?.[0];
  if (parsedColorsArray) {
    return {
      shades: calculateShades(parsedColorsArray),
      tints: calculateTints(parsedColorsArray),
    };
  }
}
/**
 * Generates a color palette based on a given color value.
 *
 * The color palette consists of ten colors: five tints, the base color, and four shades of the provided color.
 * The tints are lighter versions of the base color, while the shades are darker versions.
 *
 * @param value - A string representation of a color in hexadecimal format.
 *    It accepts three or six hexadecimal numbers (RGB). For example: 'ff0000', 'f00', '00ff00', '0f0', '0000ff', '00f'.
 *
 * @returns If the provided color value is valid, returns an ordered tuple of 10 strings representing color values in hexadecimal format:
 *    - Index 0-4: Tints from lightest to darkest (omits the lightest one which would be white)
 *    - Index 5: The base color
 *    - Index 6-9: Shades from lightest to darkest (omits the darkest one which would be black)
 * If the provided color value is not valid, returns undefined.
 *
 * @example
 * createPalette('501214');
 * //returns ['#d89c9b', '#c37f7e', '#ae6160', '#984443', '#833626', '#501214', '#480f12', '#400c11', '#380910', '#30060f']
 */
export function createPalette(value: string) {
  const result = createTintsAndShades(value);
  if (result) {
    const { shades, tints } = result;

    return [...tints.slice(1, 6).reverse(), tints[0], ...shades.slice(1, 5)].map((it) => `#${it}`) as Tuple<string, 10>;
  }
}
