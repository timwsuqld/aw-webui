const _ = require('lodash');

const level_sep = ">";

interface Category {
    id?: number;
    name: string[];
    name_pretty?: string;
    subname?: string;
    rule: {
        type: string;
        pattern: string;
    };
    depth?: number;
    parent?: string[];
    children?: Category[];
}

export const defaultCategories: Category[] = [
  { name: ['Work'], rule: { type: 'regex', pattern: 'Google Docs' } },
  {
    name: ['Work', 'Programming'],
    rule: { type: 'regex', pattern: 'GitHub|Stack Overflow' },
  },
  {
    name: ['Work', 'Programming', 'ActivityWatch'],
    rule: { type: 'regex', pattern: '[Aa]ctivity[Ww]atch|aw-' },
  },
  { name: ['Media', 'Games'], rule: { type: 'regex', pattern: 'Minecraft|RimWorld' } },
  { name: ['Media', 'Video'], rule: { type: 'regex', pattern: 'YouTube|Plex' } },
  { name: ['Media', 'Social Media'], rule: { type: 'regex', pattern: 'reddit|Facebook|Twitter|Instagram' } },
  { name: ['Comms', 'IM'], rule: { type: 'regex', pattern: 'Messenger|Telegram|Signal|WhatsApp' } },
  { name: ['Comms', 'Email'], rule: { type: 'regex', pattern: 'Gmail' } },
];

export function build_category_hierarchy(classes: Category[]): Category[] {
  function annotate(c: Category) {
    const ch = c.name;
    c.name_pretty = ch.join(level_sep);
    c.subname = ch.slice(-1)[0];
    c.parent = ch.length > 1 ? ch.slice(0, -1) : null;
    c.depth = ch.length - 1;
    return c;
  }

  const new_classes = classes.slice().map(c => annotate(c));

  // Insert dangling/undefined parents
  const all_full_names = new Set(new_classes.map(c => c.name.join(level_sep)));

  function createMissingParents(children) {
     children
        .map(c => c.parent)
        .filter(p => !!p)
        .map(p => {
          const name = p.join(level_sep);
          if (p && !all_full_names.has(name)) {
            const new_parent = annotate({ name: p, rule: { type: null, pattern: '' } });
            classes.push(new_parent);
            all_full_names.add(name);
            // New parent might not be top-level, so we need to recurse
            createMissingParents([new_parent]);
          }
        });
  }

  createMissingParents(new_classes);

  function assignChildren(classes_at_level: Category[]) {
    return classes_at_level.map(cls => {
      cls.children = classes.filter(child => {
        return child.parent && cls.name
          ? JSON.stringify(child.parent) == JSON.stringify(cls.name)
          : false;
      });
      assignChildren(cls.children);
      return cls;
    });
  }

  return assignChildren(classes.filter(c => !c.parent));
}

export function flatten_category_hierarchy(hier: Category[]): Category[] {
  return _.flattenDeep(
    hier.map(h => {
      const level = [h, flatten_category_hierarchy(h.children)];
      h.children = [];
      return level;
    })
  );
}

export function restoreDefaultClasses() {
  localStorage.classes = JSON.stringify(defaultCategories);
  console.log('Saved classes', localStorage.classes);
}

export function saveClasses(classes: Category[]) {
  localStorage.classes = JSON.stringify(classes);
  console.log('Saved classes', localStorage.classes);
}

export function loadClasses(): Category[] {
  const classes_json = localStorage.classes;
  if(classes_json && classes_json.length >= 1) {
    return JSON.parse(classes_json);
  } else {
    return defaultCategories;
  }
}

export function loadClassesForQuery(): [string[], any][] {
  return loadClasses().map(c => {
      return [c.name, { regex: c.rule.type === "regex" ? c.rule.pattern : "" }]
  });
}
