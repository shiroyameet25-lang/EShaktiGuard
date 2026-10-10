const fs = require('fs');
const parser = require('@babel/parser');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    let maxAttempts = 1000;
    
    for (let i = 0; i < maxAttempts; i++) {
        try {
            parser.parse(lines.join('\n'), {
                sourceType: 'module',
                plugins: ['jsx']
            });
            console.log('Success! File parsed without errors.');
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            return;
        } catch (e) {
            if (e.message.includes('Expected corresponding JSX closing tag') || e.message.includes('Unexpected token')) {
                // The error gives line and column (1-indexed)
                let match = e.message.match(/\((\d+):(\d+)\)/);
                if (match) {
                    let lineNum = parseInt(match[1]); // 1-indexed
                    // Insert the missing </div> BEFORE the line where the error occurred
                    // If it's Unexpected token, it might be the token that closes something else.
                    lines.splice(lineNum - 1, 0, '                </div>');
                    console.log(`Inserted </div> at line ${lineNum}`);
                } else {
                    console.log('Could not extract line number from error: ' + e.message);
                    break;
                }
            } else {
                console.log('Other error: ' + e.message);
                break;
            }
        }
    }
    console.log('Failed after max attempts.');
}

fixFile('src/components/Dashboard.jsx');
