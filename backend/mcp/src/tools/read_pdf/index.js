import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';

export const readPdfTool = {
  name: 'read_pdf',
  description: 'Lit et extrait le contenu textuel d\'un fichier PDF. Peut lire depuis un chemin de fichier ou depuis un contenu encodé en base64.',
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'Chemin du fichier PDF à lire (relatif au répertoire data)'
      },
      base64_content: {
        type: 'string',
        description: 'Contenu PDF encodé en base64 (alternative à file_path)'
      }
    },
    oneOf: [
      { required: ['file_path'] },
      { required: ['base64_content'] }
    ]
  },

  async execute(params) {
    const { file_path, base64_content } = params;

    console.log('Reading PDF file...');

    let pdfBuffer;

    if (base64_content) {
      console.log('Reading from base64 content');
      pdfBuffer = Buffer.from(base64_content, 'base64');
    } else if (file_path) {
      const dataDir = process.env.DATA_DIR || './data';
      const fullPath = path.join(dataDir, file_path);
      console.log(`Reading from file: ${fullPath}`);
      
      try {
        pdfBuffer = await fs.readFile(fullPath);
      } catch (error) {
        throw new Error(`Failed to read PDF file: ${error.message}`);
      }
    } else {
      throw new Error('Either file_path or base64_content must be provided');
    }

    try {
      const data = await pdfParse(pdfBuffer);
      
      console.log(`PDF parsed successfully. Pages: ${data.numpages}`);
      
      return {
        text: data.text,
        num_pages: data.numpages,
        info: data.info,
        metadata: data.metadata
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }
};
