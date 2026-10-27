import { describe, expect, it } from 'vitest';
import { evaluateMustacheTemplate, generatePreviewDocument } from './template-evaluator';

describe('template-evaluator', () => {
  const sampleData = [
    {
      name: 'Alice Smith',
      role: 'Data Engineer',
      email: 'alice@example.org',
      age: 31,
      city: 'Brussels',
    },
    {
      name: 'Bob Johnson',
      role: 'Architect',
      email: '',
      age: 42,
    },
  ];

  it('evaluates simple interpolation and conditionals in {{#each items}}', () => {
    const template = `
      <div class="cards">
        {{#each items}}
          <article>
            <h3>{{name}}</h3>
            {{#role}}<p class="role">{{role}}</p>{{/role}}
            {{#email}}<p class="email">{{email}}</p>{{/email}}
            {{^email}}<p class="no-email">No email provided</p>{{/email}}
          </article>
        {{/each}}
      </div>
    `;

    const rendered = evaluateMustacheTemplate(template, sampleData);

    expect(rendered).toContain('<h3>Alice Smith</h3>');
    expect(rendered).toContain('<p class="role">Data Engineer</p>');
    expect(rendered).toContain('<p class="email">alice@example.org</p>');

    expect(rendered).toContain('<h3>Bob Johnson</h3>');
    expect(rendered).toContain('<p class="role">Architect</p>');
    expect(rendered).toContain('<p class="no-email">No email provided</p>');
    expect(rendered).not.toContain('<p class="email">bob');
  });

  it('renders index correctly with {{@index}}', () => {
    const template = `{{#each items}}Item #{{@index}}: {{name}} | {{/each}}`;
    const rendered = evaluateMustacheTemplate(template, sampleData);
    expect(rendered).toBe('Item #0: Alice Smith | \nItem #1: Bob Johnson | ');
  });

  it('handles nested dot notation values', () => {
    const complexData = [
      {
        title: 'Project Alpha',
        details: {
          author: 'Charlie',
          stats: { views: 150 },
        },
      },
    ];

    const template = `{{#each items}}<h1>{{title}}</h1><p>Author: {{details.author}} (Views: {{details.stats.views}})</p>{{/each}}`;
    const rendered = evaluateMustacheTemplate(template, complexData);

    expect(rendered).toContain('Author: Charlie (Views: 150)');
  });

  it('handles empty template or missing data gracefully', () => {
    expect(evaluateMustacheTemplate('', sampleData)).toBe('');
    expect(evaluateMustacheTemplate('<h3>{{name}}</h3>', null)).toBe('<h3></h3>');
  });

  it('generates a complete HTML document with viewport and resets', () => {
    const doc = generatePreviewDocument('<div class="test">Hello World</div>');
    expect(doc).toContain('<!DOCTYPE html>');
    expect(doc).toContain('<meta name="viewport"');
    expect(doc).toContain('<div class="test">Hello World</div>');
  });
});
