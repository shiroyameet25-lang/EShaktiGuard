const getSoundex = (s) => {
    if (!s) return '';
    let a = s.toLowerCase().split(''),
        f = a.shift(),
        r = '',
        codes = { a: '', e: '', i: '', o: '', u: '', y: '', h: '', w: '', b: 1, f: 1, p: 1, v: 1, c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2, d: 3, t: 3, l: 4, m: 5, n: 5, r: 6 };
    
    r = f + a.map(v => codes[v]).filter((v, i, arr) => ((i === 0) ? v !== codes[f] : v !== arr[i - 1])).filter(v => v).join('');
    return (r + '000').slice(0, 4).toUpperCase();
};

const getPhoneticSimilarity = (name1, name2) => {
    if (!name1 || !name2) return 0;
    const parts1 = name1.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean);
    const parts2 = name2.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean);
    
    let matchCount = 0;
    for (const p1 of parts1) {
        const s1 = getSoundex(p1);
        for (const p2 of parts2) {
            if (s1 === getSoundex(p2)) {
                matchCount++;
                break; // ensure it doesn't double-match
            }
        }
    }
    
    const maxWords = Math.max(parts1.length, parts2.length);
    if (maxWords === 0) return 0;
    return Math.round((matchCount / maxWords) * 100);
};

console.log('MOHAMMED RAHMAN vs MUHAMMAD REHMAN:', getPhoneticSimilarity('Mohammed Rahman', 'Muhammad Rehman'));
console.log('Steven vs Stephen:', getPhoneticSimilarity('Steven', 'Stephen'));
console.log('Alexsander Navarro vs Alexander Novaro:', getPhoneticSimilarity('Alexsander Navarro', 'Alexander Novaro'));
