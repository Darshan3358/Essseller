const fs = require('fs');
const path = require('path');

const files = [
    'frontend/app/(authenticated)/dashboard/page.tsx',
    'frontend/app/(authenticated)/orders/page.tsx',
    'frontend/app/(authenticated)/orders/[id]/page.tsx',
    'frontend/app/(authenticated)/settings/page.tsx',
    'frontend/app/(authenticated)/password/page.tsx',
    'frontend/app/(authenticated)/suppliers/page.tsx',
    'frontend/app/(authenticated)/queries/page.tsx',
    'frontend/app/(authenticated)/uploads/page.tsx',
    'frontend/app/(authenticated)/storehouse/page.tsx',
    'frontend/app/(authenticated)/spread-packages/page.tsx',
    'frontend/app/(authenticated)/support/page.tsx',
    'frontend/app/(authenticated)/conversations/page.tsx',
    'frontend/app/(authenticated)/packages/page.tsx',
    'frontend/app/(authenticated)/refunds/page.tsx',
    'frontend/app/(authenticated)/affiliate/page.tsx',
    'frontend/app/(authenticated)/notifications/page.tsx',
    'frontend/app/(authenticated)/reports/page.tsx',
    'frontend/app/(authenticated)/commissions/page.tsx',
    'frontend/app/(authenticated)/withdraw/page.tsx',
    'frontend/app/(authenticated)/payment/page.tsx'
];

const basePath = '/Users/thankiayushi/Downloads/Essseller-main';

files.forEach(fileRelPath => {
    const fullPath = path.join(basePath, fileRelPath);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Remove import Shell
    content = content.replace(/import Shell from ['"]@\/components\/layout\/Shell['"];?\n?/g, '');
    
    // Remove <Shell> and </Shell>
    // This is simple but works if Shell is at the top level of the return
    content = content.replace(/<Shell>\n?/g, '<>\n');
    content = content.replace(/<\/Shell>/g, '</>');

    // Remove redundant auth redirect if it's there (since AuthenticatedLayout handles it)
    // content = content.replace(/useEffect\(\(\) => \{[\s\S]*?router\.push\(['"]\/login['"]\);[\s\S]*?\}, \[user, authLoading, router\]\);/g, '');

    fs.writeFileSync(fullPath, content);
    console.log(`Cleaned: ${fileRelPath}`);
});
