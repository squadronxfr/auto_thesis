import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generatePdf(params) {
    const { file_path, content, title = 'Document' } = params;
    
    if (!file_path) {
        throw new Error('file_path is required');
    }
    
    if (!content) {
        throw new Error('content is required');
    }
    
    const dataDir = process.env.DATA_DIR || '/app/data';
    const fullPath = path.join(dataDir, file_path);
    
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            font-size: 24pt;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        h2 {
            font-size: 18pt;
            margin-top: 25px;
            margin-bottom: 12px;
        }
        h3 {
            font-size: 14pt;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        h4 {
            font-size: 12pt;
            margin-top: 18px;
            margin-bottom: 8px;
            font-weight: bold;
        }
        p {
            text-align: justify;
            margin-bottom: 12px;
        }
        ul, ol {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        li {
            margin-bottom: 5px;
            line-height: 1.5;
        }
        a {
            color: #0066cc;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        code {
            background: #f4f4f4;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
${markdownToHtml(content)}
</body>
</html>`;
    
    const tempHtmlPath = fullPath.replace('.pdf', '.html');
    await fs.writeFile(tempHtmlPath, htmlContent, 'utf-8');
    
    try {
        // Use Chromium to generate PDF
        const chromiumPath = '/usr/bin/chromium-browser';
        await execAsync(`${chromiumPath} --headless --disable-gpu --print-to-pdf="${fullPath}" --no-sandbox --disable-setuid-sandbox "${tempHtmlPath}"`);
        await fs.unlink(tempHtmlPath);
        console.log(`PDF generated successfully: ${fullPath}`);
    } catch (error) {
        console.error(`PDF generation failed: ${error.message}`);
        console.log('Saving as HTML instead');
        await fs.rename(tempHtmlPath, fullPath.replace('.pdf', '.html'));
        return {
            file_path,
            full_path: fullPath.replace('.pdf', '.html'),
            format: 'html',
            note: `PDF generation failed: ${error.message}`
        };
    }
    
    const stats = await fs.stat(fullPath);
    
    return {
        file_path,
        full_path: fullPath,
        size: stats.size,
        created: true,
        format: 'pdf'
    };
}

function markdownToHtml(markdown) {
    let html = markdown;
    
    // Convert headers (must be done first, from h6 to h1)
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Convert links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Convert bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Convert unordered lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Convert ordered lists
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
    
    // Convert paragraphs (split by double newlines)
    const parts = html.split(/\n\n+/);
    html = parts.map(part => {
        part = part.trim();
        // Don't wrap headers, lists, or already wrapped content
        if (part.startsWith('<h') || part.startsWith('<ul') || part.startsWith('<ol') || 
            part.startsWith('<li') || part === '') {
            return part;
        }
        return `<p>${part.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    return html;
}

export const generatePdfTool = {
    name: 'generate_pdf',
    description: 'Génère un document PDF à partir de contenu Markdown',
    parameters: {
        file_path: {
            type: 'string',
            required: true,
            description: 'Chemin pour sauvegarder le fichier PDF (relatif au répertoire data)'
        },
        content: {
            type: 'string',
            required: true,
            description: 'Contenu Markdown à convertir en PDF'
        },
        title: {
            type: 'string',
            required: false,
            description: 'Titre du document'
        }
    },
    execute: generatePdf
};