import { slugify } from "./format";

/** Marcas com logo em `public/marcas/{slug}.png`. */
const LOGOS = new Set([
  "audi", "bmw", "byd", "chery", "chevrolet", "citroen", "fiat", "ford", "honda", "hyundai",
  "jeep", "kia", "mercedes-benz", "mitsubishi", "nissan", "peugeot", "renault", "toyota",
  "volkswagen",
]);

/** Ordem de exibição no filtro "Marca" (as mais buscadas primeiro). */
export const POPULAR_BRANDS = [
  "Volkswagen", "Honda", "Chevrolet", "Toyota", "Fiat", "Hyundai", "Ford", "Mitsubishi", "Jeep",
  "Renault", "Nissan", "Peugeot", "Citroen", "Kia", "BMW", "Mercedes-Benz", "Audi", "BYD", "Chery",
];

export function brandLogo(brand: string) {
  const slug = slugify(brand);
  return LOGOS.has(slug) ? `/marcas/${slug}.png` : null;
}
