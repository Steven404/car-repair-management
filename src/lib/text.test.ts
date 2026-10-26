import { describe, expect, it } from 'vitest';
import { fold, originalRange } from './text';

describe('fold', () => {
  it('ignores case, accents and final sigma', () => {
    expect(fold('Γιώργος').text).toBe(fold('γιωργοσ').text);
    expect(fold('ΚΏΣΤΑΣ').text).toBe(fold('κώστας').text);
  });

  it('treats Greek and Latin lookalike letters as the same', () => {
    expect(fold('ΙΚΥ').text).toBe(fold('iky').text);
    expect(fold('ικυ').text).toBe(fold('IKY').text);
  });

  it('leaves out skipped characters', () => {
    expect(fold('ΙΚΥ 4521', /[\s-]/).text).toBe(fold('iky4521').text);
  });

  it('maps each folded character back to where it came from', () => {
    const original = 'Γιώργος Παπαδόπουλος';
    const folded = fold(original);
    const at = folded.text.indexOf(fold('παπαδ').text);
    const [start, end] = originalRange(folded, at, at + 5);
    expect(original.slice(start, end)).toBe('Παπαδ');
  });

  it('maps across skipped characters to cover them', () => {
    const folded = fold('ΙΚΥ 4521', /[\s-]/);
    const [start, end] = originalRange(folded, 2, 4); // "υ4" in the folded text
    expect('ΙΚΥ 4521'.slice(start, end)).toBe('Υ 4');
  });
});
