import fs from 'fs/promises';
import path from 'path';

export const appendToFileTool = {
  name: 'append_to_file',
  description: 'Append content to a file. Creates the file if it does not exist. Useful for building the thesis document incrementally.',
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'Path to the file (relative to data directory)'
      },
      content: {
        type: 'string',
        description: 'Content to append to the file'
      },
      add_newline: {
        type: 'boolean',
        description: 'Whether to add a newline before the content (default: true)',
        default: true
      },
      create_if_missing: {
        type: 'boolean',
        description: 'Whether to create the file if it does not exist (default: true)',
        default: true
      }
    },
    required: ['file_path', 'content']
  },

  async execute(params) {
    const { file_path, content, add_newline = true, create_if_missing = true } = params;

    if (!file_path) {
      throw new Error('file_path is required');
    }

    if (content === undefined || content === null) {
      throw new Error('content is required');
    }

    const dataDir = process.env.DATA_DIR || './data';
    const fullPath = path.join(dataDir, file_path);
    const dirPath = path.dirname(fullPath);

    console.log(`Appending content to file: ${fullPath}`);

    try {
      // Ensure directory exists
      await fs.mkdir(dirPath, { recursive: true });

      // Check if file exists
      let fileExists = false;
      try {
        await fs.access(fullPath);
        fileExists = true;
      } catch {
        fileExists = false;
      }

      if (!fileExists && !create_if_missing) {
        throw new Error(`File does not exist: ${file_path}`);
      }

      // Prepare content to append
      let contentToAppend = content;
      if (add_newline && fileExists) {
        // Check if file ends with newline
        const existingContent = await fs.readFile(fullPath, 'utf-8');
        if (existingContent.length > 0 && !existingContent.endsWith('\n')) {
          contentToAppend = '\n' + content;
        }
      }

      // Append to file
      await fs.appendFile(fullPath, contentToAppend, 'utf-8');

      // Get file stats
      const stats = await fs.stat(fullPath);

      console.log(`Content appended successfully. File size: ${stats.size} bytes`);

      return {
        success: true,
        file_path: file_path,
        full_path: fullPath,
        bytes_written: Buffer.byteLength(contentToAppend, 'utf-8'),
        total_size: stats.size,
        created: !fileExists
      };
    } catch (error) {
      console.error(`Failed to append to file: ${error.message}`);
      throw new Error(`Failed to append to file: ${error.message}`);
    }
  }
};
