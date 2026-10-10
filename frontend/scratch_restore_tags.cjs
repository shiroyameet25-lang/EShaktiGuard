const fs = require('fs');

let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split(/\r?\n/);
let newLines = [];
let stack = []; 

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    if (trimmed === '') {
        newLines.push(line);
        continue;
    }
    
    let indent = line.match(/^(\s*)/)[1].length;
    
    // If the line starts with a closing tag, its structural indentation is the same as the open tag.
    // But if we encounter ANY line with lesser or equal indentation to the top div in the stack,
    // that top div must be closed before this line.
    while (stack.length > 0 && indent <= stack[stack.length - 1]) {
        let topIndent = stack[stack.length - 1];
        
        // If the current line is EXACTLY the closing tag for this div
        if (indent === topIndent && (trimmed.startsWith('</div>') || trimmed.startsWith('</>'))) {
            // Wait, if it's </>, it doesn't close the div, it closes a fragment. 
            // But if it's exactly </div>, we pop and do NOT insert an extra one.
            if (trimmed.startsWith('</div>')) {
                stack.pop();
                break; // Let the normal flow push the line
            }
        }
        
        // Otherwise, a closing div is missing for `topIndent`.
        if (topIndent >= 16) {
            newLines.push(' '.repeat(topIndent) + '</div>');
        }
        stack.pop();
    }
    
    newLines.push(line);
    
    // Push open divs to stack
    // Handle cases like `<div ` or `<div\n` or `<div{...}`. Just checking `<div` is usually enough.
    // But be careful, if it has `</div>` or `/>` on the same line, don't push it.
    if (trimmed.startsWith('<div') && !line.includes('</div>') && !line.includes('/>')) {
        stack.push(indent);
    }
}

// Clean up any remaining in the stack
while (stack.length > 0) {
    let topIndent = stack.pop();
    if (topIndent >= 16) {
        newLines.push(' '.repeat(topIndent) + '</div>');
    }
}

fs.writeFileSync('src/components/Dashboard.jsx', newLines.join('\n'), 'utf8');
console.log('Restored tags via AST/indentation heuristic.');
