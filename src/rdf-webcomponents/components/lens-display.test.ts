import { describe, expect, it } from 'vitest';
import { TemplateEngine } from './lens-display';

describe('TemplateEngine', () => {
  const engine = new TemplateEngine();

  it('renders simple value interpolation', () => {
    const template = 'Hello {{name}}!';
    const data = { name: 'Alice' };
    expect(engine.render(template, data)).toBe('Hello Alice!');
  });

  it('renders nested values with dot-notation', () => {
    const template = 'Address: {{address.street}}, {{address.city}}';
    const data = {
      address: {
        street: '123 Main St',
        city: 'Wonderland',
      },
    };
    expect(engine.render(template, data)).toBe('Address: 123 Main St, Wonderland');
  });

  it('renders array indexing with bracket notation', () => {
    const template = 'First user: {{users[0].name}} ({{users[0].role}}), Second user: {{users[1].name}}';
    const data = {
      users: [
        { name: 'Alice', role: 'Admin' },
        { name: 'Bob', role: 'User' },
      ],
    };
    expect(engine.render(template, data)).toBe('First user: Alice (Admin), Second user: Bob');
  });

  it('renders simple array loops using each', () => {
    const template = 'Users: {{#each users}}{{name}} ({{@index}}), {{/each}}';
    const data = {
      users: [
        { name: 'Alice' },
        { name: 'Bob' },
      ],
    };
    expect(engine.render(template, data)).toBe('Users: Alice (0), Bob (1), ');
  });

  it('handles undefined/null values gracefully without throwing', () => {
    const template = 'Name: {{name}}, Nested: {{profile.age}}, Array: {{items[0]}}';
    const data = {
      profile: null,
    };
    expect(engine.render(template, data)).toBe('Name: , Nested: , Array: ');
  });
});
