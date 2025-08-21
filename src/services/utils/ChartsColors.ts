import { ChartsColors } from "@/models/enums/ChartsColors";

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map(value => ({ value, sort: Math.random() })) 
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export function getChartsColorsPalette(): string[] {
  return shuffleArray(Object.values(ChartsColors));
}