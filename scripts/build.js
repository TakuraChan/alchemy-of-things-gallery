/**
 * Build Script
 * Aggregates individual JSON files from CMS into data files for the frontend.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PAINTINGS_DIR = path.join(DATA_DIR, 'paintings');
const PHOTOGRAPHY_DIR = path.join(DATA_DIR, 'photography');

/**
 * Read all JSON files from a directory and combine into array
 */
function aggregateJsonFiles(directory) {
    const items = [];
    
    if (!fs.existsSync(directory)) {
        console.log(`Directory ${directory} does not exist, creating...`);
        fs.mkdirSync(directory, { recursive: true });
        return items;
    }
    
    const files = fs.readdirSync(directory).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
        try {
            const filePath = path.join(directory, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            items.push(data);
        } catch (error) {
            console.error(`Error reading ${file}:`, error.message);
        }
    }
    
    return items;
}

/**
 * Main build function
 */
function build() {
    console.log('Building Alchemy of Things...\n');
    
    // Aggregate paintings
    console.log('Aggregating paintings...');
    const paintings = aggregateJsonFiles(PAINTINGS_DIR);
    fs.writeFileSync(
        path.join(DATA_DIR, 'works.json'),
        JSON.stringify(paintings, null, 2)
    );
    console.log(`  Found ${paintings.length} painting(s)`);
    
    // Aggregate photography
    console.log('Aggregating photography...');
    const photography = aggregateJsonFiles(PHOTOGRAPHY_DIR);
    fs.writeFileSync(
        path.join(DATA_DIR, 'photography.json'),
        JSON.stringify(photography, null, 2)
    );
    console.log(`  Found ${photography.length} photograph(s)`);
    
    // Copy symbol from settings if uploaded
    try {
        const settings = JSON.parse(
            fs.readFileSync(path.join(DATA_DIR, 'settings.json'), 'utf8')
        );
        if (settings.symbol && settings.symbol !== '/images/symbol.svg') {
            console.log('\nSymbol configured:', settings.symbol);
        }
    } catch (error) {
        // Settings file doesn't exist yet, that's fine
    }
    
    console.log('\nBuild complete!');
}

// Run build
build();
