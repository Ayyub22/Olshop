const fs = require('fs');
let code = fs.readFileSync('assets/js/data.js', 'utf8');

// Replace categories into category + subCategory
code = code.replace(/category: 'Mirrorless'/g, "category: 'Kamera',\n    subCategory: 'Mirrorless'");
code = code.replace(/category: 'DSLR'/g, "category: 'Kamera',\n    subCategory: 'DSLR'");
code = code.replace(/category: 'Compact'/g, "category: 'Kamera',\n    subCategory: 'Compact'");
code = code.replace(/category: 'Instant'/g, "category: 'Kamera',\n    subCategory: 'Instant'");

// Update filter signature
code = code.replace(
    /filter\(\{ brand, category, minPrice, maxPrice, grade, branch, status, search \} = \{\}\) \{/,
    'filter({ brand, category, subCategory, minPrice, maxPrice, grade, branch, status, search } = {}) {'
);

// Update filter condition
if (!code.includes('if (subCategory)')) {
    code = code.replace(
        /if \(category\) products = products\.filter\(p => p\.category\.toLowerCase\(\) === category\.toLowerCase\(\)\);/,
        "if (category) products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());\n    if (subCategory) products = products.filter(p => p.subCategory && p.subCategory.toLowerCase() === subCategory.toLowerCase());"
    );
}

// Update getCategories and add getSubCategories
if (!code.includes('getSubCategories')) {
    code = code.replace(
        /getCategories\(\) \{\s+const all = this\.getAll\(\);\s+return \[\.\.\.new Set\(all\.map\(p => p\.category\)\)\]\.sort\(\);\s+\}/,
        `getCategories() {
    const all = this.getAll();
    return [...new Set(all.map(p => p.category))].sort();
  }

  getSubCategories(category) {
    const all = this.getAll();
    let filtered = all;
    if (category) filtered = all.filter(p => p.category.toLowerCase() === category.toLowerCase());
    return [...new Set(filtered.map(p => p.subCategory).filter(Boolean))].sort();
  }`
    );
}

fs.writeFileSync('assets/js/data.js', code);
console.log('data.js updated via script');
