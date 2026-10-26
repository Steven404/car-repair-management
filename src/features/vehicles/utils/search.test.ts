import { describe, expect, it } from 'vitest';
import { makeSearchable, search, type SearchFieldValues } from './search';

const GOLF = { id: 'golf', brand: 'Volkswagen', model: 'Golf', plate: 'ΙΚΥ 4521', ownerName: 'Γιώργος Παπαδόπουλος' };
const YARIS = { id: 'yaris', brand: 'Toyota', model: 'Yaris', plate: 'ΥΗΒ 7310', ownerName: 'Μαρία Κωνσταντίνου' };
const POLO = { id: 'polo', brand: 'Volkswagen', model: 'Polo', plate: 'ΙΤΗ 9054', ownerName: 'Ελένη Γεωργίου' };

const cars = [GOLF, YARIS, POLO].map(makeSearchable);
const ids = (query: string) => search(cars, query).map((result) => result.item.id);

/** The highlighted parts of one car's field, as text */
function highlighted(item: SearchFieldValues & { id: string }, query: string, field: keyof SearchFieldValues) {
  const result = search(cars, query).find((r) => r.item.id === item.id);
  return (result?.highlights[field] ?? []).map(([start, end]) => item[field].slice(start, end));
}

describe('search', () => {
  it('returns every car, unhighlighted, for an empty query', () => {
    expect(ids('')).toEqual(['golf', 'yaris', 'polo']);
    expect(search(cars, '   ').every((result) => Object.keys(result.highlights).length === 0)).toBe(true);
  });

  it('finds brand, model, plate and owner', () => {
    expect(ids('volkswagen')).toEqual(['golf', 'polo']);
    expect(ids('yaris')).toEqual(['yaris']);
    expect(ids('9054')).toEqual(['polo']);
    expect(ids('κωνσταντ')).toEqual(['yaris']);
  });

  it('needs every word to match, in any field', () => {
    expect(ids('golf παπαδ')).toEqual(['golf']);
    expect(ids('golf μαρία')).toEqual([]);
  });

  it('ignores case and accents in both directions', () => {
    expect(ids('ΓΙΩΡΓΟΣ')).toEqual(['golf']);
    expect(ids('Γεωργίου')).toEqual(['polo']);
    expect(ids('γεωργιου')).toEqual(['polo']);
  });

  it('finds a Greek plate typed on a Latin keyboard, with or without the space', () => {
    expect(ids('iky')).toEqual(['golf']);
    expect(ids('iky4521')).toEqual(['golf']);
    expect(ids('ΙΚΥ-4521')).toEqual(['golf']);
    expect(ids('ικυ 4521')).toEqual(['golf']);
  });

  it('highlights the original characters, accents included', () => {
    expect(highlighted(GOLF, 'γιωρ', 'ownerName')).toEqual(['Γιώρ']);
    expect(highlighted(GOLF, 'golf', 'model')).toEqual(['Golf']);
  });

  it('highlights across the plate space when the query has none', () => {
    expect(highlighted(GOLF, 'iky4521', 'plate')).toEqual(['ΙΚΥ 4521']);
    expect(highlighted(GOLF, 'y45', 'plate')).toEqual(['Υ 45']);
  });

  it('highlights each word where it matched', () => {
    const result = search(cars, 'volks παπαδ')[0];
    expect(Object.keys(result.highlights).sort()).toEqual(['brand', 'ownerName']);
  });
});
