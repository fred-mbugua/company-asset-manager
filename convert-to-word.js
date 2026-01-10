const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, PageBreak, TableOfContents, Header, Footer, PageNumber, NumberFormat } = require('docx');

// Read the markdown file
const markdownContent = fs.readFileSync(path.join(__dirname, 'API_DOCUMENTATION.md'), 'utf-8');

// Parse markdown and create Word document
function createWordDocument(content) {
  const lines = content.split('\n');
  const sections = [];
  let isInCodeBlock = false;
  let codeBlockContent = [];
  let codeLanguage = '';
  let isInTable = false;
  let tableRows = [];
  let isTableHeader = true;
  let skipTableOfContents = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Skip table of contents section (markdown links)
    if (line.includes('## Table of Contents')) {
      skipTableOfContents = true;
      sections.push(new Paragraph({
        text: 'Table of Contents',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 180 },
        pageBreakBefore: false
      }));
      continue;
    }

    // End of table of contents when we hit a new section
    if (skipTableOfContents && line.startsWith('##') && !line.includes('Table of Contents')) {
      skipTableOfContents = false;
    }

    // Skip markdown-style links in table of contents
    if (skipTableOfContents && (line.trim().startsWith('[') || line.trim() === '---')) {
      continue;
    }

    // If in TOC, create formatted numbered list
    if (skipTableOfContents && /^\d+\./.test(line.trim())) {
      const text = line.trim().replace(/^\d+\.\s+\[(.+?)\]\(.+?\)/, '$1').replace(/^\d+\.\s+/, '');
      if (text) {
        sections.push(new Paragraph({
          children: [new TextRun({ text: text, size: 22 })],
          numbering: { reference: 'default-numbering', level: 0 },
          spacing: { before: 60, after: 60 },
          indent: { left: 360 }
        }));
      }
      continue;
    }

    // Handle code blocks with language
    if (line.trim().startsWith('```')) {
      if (isInCodeBlock) {
        // End code block - create formatted code paragraph with vertical JSON
        let codeText = codeBlockContent.join('\n');
        
        // Format JSON with proper indentation if it's JSON
        if (codeLanguage === 'json' || codeText.trim().startsWith('{') || codeText.trim().startsWith('[')) {
          try {
            const parsed = JSON.parse(codeText);
            codeText = JSON.stringify(parsed, null, 2);
          } catch (e) {
            // If parsing fails, keep original
          }
        }
        
        // Split code into lines and create a paragraph for each line to ensure proper alignment
        const codeLines = codeText.split('\n');
        codeLines.forEach((codeLine, index) => {
          sections.push(new Paragraph({
            children: [new TextRun({
              text: codeLine,
              font: 'Consolas',
              size: 18
            })],
            spacing: { 
              before: index === 0 ? 150 : 0, 
              after: index === codeLines.length - 1 ? 150 : 0 
            },
            indent: { left: 360, right: 360 },
            border: index === 0 ? {
              top: { color: 'd0d0d0', space: 1, style: BorderStyle.SINGLE, size: 6 },
              left: { color: 'd0d0d0', space: 1, style: BorderStyle.SINGLE, size: 6 },
              right: { color: 'd0d0d0', space: 1, style: BorderStyle.SINGLE, size: 6 }
            } : index === codeLines.length - 1 ? {
              bottom: { color: 'd0d0d0', space: 1, style: BorderStyle.SINGLE, size: 6 },
              left: { color: 'd0d0d0', space: 1, style: BorderStyle.SINGLE, size: 6 },
              right: { color: 'd0d0d0', space: 1, style: BorderStyle.SINGLE, size: 6 }
            } : {
              left: { color: 'd0d0d0', space: 1, style: BorderStyle.SINGLE, size: 6 },
              right: { color: 'd0d0d0', space: 1, style: BorderStyle.SINGLE, size: 6 }
            },
            shading: { fill: 'f8f8f8', type: ShadingType.CLEAR },
            alignment: AlignmentType.LEFT
          }));
        });
        
        codeBlockContent = [];
        isInCodeBlock = false;
        codeLanguage = '';
      } else {
        // Start code block
        codeLanguage = line.trim().substring(3).trim();
        isInCodeBlock = true;
      }
      continue;
    }

    if (isInCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Handle tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!isInTable) {
        isInTable = true;
        tableRows = [];
        isTableHeader = true;
      }
      
      // Skip separator lines
      if (line.includes('---') || line.includes('===')) {
        isTableHeader = false;
        continue;
      }

      const cells = line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
      
      tableRows.push(new TableRow({
        children: cells.map(cell => new TableCell({
          children: [new Paragraph({
            children: [new TextRun({
              text: cell,
              bold: isTableHeader,
              size: isTableHeader ? 22 : 20
            })],
            alignment: AlignmentType.CENTER
          })],
          width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
          shading: { fill: isTableHeader ? '4472C4' : 'FFFFFF', type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 100, right: 100 }
        }))
      }));
      continue;
    } else if (isInTable && !line.trim().startsWith('|')) {
      // End table
      if (tableRows.length > 0) {
        sections.push(new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 8, color: '4472C4' },
            bottom: { style: BorderStyle.SINGLE, size: 8, color: '4472C4' },
            left: { style: BorderStyle.SINGLE, size: 8, color: '4472C4' },
            right: { style: BorderStyle.SINGLE, size: 8, color: '4472C4' },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'd0d0d0' },
            insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'd0d0d0' }
          }
        }));
        sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      }
      isInTable = false;
      tableRows = [];
      isTableHeader = true;
    }

    // Handle headings
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      sections.push(new Paragraph({
        text: line.substring(2).trim(),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 480, after: 240 },
        alignment: AlignmentType.LEFT,
        thematicBreak: true
      }));
    } else if (line.startsWith('## ') && !line.startsWith('### ')) {
      sections.push(new Paragraph({
        text: line.substring(3).trim(),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 180 },
        pageBreakBefore: true
      }));
    } else if (line.startsWith('### ') && !line.startsWith('#### ')) {
      sections.push(new Paragraph({
        text: line.substring(4).trim(),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 280, after: 140 }
      }));
    } else if (line.startsWith('#### ')) {
      sections.push(new Paragraph({
        text: line.substring(5).trim(),
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 200, after: 120 }
      }));
    }
    // Handle bold text with ** - split and create bold runs without asterisks
    else if (line.includes('**') && !line.trim().startsWith('-') && !line.trim().startsWith('*')) {
      // Remove ** markers and identify bold segments
      const children = [];
      let currentText = '';
      let isBold = false;
      
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '*' && line[j + 1] === '*') {
          // Save current text
          if (currentText) {
            if (currentText.includes('`')) {
              const codeParts = currentText.split('`');
              codeParts.forEach((codePart, codeIndex) => {
                if (codeIndex % 2 === 0) {
                  if (codePart) children.push(new TextRun({ text: codePart, size: 22, bold: isBold }));
                } else {
                  children.push(new TextRun({
                    text: codePart,
                    font: 'Consolas',
                    size: 20,
                    bold: isBold,
                    shading: { fill: 'f0f0f0', type: ShadingType.CLEAR }
                  }));
                }
              });
            } else {
              children.push(new TextRun({ text: currentText, size: 22, bold: isBold }));
            }
            currentText = '';
          }
          // Toggle bold state
          isBold = !isBold;
          j++; // Skip the second asterisk
        } else {
          currentText += line[j];
        }
      }
      
      // Add remaining text
      if (currentText) {
        if (currentText.includes('`')) {
          const codeParts = currentText.split('`');
          codeParts.forEach((codePart, codeIndex) => {
            if (codeIndex % 2 === 0) {
              if (codePart) children.push(new TextRun({ text: codePart, size: 22, bold: isBold }));
            } else {
              children.push(new TextRun({
                text: codePart,
                font: 'Consolas',
                size: 20,
                bold: isBold,
                shading: { fill: 'f0f0f0', type: ShadingType.CLEAR }
              }));
            }
          });
        } else {
          children.push(new TextRun({ text: currentText, size: 22, bold: isBold }));
        }
      }
      
      sections.push(new Paragraph({ 
        children,
        spacing: { before: 80, after: 80 }
      }));
    }
    // Handle list items
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().substring(2);
      const children = [];
      
      // Parse inline code and bold within list items
      if (text.includes('`')) {
        const parts = text.split('`');
        parts.forEach((part, index) => {
          if (index % 2 === 0) {
            if (part) children.push(new TextRun({ text: part, size: 22 }));
          } else {
            children.push(new TextRun({
              text: part,
              font: 'Consolas',
              size: 20,
              shading: { fill: 'f0f0f0', type: ShadingType.CLEAR }
            }));
          }
        });
      } else {
        children.push(new TextRun({ text: text, size: 22 }));
      }
      
      sections.push(new Paragraph({
        children,
        bullet: { level: 0 },
        spacing: { before: 60, after: 60 },
        indent: { left: 360 }
      }));
    }
    // Handle numbered lists
    else if (/^\d+\.\s/.test(line.trim())) {
      const text = line.trim().replace(/^\d+\.\s/, '');
      sections.push(new Paragraph({
        text: text,
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { before: 60, after: 60 },
        indent: { left: 360 }
      }));
    }
    // Handle horizontal rules
    else if (line.trim() === '---' || line.trim() === '===') {
      sections.push(new Paragraph({
        text: '',
        border: {
          bottom: { color: '4472C4', space: 1, style: BorderStyle.SINGLE, size: 12 }
        },
        spacing: { before: 240, after: 240 }
      }));
    }
    // Handle empty lines
    else if (line.trim() === '') {
      sections.push(new Paragraph({ text: '', spacing: { after: 120 } }));
    }
    // Regular text
    else if (line.trim() !== '' && !line.trim().startsWith('```')) {
      // Handle inline code with backticks
      if (line.includes('`')) {
        const parts = line.split('`');
        const children = [];
        parts.forEach((part, index) => {
          if (index % 2 === 0) {
            if (part) children.push(new TextRun({ text: part, size: 22 }));
          } else {
            children.push(new TextRun({
              text: part,
              font: 'Consolas',
              size: 20,
              shading: { fill: 'f0f0f0', type: ShadingType.CLEAR }
            }));
          }
        });
        sections.push(new Paragraph({ 
          children,
          spacing: { before: 80, after: 80 }
        }));
      } else {
        sections.push(new Paragraph({
          children: [new TextRun({ text: line, size: 22 })],
          spacing: { before: 80, after: 80 }
        }));
      }
    }
  }

  return new Document({
    creator: "JSL Systems",
    company: "Jirani Smart Limited",
    description: "Complete API Documentation for Asset Management System",
    title: "Asset Management System - API Documentation",
    styles: {
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          run: {
            size: 32,
            bold: true,
            color: "2E74B5",
            font: "Segoe UI"
          },
          paragraph: {
            spacing: { before: 480, after: 240 }
          }
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          run: {
            size: 28,
            bold: true,
            color: "2E74B5",
            font: "Segoe UI"
          },
          paragraph: {
            spacing: { before: 360, after: 180 }
          }
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          run: {
            size: 24,
            bold: true,
            color: "1F4E78",
            font: "Segoe UI"
          },
          paragraph: {
            spacing: { before: 280, after: 140 }
          }
        },
        {
          id: "Normal",
          name: "Normal",
          run: {
            font: "Segoe UI",
            size: 22
          }
        }
      ]
    },
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: NumberFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT
            }
          ]
        }
      ]
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,  // 1 inch
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Asset Management System - API Documentation",
                  size: 20,
                  color: "666666"
                })
              ],
              alignment: AlignmentType.CENTER,
              border: {
                bottom: { color: "4472C4", space: 1, style: BorderStyle.SINGLE, size: 6 }
              },
              spacing: { after: 200 }
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "© 2026 Jirani Smart Limited",
                  size: 18,
                  color: "666666"
                }),
                new TextRun({
                  text: " | Page ",
                  size: 18,
                  color: "666666"
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  color: "666666"
                })
              ],
              alignment: AlignmentType.CENTER,
              border: {
                top: { color: "4472C4", space: 1, style: BorderStyle.SINGLE, size: 6 }
              },
              spacing: { before: 200 }
            })
          ]
        })
      },
      children: [
        // Title Page
        new Paragraph({
          children: [new TextRun({
            text: "ASSET MANAGEMENT SYSTEM",
            size: 48,
            bold: true,
            color: "2E74B5"
          })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 2880, after: 480 }
        }),
        new Paragraph({
          children: [new TextRun({
            text: "API Documentation",
            size: 36,
            color: "1F4E78"
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 960 }
        }),
        new Paragraph({
          children: [new TextRun({
            text: "Version 2.0",
            size: 24,
            color: "666666"
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 }
        }),
        new Paragraph({
          children: [new TextRun({
            text: `Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
            size: 22,
            color: "666666"
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 1440 }
        }),
        new Paragraph({
          children: [new TextRun({
            text: "Jirani Smart Limited",
            size: 26,
            bold: true,
            color: "2E74B5"
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 2880 }
        }),
        new Paragraph({
          text: "",
          pageBreakBefore: true
        }),
        ...sections
      ]
    }]
  });
}

// Create and save the document
console.log('Converting API Documentation to Word format...');
console.log('Applying professional formatting...');
const doc = createWordDocument(markdownContent);

Packer.toBuffer(doc).then((buffer) => {
  const defaultPath = path.join(__dirname, 'API_DOCUMENTATION.docx');
  let outputPath = defaultPath;
  
  // Try to write to the default path, if locked, create timestamped version
  try {
    fs.writeFileSync(outputPath, buffer);
  } catch (error) {
    if (error.code === 'EBUSY') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      outputPath = path.join(__dirname, `API_DOCUMENTATION_${timestamp}.docx`);
      fs.writeFileSync(outputPath, buffer);
      console.log('⚠️  Original file is open. Created new version with timestamp.');
    } else {
      throw error;
    }
  }
  
  console.log(`✓ Word document created successfully: ${outputPath}`);
  console.log('✓ Features: Professional layout, headers/footers, styled tables, code blocks, and title page');
  console.log('✓ Improvements: Removed asterisks, vertical JSON formatting, proper table of contents');
}).catch((error) => {
  console.error('Error creating Word document:', error);
  process.exit(1);
});
