enum ColorType {
  UNK,
  RGB,
  RGBA,
  HEX,
}

interface Color {
  type: ColorType;
  r: number;
  g: number;
  b: number;
  a?: number;
}

const getColorType = (color: string): ColorType => {
  if (color.startsWith('rgb'))
    return color.startsWith('rgba') ? ColorType.RGBA : ColorType.RGB;
  if (color.startsWith('#') && (color.length === 7 || color.length === 4))
    return ColorType.HEX;
  return ColorType.UNK;
};

const getColorChannels = (colorCode: string): Color => {
  const color: Partial<Color> = { type: getColorType(colorCode) };

  switch (color.type) {
    case ColorType.RGB:
    case ColorType.RGBA:
      const [r, g, b, a] = colorCode.match(/\d+/g)!.map(Number);
      color.r = r;
      color.g = g;
      color.b = b;
      color.a = a;
      break;
    case ColorType.HEX:
      const [r1, g1, b1, a1] = colorCode
        .slice(1)
        .match(/.{1,2}/g)!
        .map((x) => parseInt(x, 16));
      color.r = r1;
      color.g = g1;
      color.b = b1;
      color.a = a1 === undefined ? 255 : a1;
      break;
    default:
      throw new Error('Unknown color type for ' + colorCode);
  }
  return color as Color;
};

const toColorType = (color: Color): string => {
  switch (color.type) {
    case ColorType.RGB:
      return `rgb(${color.r},${color.g},${color.b})`;
    case ColorType.RGBA:
      return `rgba(${color.r},${color.g},${color.b},${color.a})`;
    case ColorType.HEX:
      return `#${color.r.toString(16)}${color.g.toString(16)}${color.b.toString(
        16
      )}`;
    default:
      throw new Error('Unknown color type for ' + color);
  }
};

export const alpha = (colorCode: string, delta: number): string => {
  const color = getColorChannels(colorCode);
  color.a = Math.min(Math.max(color.a! * delta, 0), 255);
  return toColorType(color);
};

export const lighten = (colorCode: string, delta: number): string => {
  const color = getColorChannels(colorCode);
  color.r = Math.min(Math.max(color.r + delta, 0), 255);
  color.g = Math.min(Math.max(color.g + delta, 0), 255);
  color.b = Math.min(Math.max(color.b + delta, 0), 255);
  return toColorType(color);
};

export const darken = (colorCode: string, delta: number): string =>
  lighten(colorCode, -delta);

export const getContrastRatio = (colorCode: string): number => {
  const color = getColorChannels(colorCode);
  const [r, g, b] = [color.r, color.g, color.b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05) / 0.05;
}